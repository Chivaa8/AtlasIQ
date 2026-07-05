import http from "node:http";
import { createPasswordReset, confirmPasswordReset } from "./auth/password-reset.js";

const port = Number(process.env.PORT || 8023);

const server = http.createServer(async (request, response) => {
  response.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:8022");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (request.method === "OPTIONS") return json(response, 204, {});

  if (request.method === "POST" && request.url === "/api/password-reset/request") {
    const body = await readJson(request);
    await createPasswordReset({ email: body.email, sendMail });
    return json(response, 200, {});
  }

  if (request.method === "POST" && request.url === "/api/password-reset/confirm") {
    const body = await readJson(request);
    const error = confirmPasswordReset(body);
    return error ? json(response, 400, { error }) : json(response, 200, {});
  }

  json(response, 404, { error: "Not found" });
});

server.listen(port, () => {
  console.log(`AtlasIQ backend on http://127.0.0.1:${port}`);
});

async function sendMail(message) {
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

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString() || "{}");
}
