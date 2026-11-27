import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import sharp from "sharp";
import { locales } from "../src/core/i18n/routing.mjs";

// content.ts imports through the "@/" alias that Astro resolves at build time. Map it to src/ here so
// the test reads the real localized profiles rather than copies of them.
const src = new URL("../src/", import.meta.url);
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (!specifier.startsWith("@/")) return nextResolve(specifier, context);
    const base = new URL(specifier.slice(2), src).href;
    for (const candidate of [base, `${base}.ts`, `${base}.mjs`]) {
      try { return nextResolve(candidate, context); } catch {}
    }
    return nextResolve(specifier, context);
  },
});
const { getSiteContent } = await import("../src/core/i18n/content.ts");
const read = (path) => readFileSync(new URL(`../src/themes/ema/pages/${path}`, import.meta.url), "utf8");
const homePage = read("HomePage.astro");
const aboutPage = read("AboutPage.astro");

test("the Ema avatar has recorded dimensions and takes its name from the localized profile", async () => {
  const assets = new URL("../public/themes/ema/", import.meta.url);
  const manifest = JSON.parse(readFileSync(new URL("ASSETS.json", assets), "utf8"));
  const avatar = manifest.assets.find((entry) => entry.id === "profile-avatar");
  assert.ok(avatar, "profile avatar is recorded");
  const bytes = readFileSync(new URL(avatar.file, assets));
  const { width, height, format, hasAlpha } = await sharp(bytes).metadata();
  assert.deepEqual([width, height], avatar.dimensions);
  assert.equal(width, height, "the crop is square");
  assert.equal(format, "webp");
  assert.equal(hasAlpha, true);
  assert.equal(createHash("sha256").update(bytes).digest("hex"), avatar.sha256);
  const pixels = await sharp(bytes).raw().toBuffer();
  const alphaAt = (x, y) => pixels[(y * width + x) * 4 + 3];
  for (const [x, y] of [[240, 8], [40, 290], [436, 125], [400, 365]]) {
    assert.equal(alphaAt(x, y), 0, `checkerboard removed at (${x}, ${y})`);
  }
  assert.equal(alphaAt(240, 240), 255, "the face stays opaque");
  assert.deepEqual(locales, ["zh-CN", "zh-TW", "ja", "en"]);
  const names = new Set();
  for (const locale of locales) {
    const { displayName } = getSiteContent(locale).profileIdentity;
    assert.ok(displayName, `${locale} has a display name`);
    names.add(displayName);
  }
  assert.equal(names.size, 4, "each locale reads the owner's name in its own spelling");
});

test("the identity card, Profile leaf and About page share the same avatar component", () => {
  assert.match(homePage, /<EmaAvatar class="k-avatar-face" alt=\{profileIdentity\.displayName\}/);
  assert.match(homePage, /<EmaAvatar class="k-plate-face" alt=""/);
  assert.match(aboutPage, /<EmaAvatar class="about-avatar-mark" alt=\{profileIdentity\.displayName\}/);
  const component = readFileSync(new URL("../src/themes/ema/components/EmaAvatar.astro", import.meta.url), "utf8");
  assert.match(component, /id === "profile-avatar"/);
  assert.match(component, /<img [^\n]*\{alt\} \{width\} \{height\}/);
});

test("月代雪 is described as the former avatar character in all four languages", () => {
  const expected = { "zh-CN": "以前的头像角色", "zh-TW": "以前的頭像角色", ja: "以前のアイコンのキャラクター", en: "Former avatar character" };
  for (const locale of locales) {
    const yuki = getSiteContent(locale).xpFavorites.find((item) => item.key === "yuki");
    assert.equal(yuki.subtitle, expected[locale], `${locale}: subtitle`);
  }
});

test("every locale serves the same recorded portraits, including the two original crops", () => {
  const publicDir = new URL("../public/", import.meta.url);
  const manifest = JSON.parse(readFileSync(new URL("characters/ASSETS.json", publicDir), "utf8"));
  const portraits = new Map(manifest.assets.map((asset) => [asset.key, asset.path]));
  for (const locale of locales) {
    const { xpFavorites } = getSiteContent(locale);
    assert.deepEqual(xpFavorites.slice(0, 2).map((item) => item.key), ["emma", "yuki"]);
    assert.deepEqual(xpFavorites.map((item) => item.key).sort(), [...portraits.keys()].sort());
    for (const { key, portrait } of xpFavorites) {
      assert.equal(portrait, portraits.get(key), `${locale}: ${key}`);
    }
  }
  const originals = {
    emma: "46ad6afdfc6dc3fb8c96034032e9ce9bf2cb4d0d59f27f4bea427158069cd298",
    yuki: "4dfa4291fcdce46567611324b7ad7f406f59190c916db5dbfbe410d5437c6451",
  };
  for (const [key, expected] of Object.entries(originals)) {
    const image = readFileSync(new URL("." + portraits.get(key), publicDir));
    assert.equal(createHash("sha256").update(image).digest("hex"), expected, key);
  }
});
