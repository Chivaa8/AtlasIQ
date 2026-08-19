import { apiBaseUrl } from "../app/config.js";
import { sessionToken } from "../app/storage.js";

export const reviews = () => request("/reviews");
export const addReview = (review) => request("/reviews", { method: "POST", body: JSON.stringify(review) });
export const favorites = () => request("/favorites");
export const addFavorite = (offerId) => request("/favorites", { method: "POST", body: JSON.stringify({ offerId }) });
export const removeFavorite = (id) => request(`/favorites/${encodeURIComponent(id)}`, { method: "DELETE" });
export const plannedPayments = () => request("/planned-payments");
export const addPlannedPayment = (payment) => request("/planned-payments", { method: "POST", body: JSON.stringify(payment) });
export const updatePlannedPayment = (id, payment) => request(`/planned-payments/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(payment) });
export const savePreferences = (preferences) => request("/auth/me/preferences", { method: "PATCH", body: JSON.stringify(preferences) });

async function request(path, options = {}) {
  try {
    const response = await fetch(`${apiBaseUrl}${path}`, { ...options, headers: { Authorization: `Bearer ${sessionToken()}`, "Content-Type": "application/json", ...options.headers } });
    const payload = await response.json().catch(() => ({}));
    return response.ok ? payload : { error: payload.error || "No se pudo guardar." };
  } catch { return { error: "Backend no disponible." }; }
}
