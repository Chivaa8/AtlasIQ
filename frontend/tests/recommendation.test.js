import assert from "node:assert/strict";
import { recommendDestinations } from "../src/services/recommendation.js";

const shortEuropeanTrip = recommendDestinations({
  goal: "playa y comida",
  continent: "any",
  landscape: "beach",
  environment: "city",
  vibe: "culture",
  days: 5,
  budget: 900,
  origin: "europe"
});

assert.ok(shortEuropeanTrip.length > 0);
assert.ok(["europe", "africa"].includes(shortEuropeanTrip[0].continent));
assert.ok(shortEuropeanTrip[0].estimatedCost <= 900 || shortEuropeanTrip[0].score < 100);
assert.ok(shortEuropeanTrip.every((destination) => destination.flightPlan?.label && destination.mobilityPlan?.label));
assert.ok(shortEuropeanTrip.every((destination) => destination.days === 5 && destination.health?.url));
assert.ok(shortEuropeanTrip.length <= 8);

const asianTrip = recommendDestinations({
  goal: "templos comida y ciudad",
  continent: "asia",
  landscape: "any",
  environment: "any",
  vibe: "culture",
  days: 8,
  budget: 1400,
  origin: "europe"
});

assert.ok(asianTrip.length > 0);
assert.ok(asianTrip.every((destination) => destination.continent === "asia"));

const stopoverTrip = recommendDestinations({
  goal: "templos comida y ciudad",
  continent: "asia",
  landscape: "any",
  environment: "any",
  vibe: "culture",
  flightMode: "visit-stopover",
  stopoverDays: 1,
  days: 8,
  budget: 1400,
  origin: "europe"
});

assert.ok(stopoverTrip.length > 0);
assert.equal(stopoverTrip[0].flightPlan.type, "visit-stopover");

const nationalTrip = recommendDestinations({
  goal: "playa comida cultura",
  tripScope: "national",
  continent: "any",
  landscape: "any",
  environment: "any",
  vibe: "culture",
  flightMode: "any",
  stopoverDays: 0,
  rentalMode: "car",
  days: 5,
  budget: 1000,
  origin: "europe"
});

assert.ok(nationalTrip.length > 0);
assert.ok(nationalTrip.every((destination) => destination.country === "España"));
assert.equal(nationalTrip[0].mobilityPlan.label, "Alquiler de coche");

console.log("AtlasIQ structured recommendation check passed");
