import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(__dirname, "../..");
const contentTypes: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".jpeg": "image/jpeg",
};

createServer(async (request: IncomingMessage, response: ServerResponse) => {
  const { method, url } = request;
  if (!url) {
    response.writeHead(400).end("Bad request");
    return;
  }
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(url, "http://localhost").pathname);
  } catch {
    response.writeHead(400).end("Bad request");
    return;
  }

  const relativePath = pathname.replace(/^\/+/, "");
  if (
    !method ||
    !["GET", "HEAD"].includes(method) ||
    !(relativePath === "index.html" || relativePath === "studri.jpeg" || relativePath.startsWith("apps/"))
  ) {
    response.writeHead(404).end("Not found");
    return;
  }

  let filePath = path.resolve(root, relativePath || "index.html");
  if (filePath !== root && !filePath.startsWith(`${root}${path.sep}`)) {
    response.writeHead(404).end("Not found");
    return;
  }
  if (pathname.endsWith("/")) filePath = path.join(filePath, "index.html");

  try {
    const body = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": contentTypes[path.extname(filePath)] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
    });
    response.end(method === "HEAD" ? undefined : body);
  } catch {
    response.writeHead(404).end("Not found");
  }
}).listen(4173, "127.0.0.1");
