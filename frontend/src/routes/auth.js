import { $ } from "../app/dom.js";
import { labels, validateUser } from "../schemas/user.js";
import { isProfileComplete } from "../schemas/profile.js";
import { currentUser, endSession, saveUsers, startSession, users } from "../app/storage.js";
import { renderRecommendations } from "./advisor.js";
import { renderProfile } from "./profile.js";
import { requestPasswordReset, resetPassword } from "../services/password-reset.js";

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
  renderProfile();
  const needsProfile = !isProfileComplete(user);
  $("#appView").classList.toggle("onboarding", needsProfile);
  document.querySelector(".profile-panel").classList.toggle("hidden", !needsProfile);
  $("#advisor").classList.toggle("hidden", needsProfile);
  if (!needsProfile) renderRecommendations();
}

function showAuthMode(mode) {
  ["login", "register", "forgot", "reset"].forEach((name) => {
    $(`#${name}Form`).classList.toggle("hidden", name !== mode);
  });
  $("#loginTab").classList.toggle("active", mode === "login");
  $("#registerTab").classList.toggle("active", mode === "register");
  showMessage("");
}

function register(event) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const nextUser = {
    id: crypto.randomUUID(),
    name: data.get("name").trim(),
    email: data.get("email").trim().toLowerCase(),
    password: data.get("password"),
    origin: data.get("origin"),
    currency: "EUR"
  };
  const error = validateUser(nextUser);
  if (error) return showMessage(error);
  if (users().some((user) => user.email === nextUser.email)) return showMessage("Ese email ya esta registrado.");

  saveUsers([...users(), nextUser]);
  startSession(nextUser.email);
  showApp();
}

function login(event) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const email = data.get("email").trim().toLowerCase();
  const user = users().find((item) => item.email === email && item.password === data.get("password"));
  if (!user) return showMessage("Correo o contraseña incorrectos.");
  startSession(user.email);
  showApp();
}

async function requestReset(event) {
  event.preventDefault();
  const email = new FormData(event.currentTarget).get("email").trim().toLowerCase();
  const error = await requestPasswordReset(email);
  if (error) return showMessage(error);
  $("#resetForm").elements.email.value = email;
  showAuthMode("reset");
  showMessage("Si el correo pertenece a una cuenta, recibirás un token ahí.");
}

async function submitReset(event) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const error = await resetPassword({
    email: data.get("email").trim().toLowerCase(),
    token: data.get("token").trim(),
    password: data.get("password")
  });
  if (error) return showMessage(error);
  showAuthMode("login");
  showMessage("Contraseña actualizada. Ya puedes entrar.");
}

function showMessage(text) {
  $("#authMessage").textContent = text;
}
