import { showPage } from "../app/pages.js";
import { createTripFromDestination } from "../services/trips.js";
import { renderTrips } from "./trips.js";
import { addReview, reviews as loadReviews } from "../services/user-data-api.js";

const cruiseContinents = {
  "Mediterráneo clásico": "europe",
  "Islas griegas": "europe",
  "Caribe oriental": "america",
  "Fiordos noruegos": "europe",
  "Mini crucero mediterráneo": "europe",
  "Danubio cultural": "europe"
};
let reviews = [];

export function mountExtrasRoute() {
  document.querySelector("#reviewForm").addEventListener("submit", submitReview);
  document.querySelector("#cruiseGrid").addEventListener("click", saveCruise);
  document.querySelector("#cruiseFilters").addEventListener("change", filterCruises);
  renderSavedReviews();
}

async function submitReview(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const name = data.get("reviewName").trim();
  const trip = data.get("reviewTrip").trim();
  const reviewText = data.get("reviewText").trim();
  if (!name || !trip || !reviewText) return showReviewMessage("Completa nombre, viaje y reseña.", true);

  const review = await addReview({ name, destination: trip, text: reviewText, rating: Number.parseInt(data.get("reviewRating"), 10) });
  if (review.error) return showReviewMessage(review.error, true);
  reviews = [review, ...reviews];
  renderReview(review);
  updateReviewSummary();
  form.reset();
  showReviewMessage("Reseña publicada.");
}

function renderReview({ name, trip, destination, text, rating }) {
  const card = document.createElement("article");
  card.className = "review-card";
  const content = document.createElement("p");
  const author = document.createElement("strong");
  const route = document.createElement("span");
  content.textContent = `“${text}”`;
  author.textContent = name;
  route.textContent = `${trip || destination} · ${rating} estrellas`;
  card.append(content, author, route);
  document.querySelector(".reviews-grid").prepend(card);
}

async function renderSavedReviews() {
  const result = await loadReviews();
  reviews = Array.isArray(result) ? result : [];
  reviews.forEach(renderReview);
  updateReviewSummary();
}

function updateReviewSummary() {
  const total = 14.7 + reviews.reduce((sum, review) => sum + (Number.parseInt(review.rating, 10) || 0), 0);
  const count = 3 + reviews.length;
  document.querySelector("#reviewSummary").textContent = `${(total / count).toFixed(1).replace(".", ",")}/5 · ${count} reseñas`;
}

function filterCruises(event) {
  const filters = Object.fromEntries(new FormData(event.currentTarget));
  let visible = 0;
  document.querySelectorAll(".cruise-card").forEach((card) => {
    const show = cruiseMatches(card.dataset, filters);
    card.classList.toggle("hidden", !show);
    if (show) visible += 1;
  });
  document.querySelector("#cruiseMessage").textContent = visible ? `${visible} cruceros encontrados.` : "No hay cruceros con esos filtros.";
}

async function saveCruise(event) {
  const button = event.target.closest("button");
  if (!button) return;
  const card = button.closest(".cruise-card");
  const name = card.querySelector("h3").textContent.trim();
  button.disabled = true;
  button.textContent = "Guardando...";
  const trip = await createTripFromDestination({
    name,
    city: card.querySelector("dd").textContent.trim(),
    continent: cruiseContinents[name] || "unknown",
    estimatedCost: parsePrice(card.querySelectorAll("dd")[1].textContent),
    highlights: card.querySelector("p").textContent.split(",").map((stop) => stop.trim())
  });
  if (!trip) {
    button.disabled = false;
    button.textContent = "Reintentar";
    return;
  }
  await renderTrips();
  showPage("tripsPanel");
}

function showReviewMessage(text, error = false) {
  const message = document.querySelector("#reviewMessage");
  message.textContent = text;
  message.classList.toggle("error", error);
  message.classList.toggle("success", !error);
}

export function parsePrice(value) {
  return Number(String(value).replace(/[^0-9]/g, ""));
}

export function cruiseMatches(cruise, filters) {
  return (!filters.zone || cruise.zone === filters.zone)
    && (!filters.duration || cruise.duration === filters.duration)
    && (!filters.style || cruise.style === filters.style)
    && (!filters.cabin || cruise.cabin === filters.cabin);
}
