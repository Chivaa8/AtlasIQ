const assert = require("node:assert/strict");
const { optimizeTrip } = require("./recommendation");

const plan = optimizeTrip({ destination: "Japon", days: 3, budget: 1200, style: "culture" });

assert.equal(plan.ranked.length, 3);
assert.ok(plan.total > 0);
assert.ok(plan.averageScore >= 0 && plan.averageScore <= 100);
assert.ok(plan.ranked[0].tags.includes("culture"));

console.log("AtlasIQ recommendation check passed");
