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

console.log("AtlasIQ structured recommendation check passed");
