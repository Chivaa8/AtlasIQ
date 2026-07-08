import { $ } from "../app/dom.js";
import { buildItinerary } from "../schemas/itinerary.js";
import { convertCurrency, tripSplit } from "../schemas/trip.js";
import { addCompanion, addExpense, toggleChecklistItem, tripById } from "../services/trips.js";

const euro = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
let activeTripId = "";

export function mountTripDetailRoute() {
  $("#closeTripDetailBtn").addEventListener("click", () => {
    $("#tripDetail").classList.add("hidden");
    $("#advisor").classList.remove("hidden");
  });
  $("#tripDetail").addEventListener("change", (event) => {
    const checkbox = event.target.closest("[data-check-item]");
    if (!checkbox) return;
    const trip = toggleChecklistItem(checkbox.dataset.tripId, checkbox.dataset.checkItem);
    if (trip) showTripDetail(trip.id);
  });
  $("#expenseForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const trip = addExpense(activeTripId, {
      concept: data.get("concept").trim(),
      amount: data.get("amount")
    });
    event.currentTarget.reset();
    if (trip) showTripDetail(trip.id);
  });
  $("#companionForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const trip = addCompanion(activeTripId, data.get("name"));
    event.currentTarget.reset();
    if (trip) showTripDetail(trip.id);
  });
  $("#currencyAmount").addEventListener("input", renderActiveConverter);
  $("#currencyTarget").addEventListener("change", renderActiveConverter);
}

export function showTripDetail(id) {
  const trip = tripById(id);
  if (!trip) return;
  activeTripId = trip.id;
  $("#tripDetailTitle").textContent = trip.name;
  $("#tripDetailCity").textContent = trip.city;
  $("#tripDetailBudget").textContent = `Presupuesto estimado: ${euro.format(trip.estimatedCost)}`;
  $("#tripItinerary").innerHTML = buildItinerary(trip).map((item) => `
    <li>
      <strong>${item.title}</strong>
      <p>${item.plan}</p>
    </li>
  `).join("");
  $("#tripChecklist").innerHTML = trip.checklist.map((item) => `
    <label class="check-item">
      <input type="checkbox" data-trip-id="${trip.id}" data-check-item="${item.id}" ${item.done ? "checked" : ""}>
      ${item.label}
    </label>
  `).join("");
  renderExpenses(trip);
  renderTravelTools(trip);
  $("#advisor").classList.add("hidden");
  $("#tripDetail").classList.remove("hidden");
}

function renderTravelTools(trip) {
  const visa = trip.visa || {
    status: "Revisa requisitos antes de viajar",
    detail: "AtlasIQ todavía no tiene datos específicos para este destino.",
    url: "https://www.exteriores.gob.es/es/ServiciosAlCiudadano/Paginas/Recomendaciones-de-viaje.aspx"
  };
  $("#visaStatus").textContent = visa.status;
  $("#visaDetail").textContent = visa.detail;
  $("#visaLink").href = visa.url;
  $("#currencyAmount").value = trip.estimatedCost;
  $("#currencyTarget").value = trip.currency || "EUR";
  renderConverter(trip);
}

function renderActiveConverter() {
  const trip = tripById(activeTripId);
  if (trip) renderConverter(trip);
}

function renderConverter(trip) {
  const amount = $("#currencyAmount").value || trip.estimatedCost;
  const target = $("#currencyTarget").value || trip.currency || "EUR";
  const converted = convertCurrency(amount, target);
  $("#currencyResult").textContent = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: target,
    maximumFractionDigits: 0
  }).format(converted);
}

function renderExpenses(trip) {
  const expenses = trip.expenses || [];
  const companions = trip.companions || [];
  const { spent, people, perPerson } = tripSplit(trip);
  $("#expenseSummary").textContent = `${euro.format(spent)} gastados · ${euro.format(trip.estimatedCost - spent)} restantes`;
  $("#splitSummary").textContent = `${people} ${people === 1 ? "persona" : "personas"} · ${euro.format(perPerson)} por persona`;
  $("#expenseList").innerHTML = expenses.length
    ? expenses.map((expense) => `
      <div class="expense-row">
        <span>${expense.concept}</span>
        <strong>${euro.format(expense.amount)}</strong>
      </div>
    `).join("")
    : `<p class="muted">Aún no hay gastos.</p>`;
  $("#companionList").innerHTML = companions.length
    ? companions.map((companion) => `
      <div class="companion-row">
        <span>${companion.name}</span>
      </div>
    `).join("")
    : `<p class="muted">Solo tú de momento.</p>`;
}
