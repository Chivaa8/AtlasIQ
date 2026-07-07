import { currentUser } from "../app/storage.js";
import { createTrip } from "../schemas/trip.js";

const tripsKey = "atlasiq-trips";

export function tripsForCurrentUser() {
  const user = currentUser();
  if (!user) return [];
  return allTrips().filter((trip) => trip.userEmail === user.email);
}

export function createTripFromDestination(destination) {
  const user = currentUser();
  if (!user) return;
  const trip = createTrip(destination, user.email);
  localStorage.setItem(tripsKey, JSON.stringify([trip, ...allTrips()]));
}

function allTrips() {
  return JSON.parse(localStorage.getItem(tripsKey) || "[]");
}
