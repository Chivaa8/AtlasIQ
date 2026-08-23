import { apiBaseUrl } from "../app/config.js";
import { sessionToken } from "../app/storage.js";

export const adminUsers = () => request("/admin/users");
export const setUserBlocked = (id, blocked) => request(`/admin/users/${id}`, { method: "PATCH", body: JSON.stringify({ blocked }) });
export const removeReview = (id) => request(`/admin/reviews/${id}`, { method: "DELETE" });

async function request(path, options = {}) {
  try {
    const response = await fetch(`${apiBaseUrl}${path}`, { ...options, headers: { Authorization: `Bearer ${sessionToken()}`, "Content-Type": "application/json" } });
    const payload = await response.json().catch(() => ({}));
    return response.ok ? payload : { error: payload.error || "No se pudo completar la acción." };
  } catch { return { error: "Backend no disponible." }; }
}
