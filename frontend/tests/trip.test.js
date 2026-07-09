import assert from "node:assert/strict";
import { convertCurrency, createTrip, tripSplit } from "../src/schemas/trip.js";

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
assert.equal(trip.weather, null);
assert.deepEqual(trip.documents, []);
assert.deepEqual(trip.companions, []);
assert.deepEqual(trip.expenses, []);

const split = tripSplit({
  expenses: [{ amount: 90 }, { amount: 60 }],
  companions: [{ name: "Ana" }, { name: "Luis" }]
});

assert.deepEqual(split, { spent: 150, people: 3, perPerson: 50 });
assert.equal(convertCurrency(100, "JPY"), 16900);

console.log("AtlasIQ trip creation check passed");
