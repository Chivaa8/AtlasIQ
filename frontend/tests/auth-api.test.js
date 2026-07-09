import assert from "node:assert/strict";
import { loginUser, registerUser } from "../src/services/auth-api.js";

const calls = [];
globalThis.fetch = async (url, options) => {
  const body = JSON.parse(options.body);
  calls.push({ url, body });
  return {
    ok: true,
    async json() {
      return { token: "abc", user: { email: body.email, name: "Oriol", origin: "europe" } };
    }
  };
};

const registered = await registerUser({ name: "Oriol", email: "oriol@example.com", password: "secret1", origin: "europe" });
const logged = await loginUser({ email: "oriol@example.com", password: "secret1" });

assert.equal(registered.session.token, "abc");
assert.equal(logged.session.user.email, "oriol@example.com");
assert.equal(calls[0].url.endsWith("/register"), true);
assert.equal(calls[1].url.endsWith("/login"), true);

console.log("AtlasIQ auth API client check passed");
