import { $ } from "../app/dom.js";
import { showPage } from "../app/pages.js";
import { currentUser } from "../app/storage.js";
import { labels } from "../schemas/user.js";
import { parseTripPreferences } from "../schemas/trip-preferences.js";
import { recommendDestinations } from "../services/recommendation.js";
import { createTripFromDestination } from "../services/trips.js";
import { renderTrips } from "./trips.js";

const euro = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
let lastPreferencesKey = "";
const continentImages = {
  africa: "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=900&q=80",
  america: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
  asia: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=900&q=80",
  europe: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=900&q=80",
  oceania: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80"
};

export function mountAdvisorRoute() {
  const form = $("#tripForm");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    renderRecommendations();
  });
  form.addEventListener("input", renderRecommendations);
  form.addEventListener("change", renderRecommendations);
  document.addEventListener("input", renderPlannerChange, true);
  document.addEventListener("change", renderPlannerChange, true);
  document.addEventListener("click", (event) => {
    if (event.target.closest('[data-page-target="advisor"]')) setTimeout(renderRecommendations, 0);
  });
  // ponytail: polling only while this page is visible; replace with custom form controls if the planner grows.
  setInterval(() => {
    if (!$("#advisor").classList.contains("hidden")) renderRecommendations();
  }, 400);
  $("#results").addEventListener("click", async (event) => {
    const button = event.target.closest("[data-create-trip]");
    if (!button) return;
    await createTripFromDestination(JSON.parse(decodeURIComponent(button.dataset.createTrip)));
    await renderTrips();
    showPage("tripsPanel");
  });
}

export function renderRecommendations() {
  const user = currentUser();
  if (!user) return;
  const preferences = parseTripPreferences(new FormData($("#tripForm")), user.origin);
  const preferencesKey = JSON.stringify(preferences);
  if (preferencesKey === lastPreferencesKey) return;
  lastPreferencesKey = preferencesKey;
  const results = recommendDestinations(preferences);

  $("#matchMetric").textContent = `${results.length} matches`;
  $("#summary").textContent = results.length
    ? `Opciones desde ${labels[preferences.origin]} para ${preferences.days} días`
    : "No hay destino claro con esos filtros";
  $("#results").innerHTML = results.length ? results.map(cardTemplate).join("") : emptyTemplate();
}

function cardTemplate(destination) {
  const flight = destination.flightPlan || { label: "Vuelo por confirmar", detail: "AtlasIQ ajustará la ruta cuando tengamos fechas y aeropuerto de salida." };
  const mobility = destination.mobilityPlan || { label: "Movilidad por confirmar", detail: "Podrás elegir transporte público, coche, moto o excursiones al crear el viaje." };
  const payload = encodeURIComponent(JSON.stringify(destination));
  const image = continentImages[destination.continent] || continentImages.europe;

  return `
    <article class="destination-card">
      <div class="destination-image" style="background-image: url('${image}')" role="img" aria-label="${destination.name}"></div>
      <div class="destination-top">
        <div>
          <span>${labels[destination.continent]}</span>
          <h3>${destination.name}</h3>
          <p>${destination.city}</p>
        </div>
        <strong>${destination.score}/100</strong>
      </div>
      <dl>
        <div><dt>Coste estimado</dt><dd>${euro.format(destination.estimatedCost)}</dd></div>
        <div><dt>Cercanía</dt><dd>${destination.proximity}</dd></div>
        <div><dt>Vuelo</dt><dd>${flight.label}</dd></div>
        <div><dt>Movilidad</dt><dd>${mobility.label}</dd></div>
      </dl>
      <p class="flight-note">${flight.detail}</p>
      <p class="flight-note">${mobility.detail}</p>
      <div class="tags">
        ${destination.landscape.map((tag) => `<span>${labels[tag]}</span>`).join("")}
        ${destination.environment.map((tag) => `<span>${labels[tag]}</span>`).join("")}
        ${destination.vibe.map((tag) => `<span>${labels[tag]}</span>`).join("")}
      </div>
      <p class="highlights">${destination.highlights.join(" · ")}</p>
      <button type="button" data-create-trip="${payload}">Crear viaje</button>
    </article>
  `;
}

function renderPlannerChange(event) {
  if (event.target.closest("#tripForm")) renderRecommendations();
}

function emptyTemplate() {
  return `
    <article class="empty">
      <h3>Prueba a subir presupuesto o abrir continente.</h3>
      <p>AtlasIQ está priorizando opciones realistas según tu origen y días.</p>
    </article>
  `;
}
