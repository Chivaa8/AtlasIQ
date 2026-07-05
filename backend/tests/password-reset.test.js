import assert from "node:assert/strict";
import { createPasswordReset, confirmPasswordReset } from "../src/auth/password-reset.js";

const sent = [];

await createPasswordReset({
  email: "test@example.com",
  sendMail: (message) => sent.push(message),
  now: () => 1000
});

const token = sent[0].text.match(/[0-9]{6}/)[0];

assert.equal(confirmPasswordReset({ email: "other@example.com", token, password: "newpass", now: () => 2000 }), "Token inválido.");
assert.equal(confirmPasswordReset({ email: "test@example.com", token: "000000", password: "newpass", now: () => 2000 }), "Token inválido.");
assert.equal(confirmPasswordReset({ email: "test@example.com", token, password: "newpass", now: () => 2000 }), "");

console.log("AtlasIQ backend password reset check passed");
