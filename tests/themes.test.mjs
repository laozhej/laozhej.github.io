import test from "node:test";
import assert from "node:assert/strict";
import { getTheme, getThemePath, stripTheme, themePreferenceKey } from "../src/core/themes/routing.mjs";
import { localizePath } from "../src/core/i18n/routing.mjs";
import { mountThemePreference, readThemePreference } from "../src/core/themes/preference.mjs";

test("theme changes round-trip every locale, section and nested article without losing URL state", () => {
  for (const locale of ["zh-CN", "zh-TW", "ja", "en"]) {
    for (const path of ["/", "/blog/", "/blog/notes/first-post/", "/projects/", "/games/", "/about/", "/credits/"]) {
      const original = localizePath(`${path}?q=hello%20world&category=life&sort=oldest&ref=shared#section-two`, locale);
      const named = ["blank", "ema", "endfield"];
      for (const [index, theme] of named.entries()) {
        const themed = getThemePath(theme, original);
        assert.equal(getTheme(themed), theme);
        assert.equal(getThemePath("arknights", themed), original);
        assert.equal(getThemePath(theme, themed), themed, "never stack theme roots");
        const other = getThemePath(named[(index + 1) % named.length], themed);
        assert.equal(getThemePath(theme, other), themed, "named themes switch between each other");
      }
    }
  }
});

test("theme detection respects complete path segments and rejects external destinations", () => {
  assert.equal(getTheme("/en/themes/ema/"), "ema");
  assert.equal(getTheme("/themes/ema?ref=home"), "ema");
  assert.equal(getTheme("/themes/blank/"), "blank");
  assert.equal(getTheme("/themes/ema-other/"), "arknights");
  assert.equal(getTheme("/"), "arknights");
  assert.equal(stripTheme("/ja/themes/ema#top"), "/#top");
  assert.equal(stripTheme("/ja/themes/blank#top"), "/#top");
  assert.throws(() => getThemePath("missing", "/"));
  for (const url of ["//example.com/", "https://example.com/", "/\\example.com/"]) {
    assert.throws(() => getThemePath("ema", url));
  }
});

test("404 switching maps to the actual static routes and language changes retain the theme", () => {
  assert.equal(getThemePath("ema", "/404.html?q=x#top"), "/themes/ema/404/?q=x#top");
  assert.equal(getThemePath("blank", "/404.html?q=x#top"), "/themes/blank/404/?q=x#top");
  assert.equal(getThemePath("arknights", "/themes/ema/404/?q=x#top"), "/404.html?q=x#top");
  assert.equal(getThemePath("arknights", "/themes/blank/404/?q=x#top"), "/404.html?q=x#top");
  assert.equal(getThemePath("ema", "/ja/404/"), "/ja/themes/ema/404/");
  assert.equal(getThemePath("blank", "/ja/404/"), "/ja/themes/blank/404/");
  assert.equal(getThemePath("endfield", "/themes/ema/404/?q=x#top"), "/themes/endfield/404/?q=x#top");
  assert.equal(localizePath("/en/themes/ema/404/", "zh-CN"), "/themes/ema/404/");
  assert.equal(localizePath("/en/themes/blank/404/", "zh-CN"), "/themes/blank/404/");
  assert.equal(localizePath("/en/themes/ema/blog/welcome/", "ja"), "/ja/themes/ema/blog/welcome/");
});

function page({ url = "/ja/themes/ema/blog/welcome/?q=old#intro", renderedPath, values = new Map(), blocked = false } = {}) {
  let writes = 0;
  const links = ["arknights", "ema", "blank"].map(theme => Object.assign(new EventTarget(), { dataset: { siteThemeTarget: theme }, href: "" }));
  const menu = {
    dataset: { siteThemePath: renderedPath },
    open: true,
    querySelectorAll: () => links,
    contains: (target) => links.includes(target),
    querySelector: () => ({ focus() { menu.focused = true; } }),
  };
  const doc = Object.assign(new EventTarget(), { documentElement: { dataset: renderedPath ? { theme: getTheme(renderedPath) } : {} }, querySelectorAll: () => [menu] });
  const win = Object.assign(new EventTarget(), {
    location: new URL(url, "https://example.com"),
    localStorage: {
      getItem(key) { if (blocked) throw new Error("Storage blocked"); return values.get(key) ?? null; },
      setItem(key, value) { if (blocked) throw new Error("Storage blocked"); writes++; values.set(key, value); },
    },
  });
  const cleanup = mountThemePreference(doc, win);
  return { doc, win, menu, links, cleanup, values, writes: () => writes };
}

