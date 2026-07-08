import { $ } from "../app/dom.js";
import { buildItinerary } from "../schemas/itinerary.js";
import { addExpense, toggleChecklistItem, tripById } from "../services/trips.js";

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
  $("#advisor").classList.add("hidden");
  $("#tripDetail").classList.remove("hidden");
}

function renderExpenses(trip) {
  const spent = (trip.expenses || []).reduce((sum, expense) => sum + expense.amount, 0);
  $("#expenseSummary").textContent = `${euro.format(spent)} gastados · ${euro.format(trip.estimatedCost - spent)} restantes`;
  $("#expenseList").innerHTML = (trip.expenses || []).length
    ? trip.expenses.map((expense) => `
      <div class="expense-row">
        <span>${expense.concept}</span>
        <strong>${euro.format(expense.amount)}</strong>
      </div>
    `).join("")
    : `<p class="muted">Aún no hay gastos.</p>`;
}
