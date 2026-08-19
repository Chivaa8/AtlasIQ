import assert from "node:assert/strict";
import { createServer } from "../src/server.js";

const userStore = memoryStore();
const tripStore = memoryStore();
const sentEmails = [];
const server = createServer({ userStore, tripStore, sendMail: async (email) => sentEmails.push(email), authSecret: "test-secret-that-is-longer-than-32-characters" });

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const baseUrl = `http://127.0.0.1:${server.address().port}`;

try {
  const corsResponse = await fetch(`${baseUrl}/api/health`, { headers: { Origin: "http://localhost:8022" } });
  assert.equal(corsResponse.headers.get("access-control-allow-origin"), "http://localhost:8022");

  const registered = await request("POST", "/api/auth/register", {
    name: "Oriol",
    email: "oriol@example.com",
    password: "Secret123",
    origin: "europe"
  });

  assert.ok(registered.token);
  assert.equal(registered.user.email, "oriol@example.com");

  await request("POST", "/api/password-reset/request", { email: "missing@example.com" });
  assert.equal(sentEmails.length, 0);
  await request("POST", "/api/password-reset/request", { email: "oriol@example.com" });
  assert.equal(sentEmails.length, 1);

  const trip = await request("POST", "/api/trips", {
    destination: {
      name: "Portugal",
      city: "Lisboa",
      continent: "europe",
      estimatedCost: 600
    }
  }, registered.token);

  assert.equal(trip.userEmail, "oriol@example.com");
  assert.equal(trip.name, "Portugal");

  const listed = await request("GET", "/api/trips", null, registered.token);
  assert.equal(listed.length, 1);
  assert.equal(listed[0].id, trip.id);

  const rejected = await request("GET", "/api/trips");
  assert.equal(rejected.error, "invalid token");
} finally {
  await new Promise((resolve) => server.close(resolve));
}

console.log("AtlasIQ backend HTTP check passed");

async function request(method, path, body, token) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  return response.json();
}

function memoryStore() {
  return {
    data: [],
    async read() {
      return this.data;
    },
    async write(data) {
      this.data = data;
    }
  };
}
