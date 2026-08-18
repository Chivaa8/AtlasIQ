import { createHmac, timingSafeEqual } from "node:crypto";

export const products = {
  "guide-rome": { name: "Guía local en Roma", amount: 9500 },
  "guide-tokyo": { name: "Guía local en Tokio", amount: 12000 },
  "guide-marrakech": { name: "Guía local en Marrakech", amount: 7000 },
  "excursion-rome": { name: "Excursión a Tivoli", amount: 6900 },
  "excursion-bali": { name: "Excursión templos de Bali", amount: 5500 },
  "insurance-basic": { name: "Seguro Esencial", amount: 2900 },
  "insurance-plus": { name: "Seguro Completo", amount: 5900 }
};

export function createStripePaymentService(store, options = {}) {
  const secretKey = options.secretKey || process.env.STRIPE_SECRET_KEY;
  const webhookSecret = options.webhookSecret || process.env.STRIPE_WEBHOOK_SECRET;
  const appUrl = options.appUrl || process.env.APP_URL || "http://localhost:8022";
  const fetchImpl = options.fetchImpl || fetch;
  const now = options.now || Date.now;

  return {
    async checkout(user, productId) {
      if (!secretKey) throw new Error("Stripe no está configurado.");
      const product = products[productId];
      if (!product) throw new Error("Producto de pago inválido.");
      const body = new URLSearchParams({
        mode: "payment",
        success_url: `${appUrl}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/?payment=cancelled`,
        customer_email: user.email,
        client_reference_id: user.email,
        "metadata[product_id]": productId,
        "line_items[0][quantity]": "1",
        "line_items[0][price_data][currency]": "eur",
        "line_items[0][price_data][unit_amount]": String(product.amount),
        "line_items[0][price_data][product_data][name]": product.name,
        "invoice_creation[enabled]": "true"
      });
      const session = await stripeRequest("/v1/checkout/sessions", body, secretKey, fetchImpl);
      await upsert(store, { id: session.id, userEmail: user.email, productId, amount: product.amount, status: "pending", checkoutUrl: session.url, createdAt: new Date(now()).toISOString() });
      return { id: session.id, url: session.url };
    },

    async list(userEmail) {
      return (await store.read()).filter((payment) => payment.userEmail === userEmail);
    },

    async webhook(rawBody, signature) {
      if (!webhookSecret) throw new Error("Webhook de Stripe no configurado.");
      verifySignature(rawBody, signature, webhookSecret, now());
      const event = JSON.parse(rawBody);
      if (!["checkout.session.completed", "checkout.session.expired"].includes(event.type)) return { received: true };
      const session = event.data.object;
      await update(store, session.id, {
        status: event.type === "checkout.session.completed" ? "paid" : "expired",
        paymentIntent: session.payment_intent || "",
        invoice: session.invoice || "",
        updatedAt: new Date(now()).toISOString()
      });
      return { received: true };
    },

    async refund(userEmail, paymentId) {
      if (!secretKey) throw new Error("Stripe no está configurado.");
      const payment = (await store.read()).find((item) => item.id === paymentId && item.userEmail === userEmail);
      if (!payment || payment.status !== "paid" || !payment.paymentIntent) throw new Error("Este pago no se puede reembolsar.");
      const refund = await stripeRequest("/v1/refunds", new URLSearchParams({ payment_intent: payment.paymentIntent }), secretKey, fetchImpl);
      await update(store, payment.id, { status: "refunded", refundId: refund.id, updatedAt: new Date(now()).toISOString() });
      return { id: refund.id, status: "refunded" };
    }
  };
}

async function stripeRequest(path, body, secretKey, fetchImpl) {
  const response = await fetchImpl(`https://api.stripe.com${path}`, { method: "POST", headers: { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/x-www-form-urlencoded" }, body });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error?.message || "Stripe rechazó la operación.");
  return payload;
}

export function verifySignature(rawBody, header, secret, now = Date.now()) {
  const values = Object.fromEntries(String(header || "").split(",").map((part) => part.split("=", 2)));
  const timestamp = Number(values.t);
  if (!timestamp || Math.abs(now / 1000 - timestamp) > 300) throw new Error("Firma de webhook caducada.");
  const expected = createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex");
  const received = Buffer.from(values.v1 || "", "hex");
  const valid = received.length === expected.length / 2 && timingSafeEqual(received, Buffer.from(expected, "hex"));
  if (!valid) throw new Error("Firma de webhook inválida.");
}

async function upsert(store, payment) {
  const payments = await store.read();
  await store.write([...payments.filter((item) => item.id !== payment.id), payment]);
}

async function update(store, id, changes) {
  const payments = await store.read();
  await store.write(payments.map((payment) => payment.id === id ? { ...payment, ...changes } : payment));
}
