import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";

const iterations = 120000;
const keyLength = 32;
const digest = "sha256";
const defaultTokenTtlMs = 7 * 24 * 60 * 60 * 1000;

export function createAuthService(store, secret = process.env.AUTH_SECRET, tokenTtlMs = defaultTokenTtlMs) {
  if (String(secret || "").length < 32) throw new Error("AUTH_SECRET must have at least 32 characters");
  return {
    async hasUser(email) {
      const normalizedEmail = String(email || "").trim().toLowerCase();
      return (await store.read()).some((item) => item.email === normalizedEmail);
    },
    async register(input) {
      const user = normalizeUser(input);
      const users = await store.read();
      if (users.some((item) => item.email === user.email)) throw new Error("email already registered");
      const saved = {
        ...user,
        id: crypto.randomUUID(),
        passwordHash: hashPassword(input.password),
        emailVerified: false,
        sessionVersion: 0,
        createdAt: new Date().toISOString()
      };
      await store.write([...users, saved]);
      return session(saved, secret, tokenTtlMs);
    },
    async login(input) {
      const email = String(input.email || "").trim().toLowerCase();
      const user = (await store.read()).find((item) => item.email === email);
      if (!user || !verifyPassword(input.password, user.passwordHash)) throw new Error("invalid credentials");
      if (user.blocked) throw new Error("account blocked");
      return session(user, secret, tokenTtlMs);
    },
    async me(token) {
      const user = await authenticatedUser(store, token, secret);
      return publicUser(user);
    },
    async updateProfile(token, profile) {
      const payload = verifyToken(token, secret);
      const users = await store.read();
      const index = users.findIndex((item) => item.id === payload.sub);
      if (index === -1 || Number(users[index].sessionVersion || 0) !== Number(payload.ver || 0)) throw new Error("invalid token");
      const nextUser = normalizeProfile(users[index], profile, users);
      users[index] = nextUser;
      await store.write(users);
      return session(nextUser, secret, tokenTtlMs);
    },
    async updatePreferences(token, preferences) {
      const payload = verifyToken(token, secret);
      const users = await store.read();
      const index = users.findIndex((item) => item.id === payload.sub);
      if (index === -1 || Number(users[index].sessionVersion || 0) !== Number(payload.ver || 0)) throw new Error("invalid token");
      users[index] = { ...users[index], preferences: normalizePreferences(preferences), updatedAt: new Date().toISOString() };
      await store.write(users);
      return publicUser(users[index]);
    },
    async refresh(token) {
      return session(await authenticatedUser(store, token, secret), secret, tokenTtlMs);
    },
    async revoke(token) {
      const user = await authenticatedUser(store, token, secret);
      const users = await store.read();
      const index = users.findIndex((item) => item.id === user.id);
      users[index] = { ...users[index], sessionVersion: Number(users[index].sessionVersion || 0) + 1 };
      await store.write(users);
      return { revoked: true };
    },
    async issueEmailVerification(token) {
      const user = await authenticatedUser(store, token, secret);
      const users = await store.read();
      const index = users.findIndex((item) => item.id === user.id);
      const code = randomBytes(24).toString("base64url");
      users[index] = { ...users[index], emailVerificationHash: hashVerification(code), emailVerificationExpiresAt: Date.now() + 30 * 60 * 1000 };
      await store.write(users);
      return { email: user.email, code };
    },
    async verifyEmail(email, code) {
      const users = await store.read();
      const index = users.findIndex((item) => item.email === String(email || "").trim().toLowerCase());
      const user = users[index];
      if (!user || user.emailVerificationExpiresAt < Date.now() || user.emailVerificationHash !== hashVerification(code)) throw new Error("verification code is invalid");
      users[index] = { ...user, emailVerified: true, emailVerificationHash: undefined, emailVerificationExpiresAt: undefined };
      await store.write(users);
      return publicUser(users[index]);
    },
    async updatePassword(email, password) {
      if (!strongPassword(password)) throw new Error("password is too weak");
      const users = await store.read();
      const index = users.findIndex((item) => item.email === String(email || "").trim().toLowerCase());
      if (index === -1) return;
      users[index] = { ...users[index], passwordHash: hashPassword(password), sessionVersion: Number(users[index].sessionVersion || 0) + 1, updatedAt: new Date().toISOString() };
      await store.write(users);
    },
    async adminUsers(token) {
      await requireAdmin(store, token, secret);
      return (await store.read()).map(publicUser);
    },
    async adminSetBlocked(token, userId, blocked) {
      const admin = await requireAdmin(store, token, secret);
      if (admin.id === userId) throw new Error("admin cannot block itself");
      const users = await store.read();
      const index = users.findIndex((user) => user.id === userId);
      if (index === -1) throw new Error("user not found");
      users[index] = { ...users[index], blocked: Boolean(blocked), sessionVersion: Number(users[index].sessionVersion || 0) + 1, updatedAt: new Date().toISOString() };
      await store.write(users);
      return publicUser(users[index]);
    }
  };
}

