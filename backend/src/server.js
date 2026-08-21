import http from "node:http";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createAuthService } from "./auth/auth-service.js";
import { createPasswordReset, confirmPasswordReset } from "./auth/password-reset.js";
import { createJsonStore } from "./storage/json-store.js";
import { createPostgresPool, createPostgresStore } from "./storage/postgres-store.js";
import { createTripService } from "./trips/trip-service.js";
import { createStripePaymentService } from "./payments/stripe-payments.js";
import { createUserDataService } from "./data/user-data-service.js";
import { createRateLimiter } from "./security/rate-limit.js";
import { securityEmail } from "./email/templates.js";

export function createServer({
  userStore,
  tripStore,
  paymentStore,
  reviewStore,
  favoriteStore,
  plannedPaymentStore,
  sendMail = realSendMail,
  stripeOptions,
  authSecret = process.env.AUTH_SECRET
} = {}) {
  const metrics = { requests: 0, errors: 0, startedAt: Date.now() };
  const defaults = defaultStores();
  userStore ||= defaults.userStore;
  tripStore ||= defaults.tripStore;
  paymentStore ||= defaults.paymentStore;
  reviewStore ||= defaults.reviewStore;
  favoriteStore ||= defaults.favoriteStore;
  plannedPaymentStore ||= defaults.plannedPaymentStore;
  const auth = createAuthService(userStore, authSecret);
  const trips = createTripService(tripStore);
  const payments = createStripePaymentService(paymentStore, stripeOptions);
  const reviews = createUserDataService(reviewStore, reviewInput);
  const favorites = createUserDataService(favoriteStore, favoriteInput);
  const plannedPayments = createUserDataService(plannedPaymentStore, plannedPaymentInput);
  const authLimited = createRateLimiter({ limit: 5 });
  const abuseLimited = createRateLimiter({ limit: 20, windowMs: 60 * 60 * 1000 });

  return http.createServer((request, response) => {
    const startedAt = Date.now();
    metrics.requests += 1;
    response.once("finish", () => {
      if (response.statusCode >= 500) metrics.errors += 1;
      log("request", { method: request.method, path: request.url?.split("?")[0], status: response.statusCode, durationMs: Date.now() - startedAt });
    });
    handleRequest(request, response).catch((error) => {
      metrics.errors += 1;
      log("request_error", { message: error.message });
      if (!response.headersSent) json(response, 500, { error: "Internal server error" });
    });
  });

  async function handleRequest(request, response) {
    const origin = request.headers.origin;
    const allowedOrigins = new Set(["http://127.0.0.1:8022", "http://localhost:8022", ...String(process.env.APP_URL || "").split(",").map((value) => value.trim()).filter(Boolean)]);
    if (allowedOrigins.has(origin)) {
      response.setHeader("Access-Control-Allow-Origin", origin);
      response.setHeader("Vary", "Origin");
    }
    response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    response.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("X-Frame-Options", "DENY");
    response.setHeader("Referrer-Policy", "no-referrer");
    response.setHeader("Cache-Control", "no-store");
    if (request.method === "OPTIONS") return json(response, 204, {});
    const url = new URL(request.url, `http://${request.headers.host}`);

    if (request.method === "POST" && url.pathname === "/api/payments/webhook") {
      try {
        return json(response, 200, await payments.webhook(await readBody(request), request.headers["stripe-signature"]));
      } catch (error) {
        return json(response, 400, { error: error.message });
      }
    }

    if (request.method === "GET" && url.pathname === "/api/health") {
      return json(response, 200, { status: "ok", service: "AtlasIQ API", uptimeSeconds: Math.floor(process.uptime()) });
    }

    if (request.method === "GET" && url.pathname === "/api/metrics") {
      return text(response, 200, `atlasiq_requests_total ${metrics.requests}\natlasiq_errors_total ${metrics.errors}\natlasiq_uptime_seconds ${Math.floor((Date.now() - metrics.startedAt) / 1000)}\n`);
    }

    if (request.method === "GET" && url.pathname === "/api/openapi.json") {
      return json(response, 200, openApiDocument());
    }

    if (request.method === "POST" && url.pathname === "/api/auth/register") {
      const body = await readJson(request);
      if (body.website || authLimited(`register:${clientIp(request)}`)) return json(response, 429, { error: "too many attempts" });
      return action(response, () => auth.register(body));
    }

    if (request.method === "POST" && url.pathname === "/api/payments/checkout") {
      const body = await readJson(request);
      return action(response, async () => payments.checkout(await auth.me(bearerToken(request)), body.productId));
    }

    if (request.method === "GET" && url.pathname === "/api/payments") {
      return action(response, async () => payments.list((await auth.me(bearerToken(request))).email));
    }

    const refundMatch = url.pathname.match(/^\/api\/payments\/([^/]+)\/refund$/);
    if (request.method === "POST" && refundMatch) {
      return action(response, async () => payments.refund((await auth.me(bearerToken(request))).email, refundMatch[1]));
    }

    if (request.method === "POST" && url.pathname === "/api/auth/login") {
      const body = await readJson(request);
      if (authLimited(`login:${clientIp(request)}:${String(body.email || "").toLowerCase()}`)) return json(response, 429, { error: "too many attempts" });
      return action(response, () => auth.login(body));
    }

    if (request.method === "POST" && url.pathname === "/api/auth/refresh") return action(response, () => auth.refresh(bearerToken(request)));
    if (request.method === "POST" && url.pathname === "/api/auth/logout") return action(response, () => auth.revoke(bearerToken(request)));

    if (request.method === "POST" && url.pathname === "/api/auth/email-verification/request") {
      return action(response, async () => {
        const verification = await auth.issueEmailVerification(bearerToken(request));
        await sendMail({ to: verification.email, subject: "Verifica tu cuenta de AtlasIQ", ...securityEmail({ title: "Verifica tu correo", intro: "Confirma que esta dirección pertenece a tu cuenta de AtlasIQ.", code: verification.code, expiry: "30 minutos" }) });
        return { sent: true };
      });
    }

    if (request.method === "POST" && url.pathname === "/api/auth/email-verification/confirm") {
      const body = await readJson(request);
      return action(response, () => auth.verifyEmail(body.email, body.code));
    }

    if (request.method === "GET" && url.pathname === "/api/auth/me") {
      return action(response, () => auth.me(bearerToken(request)));
    }

    if (request.method === "PATCH" && url.pathname === "/api/auth/me/profile") {
      const body = await readJson(request);
      return action(response, () => auth.updateProfile(bearerToken(request), body));
    }

    if (request.method === "PATCH" && url.pathname === "/api/auth/me/preferences") {
      const body = await readJson(request);
      return action(response, () => auth.updatePreferences(bearerToken(request), body));
    }

    if (request.method === "GET" && url.pathname === "/api/reviews") {
      return action(response, () => reviews.list());
    }

    if (request.method === "POST" && url.pathname === "/api/reviews") {
      const body = await readJson(request);
      if (abuseLimited(`review:${clientIp(request)}`)) return json(response, 429, { error: "too many attempts" });
      return action(response, async () => reviews.create((await auth.me(bearerToken(request))).email, body));
    }

    const collections = { favorites, "planned-payments": plannedPayments };
    const collectionMatch = url.pathname.match(/^\/api\/(favorites|planned-payments)(?:\/([^/]+))?$/);
    if (collectionMatch) {
      const service = collections[collectionMatch[1]];
      if (request.method === "GET" && !collectionMatch[2]) return action(response, async () => service.list((await auth.me(bearerToken(request))).email));
      if (request.method === "POST" && !collectionMatch[2]) return action(response, async () => service.create((await auth.me(bearerToken(request))).email, await readJson(request)));
      if (request.method === "PATCH" && collectionMatch[2]) return action(response, async () => service.update((await auth.me(bearerToken(request))).email, collectionMatch[2], await readJson(request)));
      if (request.method === "DELETE" && collectionMatch[2]) return action(response, async () => service.remove((await auth.me(bearerToken(request))).email, collectionMatch[2]));
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
      if (authLimited(`reset:${clientIp(request)}:${String(body.email || "").toLowerCase()}`)) return json(response, 429, { error: "too many attempts" });
      if (await auth.hasUser(body.email)) await createPasswordReset({ email: body.email, sendMail }).catch(() => {});
      return json(response, 200, {});
    }

    if (request.method === "POST" && url.pathname === "/api/password-reset/confirm") {
      const body = await readJson(request);
      const error = await confirmPasswordReset({ ...body, updatePassword: auth.updatePassword });
      return error ? json(response, 400, { error }) : json(response, 200, {});
    }

    json(response, 404, { error: "Not found" });
  }
}

