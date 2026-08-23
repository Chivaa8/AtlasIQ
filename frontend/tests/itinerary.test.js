import assert from "node:assert/strict";
import { buildItinerary } from "../src/schemas/itinerary.js";

const itinerary = buildItinerary({ name: "Portugal", highlights: ["costa", "vino", "azulejos"] });

assert.equal(itinerary.length, 5);
assert.equal(itinerary[0].day, 1);
assert.ok(itinerary[0].plan.includes("Portugal"));
assert.ok(itinerary[0].morning);
assert.equal(buildItinerary({ name: "Japón", days: 10, highlights: ["templos", "gastronomía"] }).length, 10);

console.log("AtlasIQ itinerary check passed");
