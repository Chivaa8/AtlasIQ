import { $ } from "../app/dom.js";
import { currentUser, endSession, saveSession, sessionToken } from "../app/storage.js";
import { showPage } from "../app/pages.js";
import { isProfileComplete } from "../schemas/profile.js";
import { labels, validateUser } from "../schemas/user.js";
import { confirmEmailVerification, loginUser, registerUser, requestEmailVerification, revokeSession } from "../services/auth-api.js";
import { requestPasswordReset, resetPassword } from "../services/password-reset.js";
import { renderRecommendations } from "./advisor.js?v=20260710-country-images";
import { renderProfile } from "./profile.js";
import { renderTrips } from "./trips.js";

export function mountAuthRoute() {
  $("#loginTab").addEventListener("click", () => showAuthMode("login"));
  $("#registerTab").addEventListener("click", () => showAuthMode("register"));
  $("#registerForm").addEventListener("submit", register);
  $("#loginForm").addEventListener("submit", login);
  $("#forgotForm").addEventListener("submit", requestReset);
  $("#resetForm").addEventListener("submit", submitReset);
  $("#forgotBtn").addEventListener("click", () => showAuthMode("forgot"));
  document.querySelectorAll("[data-auth-mode]").forEach((button) => {
    button.addEventListener("click", () => showAuthMode(button.dataset.authMode));
  });
  $("#logoutBtn").addEventListener("click", async () => {
    await revokeSession();
    endSession();
    showApp();
  });
  $("#verifyEmailBtn").addEventListener("click", requestVerification);
  $("#verifyEmailForm").addEventListener("submit", confirmVerification);
}

export function showApp() {
  const user = currentUser();
  $("#authView").classList.toggle("hidden", Boolean(user));
  $("#appView").classList.toggle("hidden", !user);
  if (!user) return;
  $("#userSummary").textContent = `${user.name} - origen: ${labels[user.origin]}`;
  $("#accountName").textContent = user.name || "Mi cuenta";
  $("#accountEmail").textContent = user.email || "";
  $("#accountAvatar").src = user.photo || defaultAvatar();
  $("#verifyEmailBtn").classList.toggle("hidden", user.emailVerified !== false);
  renderProfile();
  const needsProfile = !isProfileComplete(user);
  $("#appView").classList.toggle("onboarding", needsProfile);
  showPage(needsProfile ? "profilePanel" : "homeDashboard");
  if (!needsProfile) {
    renderTrips();
    renderRecommendations();
  }
}

function defaultAvatar() {
  return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Crect width='96' height='96' rx='48' fill='%23edf4f1'/%3E%3Ccircle cx='48' cy='36' r='18' fill='%230c7168'/%3E%3Cpath d='M20 84c5-22 19-34 28-34s23 12 28 34' fill='%230c7168'/%3E%3C/svg%3E";
}

function showAuthMode(mode) {
  ["login", "register", "forgot", "reset"].forEach((name) => {
    $(`#${name}Form`).classList.toggle("hidden", name !== mode);
  });
  $("#loginTab").classList.toggle("active", mode === "login");
  $("#registerTab").classList.toggle("active", mode === "register");
  showMessage("");
}

async function register(event) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const nextUser = {
    name: data.get("name").trim(),
    email: data.get("email").trim().toLowerCase(),
    password: data.get("password"),
    origin: data.get("origin"),
    currency: "EUR",
    website: data.get("website")
  };
  const error = validateUser(nextUser);
  if (error) return showMessage(error, "error");
  const result = await registerUser(nextUser);
  if (result.error) return showMessage(normalizeAuthError(result.error), "error");
  saveSession(result.session);
  showApp();
}

async function requestVerification() {
  const result = await requestEmailVerification();
  if (result.error) return alert(result.error);
  $("#verifyEmailDialog").showModal();
}

async function confirmVerification(event) {
  event.preventDefault();
  const user = currentUser();
  const result = await confirmEmailVerification(user.email, new FormData(event.currentTarget).get("code").trim());
  if (result.error) return $("#verifyEmailMessage").textContent = result.error;
  saveSession({ token: sessionToken(), user: result.session });
  $("#verifyEmailDialog").close();
  showApp();
}

async function login(event) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const result = await loginUser({
    email: data.get("email").trim().toLowerCase(),
    password: data.get("password")
  });
  if (result.error) return showMessage(normalizeAuthError(result.error), "error");
  saveSession(result.session);
  showApp();
}

async function requestReset(event) {
  event.preventDefault();
  const email = new FormData(event.currentTarget).get("email").trim().toLowerCase();
  const error = await requestPasswordReset(email);
  if (error) return showMessage(error, "error");
  $("#resetForm").elements.email.value = email;
  showAuthMode("reset");
  showMessage("Si el correo pertenece a una cuenta, recibirás un token ahí.", "success");
}

async function submitReset(event) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const error = await resetPassword({
    email: data.get("email").trim().toLowerCase(),
    token: data.get("token").trim(),
    password: data.get("password")
  });
  if (error) return showMessage(error, "error");
  showAuthMode("login");
  showMessage("Contraseña actualizada. Ya puedes entrar.", "success");
}

function showMessage(text, type = "") {
  const message = $("#authMessage");
  message.textContent = text;
  message.classList.toggle("error", type === "error");
  message.classList.toggle("success", type === "success");
}

function normalizeAuthError(error) {
  const messages = {
    "email already registered": "Ese email ya está registrado.",
    "invalid credentials": "Correo o contraseña incorrectos.",
    "email is invalid": "Correo inválido.",
    "password is too weak": "La contraseña necesita 8 caracteres, mayúscula, minúscula y número.",
    "too many attempts": "Demasiados intentos. Espera unos minutos antes de volver a probar.",
    "origin is required": "Selecciona tu origen."
  };
  return messages[error] || error;
}