function defaultStores() {
  const pool = createPostgresPool();
  return pool ? {
    userStore: createPostgresStore(pool, "users"),
    tripStore: createPostgresStore(pool, "trips"),
    paymentStore: createPostgresStore(pool, "payments"),
    reviewStore: createPostgresStore(pool, "reviews"),
    favoriteStore: createPostgresStore(pool, "favorites"),
    plannedPaymentStore: createPostgresStore(pool, "planned_payments")
  } : {
    userStore: createJsonStore(resolve("backend/data/users.json"), []),
    tripStore: createJsonStore(resolve("backend/data/trips.json"), []),
    paymentStore: createJsonStore(resolve("backend/data/payments.json"), []),
    reviewStore: createJsonStore(resolve("backend/data/reviews.json"), []),
    favoriteStore: createJsonStore(resolve("backend/data/favorites.json"), []),
    plannedPaymentStore: createJsonStore(resolve("backend/data/planned-payments.json"), [])
  };
}

function reviewInput(input) {
  const text = String(input?.text || "").trim().slice(0, 1000);
  if (!text) throw new Error("review text is required");
  return { name: String(input.name || "Viajero").trim().slice(0, 80), destination: String(input.destination || "").trim().slice(0, 120), rating: Math.min(5, Math.max(1, Number(input.rating || 5))), text };
}

