import assert from "node:assert/strict";
import { createTrip } from "../src/schemas/trip.js";

const trip = createTrip({
  name: "Portugal",
  city: "Lisboa",
  continent: "europe",
  estimatedCost: 600
}, "user@example.com");

assert.ok(trip.id);
assert.equal(trip.userEmail, "user@example.com");
assert.equal(trip.name, "Portugal");
assert.equal(trip.checklist.length, 5);
assert.equal(trip.checklist[0].done, false);
assert.deepEqual(trip.expenses, []);

console.log("AtlasIQ trip creation check passed");
