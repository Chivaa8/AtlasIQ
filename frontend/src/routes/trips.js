import { $ } from "../app/dom.js";
import { currentUser } from "../app/storage.js";
import { archiveTrip, tripsForCurrentUser } from "../services/trips.js";
import { showTripDetail } from "./trip-detail.js";

const euro = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

export function mountTripsRoute() {
  $("#tripList").addEventListener("click", async (event) => {
    const archiveButton = event.target.closest("[data-archive-trip]");
    if (archiveButton) {
      await archiveTrip(archiveButton.dataset.archiveTrip);
      return renderTrips();
    }
    const button = event.target.closest("[data-trip-id]");
    if (button) showTripDetail(button.dataset.tripId);
  });
  renderTrips();
}

export async function renderTrips() {
  const user = currentUser();
  if (!user) return;
  const trips = (await tripsForCurrentUser()).filter((trip) => !trip.archivedAt);
  $("#tripCount").textContent = `${trips.length} viajes`;
  $("#tripList").innerHTML = trips.length ? trips.map(tripTemplate).join("") : emptyTemplate();
  renderHomeDashboard(trips);
  renderPayments(trips);
}

function renderHomeDashboard(trips) {
  const budget = trips.reduce((total, trip) => total + Number(trip.estimatedCost || 0), 0);
  const readyDocuments = trips.reduce(
    (total, trip) => total + (trip.documents || []).filter((document) => document.ready).length,
    0
  );
  $("#homeTripCount").textContent = trips.length;
  $("#homeBudget").textContent = euro.format(budget);
  $("#homeDocs").textContent = readyDocuments;
  $("#homeInsight").textContent = trips.length
    ? `Tienes ${trips.length} viaje${trips.length === 1 ? "" : "s"} en marcha con ${euro.format(budget)} previstos.`
    : "Busca un destino y AtlasIQ preparará una ruta con presupuesto, checklist y documentación.";
}

function renderPayments(trips) {
  const budget = trips.reduce((total, trip) => total + Number(trip.estimatedCost || 0), 0);
  const shared = trips.reduce((total, trip) => total + (trip.companions || []).length, 0);
  $("#paymentTotal").textContent = euro.format(budget);
  $("#pendingPayments").textContent = trips.length;
  $("#sharedPayments").textContent = shared;
}

function tripTemplate(trip) {
  return `
    <article class="trip-card">
      <div>
        <span>${trip.continent}</span>
        <h3>${trip.name}</h3>
        <p>${trip.city}</p>
      </div>
      <div class="trip-actions">
        <strong>${euro.format(trip.estimatedCost)}</strong>
        <button type="button" data-trip-id="${trip.id}">Ver viaje</button>
        <button class="link-button" type="button" data-archive-trip="${trip.id}">Archivar</button>
      </div>
    </article>
  `;
}

function emptyTemplate() {
  return `
    <article class="trip-empty">
      <h3>Aún no tienes viajes.</h3>
      <p>Elige una recomendación y crea tu primer viaje.</p>
    </article>
  `;
}
