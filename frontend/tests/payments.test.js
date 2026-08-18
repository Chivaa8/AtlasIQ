import assert from "node:assert/strict";
import { createPayment } from "../src/routes/payments.js";

assert.equal(createPayment("Hotel", 0, "2026-09-01"), null);
assert.equal(createPayment("Hotel", 120, "fecha"), null);
assert.deepEqual(Object.keys(createPayment(" Hotel ", "120", "2026-09-01")).sort(), ["amount", "completed", "concept", "date", "id"]);

console.log("AtlasIQ payments check passed");
