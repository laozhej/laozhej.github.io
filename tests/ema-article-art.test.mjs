import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { ribbon, screentone } from "../src/themes/ema/lib/still-life.mjs";

// The article-page pilot (owner's request, 2026-11-15): a bookmark ribbon beside the title, a screentone
// corner in the outer margin on the side-by-side desktop layout, and a fine rule with fallen petals after
// the body. Blank's shared ArticlePage only offers two empty slots and Ema alone fills them; the art is
// decorative, drawn from the shared still life, styled under .ema-content, and stays outside the text.
const src = fileURLToPath(new URL("../src/", import.meta.url));
const read = (path) => readFileSync(join(src, path), "utf8");
const files = (dir) => readdirSync(dir).flatMap((name) => {
  const path = join(dir, name);
  return statSync(path).isDirectory() ? files(path) : [path];
});
const blankArticle = read("themes/blank/pages/ArticlePage.astro");
const art = read("themes/ema/components/ArticleArt.astro");
const css = read("themes/ema/styles/article.css");
const rules = css.replace(/\/\*[\s\S]*?\*\//g, "");

test("only Ema's article page fills the shared article page's slots", () => {
  const fillers = files(src).filter((path) => path.endsWith(".astro") && /slot="(header-art|end-art)"/.test(readFileSync(path, "utf8")))
    .map((path) => path.slice(src.length));
  assert.deepEqual(fillers, ["themes/ema/pages/ArticlePage.astro"]);
  assert.match(read("themes/ema/pages/ArticlePage.astro"), /<ArticleArt slot="header-art" part="header" \/><ArticleArt slot="end-art" part="end" \/><slot \/>/);
});

test("the slots sit outside the text: after the tag line, and between the body and the end note", () => {
  assert.match(blankArticle, /<div class="blank-tag-line">.*<\/div>\s*<slot name="header-art" \/>\s*<\/header>/);
  assert.match(blankArticle, /<div class="blank-prose" data-site-prose lang=\{frontmatter\.locale\}><slot \/><\/div>\s*<slot name="end-art" \/>\s*<footer class="blank-article-end">/);
});

test("the decorations are drawn from the shared still life, without text, links or pictures", () => {
  assert.match(art, /import \{ petal, ribbon, screentone \} from "\.\.\/lib\/still-life\.mjs";/);
  assert.doesNotMatch(art, /<text|<tspan|<foreignObject|<image|<img|<a[\s>]|<button|tabindex/);
  const wrappers = [...art.matchAll(/<div class="(ema-[a-z]+)"([^>]*)>/g)];
  assert.deepEqual(wrappers.map((match) => match[1]), ["ema-ribbon", "ema-corner", "ema-coda"]);
  for (const [, name, attributes] of wrappers) assert.match(attributes, /aria-hidden="true"/, name);
  // One screentone for the inner pages: the Journal plate and the article corner use the same pattern.
  for (const file of ["themes/ema/components/PagePlate.astro", "themes/ema/components/ArticleArt.astro"]) {
    assert.match(read(file), /screentone\("/, file);
    assert.doesNotMatch(read(file), /<pattern/, `${file} must not keep its own copy of the screentone`);
  }
  assert.match(screentone("a", "b"), /^<pattern id="a" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate\(30\)"><circle cx="4\.5" cy="4\.5" r="1\.7" class="b"><\/circle><\/pattern>$/);
  // The ribbon's tail is cut in a fishtail half as deep as the ribbon is wide, like the notebook's.
  const [, width, length, mid, notch] = ribbon.match(/^M0 0 H(\d+) V(\d+) L(\d+) (\d+) L0 \2 Z$/).map(Number);
  assert.equal(mid * 2, width);
  assert.equal(length - notch, width / 2);
});

test("every article style stays inside Ema's pages, ignores the pointer and never moves the text", () => {
  const selectors = [...rules.matchAll(/([^{}]+)\{/g)].map((match) => match[1].trim()).filter((selector) => !selector.startsWith("@media"));
  assert.ok(selectors.length >= 10);
  for (const selector of selectors) assert.match(selector, /^\.ema-content /, selector);
  assert.match(rules, /\.ema-content :is\(\.ema-ribbon, \.ema-corner, \.ema-coda\) \{[^}]*pointer-events: none;[^}]*user-select: none;/);
  assert.doesNotMatch(rules, /\.blank-(prose|toc|article-body|article-shell|article-end|article-topline)|\.blank-article-header h1/, "the reading layout is left alone");
  assert.doesNotMatch(rules, /(^|[;\s{])(animation|transition|filter|backdrop-filter)\s*:/m);
  assert.doesNotMatch(rules, /#[0-9a-f]{3}|\b(rgba?|hsla?|oklch|lab)\(/i, "colours come from the theme's tokens");
});

test("the corner shows only on the side-by-side layout; print and forced colours leave all three out", () => {
  assert.match(rules, /^\.ema-content \.ema-corner \{ display: none; \}/m);
  assert.match(rules, /@media \(min-width: 1101px\) \{\s*\.ema-content \.ema-corner \{ display: block;/);
  assert.match(rules, /@media print, \(forced-colors: active\) \{\s*\.ema-content :is\(\.ema-ribbon, \.ema-corner, \.ema-coda\) \{ display: none; \}/);
});

test("the article styles load with the layout's own stylesheets, keeping their order on every page", () => {
  const layout = read("themes/ema/layouts/EmaLayout.astro");
  assert.match(layout, /import "\.\.\/styles\/theme\.css";\nimport "\.\.\/styles\/plate\.css";\nimport "\.\.\/styles\/article\.css";\n/);
  const importers = files(src).filter((path) => /\.(astro|ts|mjs)$/.test(path) && /styles\/article\.css/.test(readFileSync(path, "utf8"))).map((path) => path.slice(src.length));
  assert.deepEqual(importers, ["themes/ema/layouts/EmaLayout.astro"]);
});
