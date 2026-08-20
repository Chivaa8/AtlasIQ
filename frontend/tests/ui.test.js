import assert from "node:assert/strict";
import { emptyState, skeleton } from "../src/app/ui.js";

assert.equal((skeleton(2).match(/class="skeleton"/g) || []).length, 2);
assert.match(emptyState("Sin viajes", "Crea el primero.", "advisor"), /data-page-target="advisor"/);

console.log("AtlasIQ UX state check passed");
