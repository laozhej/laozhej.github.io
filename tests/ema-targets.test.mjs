import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Ema's About page keeps its earlier look, in which several links and buttons are under 44px tall. (The Games page went
// back to its reference-style layout on 2026-11-27, whose controls are 44px by design; tests/ema-games.test.mjs covers it.)
// Their hit areas are extended by pseudo-elements that paint nothing; these tests keep those rules in place.
const read = (name) => readFileSync(new URL(`../src/themes/ema/styles/${name}`, import.meta.url), "utf8");
const empty = (css, selector, inset) => new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} \\{content:"";position:absolute;inset:${inset};\\}`).test(css);

test("Ema About: pills, 'more' links and title links have hit areas of at least 44px that paint nothing", () => {
  const css = read("about.css");
  assert.match(css, /\.about-links a,\.about-marks a,a\.about-more,\.about-games h3,\.about-animes h3 \{position:relative;\}/);
  assert.doesNotMatch(css, /\.about-(games|animes)>li \{[^}]*position:relative/, "the cards stay unpositioned, so the tilted posters render as before");
  assert.ok(empty(css, ".about-links a::after,.about-marks a::after", "-4px 0"), "38.8px + 2 × 3px beyond the 1px border");
  assert.ok(empty(css, "a.about-more::after", "-11px 0"), "22.8px + 2 × 11px");
  assert.ok(empty(css, ".about-games h3 a::after,.about-animes h3 a::after", "-13px 0"), "13px above and below the heading, which is at least one 18px line tall");
});
