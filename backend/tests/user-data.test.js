import assert from "node:assert/strict";
import { createUserDataService } from "../src/data/user-data-service.js";

let rows = [];
const store = { async read() { return rows; }, async write(next) { rows = next; } };
const data = createUserDataService(store, (input) => ({ value: String(input.value || "").trim() }));
const created = await data.create("user@example.com", { value: " Roma " });
assert.equal(created.value, "Roma");
assert.equal((await data.list("user@example.com")).length, 1);
assert.equal((await data.update("user@example.com", created.id, { value: "Tokio" })).value, "Tokio");
await data.remove("user@example.com", created.id);
assert.deepEqual(await data.list("user@example.com"), []);

console.log("AtlasIQ server data check passed");
