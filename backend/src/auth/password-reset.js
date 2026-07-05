import crypto from "node:crypto";

const resets = new Map();

export async function createPasswordReset({ email, sendMail, now = Date.now }) {
  const token = String(crypto.randomInt(100000, 1000000));
  resets.set(email, {
    tokenHash: hashToken(token),
    expiresAt: now() + 15 * 60 * 1000
  });
  await sendMail({
    to: email,
    subject: "AtlasIQ - recupera tu contraseña",
    text: `Tu token de AtlasIQ es: ${token}. Caduca en 15 minutos.`
  });
  return { ok: true };
}

export function confirmPasswordReset({ email, token, password, now = Date.now }) {
  const reset = resets.get(email);
  if (!reset || reset.expiresAt < now() || reset.tokenHash !== hashToken(token)) return "Token inválido.";
  if (password.length < 6) return "La nueva contraseña necesita al menos 6 caracteres.";
  resets.delete(email);
  return "";
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
