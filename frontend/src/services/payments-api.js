import { apiBaseUrl } from "../app/config.js";
import { sessionToken } from "../app/storage.js";

export async function createCheckout(productId) {
  return request("/payments/checkout", { method: "POST", body: JSON.stringify({ productId }) });
}

export async function paymentHistory() {
  return request("/payments");
}

export async function requestRefund(paymentId) {
  return request(`/payments/${encodeURIComponent(paymentId)}/refund`, { method: "POST" });
}

async function request(path, options = {}) {
  try {
    const response = await fetch(`${apiBaseUrl}${path}`, { ...options, headers: { Authorization: `Bearer ${sessionToken()}`, "Content-Type": "application/json", ...options.headers } });
    const payload = await response.json().catch(() => ({}));
    return response.ok ? payload : { error: payload.error || "No se pudo completar la operación." };
  } catch {
    return { error: "Backend no disponible." };
  }
}
