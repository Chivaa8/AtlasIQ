import assert from "node:assert/strict";
import { createTripService } from "../src/trips/trip-service.js";

const memoryStore = {
  data: [],
  async read() {
    return this.data;
  },
  async write(data) {
    this.data = data;
  }
};

const trips = createTripService(memoryStore);
const trip = await trips.create("user@example.com", {
  name: "Japón",
  city: "Tokyo, Kyoto y Osaka",
  continent: "asia",
  estimatedCost: 1550,
  currency: "JPY",
  weather: { average: "10-30 °C" }
});

assert.equal(trip.userEmail, "user@example.com");
assert.equal(trip.currency, "JPY");
assert.equal(trip.weather.average, "10-30 °C");
assert.equal((await trips.list("other@example.com")).length, 0);

const withExpense = await trips.addExpense("user@example.com", trip.id, { concept: "Hotel", amount: 300 });
assert.equal(withExpense.expenses[0].amount, 300);

const withDocument = await trips.addDocument("user@example.com", trip.id, { type: "Seguro", name: "Póliza AXA" });
assert.equal(withDocument.documents[0].name, "Póliza AXA");

const withReadyDocument = await trips.toggleDocument("user@example.com", trip.id, withDocument.documents[0].id);
assert.equal(withReadyDocument.documents[0].ready, true);

const archived = await trips.archive("user@example.com", trip.id);
assert.ok(archived.archivedAt);
assert.equal((await trips.list("user@example.com")).length, 0);

await assert.rejects(
  () => trips.addCompanion("other@example.com", trip.id, "Ana"),
  /trip not found/
);

console.log("AtlasIQ backend trips check passed");
