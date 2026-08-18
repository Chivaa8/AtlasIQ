import assert from "node:assert/strict";
import { currencyCodes, rentalEstimate } from "../src/routes/tools.js";

assert.equal(currencyCodes().includes("JPY"), true);
assert.deepEqual(rentalEstimate("car", 3, "full", 30), { days: 3, daily: 60, total: 180 });
assert.equal(rentalEstimate("moto", 2, "basic", 22).total, 74);
assert.equal(rentalEstimate("car", 100, "basic", 30).days, 60);

console.log("AtlasIQ travel tools check passed");
