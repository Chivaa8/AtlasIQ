export function buildItinerary(trip, days = 3) {
  const highlights = trip.highlights?.length ? trip.highlights : ["llegada", "centro", "gastronomía"];
  return Array.from({ length: Math.min(days, highlights.length) }, (_, index) => ({
    day: index + 1,
    title: `Día ${index + 1}`,
    plan: `Explorar ${highlights[index]} en ${trip.name}`
  }));
}
