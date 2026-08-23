import { destinations, proximity } from "../data/destinations.js";

export function recommendDestinations(preferences) {
  return destinations
    .filter((destination) => preferences.tripScope !== "national" || destination.country === "España")
    .filter((destination) => preferences.tripScope !== "international" || destination.country !== "España")
    .filter((destination) => preferences.continent === "any" || destination.continent === preferences.continent)
    .map((destination) => ({
      ...destination,
      score: scoreDestination(destination, preferences),
      estimatedCost: Math.round(destination.dailyCost * preferences.days),
      days: preferences.days,
      proximity: proximityLabel(preferences.origin, destination.continent),
      flightPlan: flightPlan(destination, preferences),
      mobilityPlan: mobilityPlan(destination, preferences)
    }))
    .filter((destination) => destination.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
}

function scoreDestination(destination, preferences) {
  const estimatedCost = destination.dailyCost * preferences.days;
  let score = 12 + (proximity[preferences.origin]?.[destination.continent] || 0);

  if (preferences.continent === "any" || destination.continent === preferences.continent) score += 18;
  if (preferences.landscape === "any" || destination.landscape.includes(preferences.landscape)) score += 14;
  if (preferences.environment === "any" || destination.environment.includes(preferences.environment)) score += 12;
  if (preferences.vibe === "any" || destination.vibe.includes(preferences.vibe)) score += 12;
  score += flightScore(destination, preferences);
  score += mobilityScore(destination, preferences);
  if (preferences.days >= destination.minDays) score += 14;
  else score -= (destination.minDays - preferences.days) * 5;
  if (estimatedCost <= preferences.budget) score += 14;
  else score -= Math.min(24, Math.round((estimatedCost - preferences.budget) / 100));

  // ponytail: keyword bump; replace with embeddings/ML when there are real user searches.
  score += destination.highlights.some((word) => preferences.goal.toLowerCase().includes(word)) ? 6 : 0;

  return Math.max(0, Math.min(100, score));
}

function mobilityScore(destination, preferences) {
  if (preferences.rentalMode === "car") return destination.environment.includes("countryside") || destination.landscape.includes("mountain") ? 10 : -4;
  if (preferences.rentalMode === "moto") return destination.landscape.includes("beach") || destination.highlights.includes("islas") ? 8 : -6;
  if (preferences.rentalMode === "none") return destination.environment.includes("city") ? 8 : -4;
  return 0;
}

function mobilityPlan(destination, preferences) {
  const mode = preferences.rentalMode || "any";
  if (mode === "car") return { label: "Alquiler de coche", detail: `${destination.driving.car} Circulación por la ${destination.driving.side.toLowerCase()}. ${destination.driving.note}` };
  if (mode === "moto") return { label: "Alquiler de moto", detail: `${destination.driving.moto} Circulación por la ${destination.driving.side.toLowerCase()}. ${destination.driving.note}` };
  if (mode === "none") return { label: "Sin vehículo", detail: "Prioriza ciudades, transporte público, trenes, taxis o excursiones organizadas." };
  return { label: "Movilidad flexible", detail: `Si alquilas: ${destination.driving.car} Circulación por la ${destination.driving.side.toLowerCase()}.` };
}

function flightScore(destination, preferences) {
  const plan = flightPlan(destination, preferences);
  if (preferences.flightMode === "direct") return plan.type === "direct" ? 12 : -18;
  if (preferences.flightMode === "short-stopover") return plan.type === "stopover" ? 10 : 4;
  if (preferences.flightMode === "visit-stopover") return plan.type === "visit-stopover" ? 12 : -8;
  return 0;
}

function flightPlan(destination, preferences) {
  const directness = directnessScore(preferences.origin, destination.continent);
  if (directness >= 18) return { type: "direct", label: "Vuelo directo probable", detail: "Buena opción si quieres llegar sin perder tiempo en escalas." };
  if (preferences.flightMode === "visit-stopover" && preferences.stopoverDays > 0) {
    return {
      type: "visit-stopover",
      label: "Escala aprovechable",
      detail: `Añade ${preferences.stopoverDays} ${preferences.stopoverDays === 1 ? "día" : "días"} para ver un país de paso.`
    };
  }
  return { type: "stopover", label: "Escala recomendada", detail: "Probablemente compense aceptar una escala para mejorar precio o horarios." };
}

function directnessScore(origin, continent) {
  return proximity[origin]?.[continent] || 0;
}

function proximityLabel(origin, continent) {
  const points = proximity[origin]?.[continent] || 0;
  if (points >= 20) return "Alta";
  if (points >= 10) return "Media";
  return "Lejana";
}
