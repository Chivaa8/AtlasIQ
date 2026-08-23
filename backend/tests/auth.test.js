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

const auth = createAuthService(memoryStore, "test-secret-that-is-longer-than-32-characters");
process.env.ADMIN_EMAILS = "oriol@example.com";
const registered = await auth.register({
  name: "Oriol",
  email: "ORIOL@example.com",
  password: "Secret123",
  origin: "europe"
});

assert.equal(registered.user.email, "oriol@example.com");
assert.ok(registered.token);
assert.equal(await auth.hasUser("ORIOL@example.com"), true);
assert.equal(await auth.hasUser("missing@example.com"), false);
assert.equal(memoryStore.data[0].password, undefined);
assert.ok(memoryStore.data[0].passwordHash);

const logged = await auth.login({ email: "oriol@example.com", password: "Secret123" });
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
  password: "Newsecret1"
});

const relogged = await auth.login({ email: "oriol@example.com", password: "Newsecret1" });
assert.equal(relogged.user.id, withPassword.user.id);

const verification = await auth.issueEmailVerification(relogged.token);
assert.equal((await auth.verifyEmail("oriol@example.com", verification.code)).emailVerified, true);
const refreshed = await auth.refresh(relogged.token);
assert.ok(refreshed.token);
await auth.revoke(refreshed.token);
await assert.rejects(() => auth.me(refreshed.token), /invalid token/);

await assert.rejects(
  () => auth.login({ email: "oriol@example.com", password: "Secret123" }),
  /invalid credentials/
);

const expiringAuth = createAuthService(memoryStore, "test-secret-that-is-longer-than-32-characters", -1);
const expired = await expiringAuth.login({ email: "oriol@example.com", password: "Newsecret1" });
await assert.rejects(
  () => expiringAuth.me(expired.token),
  /token expired/
);

const regular = await auth.register({ name: "Ana", email: "ana@example.com", password: "Secret123", origin: "europe" });
await assert.rejects(() => auth.adminUsers(regular.token), /admin required/);
const adminSession = await auth.login({ email: "oriol@example.com", password: "Newsecret1" });
assert.equal(adminSession.user.role, "admin");
assert.equal((await auth.adminUsers(adminSession.token)).length, 2);
await auth.adminSetBlocked(adminSession.token, regular.user.id, true);
await assert.rejects(() => auth.me(regular.token), /invalid token/);
await assert.rejects(() => auth.login({ email: "ana@example.com", password: "Secret123" }), /account blocked/);
await assert.rejects(() => auth.adminSetBlocked(adminSession.token, adminSession.user.id, true), /cannot block itself/);

console.log("AtlasIQ backend auth check passed");
