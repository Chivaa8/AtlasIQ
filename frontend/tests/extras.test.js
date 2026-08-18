import assert from "node:assert/strict";
import { cruiseMatches, parsePrice } from "../src/routes/extras.js";

assert.equal(parsePrice("1.150 €"), 1150);
assert.equal(parsePrice("790 €"), 790);
assert.equal(cruiseMatches({ zone: "caribbean", duration: "week", style: "party", cabin: "balcony" }, { zone: "caribbean", duration: "week", style: "", cabin: "" }), true);
assert.equal(cruiseMatches({ zone: "fjords", duration: "long", style: "quiet", cabin: "outside" }, { zone: "caribbean", duration: "", style: "", cabin: "" }), false);

console.log("AtlasIQ extras check passed");
