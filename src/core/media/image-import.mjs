import sharp from "sharp";
import { createHash, randomUUID } from "node:crypto";
import { mkdir, open, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

export const MAX_FILE_BYTES = 25 * 1024 * 1024;
export const MAX_BATCH_BYTES = 50 * 1024 * 1024;
export const MAX_FILES = 20;
export const MANIFEST_PATH = "src/core/data/imported-images.json";
export const IMAGE_DIRECTORY = "public/images/imported";
const supportedFormats = new Set(["jpeg", "png", "webp", "heif", "avif", "gif"]);
const outputPathPattern = /^\/images\/imported\/[a-z0-9-]+\.webp$/;

export class ImageImportError extends Error {
  constructor(code, detail = "") {
    super(code);
    this.code = code;
    this.detail = detail;
  }
}

const fail = (code, detail) => { throw new ImageImportError(code, detail); };
const hash = (data) => createHash("sha256").update(data).digest("hex");
const cleanText = (value, max = 2000) => {
  if (value != null && typeof value !== "string") fail("invalidFields");
  const text = (value || "").trim();
  if (text.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(text)) fail("invalidFields");
  return text;
};

function sourceUrl(value) {
  const text = cleanText(value);
  if (!text) return "";
  try {
    const url = new URL(text);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) fail("invalidSource");
    return url.href;
  } catch { fail("invalidSource"); }
}

function normalizeSource(source = {}) {
  if (!source || typeof source !== "object") fail("invalidSource");
  if (!["original", "external"].includes(source.type)) fail("sourceRequired");
  const page = sourceUrl(source.page);
  if (source.type === "external" && !page) fail("sourceRequired");
  return {
    type: source.type,
    page,
    image: sourceUrl(source.image),
    creator: cleanText(source.creator, 300),
    license: cleanText(source.license, 500),
    notes: cleanText(source.notes),
  };
}

export function imageSlug(value) {
  return String(value).normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60).replace(/-+$/g, "") || "image";
}

export function imageReferences(asset, alt = asset.alt || "") {
  const text = String(alt).replace(/[\r\n]/g, " ");
  const markdownAlt = text.replace(/\\/g, "\\\\").replace(/\[/g, "\\[").replace(/\]/g, "\\]");
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  return {
    path: asset.path,
    markdown: `![${markdownAlt}](${asset.path})`,
    html: `<img src="${asset.path}" alt="${escapeHtml(text)}" width="${asset.output.width}" height="${asset.output.height}" loading="lazy" decoding="async" />`,
  };
}

async function loadManifest(rootDir) {
  try {
    const manifest = JSON.parse(await readFile(path.join(rootDir, MANIFEST_PATH), "utf8"));
    if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.assets)) fail("invalidManifest");
    const ids = new Set();
    const paths = new Set();
    for (const asset of manifest.assets) {
      if (!/^[a-f0-9]{64}$/.test(asset.id) || ids.has(asset.id) || paths.has(asset.path)
        || !outputPathPattern.test(asset.path) || !Array.isArray(asset.sources)
        || !asset.output || !/^[a-f0-9]{64}$/.test(asset.output.sha256)) fail("invalidManifest");
      ids.add(asset.id);
      paths.add(asset.path);
    }
    return manifest;
  } catch (error) {
    if (error.code === "ENOENT") return { schemaVersion: 1, assets: [] };
    if (error instanceof ImageImportError) throw error;
    fail("invalidManifest");
  }
}

export async function listImportedImages(rootDir) {
  const manifest = await loadManifest(rootDir);
  return manifest.assets.map((asset) => ({ ...asset, references: imageReferences(asset) }));
}

