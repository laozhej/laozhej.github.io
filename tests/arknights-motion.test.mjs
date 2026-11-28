import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dotMatrix, gatherFrom } from "../src/themes/arknights/lib/matrix.mjs";
import { decodeFrame, navShift, pageScanDuration, pagesToScan, repel, tickPlace, SECTOR_LINE } from "../src/themes/arknights/lib/runtime.mjs";

// The Arknights theme's interactive motion (2026-11-28): the board gathering and answering the pointer, sectors arriving
// once, the rail's decode and marks, the page change scanned across the window. These tests keep each piece behind the
// pause button and reduced motion, keep the page complete without it, and keep its numbers sensible.
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const css = read("src/themes/arknights/styles/theme.css").replace(/\/\*[\s\S]*?\*\//g, "");
const runtime = read("src/themes/arknights/lib/runtime.mjs");
const layout = read("src/themes/arknights/layouts/ArknightsLayout.astro");
const home = read("src/themes/arknights/pages/HomePage.astro");

// The rules inside one at-rule block, found by its exact prelude.
const block = (prelude) => {
  const start = css.indexOf(`${prelude} {`);
  assert.ok(start >= 0, `missing ${prelude}`);
  let depth = 0;
  for (let i = css.indexOf("{", start); i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}" && --depth === 0) return css.slice(start, i + 1);
  }
  throw new Error(`unclosed ${prelude}`);
};

