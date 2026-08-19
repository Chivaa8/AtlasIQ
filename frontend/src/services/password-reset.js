import { apiBaseUrl } from "../app/config.js";

const passwordResetEndpoint = `${apiBaseUrl}/password-reset`;

export async function requestPasswordReset(email) {
  return postJson(`${passwordResetEndpoint}/request`, { email });
}

export async function resetPassword({ email, token, password }) {
  const error = await postJson(`${passwordResetEndpoint}/confirm`, { email, token, password });
  return error;
}

async function postJson(url, body) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const payload = await response.json().catch(() => ({}));
    return response.ok ? "" : payload.error || "No se pudo completar la operación.";
  } catch {
    return "Servicio de correo no disponible. Arranca el backend de AtlasIQ.";
  }
}
