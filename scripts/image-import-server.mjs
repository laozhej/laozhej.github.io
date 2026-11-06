import { createServer } from "node:http";
import { randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ImageImportError, importImages, listImportedImages, MAX_BATCH_BYTES, MAX_FILE_BYTES, MAX_FILES } from "../src/core/media/image-import.mjs";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const staticRoutes = {
  "/favicon.svg": ["public/favicon.svg", "image/svg+xml"],
  "/": ["tools/image-import/index.html", "text/html; charset=utf-8"],
  "/app.mjs": ["tools/image-import/app.mjs", "text/javascript; charset=utf-8"],
  "/style.css": ["tools/image-import/style.css", "text/css; charset=utf-8"],
  "/i18n.mjs": ["src/core/i18n/image-import.mjs", "text/javascript; charset=utf-8"],
  "/routing.mjs": ["src/core/i18n/routing.mjs", "text/javascript; charset=utf-8"],
};

// Only this allowlist is served. The repository, originals and source manifest are not a static root.
export function createImporterServer({ rootDir = repositoryRoot, logger = console } = {}) {
  const token = randomBytes(32).toString("hex");
  let importing = false;
  const server = createServer(async (request, response) => {
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("Referrer-Policy", "no-referrer");
    response.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' blob:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
    const json = (status, data) => {
      response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
      response.end(JSON.stringify(data));
    };
    try {
      const origin = `http://127.0.0.1:${server.address().port}`;
      if (request.headers.host !== new URL(origin).host || (request.headers.origin && request.headers.origin !== origin)) {
        return json(403, { error: "forbidden" });
      }
      const pathname = new URL(request.url, origin).pathname;
      if (request.method === "GET" && staticRoutes[pathname]) {
        const [filename, contentType] = staticRoutes[pathname];
        let contents = await readFile(path.join(repositoryRoot, filename));
        if (pathname === "/") contents = contents.toString().replace("__IMPORT_TOKEN__", token);
        response.writeHead(200, { "Content-Type": contentType });
        return response.end(contents);
      }
      if (request.method === "GET" && pathname === "/api/images") {
        return json(200, { assets: await listImportedImages(rootDir) });
      }
      if (request.method === "GET" && /^\/images\/imported\/[a-z0-9-]+\.webp$/.test(pathname)) {
        const assets = await listImportedImages(rootDir);
        if (!assets.some((asset) => asset.path === pathname)) return json(404, { error: "notFound" });
        const contents = await readFile(path.join(rootDir, "public", pathname.slice(1)));
        response.writeHead(200, { "Content-Type": "image/webp" });
        return response.end(contents);
      }
      if (request.method !== "POST" || pathname !== "/api/import") return json(404, { error: "notFound" });
      if (request.headers["x-image-import-token"] !== token || request.headers.origin !== origin) return json(403, { error: "forbidden" });
      if (!request.headers["content-type"]?.startsWith("multipart/form-data;")) return json(400, { error: "badRequest" });
      if (importing) return json(409, { error: "busy" });
      importing = true;
      try {
        const limit = MAX_BATCH_BYTES + 256 * 1024;
        if (Number(request.headers["content-length"]) > limit) return json(413, { error: "batchSize" });
        const chunks = [];
        let length = 0;
        for await (const chunk of request) {
          length += chunk.length;
          if (length > limit) return json(413, { error: "batchSize" });
          chunks.push(chunk);
        }
        let form;
        let fields;
        try {
          form = await new Request(`${origin}/api/import`, { method: "POST", headers: { "Content-Type": request.headers["content-type"] }, body: Buffer.concat(chunks) }).formData();
          fields = JSON.parse(form.get("metadata"));
        } catch { throw new ImageImportError("badRequest"); }
        const uploads = form.getAll("images");
        if (!uploads.length || uploads.length > MAX_FILES || !Array.isArray(fields?.files) || fields.files.length !== uploads.length) throw new ImageImportError("invalidBatch");
        const files = [];
        for (const [index, file] of uploads.entries()) {
          if (!(file instanceof File) || !file.size || file.size > MAX_FILE_BYTES) throw new ImageImportError("fileSize");
          files.push({ data: Buffer.from(await file.arrayBuffer()), name: file.name, nameHint: fields.files[index]?.nameHint, alt: fields.files[index]?.alt, source: fields.source });
        }
        const assets = await importImages({ rootDir, files, maxSize: fields.maxSize, quality: fields.quality });
        return json(200, { assets });
      } finally { importing = false; }
    } catch (error) {
      if (error instanceof ImageImportError) return json(error.code === "busy" ? 409 : 400, { error: error.code, detail: error.detail });
      if (error.code === "ENOENT") return json(404, { error: "notFound" });
      logger.error(error);
      if (!response.headersSent) json(500, { error: "internal" });
      else response.end();
    }
  });
  server.requestTimeout = 120_000;
  server.headersTimeout = 10_000;
  return server;
}
