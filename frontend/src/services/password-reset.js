import { saveUsers, users } from "../app/storage.js";

const passwordResetEndpoint = "http://127.0.0.1:8023/api/password-reset";

export async function requestPasswordReset(email) {
  const user = users().find((item) => item.email === email);
  if (!user) return "";
  return postJson(`${passwordResetEndpoint}/request`, { email });
}

export async function resetPassword({ email, token, password }) {
  const error = await postJson(`${passwordResetEndpoint}/confirm`, { email, token, password });
  if (error) return error;
  saveUsers(users().map((user) => (user.email === email ? { ...user, password } : user)));
  return "";
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
