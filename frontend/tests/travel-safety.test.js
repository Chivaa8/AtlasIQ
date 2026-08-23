import assert from "node:assert/strict";
import { insuranceForTrip } from "../src/routes/trip-detail.js";

const usa = insuranceForTrip({ continent: "america", estimatedCost: 2200, highlights: ["ciudades"] });
assert.match(usa.coverages.join(" "), /1\.000\.000/);
assert.match(usa.coverages.join(" "), /Cancelación/);

const adventure = insuranceForTrip({ continent: "asia", estimatedCost: 900, highlights: ["trekking"] });
assert.match(adventure.coverages.join(" "), /aventura/);

console.log("AtlasIQ travel safety check passed");
