import { apiBaseUrl, backendUnavailableMessage } from "../app/config.js";

const authEndpoint = `${apiBaseUrl}/auth`;

export async function registerUser(user) {
  return postAuth("register", user);
}

export async function loginUser(credentials) {
  return postAuth("login", credentials);
}

export const refreshSession = () => authenticated("refresh");
export const revokeSession = () => authenticated("logout");
export const requestEmailVerification = () => authenticated("email-verification/request");

export async function confirmEmailVerification(email, code) {
  return postAuth("email-verification/confirm", { email, code });
}

async function authenticated(path) {
  const { sessionToken } = await import("../app/storage.js");
  try {
    const response = await fetch(`${authEndpoint}/${path}`, { method: "POST", headers: { Authorization: `Bearer ${sessionToken()}`, "Content-Type": "application/json" }, body: "{}" });
    const payload = await response.json().catch(() => ({}));
    return response.ok ? { session: payload, error: "" } : { session: null, error: payload.error || "No se pudo completar la operación." };
  } catch { return { session: null, error: backendUnavailableMessage }; }
}

async function postAuth(path, body) {
  try {
    const response = await fetch(`${authEndpoint}/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const payload = await response.json().catch(() => ({}));
    return response.ok
      ? { session: payload, error: "" }
      : { session: null, error: payload.error || "No se pudo completar la operación." };
  } catch {
    return { session: null, error: backendUnavailableMessage };
  }
}
