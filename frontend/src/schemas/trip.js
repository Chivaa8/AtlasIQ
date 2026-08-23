export function createTrip(destination, userEmail) {
  return {
    id: crypto.randomUUID(),
    userEmail,
    name: destination.name,
    city: destination.city,
    continent: destination.continent,
    estimatedCost: destination.estimatedCost,
    currency: destination.currency || "EUR",
    visa: destination.visa || null,
    weather: destination.weather || null,
    health: destination.health || null,
    days: Math.min(45, Math.max(1, Number(destination.days || destination.minDays || 3))),
    highlights: destination.highlights || [],
    checklist: defaultChecklist(),
    documents: [],
    companions: [],
    expenses: [],
    createdAt: new Date().toISOString()
  };
}

export function tripSplit(trip) {
  const spent = (trip.expenses || []).reduce((sum, expense) => sum + expense.amount, 0);
  const people = (trip.companions || []).length + 1;
  return { spent, people, perPerson: spent / people };
}

export function convertCurrency(amount, toCurrency, fromCurrency = "EUR") {
  const rates = { EUR: 1, USD: 1.09, GBP: 0.86, JPY: 169, MXN: 20.3, MAD: 10.8, ISK: 151, CRC: 560, IDR: 17800, NZD: 1.82 };
  return (Number(amount) || 0) / (rates[fromCurrency] || 1) * (rates[toCurrency] || 1);
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
