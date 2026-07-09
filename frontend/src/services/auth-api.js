import { apiBaseUrl, backendUnavailableMessage } from "../app/config.js";

const authEndpoint = `${apiBaseUrl}/auth`;

export async function registerUser(user) {
  return postAuth("register", user);
}

export async function loginUser(credentials) {
  return postAuth("login", credentials);
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
