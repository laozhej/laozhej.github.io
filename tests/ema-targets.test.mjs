import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Ema's Games and About pages keep their earlier look, in which several links and buttons are under 44px tall.
// Their hit areas are extended by pseudo-elements that paint nothing; these tests keep those rules in place.
const read = (name) => readFileSync(new URL(`../src/themes/ema/styles/${name}`, import.meta.url), "utf8");
const empty = (css, selector, inset) => new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} \\{content:"";position:absolute;inset:${inset};\\}`).test(css);

test("Ema Games: the card link and the filter buttons have hit areas of at least 44px that paint nothing", () => {
  const css = read("games.css");
  assert.match(css, /\.game-link,\.games-filters button \{position:relative;\}/);
  assert.ok(empty(css, ".game-link::after", "-9px 0"), "27.9px + 2 × 9px");
  assert.ok(empty(css, ".games-filters button::after", "-4px 0"), "38px + 2 × 3px beyond the 1px border");
});

test("Ema About: pills, 'more' links and title links have hit areas of at least 44px that paint nothing", () => {
  const css = read("about.css");
  assert.match(css, /\.about-links a,\.about-marks a,a\.about-more,\.about-games h3,\.about-animes h3 \{position:relative;\}/);
  assert.doesNotMatch(css, /\.about-(games|animes)>li \{[^}]*position:relative/, "the cards stay unpositioned, so the tilted posters render as before");
  assert.ok(empty(css, ".about-links a::after,.about-marks a::after", "-4px 0"), "38.8px + 2 × 3px beyond the 1px border");
  assert.ok(empty(css, "a.about-more::after", "-11px 0"), "22.8px + 2 × 11px");
  assert.ok(empty(css, ".about-games h3 a::after,.about-animes h3 a::after", "-13px 0"), "13px above and below the heading, which is at least one 18px line tall");
});
