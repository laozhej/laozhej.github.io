import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { request as httpRequest } from "node:http";
import sharp from "sharp";
import { importImages, imageReferences, imageSlug, listImportedImages, MANIFEST_PATH } from "../src/core/media/image-import.mjs";
import { importerMessages, importerText } from "../src/core/i18n/image-import.mjs";
import { createImporterServer } from "../scripts/image-import-server.mjs";

async function workspace(t) {
  const rootDir = await mkdtemp(path.join(tmpdir(), "website-image-import-"));
  t.after(() => rm(rootDir, { recursive: true, force: true }));
  return rootDir;
}
async function image(width = 400, height = 200) {
  const pixels = Buffer.alloc(width * height * 3);
  let random = 123;
  for (let i = 0; i < pixels.length; i++) {
    random = (random * 1664525 + 1013904223) >>> 0;
    pixels[i] = random >>> 24;
  }
  return sharp(pixels, { raw: { width, height, channels: 3 } }).png().toBuffer();
}
const file = (data, overrides = {}) => ({ data, name: "My holiday photo.png", alt: "海边", source: { type: "original", creator: "Test author" }, ...overrides });
const rejectsWith = (code) => (error) => error.code === code;

test("imports a real image, compresses and bounds it, and records source and usable references", async (t) => {
  const rootDir = await workspace(t);
  const data = await image(1800, 900);
  const [asset] = await importImages({ rootDir, files: [file(data, { source: { type: "external", page: "https://example.com/original", image: "https://example.com/photo.png", creator: "Photographer", license: "CC BY 4.0", notes: "Uncropped" } })] });
  assert.match(asset.path, /^\/images\/imported\/my-holiday-photo-[a-f0-9]{16}\.webp$/);
  assert.deepEqual([asset.output.width, asset.output.height], [1600, 800]);
  assert.ok(asset.output.bytes < data.length);
  assert.equal(asset.sources[0].creator, "Photographer");
  assert.equal(asset.sources[0].page, "https://example.com/original");
  assert.equal(asset.references.markdown, `![海边](${asset.path})`);
  assert.match(asset.references.html, /width="1600" height="800"/);
  const saved = await readFile(path.join(rootDir, "public", asset.path.slice(1)));
  assert.equal((await sharp(saved).metadata()).format, "webp");
  const manifest = JSON.parse(await readFile(path.join(rootDir, MANIFEST_PATH), "utf8"));
  assert.equal(manifest.assets[0].original.bytes, data.length);
  assert.match(manifest.assets[0].original.sha256, /^[a-f0-9]{64}$/);
  assert.equal(manifest.assets[0].sources[0].license, "CC BY 4.0");
  assert.ok(!JSON.stringify(manifest).includes(rootDir), "local absolute paths are never published");
});

test("same-name images with different content never collide", async (t) => {
  const rootDir = await workspace(t);
  const assets = await importImages({ rootDir, files: [file(await image(90, 60)), file(await image(80, 60))] });
  assert.notEqual(assets[0].path, assets[1].path);
  assert.equal((await listImportedImages(rootDir)).length, 2);
});

test("applies EXIF orientation, removes metadata, preserves alpha and never upscales", async (t) => {
  const rootDir = await workspace(t);
  const data = await sharp({ create: { width: 40, height: 80, channels: 4, background: { r: 10, g: 20, b: 30, alpha: 0.5 } } }).withMetadata({ orientation: 6 }).png().toBuffer();
  const [asset] = await importImages({ rootDir, files: [file(data)] });
  const metadata = await sharp(await readFile(path.join(rootDir, "public", asset.path.slice(1)))).metadata();
  assert.deepEqual([metadata.width, metadata.height], [80, 40]);
  assert.equal(metadata.hasAlpha, true);
  assert.equal(metadata.exif, undefined);
  assert.equal(metadata.orientation, undefined);
});

test("deduplicates renamed files without losing provenance; changed settings get their own file", async (t) => {
  const rootDir = await workspace(t);
  const data = await image();
  const [first] = await importImages({ rootDir, files: [file(data)] });
  const [again] = await importImages({ rootDir, files: [file(data, { name: "renamed.png", nameHint: "different-name", source: { type: "external", page: "https://example.com/source" } })] });
  assert.equal(again.duplicate, true);
  assert.equal(again.path, first.path);
  assert.equal(again.sources.length, 2);
  const [changed] = await importImages({ rootDir, files: [file(data)], quality: 70 });
  assert.notEqual(changed.path, first.path);
  assert.equal((await listImportedImages(rootDir)).length, 2);
  assert.equal((await readdir(path.join(rootDir, "public/images/imported"))).length, 2);
});

test("a bad file aborts the batch without touching previous files or manifest", async (t) => {
  const rootDir = await workspace(t);
  await importImages({ rootDir, files: [file(await image(100, 80))] });
  const before = await readFile(path.join(rootDir, MANIFEST_PATH), "utf8");
  const filesBefore = await readdir(path.join(rootDir, "public/images/imported"));
  await assert.rejects(importImages({ rootDir, files: [file(await image(300, 200)), file(Buffer.from("not an image"))] }), rejectsWith("invalidImage"));
  assert.equal(await readFile(path.join(rootDir, MANIFEST_PATH), "utf8"), before);
  assert.deepEqual(await readdir(path.join(rootDir, "public/images/imported")), filesBefore);
});

