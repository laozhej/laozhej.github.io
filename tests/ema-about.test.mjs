import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const page = readFileSync(new URL("../src/themes/ema/pages/AboutPage.astro", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/themes/ema/styles/about.css", import.meta.url), "utf8");

test("Ema About follows the reference's section order: tech with now beside it, stories, characters, games", () => {
  const order = ["ema-about-letter", "ema-about-tech", "ema-about-now", "ema-about-animes", "ema-about-characters", "ema-about-games"]
    .map((id) => page.indexOf(`id="${id}"`));
  assert.ok(order.every((index) => index > 0), "every section is present");
  assert.deepEqual([...order].sort((a, b) => a - b), order);
  assert.match(page, /<aside class="about-now"[\s\S]*?<\/aside>\s*<\/div>\s*<\/section>/, "now sits inside the tech section");
  assert.match(page, /<div class="about-interests">\s*<section[^>]*ema-about-characters[\s\S]*ema-about-games/);
});

test("Ema About's opening is its page head, as in the reference: the owner's name is the only h1", () => {
  assert.doesNotMatch(page, /PageHead/);
  assert.equal(page.match(/<h1\b/g)?.length, 1);
  assert.match(page, /<h1>\{profileIdentity\.displayName\}<\/h1>/);
  assert.match(page, /<p class="about-eyebrow"><span>04 \/ \{t\("common\.about"\)\}<\/span>/);
});

test("Ema About is ruled sections, not a wall of cards, and draws on shared data only", () => {
  assert.doesNotMatch(page, /shelf-card|shelf-chip/);
  assert.match(page, /getSiteContent\(locale\)/);
  assert.match(page, /gameShelf\.find\(\(entry\) => entry\.key === game\.key\)\?\.art/, "favourite game art comes from the shelf entry with the same key");
  assert.doesNotMatch(page, /<img[^>]+src="\//, "no hard-coded image paths");
});

test("Ema About keeps 44px targets and quiets motion when asked", () => {
  assert.match(css, /\.about-links a \{[^}]*min-height:44px/);
  assert.match(css, /\.about-marks a \{[^}]*min-height:48px/);
  assert.match(css, /\.about-more \{[^}]*min-height:44px/);
  assert.match(css, /\.about-games>li \{position:relative;/);
  assert.match(css, /\.about-games h3 a::after \{content:"";position:absolute;inset:0;\}/, "a favourite game's link covers its whole row");
  assert.match(css, /html\[data-motion-paused="true"\] \.ema-about/);
  assert.match(css, /prefers-reduced-motion:reduce/);
});
