import assert from "node:assert/strict";
import { createAuthService } from "../src/auth/auth-service.js";

const memoryStore = {
  data: [],
  async read() {
    return this.data;
  },
  async write(data) {
    this.data = data;
  }
};

const auth = createAuthService(memoryStore, "test-secret");
const registered = await auth.register({
  name: "Oriol",
  email: "ORIOL@example.com",
  password: "secret123",
  origin: "europe"
});

assert.equal(registered.user.email, "oriol@example.com");
assert.ok(registered.token);
assert.equal(memoryStore.data[0].password, undefined);
assert.ok(memoryStore.data[0].passwordHash);

const logged = await auth.login({ email: "oriol@example.com", password: "secret123" });
assert.equal(logged.user.id, registered.user.id);

const me = await auth.me(logged.token);
assert.equal(me.email, "oriol@example.com");
assert.equal(me.passwordHash, undefined);

const profiled = await auth.updateProfile(logged.token, {
  name: "Oriol",
  firstSurname: "Chiva",
  documentId: "ABC123456",
  currency: "EUR",
  email: "oriol@example.com",
  phone: "+34 600 000 000"
});

assert.equal(profiled.user.firstSurname, "Chiva");
assert.equal(profiled.user.documentId, "ABC123456");
assert.equal(profiled.user.passwordHash, undefined);
assert.ok(profiled.token);

const withPassword = await auth.updateProfile(profiled.token, {
  name: "Oriol",
  firstSurname: "Chiva",
  documentId: "ABC123456",
  currency: "EUR",
  email: "oriol@example.com",
  phone: "+34 600 000 000",
  password: "newsecret"
});

const relogged = await auth.login({ email: "oriol@example.com", password: "newsecret" });
assert.equal(relogged.user.id, withPassword.user.id);

await assert.rejects(
  () => auth.login({ email: "oriol@example.com", password: "secret123" }),
  /invalid credentials/
);

const expiringAuth = createAuthService(memoryStore, "test-secret", -1);
const expired = await expiringAuth.login({ email: "oriol@example.com", password: "newsecret" });
await assert.rejects(
  () => expiringAuth.me(expired.token),
  /token expired/
);

console.log("AtlasIQ backend auth check passed");
