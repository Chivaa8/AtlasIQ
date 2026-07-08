export function createTrip(destination, userEmail) {
  return {
    id: crypto.randomUUID(),
    userEmail,
    name: destination.name,
    city: destination.city,
    continent: destination.continent,
    estimatedCost: destination.estimatedCost,
    highlights: destination.highlights || [],
    checklist: defaultChecklist(),
    expenses: [],
    createdAt: new Date().toISOString()
  };
}

function defaultChecklist() {
  return [
    { id: "flights", label: "Vuelos reservados", done: false },
    { id: "hotel", label: "Alojamiento confirmado", done: false },
    { id: "insurance", label: "Seguro de viaje", done: false },
    { id: "documents", label: "Documentación revisada", done: false },
    { id: "activities", label: "Actividades principales", done: false }
  ];
}
