import { destinations, proximity } from "../data/destinations.js";

export function recommendDestinations(preferences) {
  return destinations
    .map((destination) => ({
      ...destination,
      score: scoreDestination(destination, preferences),
      estimatedCost: Math.round(destination.dailyCost * preferences.days),
      proximity: proximityLabel(preferences.origin, destination.continent)
    }))
    .filter((destination) => destination.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
}

function scoreDestination(destination, preferences) {
  const estimatedCost = destination.dailyCost * preferences.days;
  let score = 12 + (proximity[preferences.origin]?.[destination.continent] || 0);

  if (preferences.continent === "any" || destination.continent === preferences.continent) score += 18;
  if (preferences.landscape === "any" || destination.landscape.includes(preferences.landscape)) score += 14;
  if (preferences.environment === "any" || destination.environment.includes(preferences.environment)) score += 12;
  if (preferences.vibe === "any" || destination.vibe.includes(preferences.vibe)) score += 12;
  if (preferences.days >= destination.minDays) score += 14;
  else score -= (destination.minDays - preferences.days) * 5;
  if (estimatedCost <= preferences.budget) score += 14;
  else score -= Math.min(24, Math.round((estimatedCost - preferences.budget) / 100));

  // ponytail: keyword bump; replace with embeddings/ML when there are real user searches.
  score += destination.highlights.some((word) => preferences.goal.toLowerCase().includes(word)) ? 6 : 0;

  return Math.max(0, Math.min(100, score));
}

function proximityLabel(origin, continent) {
  const points = proximity[origin]?.[continent] || 0;
  if (points >= 20) return "Alta";
  if (points >= 10) return "Media";
  return "Lejana";
}