test("requires an honest source and rejects unsafe URLs and unsupported animations", async (t) => {
  const rootDir = await workspace(t);
  const data = await image(20, 20);
  await assert.rejects(importImages({ rootDir, files: [file(data, { source: { type: "external" } })] }), rejectsWith("sourceRequired"));
  await assert.rejects(importImages({ rootDir, files: [file(data, { source: { type: "external", page: "javascript:alert(1)" } })] }), rejectsWith("invalidSource"));
  await assert.rejects(importImages({ rootDir, files: [file(data, { source: { type: "external", page: "https://user:secret@example.com" } })] }), rejectsWith("invalidSource"));
  const animated = await sharp(Buffer.from([255, 0, 0, 0, 0, 255]), { raw: { width: 1, height: 2, channels: 3, pageHeight: 1 } }).gif().toBuffer();
  assert.equal((await sharp(animated).metadata()).pages, 2);
  await assert.rejects(importImages({ rootDir, files: [file(animated, { name: "animated.gif" })] }), rejectsWith("animatedImage"));
  await assert.rejects(importImages({ rootDir, files: [file(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"/>'))] }), rejectsWith("unsupportedFormat"));
  assert.deepEqual(await listImportedImages(rootDir), []);
});

test("never overwrites conflicting output or a corrupt source manifest", async (t) => {
  const rootDir = await workspace(t);
  const data = await image(30, 20);
  const [asset] = await importImages({ rootDir, files: [file(data)] });
  const destination = path.join(rootDir, "public", asset.path.slice(1));
  await writeFile(destination, "edited externally");
  const before = await readFile(path.join(rootDir, MANIFEST_PATH), "utf8");
  await assert.rejects(importImages({ rootDir, files: [file(await image(40, 30)), file(data)] }), rejectsWith("outputConflict"));
  assert.equal(await readFile(destination, "utf8"), "edited externally");
  assert.deepEqual(await readdir(path.join(rootDir, "public/images/imported")), [path.basename(asset.path)], "newly written files roll back after a later conflict");
  assert.equal(await readFile(path.join(rootDir, MANIFEST_PATH), "utf8"), before);
  await writeFile(path.join(rootDir, MANIFEST_PATH), "broken manifest");
  await assert.rejects(importImages({ rootDir, files: [file(data)] }), rejectsWith("invalidManifest"));
  assert.equal(await readFile(path.join(rootDir, MANIFEST_PATH), "utf8"), "broken manifest");
});

test("serializes independent import processes and safely escapes references", async (t) => {
  const rootDir = await workspace(t);
  await mkdir(path.join(rootDir, ".image-import.lock"));
  await assert.rejects(importImages({ rootDir, files: [file(await image(10, 10))] }), rejectsWith("busy"));
  assert.equal(imageSlug("../../Café image<script>"), "cafe-image-script");
  const references = imageReferences({ path: "/images/imported/image-abc.webp", output: { width: 20, height: 10 } }, '[a] "<script>\n');
  assert.match(references.markdown, /\\\[a\\\]/);
  assert.match(references.html, /&quot;&lt;script&gt;/);
  assert.ok(!references.html.includes("\n"));
});

test("tool messages cover all four project locales", () => {
  const keys = Object.keys(importerMessages["zh-CN"]).sort();
  for (const [locale, messages] of Object.entries(importerMessages)) {
    assert.deepEqual(Object.keys(messages).sort(), keys, locale);
    assert.ok(Object.values(messages).every((message) => typeof message === "string" && message.length));
    assert.ok(importerText(locale)("imported", { count: 3 }).includes("3"));
  }
});

test("local web tool imports real multipart files and blocks cross-origin writes and repository reads", async (t) => {
  const rootDir = await workspace(t);
  const server = createImporterServer({ rootDir, logger: { error: (error) => { throw error; } } });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve) => { server.close(resolve); server.closeAllConnections(); }));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const html = await (await fetch(origin)).text();
  const token = html.match(/name="import-token" content="([a-f0-9]+)"/)[1];
  assert.equal((await fetch(`${origin}/api/import`, { method: "POST" })).status, 403);
  assert.equal((await fetch(`${origin}/api/import`, { method: "POST", headers: { Origin: "https://example.com", "X-Image-Import-Token": token } })).status, 403);
  const wrongHostStatus = await new Promise((resolve, reject) => {
    const request = httpRequest(origin, { headers: { Host: "attacker.example" } }, (response) => { response.resume(); resolve(response.statusCode); });
    request.on("error", reject);
    request.end();
  });
  assert.equal(wrongHostStatus, 403);
  assert.equal((await fetch(`${origin}/package.json`)).status, 404);
  assert.equal((await fetch(`${origin}/src/core/data/imported-images.json`)).status, 404);
  const payload = new FormData();
  payload.set("metadata", JSON.stringify({ source: { type: "original", creator: "Tester" }, files: [{ alt: "A test picture" }], maxSize: 1600, quality: 82 }));
  payload.append("images", new Blob([await image(80, 40)], { type: "image/png" }), "test.png");
  const response = await fetch(`${origin}/api/import`, { method: "POST", headers: { Origin: origin, "X-Image-Import-Token": token }, body: payload });
  assert.equal(response.status, 200);
  const { assets } = await response.json();
  assert.equal(assets.length, 1);
  assert.equal(assets[0].references.markdown, `![A test picture](${assets[0].path})`);
  assert.equal((await fetch(`${origin}${assets[0].path}`)).headers.get("content-type"), "image/webp");
  assert.equal((await (await fetch(`${origin}/api/images`)).json()).assets.length, 1);
});
