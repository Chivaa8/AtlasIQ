import { currentUser, sessionToken } from "../app/storage.js";
import { apiBaseUrl } from "../app/config.js";

const tripsKey = "atlasiq-trips";
const tripsEndpoint = `${apiBaseUrl}/trips`;

export async function tripsForCurrentUser() {
  const user = currentUser();
  if (!user) return [];
  const trips = await requestTrips();
  return trips || cachedTrips().filter((trip) => trip.userEmail === user.email);
}

export function tripById(id) {
  return cachedTrips().find((trip) => trip.id === id);
}

export async function createTripFromDestination(destination) {
  const trip = await requestJson(tripsEndpoint, {
    method: "POST",
    body: JSON.stringify({ destination })
  });
  if (trip) upsertTrip(trip);
  return trip;
}

export async function toggleChecklistItem(tripId, itemId) {
  const trip = await requestJson(`${tripsEndpoint}/${tripId}/checklist/${itemId}`, { method: "PATCH" });
  if (trip) upsertTrip(trip);
  return trip || tripById(tripId);
}

export async function addExpense(tripId, expense) {
  const trip = await requestJson(`${tripsEndpoint}/${tripId}/expenses`, {
    method: "POST",
    body: JSON.stringify({ concept: expense.concept, amount: expense.amount })
  });
  if (trip) upsertTrip(trip);
  return trip || tripById(tripId);
}

export async function addCompanion(tripId, name) {
  const trip = await requestJson(`${tripsEndpoint}/${tripId}/companions`, {
    method: "POST",
    body: JSON.stringify({ name })
  });
  if (trip) upsertTrip(trip);
  return trip || tripById(tripId);
}

export async function addDocument(tripId, document) {
  const trip = await requestJson(`${tripsEndpoint}/${tripId}/documents`, {
    method: "POST",
    body: JSON.stringify(document)
  });
  if (trip) upsertTrip(trip);
  return trip || tripById(tripId);
}

export async function toggleDocumentReady(tripId, documentId) {
  const trip = await requestJson(`${tripsEndpoint}/${tripId}/documents/${documentId}`, { method: "PATCH" });
  if (trip) upsertTrip(trip);
  return trip || tripById(tripId);
}

export async function archiveTrip(tripId) {
  const trip = await requestJson(`${tripsEndpoint}/${tripId}/archive`, { method: "PATCH" });
  if (trip) upsertTrip(trip);
  return trip;
}

async function requestTrips() {
  const trips = await requestJson(tripsEndpoint);
  if (!trips) return null;
  const user = currentUser();
  const otherTrips = cachedTrips().filter((trip) => trip.userEmail !== user.email);
  localStorage.setItem(tripsKey, JSON.stringify([...trips, ...otherTrips]));
  return trips;
}

async function requestJson(url, options = {}) {
  const token = sessionToken();
  if (!token) return null;
  try {
    const response = await fetch(url, {
      method: options.method || "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: options.body
    });
    return response.ok ? response.json() : null;
  } catch {
    return null;
  }
}

function upsertTrip(nextTrip) {
  const trips = cachedTrips();
  const exists = trips.some((trip) => trip.id === nextTrip.id);
  localStorage.setItem(tripsKey, JSON.stringify(
    exists ? trips.map((trip) => (trip.id === nextTrip.id ? nextTrip : trip)) : [nextTrip, ...trips]
  ));
}

function cachedTrips() {
  return JSON.parse(localStorage.getItem(tripsKey) || "[]");
}
