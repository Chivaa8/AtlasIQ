import { currentUser } from "../app/storage.js";
import { paymentHistory, requestRefund } from "../services/payments-api.js";

const key = "atlasiq-payments";
const euro = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

export function mountPaymentsRoute() {
  document.querySelector("#paymentForm").addEventListener("submit", addPayment);
  document.querySelector("#scheduledPayments").addEventListener("click", togglePayment);
  document.querySelector("#stripePayments").addEventListener("click", refundPayment);
  document.addEventListener("click", (event) => {
    if (event.target.closest('[data-page-target="paymentsPanel"]')) { renderPayments(); renderStripePayments(); }
  });
}

async function renderStripePayments() {
  const list = document.querySelector("#stripePayments");
  const result = await paymentHistory();
  if (result.error) return list.innerHTML = `<li><span>${escapeHtml(result.error)}</span></li>`;
  list.innerHTML = result.length ? result.map((payment) => `<li><span><strong>${escapeHtml(payment.productId)}</strong><small>${statusLabel(payment.status)}</small></span><strong>${euro.format(payment.amount / 100)}</strong>${payment.status === "paid" ? `<button class="link-button" type="button" data-refund-payment="${payment.id}">Solicitar reembolso</button>` : ""}</li>`).join("") : "<li><span>No hay pagos reales.</span></li>";
}

async function refundPayment(event) {
  const button = event.target.closest("[data-refund-payment]");
  if (!button) return;
  button.disabled = true;
  const result = await requestRefund(button.dataset.refundPayment);
  if (result.error) { button.disabled = false; button.textContent = result.error; return; }
  await renderStripePayments();
}

function addPayment(event) {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const payment = createPayment(data.get("concept"), data.get("amount"), data.get("date"));
  if (!payment) return showMessage("Completa un concepto, un importe positivo y una fecha.", true);
  savePayments([payment, ...payments()]);
  event.currentTarget.reset();
  showMessage("Pago previsto añadido.");
  renderPayments();
}

function togglePayment(event) {
  const button = event.target.closest("[data-payment-id]");
  if (!button) return;
  savePayments(payments().map((payment) => payment.id === button.dataset.paymentId
    ? { ...payment, completed: !payment.completed }
    : payment));
  renderPayments();
}

export function createPayment(concept, amount, date) {
  const value = Number(amount);
  if (!String(concept || "").trim() || !Number.isFinite(value) || value <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(String(date))) return null;
  return { id: crypto.randomUUID(), concept: String(concept).trim(), amount: value, date: String(date), completed: false };
}

function renderPayments() {
  const list = document.querySelector("#scheduledPayments");
  const entries = payments();
  list.innerHTML = entries.length ? entries.map((payment) => `
    <li class="${payment.completed ? "completed" : ""}">
      <span><strong>${escapeHtml(payment.concept)}</strong><small>${formatDate(payment.date)}</small></span>
      <strong>${euro.format(payment.amount)}</strong>
      <button class="link-button" type="button" data-payment-id="${payment.id}">${payment.completed ? "Reabrir" : "Completar"}</button>
    </li>
  `).join("") : "<li><span>No hay pagos previstos.</span></li>";
  document.querySelector("#scheduledPaymentTotal").textContent = euro.format(entries.filter((payment) => !payment.completed).reduce((sum, payment) => sum + payment.amount, 0));
}

function payments() {
  try {
    const email = currentUser()?.email;
    const all = JSON.parse(localStorage.getItem(key) || "{}");
    return email && Array.isArray(all[email]) ? all[email] : [];
  } catch {
    return [];
  }
}

function savePayments(entries) {
  const email = currentUser()?.email;
  if (!email) return;
  let all = {};
  try { all = JSON.parse(localStorage.getItem(key) || "{}"); } catch {}
  localStorage.setItem(key, JSON.stringify({ ...all, [email]: entries }));
}

function showMessage(text, error = false) {
  const message = document.querySelector("#paymentMessage");
  message.textContent = text;
  message.classList.toggle("error", error);
  message.classList.toggle("success", !error);
}

function formatDate(value) {
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

function statusLabel(status) {
  return ({ pending: "Pendiente", paid: "Pagado", expired: "Caducado", refunded: "Reembolsado" })[status] || status;
}
