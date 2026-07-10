import crypto from "node:crypto";

const resets = new Map();

export async function createPasswordReset({ email, sendMail, now = Date.now }) {
  const normalizedEmail = normalizeEmail(email);
  const token = String(crypto.randomInt(100000, 1000000));
  resets.set(normalizedEmail, {
    tokenHash: hashToken(token),
    expiresAt: now() + 15 * 60 * 1000
  });
  await sendMail({
    to: normalizedEmail,
    subject: "AtlasIQ - recupera tu contraseña",
    text: `Tu token de AtlasIQ es: ${token}. Caduca en 15 minutos.`
  });
  return { ok: true };
}

export async function confirmPasswordReset({ email, token, password, updatePassword, now = Date.now }) {
  const normalizedEmail = normalizeEmail(email);
  const reset = resets.get(normalizedEmail);
  if (!reset || reset.expiresAt < now() || reset.tokenHash !== hashToken(token)) return "Token inválido.";
  if (String(password || "").length < 6) return "La nueva contraseña necesita al menos 6 caracteres.";
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
