import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// The inner-page plate, the pilot for the owner's art plan P2 (2026-11-14): a storyboard strip in the
// Journal header. Blank's shared page head only offers an empty slot; Ema alone fills it, and the plate's
// styles ship in the layout stylesheet every theme loads, so every rule must stay inside Ema's pages.
const src = fileURLToPath(new URL("../src/", import.meta.url));
const read = (path) => readFileSync(join(src, path), "utf8");
const files = (dir) => readdirSync(dir).flatMap((name) => {
  const path = join(dir, name);
  return statSync(path).isDirectory() ? files(path) : [path];
});

test("only Ema's Journal page fills the shared page head's art slot", () => {
  const fillers = files(src).filter((path) => path.endsWith(".astro") && /slot="(head-art|art)"/.test(readFileSync(path, "utf8")))
    .map((path) => path.slice(src.length));
  assert.deepEqual(fillers.sort(), ["themes/blank/pages/BlogIndexPage.astro", "themes/ema/pages/BlogIndexPage.astro"]);
  assert.match(read("themes/blank/pages/BlogIndexPage.astro"), /<slot name="head-art" slot="art" \/>/, "Blank only forwards the slot");
  assert.match(read("themes/ema/pages/BlogIndexPage.astro"), /<PagePlate slot="head-art" motif="notebook" \/>/);
});

test("the plate draws no lettering and reuses the homepage still life", () => {
  const plate = read("themes/ema/components/PagePlate.astro");
  assert.doesNotMatch(plate, /<text|<tspan|<foreignObject/);
  assert.match(plate, /from "\.\.\/lib\/still-life\.mjs"/);
  assert.match(read("themes/ema/components/Storyboard.astro"), /from "\.\.\/lib\/still-life\.mjs"/);
  for (const file of ["themes/ema/components/PagePlate.astro", "themes/ema/components/Storyboard.astro"]) {
    assert.doesNotMatch(read(file), /sb-still sb-notebook|sb-still sb-teacup/, `${file} must not keep its own copy of the drawings`);
  }
});

test("every plate style stays inside Ema's pages and the plate is hidden below 1101px", () => {
  const css = read("themes/ema/styles/plate.css").replace(/\/\*[\s\S]*?\*\//g, "");
  const selectors = [...css.matchAll(/([^{}]+)\{/g)].map((match) => match[1].trim()).filter((selector) => !selector.startsWith("@media"));
  assert.ok(selectors.length >= 10);
  for (const selector of selectors) assert.match(selector, /^\.ema-content /, selector);
  assert.match(css, /^\.ema-content \.ema-plate \{ display: none; \}/m);
  assert.match(css, /@media \(min-width: 1101px\) \{\s*\.ema-content \.ema-plate \{/);
});
