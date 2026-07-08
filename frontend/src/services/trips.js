import { currentUser } from "../app/storage.js";
import { createTrip } from "../schemas/trip.js";

const tripsKey = "atlasiq-trips";

export function tripsForCurrentUser() {
  const user = currentUser();
  if (!user) return [];
  return allTrips().filter((trip) => trip.userEmail === user.email);
}

export function tripById(id) {
  return tripsForCurrentUser().find((trip) => trip.id === id);
}

export function createTripFromDestination(destination) {
  const user = currentUser();
  if (!user) return;
  const trip = createTrip(destination, user.email);
  localStorage.setItem(tripsKey, JSON.stringify([trip, ...allTrips()]));
}

export function toggleChecklistItem(tripId, itemId) {
  const trips = allTrips().map((trip) => {
    if (trip.id !== tripId) return trip;
    return {
      ...trip,
      checklist: trip.checklist.map((item) => (
        item.id === itemId ? { ...item, done: !item.done } : item
      ))
    };
  });
  localStorage.setItem(tripsKey, JSON.stringify(trips));
  return tripById(tripId);
}

export function addExpense(tripId, expense) {
  const trips = allTrips().map((trip) => {
    if (trip.id !== tripId) return trip;
    return {
      ...trip,
      expenses: [
        { id: crypto.randomUUID(), concept: expense.concept, amount: Number(expense.amount) },
        ...(trip.expenses || [])
      ]
    };
  });
  localStorage.setItem(tripsKey, JSON.stringify(trips));
  return tripById(tripId);
}

function allTrips() {
  return JSON.parse(localStorage.getItem(tripsKey) || "[]");
}
