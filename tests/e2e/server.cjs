const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".jpeg": "image/jpeg",
};

http
  .createServer(async (request, response) => {
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    } catch {
      response.writeHead(400).end("Bad request");
      return;
    }

    const relativePath = pathname.replace(/^\/+/, "");
    if (
      !["GET", "HEAD"].includes(request.method) ||
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
      const body = await fs.readFile(filePath);
      response.writeHead(200, {
        "Content-Type": contentTypes[path.extname(filePath)] || "application/octet-stream",
        "X-Content-Type-Options": "nosniff",
      });
      response.end(request.method === "HEAD" ? undefined : body);
    } catch {
      response.writeHead(404).end("Not found");
    }
  })
  .listen(4173, "127.0.0.1");
