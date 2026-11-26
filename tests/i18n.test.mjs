import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { getThemePath, themes } from "../src/core/themes/routing.mjs";
import { getLocale, stripLocale, localizePath, locales, localePreferenceKey } from "../src/core/i18n/routing.mjs";
import { messages } from "../src/core/i18n/messages.ts";
import { selectPosts } from "../src/core/content/select-posts.mjs";

test("locale detection uses only complete leading segments", () => {
  assert.equal(getLocale("/ja/blog/welcome/"), "ja");
  assert.equal(getLocale("/en"), "en");
  assert.equal(getLocale("/zh-TW/games/"), "zh-TW");
  assert.equal(getLocale("/zh-TWN/"), "zh-CN");
  assert.equal(getLocale("/english/"), "zh-CN");
  assert.equal(getLocale("/blog/"), "zh-CN");
});
test("switching language preserves the page and query without stacking prefixes", () => {
  assert.equal(localizePath("/ja/blog/welcome/", "en"), "/en/blog/welcome/");
  assert.equal(localizePath("/en/blog/?category=life&sort=oldest", "zh-CN"), "/blog/?category=life&sort=oldest");
  assert.equal(stripLocale("/en?category=life"), "/?category=life");
  assert.equal(localizePath("/zh-TW/blog/?sort=oldest#top", "ja"), "/ja/blog/?sort=oldest#top");
  assert.equal(localizePath("/en/themes/ema/about/", "zh-TW"), "/zh-TW/themes/ema/about/");
});
test("a future theme retains its route across languages", () => {
  assert.equal(localizePath("/ja/themes/next/blog/welcome/", "en"), "/en/themes/next/blog/welcome/");
  assert.equal(localizePath("/themes/next/", "ja"), "/ja/themes/next/");
});
test("root and localized 404 pages have valid published paths", () => {
  assert.equal(localizePath("/", "ja"), "/ja/");
  assert.equal(localizePath("/404.html", "en"), "/en/404/");
  assert.equal(localizePath("/ja/404/", "zh-CN"), "/404.html");
  assert.equal(localizePath("/404.html", "zh-TW"), "/zh-TW/404/");
});
test("GitHub Pages' root 404 resolves the requested language and theme before paint", () => {
  const component = readFileSync(new URL("../src/core/i18n/LanguagePreference.astro", import.meta.url), "utf8");
  const script = component.match(/<script[^>]*\bfallbackRoutes[^>]*>([\s\S]*?)<\/script>/)[1];
  const fallbackRoutes = themes.map(({ id, root }) => ({
    root, pages: Object.fromEntries(locales.map((locale) => [locale, getThemePath(id, "/404/", locale)])),
  }));
  for (const [pathname, saved, expected] of [
    ["/ja/themes/ema/missing/", "en", "/ja/themes/ema/404/"],
    ["/themes/endfield/missing/", "zh-TW", "/zh-TW/themes/endfield/404/"],
    ["/themes/ema/missing/", null, "/themes/ema/404/"],
    ["/journal/missing/", "en", "/en/404/"],
    ["/missing/", null, null],
    ["/404.html", "en", "/en/404/"],
    ["/ja/404/", "en", null],
  ]) {
    const location = { origin: "https://example.com", pathname, search: "?q=1", hash: "#top" };
    let target = null;
    location.replace = (href) => { target = new URL(href); };
    runInNewContext(script, { URL, location, localStorage: { getItem: () => saved }, locales, localePreferenceKey, fallbackRoutes });
    assert.equal(target?.pathname ?? null, expected, pathname);
    if (target) {
      assert.equal(target.searchParams.get("q"), "1");
      assert.equal(target.hash, "#top");
      assert.equal(target.searchParams.get("from"), pathname === "/404.html" ? null : pathname);
    }
  }
});

test("external URLs and unsupported locales cannot become language destinations", () => {
  assert.throws(() => localizePath("//example.com/", "en"));
  assert.throws(() => localizePath("https://example.com/", "ja"));
  assert.throws(() => localizePath("/", "de"));
});
test("every shared interface string is present in every language", () => {
  const keys = Object.keys(messages["zh-CN"]).sort();
  for (const locale of ["zh-TW", "ja", "en"]) {
    assert.deepEqual(Object.keys(messages[locale]).sort(), keys);
    for (const key of keys) assert.ok(messages[locale][key].trim(), `${locale}: ${key}`);
  }
});

const article = (id, locale, extra = {}) => ({ id, data: { locale, pubDate: new Date("2026-10-26"), draft: false, ...extra } });
test("translated articles retain a stable shared URL slug", () => {
  const selected = selectPosts([article("welcome", "zh-CN"), article("ja/welcome", "ja", { translationKey: "welcome" })], "ja");
  assert.equal(selected.length, 1);
  assert.equal(selected[0].id, "ja/welcome");
  assert.equal(selected[0].slug, "welcome");
});
test("Traditional Chinese translations live in their own folder and keep the shared slug", () => {
  const selected = selectPosts([article("welcome", "zh-CN"), article("zh-TW/welcome", "zh-TW")], "zh-TW");
  assert.equal(selected[0].id, "zh-TW/welcome");
  assert.equal(selected[0].slug, "welcome");
});
test("missing or draft translations show the original with its actual content locale", () => {
  const selected = selectPosts([article("welcome", "zh-CN"), article("en/welcome", "en", { translationKey: "welcome", draft: true })], "en");
  assert.equal(selected[0].data.locale, "zh-CN");
  assert.equal(selected[0].slug, "welcome");
});
test("duplicate or orphan translations cannot publish broken language links", () => {
  assert.throws(() => selectPosts([article("welcome", "zh-CN"), article("copy", "zh-CN", { translationKey: "welcome" })], "ja"));
  assert.throws(() => selectPosts([article("en/welcome", "en")], "en"));
});
