#!/usr/bin/env node
import { parseArgs } from "node:util";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { importImages, ImageImportError, MAX_BATCH_BYTES, MAX_FILE_BYTES, MAX_FILES } from "../src/core/media/image-import.mjs";
import { importerText, locales } from "../src/core/i18n/image-import.mjs";
import { createImporterServer } from "./image-import-server.mjs";

const rootDir = fileURLToPath(new URL("../", import.meta.url));
let t = importerText();
try {
  const args = parseArgs({ allowPositionals: true, options: {
    help: { type: "boolean", short: "h" }, locale: { type: "string", default: "zh-CN" },
    port: { type: "string", default: "4318" }, source: { type: "string" }, "source-image": { type: "string" },
    original: { type: "boolean" }, creator: { type: "string" }, license: { type: "string" }, notes: { type: "string" },
    name: { type: "string" }, alt: { type: "string" }, "max-size": { type: "string", default: "1600" }, quality: { type: "string", default: "82" }, json: { type: "boolean" },
  } });
  if (!locales.includes(args.values.locale)) throw new ImageImportError("invalidArgs");
  t = importerText(args.values.locale);
  if (args.values.help) {
    console.log(`${t("cliUsage")}\n\n${t("cliHelp")}`);
  } else {
    const command = args.positionals.shift() || "serve";
    if (command === "serve") {
      const port = Number(args.values.port);
      if (args.positionals.length || !Number.isInteger(port) || port < 1024 || port > 65535) throw new ImageImportError("invalidArgs");
      const server = createImporterServer({ rootDir });
      server.on("error", (error) => { console.error(t(error.code === "EADDRINUSE" ? "portBusy" : "internal")); process.exitCode = 1; });
      server.listen(port, "127.0.0.1", () => console.log(`${t("serverStarted", { url: `http://127.0.0.1:${port}` })}\n${t("stop")}`));
      for (const signal of ["SIGINT", "SIGTERM"]) process.once(signal, () => server.close());
    } else if (command === "import") {
      if (!args.positionals.length || args.positionals.length > MAX_FILES) throw new ImageImportError("invalidBatch");
      const files = [];
      let total = 0;
      for (const input of args.positionals) {
        let data;
        try {
          const info = await stat(input);
          if (!info.isFile()) throw new ImageImportError("fileRead", path.basename(input));
          if (!info.size || info.size > MAX_FILE_BYTES) throw new ImageImportError("fileSize", path.basename(input));
          total += info.size;
          if (total > MAX_BATCH_BYTES) throw new ImageImportError("batchSize");
          data = await readFile(input);
        } catch (error) {
          if (error instanceof ImageImportError) throw error;
          throw new ImageImportError("fileRead", path.basename(input));
        }
        files.push({ data, name: path.basename(input), nameHint: args.values.name, alt: args.values.alt, source: {
          type: args.values.original ? "original" : "external", page: args.values.source, image: args.values["source-image"], creator: args.values.creator, license: args.values.license, notes: args.values.notes,
        } });
      }
      const assets = await importImages({ rootDir, files, maxSize: Number(args.values["max-size"]), quality: Number(args.values.quality) });
      if (args.values.json) console.log(JSON.stringify({ assets }, null, 2));
      else {
        console.log(t("imported", { count: assets.length }));
        for (const asset of assets) console.log(`\n${asset.duplicate ? t("reused") : t("new")} · ${asset.output.width} × ${asset.output.height} · ${asset.original.bytes} → ${asset.output.bytes} B\n${asset.references.path}\n${asset.references.markdown}\n${asset.references.html}`);
        console.log(`\n${t("manifest")}\n${t("publicNote")}`);
      }
    } else throw new ImageImportError("invalidArgs");
  }
} catch (error) {
  const code = error instanceof ImageImportError ? error.code : error.code?.startsWith("ERR_PARSE_ARGS") ? "invalidArgs" : "internal";
  console.error(`${t(code)}${error.detail ? ` (${error.detail})` : ""}`);
  if (code === "internal") console.error(error);
  process.exitCode = 1;
}
