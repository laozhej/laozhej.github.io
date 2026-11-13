import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import sharp from "sharp";

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

test("only the five owner-requested Ema images are restored, with historical bytes, dimensions and alpha", async () => {
  const ema = JSON.parse(readFileSync(join(publicDir, "themes/ema/ASSETS.json"), "utf8"));
  // Fixed hashes from 76c9da5: this also works in shallow CI checkouts without that Git object.
  const originals = [
    ["ema.webp", "smile", 905, 2400, "65eb570bcc3b40a06e5d90b661592990434311a09435a044d1363c68aa15b576"],
    ["ema-frame-wave.webp", "wave", 1030, 2400, "71a9e9fda324c76edb5e87d16bd830888b318274eaee182549482587f201dcd0"],
    ["ema-frame-together.webp", "together", 1030, 2400, "9efc1c28720e9d454b36b79b17d2aa84759912f77282861c2c8a4a1d8c6b7d34"],
    ["ema-frame-talk.webp", "talk", 1030, 2400, "b8ec25271b5a17c5dc0d6d00694891697e1909ead97093db4bfd207f96058d8d"],
    ["ema-frame-refute.webp", "refute", 1472, 2048, "0405f914f4150e9672e93addbb1d2b57fc2169549f4fc0513093eb4b4f1e9716"],
  ];
  assert.deepEqual(ema.assets.map((entry) => entry.file), originals.map((_, i) => `assets/ema-pose-0${i + 1}.webp`));
  for (const [index, entry] of ema.assets.entries()) {
    const [original, key, width, height, sha256] = originals[index];
    const buffer = readFileSync(join(publicDir, "themes/ema", entry.file));
    const metadata = await sharp(buffer).metadata();
    assert.equal(createHash("sha256").update(buffer).digest("hex"), sha256);
    assert.equal(entry.sha256, sha256);
    assert.equal(entry.bytes, buffer.length);
    assert.deepEqual([metadata.width, metadata.height], [width, height]);
    assert.deepEqual(entry.dimensions, [width, height]);
    assert.equal(metadata.hasAlpha, true);
    assert.equal(entry.has_alpha, true);
    assert.equal(entry.pose_key, `ema.frames.${key}`);
    assert.equal(entry.restoration.commit, "76c9da5690e89a7816bb4b44eefacbcc87521446");
    assert.equal(entry.restoration.path, `public/themes/ema/assets/${original}`);
    assert.equal(entry.restoration.sha256, sha256);
    assert.equal(entry.generative_ai_used, false, `${entry.id}: no generative AI`);
    assert.match(entry.source_status, /^Unconfirmed\./);
    assert.match(entry.permission_status, /^Unconfirmed\./);
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
