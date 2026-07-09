import assert from "node:assert/strict";
import { createServer } from "../src/server.js";

const userStore = memoryStore();
const tripStore = memoryStore();
const server = createServer({ userStore, tripStore, sendMail: async () => {} });
const testPort = 8024;

await new Promise((resolve) => server.listen(testPort, "127.0.0.1", resolve));
const baseUrl = `http://127.0.0.1:${testPort}`;

try {
  const health = await request("GET", "/api/health");
  assert.equal(health.status, "ok");

  const openapi = await request("GET", "/api/openapi.json");
  assert.equal(openapi.info.title, "AtlasIQ API");
  assert.ok(openapi.paths["/api/trips"]);

  const registered = await request("POST", "/api/auth/register", {
    name: "Oriol",
    email: "oriol@example.com",
    password: "secret123",
    origin: "europe"
  });

  assert.ok(registered.token);
  assert.equal(registered.user.email, "oriol@example.com");

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

  const withDocument = await request("POST", `/api/trips/${trip.id}/documents`, { type: "Seguro", name: "Póliza AXA" }, registered.token);
  const readyDocument = await request("PATCH", `/api/trips/${trip.id}/documents/${withDocument.documents[0].id}`, null, registered.token);
  assert.equal(readyDocument.documents[0].ready, true);

  const listed = await request("GET", "/api/trips", null, registered.token);
  assert.equal(listed.length, 1);
  assert.equal(listed[0].id, trip.id);

  const archived = await request("PATCH", `/api/trips/${trip.id}/archive`, null, registered.token);
  assert.ok(archived.archivedAt);
  const listedAfterArchive = await request("GET", "/api/trips", null, registered.token);
  assert.equal(listedAfterArchive.length, 0);

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