function favoriteInput(input) {
  const offerId = String(input?.offerId || "").trim().slice(0, 120);
  if (!offerId) throw new Error("offerId is required");
  return { offerId };
}

function plannedPaymentInput(input) {
  const amount = Number(input?.amount);
  if (!String(input?.concept || "").trim() || !Number.isFinite(amount) || amount <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(String(input?.date || ""))) throw new Error("planned payment is invalid");
  return { concept: String(input.concept).trim().slice(0, 120), amount, date: input.date, completed: Boolean(input.completed) };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const port = Number(process.env.PORT || 8023);
  createServer().listen(port, () => {
    log("server_started", { port });
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
      text: message.text,
      html: message.html
    })
  });
  if (!response.ok) throw new Error("Email provider rejected the password reset email.");
}

function json(response, status, payload) {
  response.writeHead(status, { "Content-Type": "application/json" });
  response.end(JSON.stringify(payload));
}

function text(response, status, payload) {
  response.writeHead(status, { "Content-Type": "text/plain; version=0.0.4; charset=utf-8" });
  response.end(payload);
}

function log(event, details = {}) {
  console.log(JSON.stringify({ timestamp: new Date().toISOString(), level: "info", event, ...details }));
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
  if (!String(request.headers["content-type"] || "").toLowerCase().startsWith("application/json")) throw new Error("Content-Type must be application/json");
  return JSON.parse(await readBody(request) || "{}");
}

async function readBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 1024 * 1024) throw new Error("request body is too large");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString();
}

function clientIp(request) {
  return String(request.socket.remoteAddress || "unknown");
}
