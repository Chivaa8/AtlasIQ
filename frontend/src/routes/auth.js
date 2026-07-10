import { $ } from "../app/dom.js";
import { currentUser, endSession, saveSession } from "../app/storage.js";
import { showPage } from "../app/pages.js";
import { isProfileComplete } from "../schemas/profile.js";
import { labels, validateUser } from "../schemas/user.js";
import { loginUser, registerUser } from "../services/auth-api.js";
import { requestPasswordReset, resetPassword } from "../services/password-reset.js";
import { renderRecommendations } from "./advisor.js";
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
  $("#logoutBtn").addEventListener("click", () => {
    endSession();
    showApp();
  });
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
    currency: "EUR"
  };
  const error = validateUser(nextUser);
  if (error) return showMessage(error, "error");
  const result = await registerUser(nextUser);
  if (result.error) return showMessage(normalizeAuthError(result.error), "error");
  saveSession(result.session);
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
    "password must have 6 characters": "La contraseña debe tener al menos 6 caracteres.",
    "origin is required": "Selecciona tu origen."
  };
  return messages[error] || error;
}
