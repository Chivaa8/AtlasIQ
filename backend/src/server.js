import http from "node:http";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createAuthService } from "./auth/auth-service.js";
import { createPasswordReset, confirmPasswordReset } from "./auth/password-reset.js";
import { createJsonStore } from "./storage/json-store.js";
import { createTripService } from "./trips/trip-service.js";

export function createServer({
  userStore = createJsonStore(resolve("backend/data/users.json"), []),
  tripStore = createJsonStore(resolve("backend/data/trips.json"), []),
  sendMail = realSendMail
} = {}) {
  const auth = createAuthService(userStore);
  const trips = createTripService(tripStore);

  return http.createServer(async (request, response) => {
    response.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:8022");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    response.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
    if (request.method === "OPTIONS") return json(response, 204, {});
    const url = new URL(request.url, `http://${request.headers.host}`);

    if (request.method === "GET" && url.pathname === "/api/health") {
      return json(response, 200, { status: "ok", service: "AtlasIQ API" });
    }

    if (request.method === "GET" && url.pathname === "/api/openapi.json") {
      return json(response, 200, openApiDocument());
    }

    if (request.method === "POST" && url.pathname === "/api/auth/register") {
      const body = await readJson(request);
      return action(response, () => auth.register(body));
    }

    if (request.method === "POST" && url.pathname === "/api/auth/login") {
      const body = await readJson(request);
      return action(response, () => auth.login(body));
    }

    if (request.method === "GET" && url.pathname === "/api/auth/me") {
      return action(response, () => auth.me(bearerToken(request)));
    }

    if (request.method === "PATCH" && url.pathname === "/api/auth/me/profile") {
      const body = await readJson(request);
      return action(response, () => auth.updateProfile(bearerToken(request), body));
    }

    if (request.method === "GET" && url.pathname === "/api/trips") {
      return action(response, async () => trips.list((await auth.me(bearerToken(request))).email));
    }

    if (request.method === "POST" && url.pathname === "/api/trips") {
      const body = await readJson(request);
      return action(response, async () => trips.create((await auth.me(bearerToken(request))).email, body.destination));
    }

    const tripMatch = url.pathname.match(/^\/api\/trips\/([^/]+)\/(expenses|companions|documents)$/);
    if (request.method === "POST" && tripMatch) {
      const body = await readJson(request);
      const [, tripId, resource] = tripMatch;
      const actions = {
        expenses: (user) => trips.addExpense(user.email, tripId, body),
        companions: (user) => trips.addCompanion(user.email, tripId, body.name),
        documents: (user) => trips.addDocument(user.email, tripId, body)
      };
      return action(response, async () => actions[resource](await auth.me(bearerToken(request))));
    }

    const checkMatch = url.pathname.match(/^\/api\/trips\/([^/]+)\/checklist\/([^/]+)$/);
    if (request.method === "PATCH" && checkMatch) {
      return action(response, async () => trips.toggleChecklist((await auth.me(bearerToken(request))).email, checkMatch[1], checkMatch[2]));
    }

    const documentMatch = url.pathname.match(/^\/api\/trips\/([^/]+)\/documents\/([^/]+)$/);
    if (request.method === "PATCH" && documentMatch) {
      return action(response, async () => trips.toggleDocument((await auth.me(bearerToken(request))).email, documentMatch[1], documentMatch[2]));
    }

    const archiveMatch = url.pathname.match(/^\/api\/trips\/([^/]+)\/archive$/);
    if (request.method === "PATCH" && archiveMatch) {
      return action(response, async () => trips.archive((await auth.me(bearerToken(request))).email, archiveMatch[1]));
    }

    if (request.method === "POST" && url.pathname === "/api/password-reset/request") {
      const body = await readJson(request);
      await createPasswordReset({ email: body.email, sendMail });
      return json(response, 200, {});
    }

    if (request.method === "POST" && url.pathname === "/api/password-reset/confirm") {
      const body = await readJson(request);
      const error = confirmPasswordReset(body);
      return error ? json(response, 400, { error }) : json(response, 200, {});
    }

    json(response, 404, { error: "Not found" });
  });
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const port = Number(process.env.PORT || 8023);
  createServer().listen(port, () => {
    console.log(`AtlasIQ backend on http://127.0.0.1:${port}`);
  });
}

async function realSendMail(message) {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    throw new Error("RESEND_API_KEY and EMAIL_FROM are required for real email sending.");
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to: message.to,
      subject: message.subject,
      text: message.text
    })
  });
  if (!response.ok) throw new Error("Email provider rejected the password reset email.");
}

function json(response, status, payload) {
  response.writeHead(status, { "Content-Type": "application/json" });
  response.end(JSON.stringify(payload));
}

async function action(response, handler) {
  try {
    return json(response, 200, await handler());
  } catch (error) {
    return json(response, 400, { error: error.message });
  }
}

function openApiDocument() {
  return {
    openapi: "3.0.3",
    info: { title: "AtlasIQ API", version: "0.1.0" },
    servers: [{ url: "http://127.0.0.1:8023" }],
    paths: {
      "/api/health": { get: { summary: "Estado de la API", responses: { 200: { description: "API disponible" } } } },
      "/api/auth/register": { post: { summary: "Crear usuario", responses: { 200: { description: "Sesión creada" } } } },
      "/api/auth/login": { post: { summary: "Entrar", responses: { 200: { description: "Sesión creada" } } } },
      "/api/auth/me": { get: { summary: "Usuario actual", security: [{ bearerAuth: [] }], responses: { 200: { description: "Usuario autenticado" } } } },
      "/api/auth/me/profile": { patch: { summary: "Actualizar perfil", security: [{ bearerAuth: [] }], responses: { 200: { description: "Perfil actualizado" } } } },
      "/api/trips": {
        get: { summary: "Listar viajes", security: [{ bearerAuth: [] }], responses: { 200: { description: "Viajes del usuario" } } },
        post: { summary: "Crear viaje", security: [{ bearerAuth: [] }], responses: { 200: { description: "Viaje creado" } } }
      },
      "/api/trips/{tripId}/expenses": { post: { summary: "Añadir gasto", security: [{ bearerAuth: [] }], responses: { 200: { description: "Viaje actualizado" } } } },
      "/api/trips/{tripId}/companions": { post: { summary: "Añadir compañero", security: [{ bearerAuth: [] }], responses: { 200: { description: "Viaje actualizado" } } } },
      "/api/trips/{tripId}/documents": { post: { summary: "Añadir documento", security: [{ bearerAuth: [] }], responses: { 200: { description: "Viaje actualizado" } } } },
      "/api/trips/{tripId}/documents/{documentId}": { patch: { summary: "Alternar documento listo", security: [{ bearerAuth: [] }], responses: { 200: { description: "Viaje actualizado" } } } },
      "/api/trips/{tripId}/checklist/{itemId}": { patch: { summary: "Alternar checklist", security: [{ bearerAuth: [] }], responses: { 200: { description: "Viaje actualizado" } } } },
      "/api/trips/{tripId}/archive": { patch: { summary: "Archivar viaje", security: [{ bearerAuth: [] }], responses: { 200: { description: "Viaje archivado" } } } },
      "/api/password-reset/request": { post: { summary: "Solicitar token de recuperación", responses: { 200: { description: "Solicitud aceptada" } } } },
      "/api/password-reset/confirm": { post: { summary: "Confirmar nueva contraseña", responses: { 200: { description: "Contraseña actualizada" } } } }
    },
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer" }
      }
    }
  };
}

function bearerToken(request) {
  return String(request.headers.authorization || "").replace(/^Bearer\s+/i, "");
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString() || "{}");
}
