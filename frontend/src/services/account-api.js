import { apiBaseUrl } from "../app/config.js";
import { sessionToken } from "../app/storage.js";

export const exportAccount = () => request("GET", "/account/export");
export const deleteAccount = () => request("DELETE", "/account");

async function request(method, path) {
  try {
    const response = await fetch(`${apiBaseUrl}${path}`, { method, headers: { Authorization: `Bearer ${sessionToken()}` } });
    const payload = await response.json().catch(() => ({}));
    return response.ok ? payload : { error: payload.error || "No se pudo completar la acción." };
  } catch { return { error: "Backend no disponible." }; }
}
