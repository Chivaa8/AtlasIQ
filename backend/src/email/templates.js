export function securityEmail({ title, intro, code, expiry }) {
  const safeCode = escapeHtml(code);
  return {
    text: `${title}\n\n${intro}\n\nCódigo: ${code}\nCaduca en ${expiry}.\n\nSi no has solicitado esto, ignora el mensaje.`,
    html: `<!doctype html><html lang="es"><body style="margin:0;background:#f3f6f5;font-family:Arial,sans-serif;color:#17211f"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:32px 16px"><table role="presentation" width="100%" style="max-width:560px;background:#fff;border-radius:12px"><tr><td style="padding:32px"><p style="margin:0 0 24px;color:#0c7168;font-size:22px;font-weight:700">AtlasIQ</p><h1 style="font-size:24px">${escapeHtml(title)}</h1><p>${escapeHtml(intro)}</p><p style="padding:18px;text-align:center;background:#edf4f1;border-radius:8px;font-size:30px;font-weight:700;letter-spacing:5px">${safeCode}</p><p>Caduca en ${escapeHtml(expiry)}.</p><p style="color:#66736f;font-size:14px">Si no has solicitado esto, ignora el mensaje. AtlasIQ nunca te pedirá la contraseña por correo.</p></td></tr></table></td></tr></table></body></html>`
  };
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}
