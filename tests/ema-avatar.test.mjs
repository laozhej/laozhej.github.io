import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { locales } from "../src/core/i18n/routing.mjs";
import { AVATAR_MONOGRAM, avatarAttributes } from "../src/themes/ema/lib/avatar.mjs";

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

test("the Ema avatar is 旭 in all four locales and is an image named after the owner", () => {
  assert.deepEqual(locales, ["zh-CN", "zh-TW", "ja", "en"]);
  const names = new Set();
  for (const locale of locales) {
    const { displayName } = getSiteContent(locale).profileIdentity;
    assert.ok(displayName, `${locale} has a display name`);
    assert.equal(AVATAR_MONOGRAM, "旭", `${locale} shows 旭`);
    assert.deepEqual(avatarAttributes(displayName), { role: "img", "aria-label": displayName }, `${locale}: named after the owner`);
    names.add(displayName);
  }
  assert.equal(names.size, 4, "each locale reads the owner's name in its own spelling");
});

test("the homepage and About page take the monogram from the constant, never from the localized name", () => {
  // The English name "Arataki Asahi" ends in "i": slicing the display name was the round-4 defect.
  for (const page of [homePage, aboutPage]) {
    assert.doesNotMatch(page, /displayName\s*(?:\.\s*(?:slice|at|charAt|substring|substr)\s*\(|\[)/);
  }
  assert.equal(homePage.match(/\{AVATAR_MONOGRAM\}/g)?.length, 2, "identity card and Profile leaf");
  assert.match(homePage, /<div class="k-avatar" \{\.\.\.avatar\}>/);
  assert.match(homePage, /const avatar = avatarAttributes\(profileIdentity\.displayName\);/);
  assert.match(aboutPage, /<span class="about-avatar-mark" \{\.\.\.avatarAttributes\(profileIdentity\.displayName\)\}>\{AVATAR_MONOGRAM\}<\/span>/);
});

test("月代雪 is described as the former avatar character, and her frame stays empty", () => {
  const expected = { "zh-CN": "以前的头像角色", "zh-TW": "以前的頭像角色", ja: "以前のアイコンのキャラクター", en: "Former avatar character" };
  for (const locale of locales) {
    const yuki = getSiteContent(locale).xpFavorites.find((item) => item.key === "yuki");
    assert.equal(yuki.subtitle, expected[locale], `${locale}: subtitle`);
    assert.equal(yuki.portrait, null, `${locale}: no portrait; 旭 is the owner's monogram, not hers`);
  }
});

test("favourites without a cleared portrait get an empty frame on every About page", () => {
  for (const locale of locales) {
    const { xpFavorites } = getSiteContent(locale);
    const empty = xpFavorites.filter((item) => !item.portrait).map((item) => item.key);
    assert.deepEqual(empty, ["emma", "yuki"], `${locale}: only the two uncleared portraits are empty`);
  }
  const blankAbout = readFileSync(new URL("../src/themes/blank/pages/AboutPage.astro", import.meta.url), "utf8");
  assert.match(blankAbout, /item\.portrait \? <img src=\{item\.portrait\}[^>]*\/> : <span class="blank-portrait-empty" aria-hidden="true"><\/span>/);
  assert.match(aboutPage, /item\.portrait\s*\?\s*<img class="about-portrait" src=\{item\.portrait\}[\s\S]*?:\s*<span class="about-portrait about-portrait-empty" aria-hidden="true"><\/span>/);
});