test("explicit routes win over remembered themes; clicks persist a choice and keep live query/hash", () => {
  const p = page({ values: new Map([[themePreferenceKey, "arknights"]]) });
  assert.equal(p.doc.documentElement.dataset.theme, "ema");
  assert.equal(p.doc.documentElement.dataset.preferredTheme, "arknights");
  assert.equal(p.win.location.pathname, "/ja/themes/ema/blog/welcome/");
  assert.equal(p.links[0].href, "/ja/blog/welcome/?q=old#intro");
  assert.equal(p.links[2].href, "/ja/themes/blank/blog/welcome/?q=old#intro");
  p.win.location.search = "?q=new&sort=oldest";
  p.win.location.hash = "#details";
  p.links[0].dispatchEvent(new Event("click"));
  assert.equal(p.links[0].href, "/ja/blog/welcome/?q=new&sort=oldest#details");
  assert.equal(p.values.get(themePreferenceKey), "arknights");
  assert.equal(p.menu.open, false);
  p.cleanup();
  const root = page({ url: "/blog/", values: new Map([[themePreferenceKey, "ema"]]) });
  assert.equal(root.doc.documentElement.dataset.theme, "arknights");
  assert.equal(root.doc.documentElement.dataset.preferredTheme, "ema");
  assert.equal(root.win.location.pathname, "/blog/");
  root.cleanup();
});

test("theme selection works when storage is blocked and invalid saved values fall back", () => {
  assert.equal(readThemePreference({ getItem: () => "unknown" }, "ema"), "ema");
  assert.equal(readThemePreference({ getItem: () => "unknown" }), "arknights");
  const p = page({ blocked: true });
  p.links[0].dispatchEvent(new Event("click"));
  assert.equal(p.links[0].href, "/ja/blog/welcome/?q=old#intro");
  assert.equal(p.doc.documentElement.dataset.preferredTheme, "arknights");
  p.cleanup();
});

test("GitHub Pages fallback keeps its rendered layout and switches to an existing localized 404", () => {
  const p = page({ url: "/en/themes/ema/missing/?from=shared#note", renderedPath: "/404.html" });
  assert.equal(p.doc.documentElement.dataset.theme, "arknights");
  assert.equal(p.links[0].href, "/en/404/?from=shared#note");
  assert.equal(p.links[1].href, "/en/themes/ema/404/?from=shared#note");
  assert.equal(p.links[2].href, "/en/themes/blank/404/?from=shared#note");
  p.links[1].dispatchEvent(new Event("click"));
  assert.equal(p.links[1].href, "/en/themes/ema/404/?from=shared#note");
  p.cleanup();
});

test("remount cleans up handlers and storage events never navigate the active page", () => {
  const p = page();
  const cleanup = mountThemePreference(p.doc, p.win);
  p.links[0].dispatchEvent(new Event("click"));
  assert.equal(p.writes(), 1);
  p.values.set(themePreferenceKey, "ema");
  p.win.dispatchEvent(Object.assign(new Event("storage"), { key: themePreferenceKey }));
  assert.equal(p.doc.documentElement.dataset.preferredTheme, "ema");
  assert.equal(p.win.location.pathname, "/ja/themes/ema/blog/welcome/");
  p.menu.open = true;
  p.doc.dispatchEvent(Object.assign(new Event("keydown"), { key: "Escape" }));
  assert.equal(p.menu.open, false);
  assert.equal(p.menu.focused, true);
  cleanup();
  p.links[0].dispatchEvent(new Event("click"));
  assert.equal(p.writes(), 1);
});
