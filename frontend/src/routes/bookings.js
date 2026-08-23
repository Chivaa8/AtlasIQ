import { createCheckout } from "../services/payments-api.js";
import { addFavorite, favorites, removeFavorite } from "../services/user-data-api.js";
import { confirmAction, emptyState, notify, skeleton, withLoading } from "../app/ui.js";

const offers = [
  { id: "guide-rome", type: "guide", destination: "Roma", title: "Lucia, guía local", detail: "Español, italiano e inglés · centro histórico y Vaticano", price: 95, unit: "4 horas", rating: 4.9 },
  { id: "guide-tokyo", type: "guide", destination: "Tokio", title: "Kenji, guía local", detail: "Español, japonés e inglés · barrios, gastronomía y templos", price: 120, unit: "5 horas", rating: 4.8 },
  { id: "guide-marrakech", type: "guide", destination: "Marrakech", title: "Samira, guía local", detail: "Español, francés y árabe · medina, zocos e historia", price: 70, unit: "4 horas", rating: 4.9 },
  { id: "free-tour-rome", type: "free-tour", destination: "Roma", title: "Free tour por Roma", detail: "Centro histórico · pago libre al guía al finalizar", price: 0, unit: "reserva", rating: 4.8 },
  { id: "free-tour-lisbon", type: "free-tour", destination: "Lisboa", title: "Free tour por Lisboa", detail: "Baixa, Chiado y Alfama · pago libre al guía al finalizar", price: 0, unit: "reserva", rating: 4.8 },
  { id: "excursion-rome", type: "excursion", destination: "Roma", title: "Excursión a Tivoli", detail: "Villa Adriana y Villa de Este · guía y transporte", price: 69, unit: "persona", rating: 4.7 },
  { id: "excursion-bali", type: "excursion", destination: "Bali", title: "Templos y arrozales de Bali", detail: "Guía local · transporte · día completo", price: 55, unit: "persona", rating: 4.8 },
  { id: "hotel-rome", type: "hotel", destination: "Roma", title: "Hotel Centro Roma", detail: "4 estrellas · desayuno · cancelación flexible", price: 138, unit: "noche", rating: 4.6 },
  { id: "hotel-bali", type: "hotel", destination: "Bali", title: "Ubud Garden Resort", detail: "4 estrellas · piscina · desayuno · traslado", price: 92, unit: "noche", rating: 4.7 },
  { id: "hotel-tokyo", type: "hotel", destination: "Tokio", title: "Shinjuku City Stay", detail: "3 estrellas · metro cercano · cancelación flexible", price: 110, unit: "noche", rating: 4.5 },
  { id: "insurance-basic", type: "insurance", destination: "Mundial", title: "Seguro Esencial", detail: "Asistencia médica 100.000 € · equipaje · repatriación", price: 29, unit: "viaje", rating: 4.5 },
  { id: "insurance-plus", type: "insurance", destination: "Mundial", title: "Seguro Completo", detail: "Asistencia médica 500.000 € · cancelación · deportes", price: 59, unit: "viaje", rating: 4.8 },
  { id: "insurance-premium", type: "insurance", destination: "Mundial", title: "Seguro Premium", detail: "Asistencia médica 1.000.000 € · cancelación amplia · deportes · cruceros", price: 89, unit: "viaje", rating: 4.9 },
  { id: "insurance-longstay", type: "insurance", destination: "Mundial", title: "Seguro Larga Estancia", detail: "Viajes de 30 a 365 días · telemedicina · repatriación · equipaje", price: 119, unit: "mes", rating: 4.7 },
  { id: "rental-car", type: "rental", destination: "Mundial", title: "Alquiler de coche", detail: "Comparación de vehículos · kilometraje y coberturas según proveedor", price: 45, unit: "día", rating: 4.6 },
  { id: "rental-moto", type: "rental", destination: "Mundial", title: "Alquiler de moto", detail: "Scooter o moto · revisa permiso, casco, franquicia y cilindrada", price: 25, unit: "día", rating: 4.5 },
  { id: "flight-rome", type: "flight", destination: "Roma", title: "Vuelos a Roma", detail: "Compara horarios, escalas, equipaje y condiciones de cambio", price: 120, unit: "persona", rating: 4.6 },
  { id: "flight-tokyo", type: "flight", destination: "Tokio", title: "Vuelos a Tokio", detail: "Compara rutas, escalas, equipaje y condiciones de cambio", price: 690, unit: "persona", rating: 4.6 },
  { id: "package-rome", type: "package", destination: "Roma", title: "Vuelo + hotel en Roma", detail: "Vuelo ida y vuelta · 4 noches · desayuno", price: 489, unit: "persona", rating: 4.7 },
  { id: "package-bali", type: "package", destination: "Bali", title: "Vuelo + resort en Bali", detail: "Vuelo ida y vuelta · 7 noches · desayuno y traslado", price: 1090, unit: "persona", rating: 4.8 },
  { id: "package-tokyo", type: "package", destination: "Tokio", title: "Vuelo + hotel en Tokio", detail: "Vuelo ida y vuelta · 6 noches · seguro esencial", price: 1260, unit: "persona", rating: 4.7 }
];

