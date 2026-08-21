import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve("frontend");
const types = { ".css": "text/css", ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml" };

export function startStaticServer() {
  const server = http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    const file = resolve(root, pathname === "/" ? "index.html" : `.${pathname}`);
    if (file !== root && !file.startsWith(`${root}${sep}`)) throw new Error("invalid path");
    const body = await readFile(file);
    response.writeHead(200, { "Content-Type": `${types[extname(file)] || "application/octet-stream"}; charset=utf-8` });
    response.end(body);
  } catch {
    response.writeHead(404).end("Not found");
  }
  });
  return new Promise((resolve) => server.listen(8022, "127.0.0.1", () => resolve(server)));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await startStaticServer();
