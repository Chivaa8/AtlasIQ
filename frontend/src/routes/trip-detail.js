import { $ } from "../app/dom.js";
import { showPage } from "../app/pages.js";
import { buildItinerary } from "../schemas/itinerary.js";
import { convertCurrency, tripSplit } from "../schemas/trip.js";
import { addCompanion, addDocument, addExpense, toggleChecklistItem, toggleDocumentReady, tripById } from "../services/trips.js";

const euro = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
let activeTripId = "";

export function mountTripDetailRoute() {
  $("#closeTripDetailBtn").addEventListener("click", () => {
    showPage("tripsPanel");
  });
  $("#tripDetail").addEventListener("change", async (event) => {
    const checkbox = event.target.closest("[data-check-item]");
    const documentCheckbox = event.target.closest("[data-document-id]");
    if (documentCheckbox) {
      const trip = await toggleDocumentReady(documentCheckbox.dataset.tripId, documentCheckbox.dataset.documentId);
      if (trip) showTripDetail(trip.id);
      return;
    }
    if (!checkbox) return;
    const trip = await toggleChecklistItem(checkbox.dataset.tripId, checkbox.dataset.checkItem);
    if (trip) showTripDetail(trip.id);
  });
  $("#expenseForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const trip = await addExpense(activeTripId, {
      concept: data.get("concept").trim(),
      amount: data.get("amount")
    });
    event.currentTarget.reset();
    if (trip) showTripDetail(trip.id);
  });
  $("#companionForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const trip = await addCompanion(activeTripId, data.get("name"));
    event.currentTarget.reset();
    if (trip) showTripDetail(trip.id);
  });
  $("#documentForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const trip = await addDocument(activeTripId, {
      type: data.get("type"),
      name: data.get("name")
    });
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
  renderDocuments(trip);
  renderExpenses(trip);
  renderTravelTools(trip);
  renderDrivingRules(trip.driving);
  showPage("tripDetail");
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
  renderWeather(trip.weather);
  $("#currencyAmount").value = trip.estimatedCost;
  $("#currencyTarget").value = trip.currency || "EUR";
  renderConverter(trip);
}

function renderWeather(weather) {
  const info = weather || { average: "Sin datos", rain: "Sin datos", bestMonths: "Revisar antes de viajar" };
  $("#weatherAverage").textContent = info.average;
  $("#weatherRain").textContent = info.rain;
  $("#weatherBestMonths").textContent = info.bestMonths;
}

function renderDrivingRules(driving = {}) {
  $("#drivingSide").textContent = driving.side || "Revisar";
  $("#drivingCar").textContent = driving.car || "Revisa permiso, seguro y requisitos locales antes de alquilar.";
  $("#drivingMoto").textContent = driving.moto || "Revisa permiso de moto, casco, seguro y cilindrada permitida.";
  $("#drivingNote").textContent = driving.note || "Consulta siempre fuentes oficiales antes de circular.";
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

function renderDocuments(trip) {
  const documents = trip.documents || [];
  $("#tripDocuments").innerHTML = documents.length
    ? documents.map((document) => `
      <label class="document-row">
        <input type="checkbox" data-trip-id="${trip.id}" data-document-id="${document.id}" ${document.ready ? "checked" : ""}>
        <span>${document.name}</span>
        <strong>${document.type}</strong>
      </label>
    `).join("")
    : `<p class="muted">Aún no has añadido documentos.</p>`;
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