const typeLabels = { guide: "Guía local", "free-tour": "Free tour", excursion: "Excursión", hotel: "Hotel", insurance: "Seguro", rental: "Coche o moto", flight: "Vuelo", package: "Vuelo + hotel" };
const checkoutProducts = new Set(["guide-rome", "guide-tokyo", "guide-marrakech", "excursion-rome", "excursion-bali", "insurance-basic", "insurance-plus", "insurance-premium", "insurance-longstay"]);
let saved = [];

export function mountBookingsRoute() {
  document.querySelector("#bookingFilters").addEventListener("input", renderOffers);
  document.querySelector("#bookingFilters").addEventListener("change", renderOffers);
  document.querySelector("#bookingOffers").addEventListener("click", saveOffer);
  document.querySelector("#bookingOffers").addEventListener("click", startCheckout);
  document.querySelector("#savedOffers").addEventListener("click", removeOffer);
  renderOffers();
  loadSaved();
}

function renderOffers() {
  const filters = Object.fromEntries(new FormData(document.querySelector("#bookingFilters")));
  const filtered = offers.filter((offer) => offerMatches(offer, filters));
  document.querySelector("#bookingOffers").innerHTML = filtered.map((offer) => offerCard(offer, filters)).join("") || emptyState("Sin resultados", "Prueba otro destino, fecha o tipo de reserva.");
  document.querySelector("#bookingCount").textContent = `${filtered.length} opciones`;
}

function offerCard(offer, filters) {
  return `<article class="booking-card">
    <span>${typeLabels[offer.type]}</span><h3>${offer.title}</h3><p>${offer.destination} · ${offer.detail}</p>
    <div><strong>${offer.rating.toFixed(1)} ★</strong><strong>Desde ${offer.price} € / ${offer.unit}</strong></div>
    <div class="booking-actions"><button type="button" data-save-offer="${offer.id}">Guardar opción</button>${checkoutProducts.has(offer.id) ? `<button type="button" data-checkout-offer="${offer.id}">Pagar con Stripe</button>` : ""}<a href="${providerUrl(offer, filters)}" target="_blank" rel="noopener noreferrer">Consultar disponibilidad real</a></div>
  </article>`;
}

async function saveOffer(event) {
  const button = event.target.closest("[data-save-offer]");
  if (!button) return;
  if (!saved.some((item) => item.offerId === button.dataset.saveOffer)) {
    const result = await withLoading(button, "Guardando...", () => addFavorite(button.dataset.saveOffer));
    if (result.error) return button.textContent = result.error;
    saved = [result, ...saved];
    notify("Opción guardada.");
  }
  button.textContent = "Guardado";
  renderSaved();
}

async function startCheckout(event) {
  const button = event.target.closest("[data-checkout-offer]");
  if (!button) return;
  button.disabled = true;
  button.textContent = "Abriendo pago...";
  const result = await createCheckout(button.dataset.checkoutOffer);
  if (result.url) return window.location.assign(result.url);
  button.disabled = false;
  button.textContent = result.error || "No disponible";
}

async function removeOffer(event) {
  const button = event.target.closest("[data-remove-offer]");
  if (!button) return;
  if (!confirmAction("¿Quitar esta opción de tus guardados?")) return;
  const item = saved.find((favorite) => favorite.offerId === button.dataset.removeOffer);
  if (item) {
    const result = await removeFavorite(item.id);
    if (result.error) return notify(result.error, "error");
    saved = saved.filter((favorite) => favorite.id !== item.id);
    notify("Opción eliminada de guardados.");
  }
  renderSaved();
}

function renderSaved() {
  const selected = saved.map((item) => offers.find((offer) => offer.id === item.offerId)).filter(Boolean);
  document.querySelector("#savedOfferCount").textContent = selected.length;
  document.querySelector("#savedOffers").innerHTML = selected.length ? selected.map((offer) => `<li><span><strong>${offer.title}</strong><small>${offer.destination} · ${offer.price} €</small></span><button class="link-button" type="button" data-remove-offer="${offer.id}">Quitar</button></li>`).join("") : "<li><span>No has guardado opciones todavía.</span></li>";
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
    "free-tour": `https://www.guruwalk.com/es/walks?search=${query}`,
    excursion: `https://www.getyourguide.es/s/?q=${query}`,
    hotel: `https://www.booking.com/searchresults.es.html?ss=${query}&checkin=${start}&checkout=${end}&group_adults=${travelers}&no_rooms=1`,
    insurance: "https://www.iatiseguros.com/",
    rental: `https://www.booking.com/cars/index.es.html?search=${query}`,
    flight: "https://www.skyscanner.es/transporte/vuelos/",
    package: "https://www.expedia.es/Paquetes"
  };
  return urls[offer.type];
}

async function loadSaved() {
  document.querySelector("#savedOffers").innerHTML = `<li>${skeleton(1)}</li>`;
  const result = await favorites();
  if (result.error) notify(result.error, "error");
  saved = Array.isArray(result) ? result : [];
  renderSaved();
}
