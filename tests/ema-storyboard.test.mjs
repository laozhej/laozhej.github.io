import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Sakura Archive homepage manga storyboard and falling-tags backdrop (updated 2026-11-28 at the
// owner's request): curated non-AI manga panel crops recorded in public/themes/ema/ASSETS.json,
// decorative-only backdrop layers, theme-token colours, and no filter on Ema's five stage images.
const read = (path) => readFileSync(new URL(`../src/themes/ema/${path}`, import.meta.url), "utf8");
const storyboard = read("components/Storyboard.astro");
const homePage = read("pages/HomePage.astro");
const stage = read("styles/stage.css");
const theme = read("styles/theme.css");
const manifest = JSON.parse(readFileSync(new URL("../public/themes/ema/ASSETS.json", import.meta.url), "utf8"));

test("the storyboard draws no inline SVG lettering and stays hidden from assistive technology", () => {
  assert.doesNotMatch(storyboard, /<text|<tspan|<foreignObject/);
  assert.match(storyboard, /<svg[^>]*aria-hidden="true"/);
});

test("every manga panel and the signal backdrop are recorded in the Ema manifest as non-AI", () => {
  const panelRefs = [...storyboard.matchAll(/art:\s*"(\/themes\/ema\/storyboard\/[^"]+\.webp)"/g)].map((m) => m[1]);
  assert.ok(panelRefs.length >= 8, "storyboard renders curated manga panels");
  const signalRef = homePage.match(/class="k-signal-bg"[\s\S]*?src="(\/themes\/ema\/storyboard\/[^"]+\.webp)"/)?.[1];
  assert.ok(signalRef, "falling-tags section mounts a decorative backdrop image");
  assert.match(homePage, /<div class="k-signal-bg" aria-hidden="true">/);

  const byFile = new Map(manifest.assets.map((entry) => [`/themes/ema/${entry.file}`, entry]));
  for (const ref of [...panelRefs, signalRef]) {
    const entry = byFile.get(ref);
    assert.ok(entry, `${ref} is recorded in public/themes/ema/ASSETS.json`);
    assert.equal(entry.generative_ai_used, false, `${ref} must not use generative AI`);
    assert.match(entry.source_page, /^https:\/\/www\.pixiv\.net\/artworks\/\d+$/);
  }
});

test("the storyboard panels blend cleanly in both colour modes without inverting faces", () => {
  assert.match(stage, /#ema-stage \.sb \.sb-art\s*\{[^}]*mix-blend-mode:\s*multiply/);
  assert.match(stage, /html\[data-color-mode="dark"\] #ema-stage \.sb \.sb-art\s*\{[^}]*mix-blend-mode:\s*multiply/);
  assert.doesNotMatch(stage, /html\[data-color-mode="dark"\] #ema-stage \.sb \.sb-art\s*\{[^}]*invert\(/);
  assert.match(stage, /#ema-stage \.k-signal-bg\s*\{/);
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
