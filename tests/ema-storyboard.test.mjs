import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// The owner's art plan (2026-11-14) for the homepage decor, checked against the source: at most three
// quiet pieces drawn in code, no lettering, none in the stacked phone layout, colours taken from the
// theme, and no filter on Ema's images in any state or colour mode (the owner removed the docked
// dimming and the hover glow on 2026-11-14).
const read = (path) => readFileSync(new URL(`../src/themes/ema/${path}`, import.meta.url), "utf8");
const storyboard = read("components/Storyboard.astro");
const homePage = read("pages/HomePage.astro");
const stage = read("styles/stage.css");
const theme = read("styles/theme.css");

test("the storyboard draws no lettering and no empty speech bubble", () => {
  assert.doesNotMatch(storyboard, /<text|<tspan|<foreignObject/);
  assert.doesNotMatch(storyboard, /motif: "bubble"/);
});

test("the decor is at most three pieces: the notebook, the teacup and the window light", () => {
  const motifs = [...storyboard.matchAll(/motif: "(notebook|teacup)"/g)].map((match) => match[1]);
  assert.deepEqual(motifs, ["notebook", "teacup"]);
  assert.equal(homePage.match(/class="k-light"/g)?.length, 1);
});

test("phones and portrait tablets show none of the decor", () => {
  const start = stage.indexOf("@media (max-width: 760px), (max-width: 1100px) and (orientation: portrait) {");
  assert.ok(start > 0, "the stacked layout block exists");
  const block = stage.slice(start, stage.indexOf("\n}\n", start));
  assert.match(block, /#ema-stage :is\(\.sb-still, \.k-light\) \{ display: none; \}/);
});

test("the still life takes its colours from the theme's existing tokens", () => {
  const declarations = [...stage.matchAll(/--sb-still-[a-z]+:\s*([^;]+);/g)].map((match) => match[1]);
  assert.ok(declarations.length >= 6);
  for (const value of declarations) assert.doesNotMatch(value, /#[0-9a-f]{3}|\b(rgba?|hsla?|oklch|lab)\(/i, value);
});

test("Ema's images carry no filter in any state or colour mode", () => {
  let checked = 0;
  for (const css of [stage, theme]) {
    for (const [, selector, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      if (!/\.k-(ema|frames?)(?![\w-])/.test(selector)) continue;
      checked++;
      assert.doesNotMatch(body, /(^|[;\s])filter\s*:/, selector.trim());
    }
  }
  assert.ok(checked >= 5, "the rules for Ema's figure were found");
});
