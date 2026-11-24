import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const home = read("src/themes/ema/pages/HomePage.astro");
const css = read("src/themes/ema/styles/stage.css");
const stage = read("src/themes/ema/lib/stage.mjs");

test("the homepage terminal keeps its caret right after the last typed character", () => {
  // The caret is inline inside the line, not a flex item beside the whole text box,
  // so it follows the text onto a wrapped second line.
  assert.match(home, /<span class="k-live"><span class="k-typing" data-k-typing>\{signals\[0\]\}<\/span><span class="k-caret"><\/span><\/span>/);
  assert.match(css, /#ema-stage \.k-caret \{ display: inline-block;[^}]*vertical-align: -\.2em;/);
  assert.doesNotMatch(css, /#ema-stage \.k-caret \{[^}]*flex: none/);
});

test("the terminal holds the height of its longest line, so the hero copy never jumps while typing", () => {
  assert.match(home, /\{signals\.map\(\(line\) => <span class="k-ghost">\{line\}<\/span>\)\}/);
  assert.match(css, /#ema-stage \.k-line > \* \{ grid-area: 1 \/ 1; \}/);
  assert.match(css, /#ema-stage \.k-ghost \{ visibility: hidden; \}/);
});

test("the caret is solid while typing and blinks only while waiting; motion off stops it", () => {
  assert.match(css, /#ema-stage \.is-typing \.k-caret \{ animation: none; opacity: 1; \}/);
  assert.match(stage, /host\.classList\.toggle\('is-typing', typing\)/);
  assert.match(stage, /if \(!canAnimate\(\)\) \{ target\.textContent = lines\[line\]; host\.classList\.remove\('is-typing'\); return; \}/);
  assert.match(css, /html\[data-motion-paused="true"\] #ema-stage :is\(\.k-caret, \.k-cue-arrows i\) \{ animation: none; \}/);
});
