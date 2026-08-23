export function buildItinerary(trip, days = trip.days || Math.max(5, trip.highlights?.length || 0)) {
  const highlights = trip.highlights?.length ? trip.highlights : ["llegada", "centro", "gastronomía"];
  const totalDays = Math.min(45, Math.max(1, Number(days) || 3));
  return Array.from({ length: totalDays }, (_, index) => ({
    day: index + 1,
    title: index === 0 ? "Día 1 · Llegada y orientación" : index === totalDays - 1 ? `Día ${index + 1} · Despedida y regreso` : `Día ${index + 1} · ${capitalize(highlights[index % highlights.length])}`,
    morning: index === 0 ? "Llegada, traslado y check-in" : `Visita tranquila a ${highlights[index % highlights.length]}`,
    afternoon: index === totalDays - 1 ? "Últimas compras y traslado" : `Ruta por ${highlights[(index + 1) % highlights.length]} con pausa para comer`,
    evening: index === totalDays - 1 ? "Regreso" : `Cena local y paseo por ${highlights[(index + 2) % highlights.length]}`,
    plan: index === 0 ? `Llegada a ${trip.name}, check-in y primer paseo sin prisas.` : `Día completo en ${trip.name} combinando visitas, gastronomía y tiempo libre.`
  }));
}

function capitalize(value) {
  const text = String(value || "plan libre");
  return text.charAt(0).toUpperCase() + text.slice(1);
}
