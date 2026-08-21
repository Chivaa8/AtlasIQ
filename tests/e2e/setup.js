import { startTestApi } from "../../backend/scripts/test-server.js";
import { startStaticServer } from "../static-server.js";

export default async function setup() {
  const servers = await Promise.all([startTestApi(), startStaticServer()]);
  return async () => Promise.all(servers.map((server) => new Promise((resolve) => server.close(resolve))));
}
