import assert from "node:assert/strict";
import { offerMatches } from "../src/routes/bookings.js";

const guide = { type: "guide", destination: "Roma", title: "Guía local", detail: "Español e italiano" };
assert.equal(offerMatches(guide, { type: "guide", destination: "roma" }), true);
assert.equal(offerMatches(guide, { type: "hotel", destination: "" }), false);
assert.equal(offerMatches(guide, { type: "", destination: "italiano" }), true);

console.log("AtlasIQ bookings check passed");
