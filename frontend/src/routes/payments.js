import { paymentHistory, requestRefund } from "../services/payments-api.js";
import { addPlannedPayment, plannedPayments, updatePlannedPayment } from "../services/user-data-api.js";
import { confirmAction, notify, skeleton, withLoading } from "../app/ui.js";

const euro = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });
let scheduled = [];

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
  list.innerHTML = `<li>${skeleton(1)}</li>`;
  const result = await paymentHistory();
  if (result.error) return list.innerHTML = `<li><span>${escapeHtml(result.error)}</span></li>`;
  list.innerHTML = result.length ? result.map((payment) => `<li><span><strong>${escapeHtml(payment.productId)}</strong><small>${statusLabel(payment.status)}</small></span><strong>${euro.format(payment.amount / 100)}</strong>${payment.status === "paid" ? `<button class="link-button" type="button" data-refund-payment="${payment.id}">Solicitar reembolso</button>` : ""}</li>`).join("") : "<li><span>No hay pagos reales.</span></li>";
}

async function refundPayment(event) {
  const button = event.target.closest("[data-refund-payment]");
  if (!button) return;
  if (!confirmAction("¿Solicitar el reembolso de este pago?")) return;
  const result = await withLoading(button, "Solicitando...", () => requestRefund(button.dataset.refundPayment));
  if (result.error) return notify(result.error, "error");
  notify("Reembolso solicitado.");
  await renderStripePayments();
}

async function addPayment(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const payment = createPayment(data.get("concept"), data.get("amount"), data.get("date"));
  if (!payment) return showMessage("Completa un concepto, un importe positivo y una fecha.", true);
  const result = await addPlannedPayment(payment);
  if (result.error) return showMessage(result.error, true);
  scheduled = [result, ...scheduled];
  form.reset();
  showMessage("Pago previsto añadido.");
  notify("Pago previsto añadido.");
  renderPayments();
}

async function togglePayment(event) {
  const button = event.target.closest("[data-payment-id]");
  if (!button) return;
  const payment = scheduled.find((item) => item.id === button.dataset.paymentId);
  if (!payment) return;
  const result = await updatePlannedPayment(payment.id, { ...payment, completed: !payment.completed });
  if (result.error) return showMessage(result.error, true);
  scheduled = scheduled.map((item) => item.id === result.id ? result : item);
  renderPayments();
  notify(result.completed ? "Pago marcado como completado." : "Pago reabierto.");
}

export function createPayment(concept, amount, date) {
  const value = Number(amount);
  if (!String(concept || "").trim() || !Number.isFinite(value) || value <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(String(date))) return null;
  return { id: crypto.randomUUID(), concept: String(concept).trim(), amount: value, date: String(date), completed: false };
}

async function renderPayments() {
  const list = document.querySelector("#scheduledPayments");
  list.innerHTML = `<li>${skeleton(1)}</li>`;
  const result = await plannedPayments();
  if (Array.isArray(result)) scheduled = result;
  const entries = scheduled;
  list.innerHTML = entries.length ? entries.map((payment) => `
    <li class="${payment.completed ? "completed" : ""}">
      <span><strong>${escapeHtml(payment.concept)}</strong><small>${formatDate(payment.date)}</small></span>
      <strong>${euro.format(payment.amount)}</strong>
      <button class="link-button" type="button" data-payment-id="${payment.id}">${payment.completed ? "Reabrir" : "Completar"}</button>
    </li>
  `).join("") : "<li><span>No hay pagos previstos.</span></li>";
  document.querySelector("#scheduledPaymentTotal").textContent = euro.format(entries.filter((payment) => !payment.completed).reduce((sum, payment) => sum + payment.amount, 0));
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
