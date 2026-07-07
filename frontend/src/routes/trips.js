import { $ } from "../app/dom.js";
import { currentUser } from "../app/storage.js";
import { tripsForCurrentUser } from "../services/trips.js";

const euro = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

export function mountTripsRoute() {
  renderTrips();
}

export function renderTrips() {
  const user = currentUser();
  if (!user) return;
  const trips = tripsForCurrentUser();
  $("#tripsPanel").classList.remove("hidden");
  $("#tripCount").textContent = `${trips.length} viajes`;
  $("#tripList").innerHTML = trips.length ? trips.map(tripTemplate).join("") : emptyTemplate();
}

function tripTemplate(trip) {
  return `
    <article class="trip-card">
      <div>
        <span>${trip.continent}</span>
        <h3>${trip.name}</h3>
        <p>${trip.city}</p>
      </div>
      <strong>${euro.format(trip.estimatedCost)}</strong>
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
