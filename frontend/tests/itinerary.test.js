import assert from "node:assert/strict";
import { buildItinerary } from "../src/schemas/itinerary.js";

const itinerary = buildItinerary({ name: "Portugal", highlights: ["costa", "vino", "azulejos"] });

assert.equal(itinerary.length, 3);
assert.equal(itinerary[0].day, 1);
assert.ok(itinerary[0].plan.includes("Portugal"));

console.log("AtlasIQ itinerary check passed");
