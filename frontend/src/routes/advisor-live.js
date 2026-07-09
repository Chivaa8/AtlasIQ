import { currentUser } from "../app/storage.js";
import { labels } from "../schemas/user.js";
import { parseTripPreferences } from "../schemas/trip-preferences.js";
import { recommendDestinations } from "../services/recommendation.js";

const euro = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const $ = (selector) => document.querySelector(selector);
let lastKey = "";

const images = [
  "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1513415564515-763d91423bdd?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80"
];

document.addEventListener("change", renderIfPlannerEvent, true);
document.addEventListener("input", renderIfPlannerEvent, true);
document.addEventListener("click", (event) => {
  if (event.target.closest('[data-page-target="advisor"]')) setTimeout(() => renderPlanner(true), 30);
});

setInterval(() => renderPlanner(false), 300);

function renderIfPlannerEvent(event) {
  if (event.target.closest("#tripForm")) setTimeout(() => renderPlanner(true), 0);
}

function renderPlanner(force) {
  const form = $("#tripForm");
  const resultsBox = $("#results");
  const user = currentUser();
  if (!form || !resultsBox || !user) return;

  const preferences = parseTripPreferences(new FormData(form), user.origin);
  const key = JSON.stringify(preferences);
  if (!force && key === lastKey) return;
  lastKey = key;

  const results = recommendDestinations(preferences);
  $("#matchMetric").textContent = `${results.length} matches`;
  $("#summary").textContent = results.length
    ? `${labels[preferences.continent] || "Opciones"} desde ${labels[preferences.origin]} para ${preferences.days} días`
    : "No hay destino claro con esos filtros";
  resultsBox.innerHTML = results.length ? results.map(cardTemplate).join("") : emptyTemplate();
}

function cardTemplate(destination, index) {
  const payload = encodeURIComponent(JSON.stringify(destination));
  const image = images[index % images.length];
  const flight = destination.flightPlan || { label: "Vuelo por confirmar", detail: "AtlasIQ ajustará la ruta cuando tengamos fechas y aeropuerto de salida." };
  const mobility = destination.mobilityPlan || { label: "Movilidad por confirmar", detail: "Podrás elegir transporte público, coche, moto o excursiones al crear el viaje." };

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

function emptyTemplate() {
  return `
    <article class="empty">
      <h3>Prueba a subir presupuesto o abrir continente.</h3>
      <p>AtlasIQ está priorizando opciones realistas según tu origen y días.</p>
    </article>
  `;
}
