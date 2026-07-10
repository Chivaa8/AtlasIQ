import assert from "node:assert/strict";
import { createPasswordReset, confirmPasswordReset } from "../src/auth/password-reset.js";

const sent = [];
let updated = null;

await createPasswordReset({
  email: "Test@Example.com",
  sendMail: (message) => sent.push(message),
  now: () => 1000
});

const token = sent[0].text.match(/[0-9]{6}/)[0];
const updatePassword = async (email, password) => {
  updated = { email, password };
};

assert.equal(await confirmPasswordReset({ email: "other@example.com", token, password: "newpass", updatePassword, now: () => 2000 }), "Token inválido.");
assert.equal(await confirmPasswordReset({ email: "test@example.com", token: "000000", password: "newpass", updatePassword, now: () => 2000 }), "Token inválido.");
assert.equal(await confirmPasswordReset({ email: "test@example.com", token, password: "short", updatePassword, now: () => 2000 }), "La nueva contraseña necesita al menos 6 caracteres.");
assert.equal(await confirmPasswordReset({ email: "test@example.com", token, password: "newpass", updatePassword, now: () => 2000 }), "");
assert.deepEqual(updated, { email: "test@example.com", password: "newpass" });

console.log("AtlasIQ backend password reset check passed");
