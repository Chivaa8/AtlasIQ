import assert from "node:assert/strict";
import { requestPasswordReset, resetPassword } from "../src/services/password-reset.js";

const calls = [];
globalThis.fetch = async (url, options) => {
  calls.push({ url, body: JSON.parse(options.body) });
  return {
    ok: true,
    async json() {
      return {};
    }
  };
};

assert.equal(await requestPasswordReset("missing@example.com"), "");
assert.equal(await requestPasswordReset("test@example.com"), "");
assert.equal(await resetPassword({ email: "test@example.com", token: "123456", password: "newpass" }), "");
assert.equal(calls[0].body.email, "missing@example.com");
assert.equal(calls[1].body.email, "test@example.com");
assert.equal(calls[2].body.password, "newpass");

console.log("AtlasIQ password reset API check passed");
