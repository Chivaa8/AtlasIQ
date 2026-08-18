import assert from "node:assert/strict";
import { offerMatches, providerUrl } from "../src/routes/bookings.js";

const guide = { type: "guide", destination: "Roma", title: "Guía local", detail: "Español e italiano" };
assert.equal(offerMatches(guide, { type: "guide", destination: "roma" }), true);
assert.equal(offerMatches(guide, { type: "hotel", destination: "" }), false);
assert.equal(offerMatches(guide, { type: "", destination: "italiano" }), true);
assert.match(providerUrl(guide, { start: "2026-09-01", end: "2026-09-05", travelers: 2 }), /^https:\/\/www\.getyourguide\.es\//);
assert.match(providerUrl({ type: "hotel", destination: "Roma" }, { start: "2026-09-01", end: "2026-09-05", travelers: 2 }), /checkin=2026-09-01.*group_adults=2/);

console.log("AtlasIQ bookings check passed");