function normalizePreferences(input) {
  return {
    tripScope: String(input?.tripScope || "any").slice(0, 30),
    continent: String(input?.continent || "any").slice(0, 30),
    landscape: String(input?.landscape || "any").slice(0, 30),
    environment: String(input?.environment || "any").slice(0, 30),
    vibe: String(input?.vibe || "any").slice(0, 30),
    flightMode: String(input?.flightMode || "any").slice(0, 30),
    rentalMode: String(input?.rentalMode || "any").slice(0, 30),
    days: Math.min(365, Math.max(1, Number(input?.days || 1))),
    budget: Math.max(0, Number(input?.budget || 0)),
    stopoverDays: Math.min(30, Math.max(0, Number(input?.stopoverDays || 0))),
    goal: String(input?.goal || "").trim().slice(0, 500)
  };
}

function normalizeUser(input) {
  const user = {
    name: String(input.name || "").trim(),
    email: String(input.email || "").trim().toLowerCase(),
    origin: String(input.origin || "").trim(),
    currency: input.currency || "EUR"
  };
  if (!user.name) throw new Error("name is required");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) throw new Error("email is invalid");
  if (!strongPassword(input.password)) throw new Error("password is too weak");
  if (!user.origin) throw new Error("origin is required");
  return user;
}

function normalizeProfile(current, profile, users) {
  const email = String(profile.email || current.email).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("email is invalid");
  if (users.some((user) => user.id !== current.id && user.email === email)) throw new Error("email already registered");
  if (profile.password && !strongPassword(profile.password)) throw new Error("password is too weak");

  return {
    ...current,
    name: String(profile.name || "").trim(),
    firstSurname: String(profile.firstSurname || "").trim(),
    secondSurname: String(profile.secondSurname || "").trim(),
    documentId: String(profile.documentId || "").trim(),
    currency: profile.currency || current.currency || "EUR",
    email,
    phone: String(profile.phone || "").trim(),
    photo: profile.photo || current.photo || "",
    personalDocuments: normalizePersonalDocuments(profile.personalDocuments || current.personalDocuments || []),
    passwordHash: profile.password ? hashPassword(profile.password) : current.passwordHash,
    updatedAt: new Date().toISOString()
  };
}

function normalizePersonalDocuments(documents) {
  return Array.isArray(documents)
    ? documents.map((document) => ({
        id: String(document.id || crypto.randomUUID()),
        name: String(document.name || "Documento").slice(0, 120),
        type: String(document.type || "Documento").slice(0, 80),
        size: Number(document.size || 0),
        dataUrl: String(document.dataUrl || "")
      }))
    : [];
}

function hashPassword(password) {
  const salt = randomBytes(16).toString("base64url");
  const key = pbkdf2Sync(String(password), salt, iterations, keyLength, digest).toString("base64url");
  return `${iterations}.${salt}.${key}`;
}

function verifyPassword(password, stored) {
  const [storedIterations, salt, key] = String(stored || "").split(".");
  if (!storedIterations || !salt || !key) return false;
  const candidate = pbkdf2Sync(String(password), salt, Number(storedIterations), keyLength, digest);
  const expected = Buffer.from(key, "base64url");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

function session(user, secret, tokenTtlMs = defaultTokenTtlMs) {
  return { token: signToken({ sub: user.id, email: user.email, ver: Number(user.sessionVersion || 0), exp: Date.now() + tokenTtlMs }, secret), user: publicUser(user) };
}

function publicUser(user) {
  const { passwordHash, emailVerificationHash, emailVerificationExpiresAt, sessionVersion, ...safeUser } = user;
  return { ...safeUser, role: isAdminEmail(user.email) ? "admin" : "user", emailVerified: user.emailVerified !== false };
}

async function authenticatedUser(store, token, secret) {
  const payload = verifyToken(token, secret);
  const user = (await store.read()).find((item) => item.id === payload.sub);
  if (!user || user.blocked || Number(user.sessionVersion || 0) !== Number(payload.ver || 0)) throw new Error("invalid token");
  return user;
}

async function requireAdmin(store, token, secret) {
  const user = await authenticatedUser(store, token, secret);
  if (!isAdminEmail(user.email)) throw new Error("admin required");
  return user;
}

function isAdminEmail(email) {
  return String(process.env.ADMIN_EMAILS || "").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean).includes(String(email || "").toLowerCase());
}

function hashVerification(code) {
  return createHmac("sha256", "atlasiq-email-verification").update(String(code || "")).digest("hex");
}

function strongPassword(password) {
  const value = String(password || "");
  return value.length >= 8 && /[a-z]/.test(value) && /[A-Z]/.test(value) && /\d/.test(value);
}

function signToken(payload, secret) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${signature}`;
}

function verifyToken(token, secret) {
  const [body, signature] = String(token || "").split(".");
  if (!body || !signature) throw new Error("invalid token");
  const expected = createHmac("sha256", secret).update(body).digest("base64url");
  const given = Buffer.from(signature);
  const wanted = Buffer.from(expected);
  if (given.length !== wanted.length || !timingSafeEqual(given, wanted)) throw new Error("invalid token");
  const payload = JSON.parse(Buffer.from(body, "base64url").toString());
  if (!payload.exp || payload.exp < Date.now()) throw new Error("token expired");
  return payload;
}
