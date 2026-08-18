import assert from "node:assert/strict";
import { latestRate } from "../src/services/exchange.js";

const rate = await latestRate("EUR", "USD", async () => ({ ok: true, json: async () => ({ date: "2026-08-18", rates: { USD: 1.15 } }) }));
assert.deepEqual(rate, { rate: 1.15, date: "2026-08-18" });
await assert.rejects(() => latestRate("EUR", "MAD", async () => { throw new Error("must not fetch"); }), /unsupported currency/);

console.log("AtlasIQ live exchange check passed");
