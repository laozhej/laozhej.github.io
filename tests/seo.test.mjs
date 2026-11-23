import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { canonicalTheme, getThemePath, isIndexedPath } from "../src/core/themes/routing.mjs";
import { localizePath } from "../src/core/i18n/routing.mjs";

const locales = ["zh-CN", "zh-TW", "ja", "en"];
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url));

test("every theme layout takes its search and preview metadata from SiteMeta", () => {
  for (const layout of ["blank/layouts/BlankLayout", "ema/layouts/EmaLayout", "endfield/layouts/EndfieldLayout"]) {
    const source = read(`src/themes/${layout}.astro`).toString();
    assert.match(source, /<SiteMeta title=\{title\} description=\{description\}/, layout);
    assert.doesNotMatch(source, /property="og:|rel="canonical"|hreflang=/, `${layout} must not keep its own copy`);
  }
});

test("only the canonical theme's pages are indexed, and every theme's copy maps back to them", () => {
  assert.equal(canonicalTheme, "blank", "the owner may move this later; update the OG cards with it");
  for (const locale of locales) {
    for (const path of ["/", "/blog/", "/blog/dev-log-01/", "/projects/", "/games/", "/about/", "/credits/"]) {
      const target = getThemePath(canonicalTheme, localizePath(path, locale));
      assert.equal(isIndexedPath(target), true, target);
      for (const theme of ["blank", "ema", "endfield"]) {
        const themed = getThemePath(theme, target);
        assert.equal(getThemePath(canonicalTheme, themed), target, themed);
        assert.equal(isIndexedPath(themed), theme === canonicalTheme, themed);
      }
    }
    for (const theme of ["blank", "ema", "endfield"]) assert.equal(isIndexedPath(getThemePath(theme, localizePath("/404/", locale))), false);
  }
});

test("each locale has a 1200×630 PNG link-preview image", () => {
  for (const locale of locales) {
    const png = read(`public/og/${locale}.png`);
    assert.equal(png.subarray(1, 4).toString(), "PNG", locale);
    assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], [1200, 630], locale);
  }
});

test("robots.txt points crawlers at the generated sitemap index", () => {
  assert.match(read("public/robots.txt").toString(), /^Sitemap: https:\/\/laozhej\.github\.io\/sitemap-index\.xml$/m);
});
