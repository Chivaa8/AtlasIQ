const defaultChecklist = [
  { id: "flights", label: "Vuelos reservados", done: false },
  { id: "hotel", label: "Alojamiento confirmado", done: false },
  { id: "insurance", label: "Seguro de viaje", done: false },
  { id: "documents", label: "Documentación revisada", done: false },
  { id: "activities", label: "Actividades principales", done: false }
];

export function createTripService(store) {
  return {
    async list(userEmail) {
      return (await store.read()).filter((trip) => trip.userEmail === userEmail && !trip.archivedAt);
    },
    async create(userEmail, destination) {
      requireText(userEmail, "userEmail");
      requireText(destination?.name, "name");
      const trip = {
        id: crypto.randomUUID(),
        userEmail,
        name: destination.name,
        city: destination.city || destination.name,
        continent: destination.continent || "unknown",
        estimatedCost: Number(destination.estimatedCost || 0),
        currency: destination.currency || "EUR",
        visa: destination.visa || null,
        weather: destination.weather || null,
        highlights: destination.highlights || [],
        checklist: defaultChecklist.map((item) => ({ ...item })),
        documents: [],
        companions: [],
        expenses: [],
        archivedAt: null,
        createdAt: new Date().toISOString()
      };
      await save(store, [trip, ...(await store.read())]);
      return trip;
    },
    async addExpense(userEmail, tripId, expense) {
      requireText(expense?.concept, "concept");
      const amount = Number(expense.amount);
      if (!Number.isFinite(amount) || amount <= 0) throw new Error("amount must be positive");
      return updateOwnedTrip(store, userEmail, tripId, (trip) => ({
        ...trip,
        expenses: [{ id: crypto.randomUUID(), concept: expense.concept.trim(), amount }, ...(trip.expenses || [])]
      }));
    },
    async addCompanion(userEmail, tripId, name) {
      requireText(name, "name");
      return updateOwnedTrip(store, userEmail, tripId, (trip) => ({
        ...trip,
        companions: [{ id: crypto.randomUUID(), name: name.trim() }, ...(trip.companions || [])]
      }));
    },
    async addDocument(userEmail, tripId, document) {
      requireText(document?.name, "name");
      return updateOwnedTrip(store, userEmail, tripId, (trip) => ({
        ...trip,
        documents: [
          { id: crypto.randomUUID(), type: document.type || "Documento", name: document.name.trim(), ready: false },
          ...(trip.documents || [])
        ]
      }));
    },
    async toggleDocument(userEmail, tripId, documentId) {
      return updateOwnedTrip(store, userEmail, tripId, (trip) => ({
        ...trip,
        documents: (trip.documents || []).map((document) => (
          document.id === documentId ? { ...document, ready: !document.ready } : document
        ))
      }));
    },
    async toggleChecklist(userEmail, tripId, itemId) {
      return updateOwnedTrip(store, userEmail, tripId, (trip) => ({
        ...trip,
        checklist: trip.checklist.map((item) => item.id === itemId ? { ...item, done: !item.done } : item)
      }));
    },
    async archive(userEmail, tripId) {
      return updateOwnedTrip(store, userEmail, tripId, (trip) => ({
        ...trip,
        archivedAt: new Date().toISOString()
      }));
    }
  };
}

async function updateOwnedTrip(store, userEmail, tripId, update) {
  const trips = await store.read();
  const index = trips.findIndex((trip) => trip.id === tripId && trip.userEmail === userEmail);
  if (index === -1) throw new Error("trip not found");
  const updated = update(trips[index]);
  trips[index] = updated;
  await save(store, trips);
  return updated;
}

async function save(store, trips) {
  await store.write(trips);
}

function requireText(value, field) {
  if (!String(value || "").trim()) throw new Error(`${field} is required`);
}
