import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { createStripePaymentService, verifySignature } from "../src/payments/stripe-payments.js";

const store = memoryStore();
const service = createStripePaymentService(store, { secretKey: "sk_test", webhookSecret: "whsec_test", now: () => 1000 * 1000, fetchImpl: async (_url, options) => ({ ok: true, json: async () => options.body.has("payment_intent") ? { id: "re_1" } : { id: "cs_1", url: "https://checkout.stripe.com/c/pay/cs_1" } }) });
const checkout = await service.checkout({ email: "test@example.com" }, "guide-rome");
assert.equal(checkout.id, "cs_1");
assert.equal((await service.list("test@example.com"))[0].amount, 9500);

const raw = JSON.stringify({ type: "checkout.session.completed", data: { object: { id: "cs_1", payment_intent: "pi_1", invoice: "in_1" } } });
const timestamp = 1000;
const signature = createHmac("sha256", "whsec_test").update(`${timestamp}.${raw}`).digest("hex");
verifySignature(raw, `t=${timestamp},v1=${signature}`, "whsec_test", 1000 * 1000);
await service.webhook(raw, `t=${timestamp},v1=${signature}`);
assert.equal((await service.list("test@example.com"))[0].status, "paid");
assert.equal((await service.refund("test@example.com", "cs_1")).status, "refunded");

console.log("AtlasIQ Stripe payments check passed");

function memoryStore() {
  let value = [];
  return { read: async () => structuredClone(value), write: async (next) => { value = structuredClone(next); } };
}
