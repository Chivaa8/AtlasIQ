import assert from "node:assert/strict";
import { createPasswordReset, confirmPasswordReset } from "../src/auth/password-reset.js";

const sent = [];

await createPasswordReset({
  email: "test@example.com",
  sendMail: (message) => sent.push(message),
  now: () => 1000
});

const token = sent[0].text.match(/[0-9]{6}/)[0];
assert.match(sent[0].html, /AtlasIQ/);
await createPasswordReset({ email: "test@example.com", sendMail: (message) => sent.push(message), now: () => 1500 });
assert.equal(sent.length, 1);

assert.equal(await confirmPasswordReset({ email: "other@example.com", token, password: "newpass", now: () => 2000 }), "Token inválido.");
assert.equal(await confirmPasswordReset({ email: "test@example.com", token: "000000", password: "newpass", now: () => 2000 }), "Token inválido.");
let updatedPassword = "";
assert.equal(await confirmPasswordReset({
  email: "test@example.com",
  token,
  password: "Newpass1",
  updatePassword: async (_email, password) => { updatedPassword = password; },
  now: () => 2000
}), "");
assert.equal(updatedPassword, "Newpass1");

console.log("AtlasIQ backend password reset check passed");
