import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";

const iterations = 120000;
const keyLength = 32;
const digest = "sha256";
const defaultTokenTtlMs = 7 * 24 * 60 * 60 * 1000;

export function createAuthService(store, secret = process.env.AUTH_SECRET || "dev-secret-change-me", tokenTtlMs = defaultTokenTtlMs) {
  return {
    async register(input) {
      const user = normalizeUser(input);
      const users = await store.read();
      if (users.some((item) => item.email === user.email)) throw new Error("email already registered");
      const saved = {
        ...user,
        id: crypto.randomUUID(),
        passwordHash: hashPassword(input.password),
        createdAt: new Date().toISOString()
      };
      await store.write([...users, saved]);
      return session(saved, secret, tokenTtlMs);
    },
    async login(input) {
      const email = String(input.email || "").trim().toLowerCase();
      const user = (await store.read()).find((item) => item.email === email);
      if (!user || !verifyPassword(input.password, user.passwordHash)) throw new Error("invalid credentials");
      return session(user, secret, tokenTtlMs);
    },
    async me(token) {
      const payload = verifyToken(token, secret);
      const user = (await store.read()).find((item) => item.id === payload.sub);
      if (!user) throw new Error("invalid token");
      return publicUser(user);
    },
    async updateProfile(token, profile) {
      const payload = verifyToken(token, secret);
      const users = await store.read();
      const index = users.findIndex((item) => item.id === payload.sub);
      if (index === -1) throw new Error("invalid token");
      const nextUser = normalizeProfile(users[index], profile, users);
      users[index] = nextUser;
      await store.write(users);
      return session(nextUser, secret, tokenTtlMs);
    }
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
  if (String(input.password || "").length < 6) throw new Error("password must have 6 characters");
  if (!user.origin) throw new Error("origin is required");
  return user;
}

function normalizeProfile(current, profile, users) {
  const email = String(profile.email || current.email).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("email is invalid");
  if (users.some((user) => user.id !== current.id && user.email === email)) throw new Error("email already registered");
  if (profile.password && String(profile.password).length < 6) throw new Error("password must have 6 characters");

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
  return { token: signToken({ sub: user.id, email: user.email, exp: Date.now() + tokenTtlMs }, secret), user: publicUser(user) };
}

function publicUser(user) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
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