export async function importImages({ rootDir, files, maxSize = 1600, quality = 82 }) {
  if (!Array.isArray(files) || !files.length || files.length > MAX_FILES) fail("invalidBatch");
  if (!Number.isInteger(maxSize) || maxSize < 64 || maxSize > 4096
    || !Number.isInteger(quality) || quality < 40 || quality > 100) fail("invalidOptions");
  let batchBytes = 0;
  for (const file of files) {
    if (!Buffer.isBuffer(file.data) || !file.data.length || file.data.length > MAX_FILE_BYTES) fail("fileSize", file.name);
    batchBytes += file.data.length;
  }
  if (batchBytes > MAX_BATCH_BYTES) fail("batchSize");

  // One lock covers both entry points and the entire read/modify/write transaction.
  const lockPath = path.join(rootDir, ".image-import.lock");
  try { await mkdir(lockPath); }
  catch (error) { if (error.code === "EEXIST") fail("busy"); throw error; }
  const created = [];
  let temporaryManifest;
  try {
    const manifest = await loadManifest(rootDir);
    const results = [];
    const pending = new Map();
    for (const file of files) {
      const originalName = path.basename(cleanText(file.name, 300).replace(/\\/g, "/"));
      const source = normalizeSource(file.source);
      const alt = cleanText(file.alt, 1000);
      const nameHint = cleanText(file.nameHint, 300);
      let metadata;
      let encoded;
      try {
        const image = sharp(file.data, { limitInputPixels: 40_000_000, failOn: "warning" });
        metadata = await image.metadata();
        if (!supportedFormats.has(metadata.format)) fail("unsupportedFormat", originalName);
        if ((metadata.pages || 1) > 1) fail("animatedImage", originalName);
        // Sharp strips EXIF/IPTC (including location), preserves alpha, and never upscales.
        encoded = await image.autoOrient().resize({ width: maxSize, height: maxSize, fit: "inside", withoutEnlargement: true })
          .webp({ quality, effort: 5 }).toBuffer({ resolveWithObject: true });
      } catch (error) {
        if (error instanceof ImageImportError) throw error;
        fail("invalidImage", originalName);
      }
      const sourceHash = hash(file.data);
      const id = hash(JSON.stringify(["webp-v1", sourceHash, maxSize, quality, sharp.versions.sharp, sharp.versions.vips]));
      let asset = manifest.assets.find((item) => item.id === id);
      const duplicate = Boolean(asset);
      if (!asset) {
        const stem = nameHint || originalName.replace(/\.[^.]+$/, "");
        const filename = `${imageSlug(stem)}-${id.slice(0, 16)}.webp`;
        asset = {
          id,
          path: `/images/imported/${filename}`,
          importedAt: new Date().toISOString(),
          alt,
          original: { filename: originalName, sha256: sourceHash, bytes: file.data.length, width: metadata.width, height: metadata.height, format: metadata.format },
          output: { sha256: hash(encoded.data), bytes: encoded.data.length, width: encoded.info.width, height: encoded.info.height, format: "image/webp" },
          processing: { maxSize, quality, autoOrient: true, metadataRemoved: true, encoder: `sharp ${sharp.versions.sharp} / libvips ${sharp.versions.vips}` },
          sources: [source],
        };
        manifest.assets.push(asset);
      } else {
        if (!asset.sources.some((item) => JSON.stringify(item) === JSON.stringify(source))) asset.sources.push(source);
        // Re-importing never silently replaces an existing file or its original description.
        if (hash(encoded.data) !== asset.output.sha256) fail("outputConflict", originalName);
      }
      pending.set(asset.path, encoded.data);
      results.push({ ...asset, duplicate, references: imageReferences(asset, alt || asset.alt) });
    }

    await mkdir(path.join(rootDir, IMAGE_DIRECTORY), { recursive: true });
    for (const [urlPath, buffer] of pending) {
      const destination = path.join(rootDir, "public", urlPath.slice(1));
      try {
        const handle = await open(destination, "wx");
        created.push(destination);
        try { await handle.writeFile(buffer); }
        finally { await handle.close(); }
      } catch (error) {
        if (error.code !== "EEXIST") throw error;
        if (hash(await readFile(destination)) !== hash(buffer)) fail("outputConflict", urlPath);
      }
    }
    const manifestFile = path.join(rootDir, MANIFEST_PATH);
    await mkdir(path.dirname(manifestFile), { recursive: true });
    temporaryManifest = `${manifestFile}.${randomUUID()}.tmp`;
    await writeFile(temporaryManifest, `${JSON.stringify(manifest, null, 2)}\n`, { flag: "wx" });
    await rename(temporaryManifest, manifestFile);
    return results;
  } catch (error) {
    await Promise.all(created.map((file) => rm(file, { force: true })));
    throw error;
  } finally {
    if (temporaryManifest) await rm(temporaryManifest, { force: true });
    await rm(lockPath, { recursive: true, force: true });
  }
}