test("the board gathers each lit cell from a fixed point scattered over it", () => {
  const board = dotMatrix("042");
  const seen = new Set();
  for (const row of board.rows) {
    for (const x of row.on) {
      const a = gatherFrom(x, row.y, board.width, board.height);
      assert.deepEqual(a, gatherFrom(x, row.y, board.width, board.height), "the same cell always starts from the same place");
      const start = [x + a.dx, row.y + a.dy];
      assert.ok(start[0] >= -2.05 && start[0] <= board.width + 2.05, `x ${start[0]}`);
      assert.ok(start[1] >= -2.55 && start[1] <= board.height + 2.55, `y ${start[1]}`);
      assert.ok(Number.isInteger(a.delay) && a.delay >= 0 && a.delay <= 90);
      seen.add(`${a.dx},${a.dy}`);
    }
  }
  assert.ok(seen.size > 20, "cells do not all start from one point");
  // Every lit cell on both boards (latest entry, nothing published) carries its starting point.
  assert.equal(home.split('<rect class="ak-dot" x={x + 0.1} y={row.y + 0.1} width="0.8" height="0.8" style={gather(x, row.y)} />').length - 1, 2);
  assert.match(home, /return `--sx:\$\{dx\};--sy:\$\{dy\};--sd:\$\{delay\}ms`;/);
  assert.match(css, /@keyframes ak-gather \{ from \{ opacity:0; transform:translate\(calc\(var\(--sx,0\) \* 1px\),calc\(var\(--sy,0\) \* 1px\)\); \}/);
});

test("the pointer pushes nearby cells away from it, most right under it, nothing further off", () => {
  assert.deepEqual(repel(3, 0), [0, 0]);
  assert.deepEqual(repel(0, 2.8), [0, 0]);
  const [nearX] = repel(0.5, 0);
  const [farX] = repel(2, 0);
  assert.ok(nearX > farX && farX > 0, "closer cells move further");
  const [dx, dy] = repel(-1, 1);
  assert.ok(dx < 0 && dy > 0, "away from the pointer");
  assert.deepEqual(repel(1, -1).map(Math.abs), repel(-1, 1).map(Math.abs));
  assert.ok(repel(0, 0)[1] <= 1.45 && repel(0, 0)[1] > 1.4, "a cell under the pointer moves at most 1.45 cells");
  // Only with a fine pointer, motion on, and never on touch; the cells drift back by transition.
  assert.match(runtime, /if \(event\.pointerType === "touch" \|\| !fine\.matches \|\| !moving\(\)\) return;/);
  assert.match(css, /@media\(hover:hover\) and \(pointer:fine\) and \(prefers-reduced-motion:no-preference\) \{\s*html:not\(\[data-motion-paused="true"\]\) \.ak-matrix rect \{ transition:translate \.55s var\(--ak-out\); \}/);
});

test("the rail's word is decoded left to right into the real word", () => {
  const random = () => 0.5;
  assert.equal(decodeFrame("Records", 1, random), "Records");
  const half = decodeFrame("Records", 0.5, random);
  assert.equal(half.length, 7);
  assert.equal(half.slice(0, 3), "Rec");
  assert.match(half.slice(3), /^[A-Z]+$/);
  assert.equal(decodeFrame("A B", 0, random)[1], " ", "spaces stay");
  // Only the rail's word, which is hidden from assistive technology, is ever rewritten.
  assert.match(layout, /<div class="ak-rail" aria-hidden="true" data-ak-rail>/);
  assert.match(runtime, /word\.textContent = done >= 1 \? final : decodeFrame\(final, done\);/);
});

test("the rail's marks sit where its fill stands when each sector becomes current", () => {
  assert.equal(SECTOR_LINE, 0.42);
  assert.equal(tickPlace(72, 900, 3000), 0, "the first screen sits at the top");
  assert.equal(tickPlace(900 * 0.42 + 1500, 900, 3000), 0.5);
  assert.equal(tickPlace(99999, 900, 3000), 1);
  assert.equal(tickPlace(500, 900, 0), 0, "a page that does not scroll");
  // Marks, like the cue, give way on short windows so the line stays readable.
  assert.match(css, /@media\(min-width:1200px\) and \(max-height:760px\) \{ \.ak-rail-cue \{ display:none; \} \}/);
  assert.match(css, /@media\(min-width:1200px\) and \(max-height:680px\) \{ \.ak-rail-tick \{ display:none; \} \}/);
  // The cue is the homepage's, inside the rail, and nothing in the rail can be pressed.
  assert.match(layout, /\{home && <span class="ak-rail-cue" data-ak-cue>Scroll<\/span>\}/);
  assert.ok(layout.indexOf("ak-rail-cue") > layout.indexOf('<div class="ak-rail"') && layout.indexOf("ak-rail-cue") < layout.indexOf("</div>", layout.indexOf('<div class="ak-rail"')));
});

test("sectors below the first screen wait for the reader, and nothing waits without the runtime, motion or a screen", () => {
  const arrivals = block("@media screen and (prefers-reduced-motion:no-preference)");
  const armed = [...arrivals.matchAll(/(html:not\(\[data-motion-paused="true"\]\) \[data-ak-armed\][^{]+)\{ animation:([^;]+);/g)];
  assert.ok(armed.length >= 7, `found ${armed.length}`);
  for (const [, selector, animation] of armed) {
    assert.match(animation, /\bbackwards paused$/, `${selector.trim()} waits on its first frame until the sector is reached`);
  }
  // Each waiting part is released by data-ak-shown.
  const running = [...arrivals.matchAll(/html:not\(\[data-motion-paused="true"\]\) \[data-ak-shown\]([^{]+)\{ animation-play-state:running; \}/g)].map((m) => m[1]).join(" ");
  for (const part of [".ak-head", ".ak-head-no", ".ak-lede", ".ak-log>li", ".ak-terms>li", ".ak-panels>li", ".ak-signals>div", ">.ak-ghost::before"]) assert.ok(running.includes(part), part);
  // The runtime arms only sectors that start below the window, never the first, and lets go of all of them when motion stops.
  assert.match(runtime, /if \("akEnter" in sector\.dataset \|\| sector\.getBoundingClientRect\(\)\.top < win\.innerHeight - 40\) continue;/);
  assert.match(runtime, /if \(moving\(\) && sectors\.length && "IntersectionObserver" in win\) \{/);
  assert.match(runtime, /on\(doc, "site:motion-change", \(\) => \{\s*if \(moving\(\)\) return;[\s\S]*?disarm\(\);/);
  // Focus never lands on a part still waiting: a sector reached by the keyboard is simply shown.
  assert.match(runtime, /on\(doc, "focusin", \(event\) => \{\s*const sector = event\.target\?\.closest\?\.\("\[data-ak-armed\]:not\(\[data-ak-shown\]\)"\);/);
  // Every entry knows its place for the stagger.
  for (const list of ["posts.slice(0, 5).map((post, index) => (\n          <li style={`--i:${index}`}>", "profileTech.map((item, index) => <li style={`--i:${index}`}>", "<li style={`--i:${index}`}>\n              <Tag class=\"ak-panel\"", "currentSignals.map((signal, index) => <div style={`--i:${index}`}>"]) {
    assert.ok(home.includes(list), list.slice(0, 40));
  }
});

test("the giant words drift with scrolling only where scroll-driven animations exist", () => {
  const depth = block("@supports ((animation-timeline:view()) and (animation-range:entry))");
  assert.match(depth, /:is\(\.ak-sector>\.ak-ghost,\.ak-footer-ghost\) \{ animation:ak-drift linear both; animation-timeline:view\(\); animation-range:cover; \}/);
  assert.match(depth, /\.ak-hero>\.ak-lattice \{ animation:ak-focus 1\.6s var\(--ak-out\) backwards,ak-lag-grid linear both; animation-timeline:auto,--ak-hero; animation-range:normal,exit; \}/);
  assert.ok(css.indexOf(depth) > css.indexOf("@media(prefers-reduced-motion:no-preference) {\n  @supports ((animation-timeline:view())"), "inside the no-preference block");
});

test("pointing at an entry shows its serial in outline behind it, as decoration", () => {
  assert.match(home, /<a href=\{href\(`\/blog\/\$\{post\.slug\}\/`\)\} data-ak-no=\{serial\(index\)\}>/);
  assert.match(css, /\.ak-log a::after \{ content:attr\(data-ak-no\); content:attr\(data-ak-no\) \/ ""; position:absolute; z-index:-1;/);
  assert.match(css, /\.ak-log a \{ position:relative; isolation:isolate;/);
  assert.match(css, /\.ak-log a:focus-visible::after \{ opacity:1; translate:0 -50%; \}/);
});

test("the page change is a scan across the window drawn by the runtime, only between the theme's own pages", () => {
  const url = (path) => new URL(`https://example.com${path}`);
  const move = (from, to, toTheme = "arknights", fromTheme = "arknights", shelfSwap = false) => pagesToScan({ from: url(from), to: url(to), fromTheme, toTheme, shelfSwap });
  assert.equal(move("/", "/blog/"), true);
  assert.equal(move("/en/about/", "/en/"), true);
  assert.equal(move("/blog/", "/blog/"), false, "the same page reloaded by a filter");
  assert.equal(move("/collection/", "/collection/games/", "arknights", "arknights", true), false, "the Collection's own shelf swap");
  assert.equal(move("/collection/games/", "/blog/"), true);
  assert.equal(move("/", "/themes/ema/", "ema"), false, "leaving the theme");
  assert.equal(move("/themes/ema/", "/", "arknights", "ema"), false, "arriving from another theme");
  // The theme reads where it is going from the fetched page, so it imports none of the shared navigation code (which
  // would split the other themes' shared script into a new chunk).
  assert.doesNotMatch(runtime, /^import /m);
  assert.match(runtime, /const toTheme = event\.newDocument\?\.documentElement\?\.dataset\?\.theme;/);
  assert.match(runtime, /shelfSwap: "shelfSwap" in html\(\)\.dataset/);
  // A Back gesture the browser animates itself brings a stand-in transition: no scan then.
  assert.match(runtime, /event\.viewTransition instanceof win\.ViewTransition/);
  assert.equal(pageScanDuration(1440), 450);
  assert.equal(pageScanDuration(390), 320);
  assert.equal(pageScanDuration(3840), 560);
  assert.equal(navShift({ left: 10, top: 0, width: 50 }, { left: 10, top: 0, width: 50 }), null);
  assert.deepEqual(navShift({ left: 10, top: 0, width: 50 }, { left: 110, top: 0, width: 100 }), [-100, 0, 0.5]);
  // The layout leaves the change to the runtime; the shared fade is gone from the theme.
  assert.match(layout, /transition:name="site-content" transition:animate="none">/);
  assert.doesNotMatch(layout, /pageTransition/);
  // Captured whole but for the header, both pictures opaque, the line under the header and gone when the change ends.
  assert.match(css, /html\[data-theme="arknights"\]\.ak-paging \{ view-transition-name:root!important; \}/);
  assert.match(css, /html\[data-theme="arknights"\]\.ak-paging #arknights-main \{ view-transition-name:none!important; \}/);
  assert.match(css, /html\[data-theme="arknights"\]\.ak-paging::view-transition-old\(root\),html\[data-theme="arknights"\]\.ak-paging::view-transition-new\(root\) \{ animation:none; opacity:1; mix-blend-mode:normal; \}/);
  assert.match(css, /\.ak-pagescan \{ position:fixed; left:0; top:0; z-index:40;/);
  assert.match(css, /\.ak-header \{ position:fixed; top:0; left:0; z-index:50;/);
  assert.match(runtime, /run\.finished\.then\(end, end\);/);
  assert.match(runtime, /from\.transition\.finished\?\.then\(end, end\);/);
  // Decided right before the old page is captured, only with motion on and view transitions available.
  assert.match(runtime, /if \(moving\(\) && typeof doc\.startViewTransition === "function"\) preparing = event;/);
  assert.match(runtime, /paging = \{ back: event\.direction === "back" \};\s*html\(\)\.classList\.add\("ak-paging"\);/);
  assert.match(runtime, /fallback = win\.setTimeout\(end, 2000\);/);
});

test("in the dark the section pointed at lights in the signal; on paper only the bar answers", () => {
  assert.match(css, /@media\(hover:hover\) and \(pointer:fine\) \{\s*html\[data-theme="arknights"\]\[data-color-mode="dark"\] \.ak-nav a:hover :is\(\.ak-nav-word,\.ak-nav-label\) \{ color:var\(--ak-signal\); \}/);
  assert.doesNotMatch(css.replace(/html\[data-theme="arknights"\]\[data-color-mode="dark"\] \.ak-nav a:hover[^}]*\}/, ""), /\.ak-nav a:hover[^{]*\{[^}]*color:var\(--ak-signal\)/);
});
