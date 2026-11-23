import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const locales = ["zh-CN", "zh-TW", "ja", "en"];
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url));

test("every theme layout takes its search and preview metadata from SiteMeta", () => {
  for (const layout of ["blank/layouts/BlankLayout", "ema/layouts/EmaLayout", "endfield/layouts/EndfieldLayout"]) {
    const source = read(`src/themes/${layout}.astro`).toString();
    assert.match(source, /<SiteMeta title=\{title\} description=\{description\}/, layout);
    assert.doesNotMatch(source, /property="og:|rel="canonical"|hreflang=/, `${layout} must not keep its own copy`);
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
