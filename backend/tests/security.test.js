import assert from "node:assert/strict";
import { createRateLimiter } from "../src/security/rate-limit.js";

let now = 1000;
const limited = createRateLimiter({ limit: 2, windowMs: 100, now: () => now });
assert.equal(limited("login:user"), false);
assert.equal(limited("login:user"), false);
assert.equal(limited("login:user"), true);
now += 101;
assert.equal(limited("login:user"), false);

console.log("AtlasIQ security limits check passed");
