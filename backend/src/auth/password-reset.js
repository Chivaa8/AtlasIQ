import crypto from "node:crypto";
import { securityEmail } from "../email/templates.js";

const resets = new Map();

export async function createPasswordReset({ email, sendMail, now = Date.now }) {
  const normalizedEmail = normalizeEmail(email);
  const previous = resets.get(normalizedEmail);
  if (previous?.lastSentAt && previous.lastSentAt + 60 * 1000 > now()) return { ok: true };
  const token = String(crypto.randomInt(100000, 1000000));
  const content = securityEmail({ title: "Recupera tu contraseña", intro: "Usa este código para crear una nueva contraseña.", code: token, expiry: "15 minutos" });
  await sendMail({
    to: normalizedEmail,
    subject: "AtlasIQ - recupera tu contraseña",
    ...content
  });
  resets.set(normalizedEmail, {
    tokenHash: hashToken(token),
    expiresAt: now() + 15 * 60 * 1000,
    lastSentAt: now()
  });
  resets.set(normalizedEmail, {
    tokenHash: hashToken(token),
    expiresAt: now() + 15 * 60 * 1000
  });
  return { ok: true };
}

export async function confirmPasswordReset({ email, token, password, updatePassword, now = Date.now }) {
  const normalizedEmail = normalizeEmail(email);
  const reset = resets.get(normalizedEmail);
  if (!reset || reset.expiresAt < now() || reset.tokenHash !== hashToken(token)) return "Token inválido.";
  const value = String(password || "");
  if (value.length < 8 || !/[a-z]/.test(value) || !/[A-Z]/.test(value) || !/\d/.test(value)) return "La nueva contraseña necesita 8 caracteres, mayúscula, minúscula y número.";
  if (typeof updatePassword !== "function") return "No se pudo actualizar la contraseña.";
  try {
    await updatePassword(normalizedEmail, password);
  } catch {
    return "No se pudo actualizar la contraseña.";
  }
  resets.delete(normalizedEmail);
  return "";
}

function hashToken(token) {
  return crypto.createHash("sha256").update(String(token || "")).digest("hex");
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}
