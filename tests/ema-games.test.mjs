import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const page = readFileSync(new URL("../src/themes/ema/pages/GamesPage.astro", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/themes/ema/styles/games.css", import.meta.url), "utf8");

test("Ema Games opens like the reference playroom: CJK title, Latin subtitle, no Latin page head", () => {
  assert.doesNotMatch(page, /PageHead/);
  assert.equal(page.match(/<h1\b/g)?.length, 1);
  assert.match(page, /<h1>\{t\("games\.label"\)\}<span class="games-sub" lang="en">Games<\/span><\/h1>/);
  assert.match(page, /<p class="games-eyebrow">03 \/ \{t\("nav\.games"\)\}<\/p>/);
  assert.doesNotMatch(css, /games-echo|games-aura/, "the rejected r3 echo numeral and aura are gone");
});

test("each game is a cabinet: label strip, screen, copy and one filled action, from shared data", () => {
  assert.match(page, /const \{ favoriteGames, gameShelf \} = getSiteContent\(locale\)/);
  for (const part of ['class="game-label"', '"game-screen"', 'class="game-copy"', 'class="game-play"']) assert.ok(page.includes(part), part);
  assert.match(page, /data-site-collection/);
  assert.match(page, /data-site-entry data-category=\{game\.genre\}/);
  assert.doesNotMatch(page, /src="\//, "no hard-coded images");
});

test("Ema Games keeps 44px targets, art that fills its screen, and quiet motion when asked", () => {
  assert.match(css, /\.games-filters button \{[^}]*min-height:44px/);
  assert.match(css, /\.ema-games \.game-play \{[^}]*min-height:44px/);
  assert.match(css, /\.ema-games \.game-screen img \{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;/);
  assert.match(css, /html\[data-motion-paused="true"\] \.ema-games/);
  assert.match(css, /prefers-reduced-motion:reduce/);
});

test("on phones the cabinets are compact rows that keep every part and the 44px action", () => {
  const phone = css.slice(css.indexOf("@media(max-width:760px)"), css.indexOf(".ema-games:lang(ja)"));
  assert.match(phone, /\.game-cabinet \{display:grid;grid-template-columns:104px minmax\(0,1fr\);/);
  assert.match(phone, /\.game-label \{grid-column:1 \/ -1;/, "the label strip stays");
  assert.doesNotMatch(phone, /\.game-[\w-]+[^{}]*\{[^}]*(display:none|min-height:[1-3]\d?px)/, "no part of a cabinet is hidden and no target shrinks");
});
