import { currentUser } from "../app/storage.js";

const offers = [
  { id: "guide-rome", type: "guide", destination: "Roma", title: "Lucia, guía local", detail: "Español, italiano e inglés · centro histórico y Vaticano", price: 95, unit: "4 horas", rating: 4.9 },
  { id: "guide-tokyo", type: "guide", destination: "Tokio", title: "Kenji, guía local", detail: "Español, japonés e inglés · barrios, gastronomía y templos", price: 120, unit: "5 horas", rating: 4.8 },
  { id: "guide-marrakech", type: "guide", destination: "Marrakech", title: "Samira, guía local", detail: "Español, francés y árabe · medina, zocos e historia", price: 70, unit: "4 horas", rating: 4.9 },
  { id: "hotel-rome", type: "hotel", destination: "Roma", title: "Hotel Centro Roma", detail: "4 estrellas · desayuno · cancelación flexible", price: 138, unit: "noche", rating: 4.6 },
  { id: "hotel-bali", type: "hotel", destination: "Bali", title: "Ubud Garden Resort", detail: "4 estrellas · piscina · desayuno · traslado", price: 92, unit: "noche", rating: 4.7 },
  { id: "hotel-tokyo", type: "hotel", destination: "Tokio", title: "Shinjuku City Stay", detail: "3 estrellas · metro cercano · cancelación flexible", price: 110, unit: "noche", rating: 4.5 },
  { id: "insurance-basic", type: "insurance", destination: "Mundial", title: "Seguro Esencial", detail: "Asistencia médica 100.000 € · equipaje · repatriación", price: 29, unit: "viaje", rating: 4.5 },
  { id: "insurance-plus", type: "insurance", destination: "Mundial", title: "Seguro Completo", detail: "Asistencia médica 500.000 € · cancelación · deportes", price: 59, unit: "viaje", rating: 4.8 },
  { id: "rental-car", type: "rental", destination: "Mundial", title: "Alquiler de coche", detail: "Comparación de vehículos · kilometraje y coberturas según proveedor", price: 45, unit: "día", rating: 4.6 },
  { id: "rental-moto", type: "rental", destination: "Mundial", title: "Alquiler de moto", detail: "Scooter o moto · revisa permiso, casco, franquicia y cilindrada", price: 25, unit: "día", rating: 4.5 },
  { id: "flight-rome", type: "flight", destination: "Roma", title: "Vuelos a Roma", detail: "Compara horarios, escalas, equipaje y condiciones de cambio", price: 120, unit: "persona", rating: 4.6 },
  { id: "flight-tokyo", type: "flight", destination: "Tokio", title: "Vuelos a Tokio", detail: "Compara rutas, escalas, equipaje y condiciones de cambio", price: 690, unit: "persona", rating: 4.6 },
  { id: "package-rome", type: "package", destination: "Roma", title: "Vuelo + hotel en Roma", detail: "Vuelo ida y vuelta · 4 noches · desayuno", price: 489, unit: "persona", rating: 4.7 },
  { id: "package-bali", type: "package", destination: "Bali", title: "Vuelo + resort en Bali", detail: "Vuelo ida y vuelta · 7 noches · desayuno y traslado", price: 1090, unit: "persona", rating: 4.8 },
  { id: "package-tokyo", type: "package", destination: "Tokio", title: "Vuelo + hotel en Tokio", detail: "Vuelo ida y vuelta · 6 noches · seguro esencial", price: 1260, unit: "persona", rating: 4.7 }
];

const typeLabels = { guide: "Guía local", hotel: "Hotel", insurance: "Seguro", rental: "Coche o moto", flight: "Vuelo", package: "Vuelo + hotel" };
const key = "atlasiq-saved-offers";

export function mountBookingsRoute() {
  document.querySelector("#bookingFilters").addEventListener("input", renderOffers);
  document.querySelector("#bookingFilters").addEventListener("change", renderOffers);
  document.querySelector("#bookingOffers").addEventListener("click", saveOffer);
  document.querySelector("#savedOffers").addEventListener("click", removeOffer);
  renderOffers();
  renderSaved();
}

