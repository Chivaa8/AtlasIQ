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
  weather: { average: "10-30 °C" },
  health: { level: "Consulta recomendada" },
  days: 10
});

assert.equal(trip.userEmail, "user@example.com");
assert.equal(trip.currency, "JPY");
assert.equal(trip.weather.average, "10-30 °C");
assert.equal(trip.health.level, "Consulta recomendada");
assert.equal(trip.days, 10);
assert.equal((await trips.list("other@example.com")).length, 0);

const withExpense = await trips.addExpense("user@example.com", trip.id, { concept: "Hotel", amount: 300 });
assert.equal(withExpense.expenses[0].amount, 300);

const withDocument = await trips.addDocument("user@example.com", trip.id, { type: "Seguro", name: "Póliza AXA" });
assert.equal(withDocument.documents[0].name, "Póliza AXA");

await assert.rejects(
  () => trips.addCompanion("other@example.com", trip.id, "Ana"),
  /trip not found/
);

console.log("AtlasIQ backend trips check passed");
