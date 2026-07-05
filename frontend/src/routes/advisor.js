import { $ } from "../app/dom.js";
import { currentUser } from "../app/storage.js";
import { labels } from "../schemas/user.js";
import { parseTripPreferences } from "../schemas/trip-preferences.js";
import { recommendDestinations } from "../services/recommendation.js";

const euro = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

export function mountAdvisorRoute() {
  $("#tripForm").addEventListener("submit", (event) => {
    event.preventDefault();
    renderRecommendations();
  });
  $("#tripForm").addEventListener("input", renderRecommendations);
}

export function renderRecommendations() {
  const user = currentUser();
  if (!user) return;
  const preferences = parseTripPreferences(new FormData($("#tripForm")), user.origin);
  const results = recommendDestinations(preferences);

  $("#matchMetric").textContent = `${results.length} matches`;
  $("#summary").textContent = results.length
    ? `Opciones desde ${labels[preferences.origin]} para ${preferences.days} dias`
    : "No hay destino claro con esos filtros";
  $("#results").innerHTML = results.length ? results.map(cardTemplate).join("") : emptyTemplate();
}

function cardTemplate(destination) {
  return `
    <article class="destination-card">
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
        <div><dt>Cercania</dt><dd>${destination.proximity}</dd></div>
      </dl>
      <div class="tags">
        ${destination.landscape.map((tag) => `<span>${labels[tag]}</span>`).join("")}
        ${destination.environment.map((tag) => `<span>${labels[tag]}</span>`).join("")}
        ${destination.vibe.map((tag) => `<span>${labels[tag]}</span>`).join("")}
      </div>
      <p class="highlights">${destination.highlights.join(" · ")}</p>
    </article>
  `;
}

function emptyTemplate() {
  return `
    <article class="empty">
      <h3>Prueba a subir presupuesto o abrir continente.</h3>
      <p>AtlasIQ esta priorizando opciones realistas segun tu origen y dias.</p>
    </article>
  `;
}