function renderOffers() {
  const filters = Object.fromEntries(new FormData(document.querySelector("#bookingFilters")));
  const filtered = offers.filter((offer) => offerMatches(offer, filters));
  document.querySelector("#bookingOffers").innerHTML = filtered.map((offer) => offerCard(offer, filters)).join("") || "<p class='trip-empty'>No hay opciones con esos filtros.</p>";
  document.querySelector("#bookingCount").textContent = `${filtered.length} opciones`;
}

function offerCard(offer, filters) {
  return `<article class="booking-card">
    <span>${typeLabels[offer.type]}</span><h3>${offer.title}</h3><p>${offer.destination} · ${offer.detail}</p>
    <div><strong>${offer.rating.toFixed(1)} ★</strong><strong>Desde ${offer.price} € / ${offer.unit}</strong></div>
    <div class="booking-actions"><button type="button" data-save-offer="${offer.id}">Guardar opción</button><a href="${providerUrl(offer, filters)}" target="_blank" rel="noopener noreferrer">Consultar disponibilidad real</a></div>
  </article>`;
}

function saveOffer(event) {
  const button = event.target.closest("[data-save-offer]");
  if (!button) return;
  const saved = savedIds();
  if (!saved.includes(button.dataset.saveOffer)) saveIds([...saved, button.dataset.saveOffer]);
  button.textContent = "Guardado";
  renderSaved();
}

function removeOffer(event) {
  const button = event.target.closest("[data-remove-offer]");
  if (!button) return;
  saveIds(savedIds().filter((id) => id !== button.dataset.removeOffer));
  renderSaved();
}

function renderSaved() {
  const saved = savedIds().map((id) => offers.find((offer) => offer.id === id)).filter(Boolean);
  document.querySelector("#savedOfferCount").textContent = saved.length;
  document.querySelector("#savedOffers").innerHTML = saved.length ? saved.map((offer) => `<li><span><strong>${offer.title}</strong><small>${offer.destination} · ${offer.price} €</small></span><button class="link-button" type="button" data-remove-offer="${offer.id}">Quitar</button></li>`).join("") : "<li>No has guardado opciones.</li>";
}

export function offerMatches(offer, filters) {
  const query = String(filters.destination || "").trim().toLocaleLowerCase("es");
  return (!filters.type || offer.type === filters.type)
    && (!query || `${offer.destination} ${offer.title} ${offer.detail}`.toLocaleLowerCase("es").includes(query));
}

export function providerUrl(offer, filters = {}) {
  const destination = offer.destination === "Mundial" ? String(filters.destination || "") : offer.destination;
  const query = encodeURIComponent(destination || "viaje");
  const start = encodeURIComponent(filters.start || "");
  const end = encodeURIComponent(filters.end || "");
  const travelers = Math.max(1, Number(filters.travelers) || 1);
  const urls = {
    guide: `https://www.getyourguide.es/s/?q=${query}`,
    hotel: `https://www.booking.com/searchresults.es.html?ss=${query}&checkin=${start}&checkout=${end}&group_adults=${travelers}&no_rooms=1`,
    insurance: "https://www.iatiseguros.com/",
    rental: `https://www.booking.com/cars/index.es.html?search=${query}`,
    flight: "https://www.skyscanner.es/transporte/vuelos/",
    package: "https://www.expedia.es/Paquetes"
  };
  return urls[offer.type];
}

function savedIds() {
  try {
    const email = currentUser()?.email || "guest";
    const all = JSON.parse(localStorage.getItem(key) || "{}");
    return Array.isArray(all[email]) ? all[email] : [];
  } catch { return []; }
}

function saveIds(ids) {
  const email = currentUser()?.email || "guest";
  let all = {};
  try { all = JSON.parse(localStorage.getItem(key) || "{}"); } catch {}
  localStorage.setItem(key, JSON.stringify({ ...all, [email]: ids }));
}
