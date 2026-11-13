import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

// Every image the site ships must be recorded (AGENTS.md: record source, creator and licence before use),
// and nothing may point at an image that is not there.
const root = fileURLToPath(new URL("../", import.meta.url));
const publicDir = join(root, "public");
const walk = (dir, out = []) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path, out);
    else out.push(path);
  }
  return out;
};
const isRaster = (file) => /\.(webp|png|jpe?g|gif|avif)$/i.test(file);
const manifests = walk(publicDir).filter((file) => file.endsWith("ASSETS.json"));
const manifestFiles = (manifest) => JSON.parse(readFileSync(manifest, "utf8")).assets.map((entry) =>
  entry.path ? join(publicDir, entry.path) : join(dirname(manifest), entry.file));
// The B. site icons are typeset, not artwork; assets/branding/README.md records how they are made.
const siteIcons = ["apple-touch-icon.png", "favicon-16.png", "favicon-32.png"].map((name) => join(publicDir, name));

test("every image path written in the source exists in public/", () => {
  const missing = [];
  for (const file of walk(join(root, "src")).filter((f) => /\.(astro|ts|mjs|css)$/.test(f))) {
    for (const [, path] of readFileSync(file, "utf8").matchAll(/["'(](\/[\w./-]+\.(?:webp|png|jpe?g|svg|gif|avif))["')]/g)) {
      if (!existsSync(join(publicDir, path))) missing.push(`${relative(root, file)} -> ${path}`);
    }
  }
  assert.deepEqual(missing, []);
});

test("every entry in a public ASSETS.json points at a file that exists", () => {
  assert.ok(manifests.length >= 5, "the theme, project and collection manifests are found");
  const missing = manifests.flatMap((manifest) => manifestFiles(manifest)
    .filter((file) => !existsSync(file))
    .map((file) => `${relative(root, manifest)} -> ${relative(root, file)}`));
  assert.deepEqual(missing, []);
});

test("every raster image in public/ is recorded in a manifest", () => {
  const recorded = new Set([...manifests.flatMap(manifestFiles), ...siteIcons]);
  const unrecorded = walk(publicDir).filter(isRaster).filter((file) => !recorded.has(file)).map((file) => relative(root, file));
  assert.deepEqual(unrecorded, []);
});

test("the Ema theme ships no third-party image until cleared art is recorded", () => {
  const ema = JSON.parse(readFileSync(join(publicDir, "themes/ema/ASSETS.json"), "utf8"));
  for (const entry of ema.assets) {
    assert.equal(entry.generative_ai_used, false, `${entry.id}: no generative AI`);
    assert.ok(entry.permission_status, `${entry.id}: permission recorded`);
  }
  const images = walk(join(publicDir, "themes/ema")).filter(isRaster);
  assert.equal(images.length, ema.assets.length, "every image in the Ema theme folder has a manifest entry");
});

test("the showcase gallery and its manifest list the same screenshots", () => {
  const gallery = join(root, "showcase/gallery");
  const listed = JSON.parse(readFileSync(join(gallery, "manifest.json"), "utf8")).captures.map((capture) => capture.file).sort();
  const present = readdirSync(gallery).filter(isRaster).sort();
  assert.deepEqual(present, listed);
});
