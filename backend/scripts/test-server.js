const { createServer } = await import("../src/server.js");
const memoryStore = () => {
  let data = [];
  return { async read() { return data; }, async write(next) { data = structuredClone(next); } };
};

export function startTestApi() {
  const server = createServer({
    userStore: memoryStore(),
    tripStore: memoryStore(),
    paymentStore: memoryStore(),
    reviewStore: memoryStore(),
    favoriteStore: memoryStore(),
    plannedPaymentStore: memoryStore(),
    sendMail: async () => {},
    authSecret: "atlasiq-e2e-secret-with-at-least-32-characters",
    authRateLimit: 100
  });
  return new Promise((resolve) => server.listen(8023, "127.0.0.1", () => resolve(server)));
}
