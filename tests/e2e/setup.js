process.env.ADMIN_EMAILS = ["chrome", "edge", "firefox", "safari-webkit"].map((name) => `admin-${name}@atlasiq.local`).join(",");
const { startTestApi } = await import("../../backend/scripts/test-server.js");
import { startStaticServer } from "../static-server.js";

export default async function setup() {
  const servers = await Promise.all([startTestApi(), startStaticServer()]);
  return async () => Promise.all(servers.map((server) => new Promise((resolve) => server.close(resolve))));
}
