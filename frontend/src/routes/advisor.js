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

const destinationImages = {
  "Alemania": "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=900&q=80",
  "Andalucía": "https://images.unsplash.com/photo-1558642084-fd07fae5282e?auto=format&fit=crop&w=900&q=80",
  "Arabia Saudí": "https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?auto=format&fit=crop&w=900&q=80",
  "Argentina": "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?auto=format&fit=crop&w=900&q=80",
  "Australia": "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?auto=format&fit=crop&w=900&q=80",
  "Austria": "https://images.unsplash.com/photo-1516550893923-42d28e5677af?auto=format&fit=crop&w=900&q=80",
  "Bélgica": "https://images.unsplash.com/photo-1491557345352-5929e343eb89?auto=format&fit=crop&w=900&q=80",
  "Brasil": "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=900&q=80",
  "Camboya": "https://images.unsplash.com/photo-1601058497548-f247dfe349d6?auto=format&fit=crop&w=900&q=80",
  "Canadá": "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=900&q=80",
  "Cataluña": "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=900&q=80",
  "Chile": "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80",
  "China": "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=900&q=80",
  "Colombia": "https://images.unsplash.com/photo-1534943441045-1009d7cb0bb9?auto=format&fit=crop&w=900&q=80",
  "Corea del Sur": "https://images.unsplash.com/photo-1538485399081-7c8ed3d7504f?auto=format&fit=crop&w=900&q=80",
  "Croacia": "https://images.unsplash.com/photo-1555990538-c48dbe047ecf?auto=format&fit=crop&w=900&q=80",
  "Dinamarca": "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?auto=format&fit=crop&w=900&q=80",
  "Egipto": "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=900&q=80",
  "Emiratos Árabes Unidos": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80",
  "España": "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=900&q=80",
  "Estados Unidos": "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=900&q=80",
  "Filipinas": "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=900&q=80",
  "Francia": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80",
  "Grecia": "https://images.unsplash.com/photo-1503152394-c571994fd383?auto=format&fit=crop&w=900&q=80",
  "India": "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=900&q=80",
  "Indonesia": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=80",
  "Irlanda": "https://images.unsplash.com/photo-1534445867742-43195f401b6c?auto=format&fit=crop&w=900&q=80",
  "Italia": "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=900&q=80",
  "Japón": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=900&q=80",
  "Malasia": "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=900&q=80",
  "Marruecos": "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=900&q=80",
  "México": "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&w=900&q=80",
  "Noruega": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
  "Nueva Zelanda": "https://images.unsplash.com/photo-1469521669194-babb45599def?auto=format&fit=crop&w=900&q=80",
  "Países Bajos": "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=900&q=80",
  "Perú": "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=900&q=80",
  "Portugal": "https://images.unsplash.com/photo-1500930287596-c1ecaa373bb2?auto=format&fit=crop&w=900&q=80",
  "Qatar": "https://images.unsplash.com/photo-1546412414-e1885259563a?auto=format&fit=crop&w=900&q=80",
  "Reino Unido": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=900&q=80",
  "República Dominicana": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
  "Singapur": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=900&q=80",
  "Sudáfrica": "https://images.unsplash.com/photo-1484318571209-661cf29a69fe?auto=format&fit=crop&w=900&q=80",
  "Suiza": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=900&q=80",
  "Tailandia": "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=900&q=80",
  "Túnez": "https://images.unsplash.com/photo-1549144511-f099e773c147?auto=format&fit=crop&w=900&q=80",
  "Turquía": "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=900&q=80",
  "Vietnam": "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=80"
};

const spanishRegionImage = "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=900&q=80";

export function mountAdvisorRoute() {
  const form = $("#tripForm");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    renderRecommendations(true);
  });
  form.addEventListener("input", () => renderRecommendations(true));
  form.addEventListener("change", () => renderRecommendations(true));
  document.addEventListener("input", renderPlannerChange, true);
  document.addEventListener("change", renderPlannerChange, true);
  document.addEventListener("click", (event) => {
    if (event.target.closest('[data-page-target="advisor"]')) setTimeout(() => renderRecommendations(true), 0);
  });
  // ponytail: tiny polling guard for native selects that miss events in cached browser sessions.
  setInterval(renderRecommendations, 300);
  $("#results").addEventListener("click", async (event) => {
    const button = event.target.closest("[data-create-trip]");
    if (!button) return;
    await createTripFromDestination(JSON.parse(decodeURIComponent(button.dataset.createTrip)));
    await renderTrips();
    showPage("tripsPanel");
  });
}

export function renderRecommendations(force = false) {
  const user = currentUser();
  const form = $("#tripForm");
  if (!user || !form) return;

  const preferences = parseTripPreferences(new FormData(form), user.origin);
  const preferencesKey = JSON.stringify(preferences);
  if (!force && preferencesKey === lastPreferencesKey) return;
  lastPreferencesKey = preferencesKey;

  const results = recommendDestinations(preferences);
  $("#matchMetric").textContent = `${results.length} matches`;
  $("#summary").textContent = results.length
    ? `${labels[preferences.continent] || "Opciones"} desde ${labels[preferences.origin]} para ${preferences.days} días`
    : "No hay destino claro con esos filtros";
  $("#results").innerHTML = results.length ? results.map(cardTemplate).join("") : emptyTemplate();
}

function cardTemplate(destination) {
  const flight = destination.flightPlan || { label: "Vuelo por confirmar", detail: "AtlasIQ ajustará la ruta cuando tengamos fechas y aeropuerto de salida." };
  const mobility = destination.mobilityPlan || { label: "Movilidad por confirmar", detail: "Podrás elegir transporte público, coche, moto o excursiones al crear el viaje." };
  const payload = encodeURIComponent(JSON.stringify(destination));
  const image = destinationImages[destination.name] || destinationImages[destination.country] || spanishRegionImage;

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
  if (event.target.closest("#tripForm")) renderRecommendations(true);
}

function emptyTemplate() {
  return `
    <article class="empty">
      <h3>Prueba a subir presupuesto o abrir continente.</h3>
      <p>AtlasIQ está priorizando opciones realistas según tu origen y días.</p>
    </article>
  `;
}
