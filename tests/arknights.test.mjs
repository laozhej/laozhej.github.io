import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { themes, getTheme, getThemePath } from "../src/core/themes/routing.mjs";
import { dotMatrix, glyphs } from "../src/themes/arknights/lib/matrix.mjs";
import { homeSectors, sectionWords } from "../src/themes/arknights/lib/sections.mjs";
import { currentSector, scanDuration } from "../src/themes/arknights/lib/runtime.mjs";

// The Arknights theme sits beside Blank, Ema and Endfield on the same skeleton. These tests keep its wiring, keep its
// stylesheet to its own pages (PageLayout brings it to every theme's pages) and keep its motion behind the pause button.
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const css = read("src/themes/arknights/styles/theme.css");
const layout = read("src/themes/arknights/layouts/ArknightsLayout.astro");
const home = read("src/themes/arknights/pages/HomePage.astro");

// Every rule of a stylesheet with the at-rules around it. Comments are dropped; the theme's CSS has no braces in strings.
function rules(source) {
  const text = source.replace(/\/\*[\s\S]*?\*\//g, "");
  const out = [];
  const walk = (src, at) => {
    let i = 0;
    while (i < src.length) {
      const open = src.indexOf("{", i);
      if (open === -1) break;
      const head = src.slice(i, open).trim();
      let depth = 1;
      let j = open + 1;
      while (depth && j < src.length) { if (src[j] === "{") depth++; else if (src[j] === "}") depth--; j++; }
      const body = src.slice(open + 1, j - 1);
      if (/^@(media|supports|starting-style)/.test(head)) walk(body, [...at, head]);
      else out.push({ head, body, at });
      i = j;
    }
  };
  walk(text, []);
  return out;
}
const splitList = (selector) => {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < selector.length; i++) {
    if (selector[i] === "(") depth++;
    else if (selector[i] === ")") depth--;
    else if (selector[i] === "," && depth === 0) { parts.push(selector.slice(start, i).trim()); start = i + 1; }
  }
  parts.push(selector.slice(start).trim());
  return parts;
};
const all = rules(css);
const styleRules = all.filter(({ head }) => !head.startsWith("@keyframes"));

test("the theme is registered fourth, serves the default root routes, and keeps legacy redirects", () => {
  assert.deepEqual(themes.map(({ id }) => id), ["blank", "ema", "endfield", "arknights"]);
  assert.equal(themes[3].root, "");
  assert.equal(themes[0].root, "/themes/blank");
  assert.equal(getTheme("/ja/blog/"), "arknights");
  assert.equal(getThemePath("arknights", "/en/themes/endfield/games/?q=x#top"), "/en/games/?q=x#top");
  assert.equal(getThemePath("arknights", "/404.html"), "/404.html");
  assert.equal(getThemePath("blank", "/404.html"), "/themes/blank/404/");
  for (const route of ["src/pages/index.astro", "src/pages/[lang]/[...page].astro"]) {
    assert.match(read(route), /import HomePage from "@\/themes\/arknights\/pages\/HomePage\.astro";/, route);
  }
  for (const route of ["src/pages/themes/blank/[...page].astro", "src/pages/[lang]/themes/blank/[...page].astro"]) {
    assert.match(read(route), /import HomePage from "@\/themes\/blank\/pages\/HomePage\.astro";/, route);
  }
  for (const route of ["src/pages/themes/arknights/[...page].astro", "src/pages/[lang]/themes/arknights/[...page].astro"]) {
    assert.match(read(route), /<ThemeRedirect theme="arknights"/, route);
  }
  assert.match(read("src/core/themes/PageLayout.astro"), /arknights: ArknightsLayout/);
  assert.match(read("src/core/themes/registry.ts"), /"arknights"/);
  // The header shows the theme's place in the list, as Endfield shows "EF / 03".
  assert.match(layout, /themes\.findIndex\(\(\{ id \}\) => id === "arknights"\) \+ 1/);
});

test("the layout mounts the shared pieces every theme must", () => {
  for (const piece of ["<LanguagePreference />", "<ThemePreference />", "<SiteIcons />", "<ColorModePreference", "<SiteNavigation />", "<LanguageSwitcher />", "<ThemeSwitcher floating />", "<SiteAttribution />", "<SiteMeta title={title} description={description}"]) {
    assert.ok(layout.includes(piece), piece);
  }
  assert.match(layout, /<html lang=\{locale\} data-theme="arknights"/);
  assert.match(layout, /registerThemeRuntime\("arknights", mountArknights\)/);
  assert.match(layout, /data-color-mode-toggle hidden aria-label=\{t\("mode\.label"\)\} aria-pressed="false"/);
  // The motion button: pause and play icons, the shared labels, a hint on hover and focus.
  assert.match(layout, /data-motion-toggle data-motion-pause=\{t\("ema\.motion\.pause"\)\} data-motion-resume=\{t\("ema\.motion\.resume"\)\} data-motion-reduced=\{t\("ema\.motion\.reduced"\)\} hidden/);
  assert.ok(layout.includes('name="tabler:player-pause"') && layout.includes('name="tabler:player-play"'));
  assert.match(css, /\.ak-motion-toggle::after \{ content:attr\(aria-label\);/);
  // The rail repeats the header (where the reader is), so it is hidden from assistive technology and holds nothing to press.
  assert.match(layout, /<div class="ak-rail" aria-hidden="true" data-ak-rail>/);
  const rail = layout.slice(layout.indexOf('<div class="ak-rail"'), layout.indexOf("</div>", layout.indexOf('<div class="ak-rail"')));
  assert.doesNotMatch(rail, /<a |<button/);
});

test("the header pairs a fixed English word with each section's own name, shown once in English", () => {
  assert.deepEqual(Object.keys(sectionWords), ["home", "blog", "projects", "games", "about"]);
  assert.match(layout, /word: locale === "en" \? label : sectionWords\[/);
  assert.match(layout, /label: locale === "en" \? "" : label/);
  // The English word keeps its language for screen readers on the Chinese and Japanese pages.
  assert.match(layout, /<span class="ak-nav-word" lang=\{locale === "en" \? undefined : "en"\}>/);
});

test("every rule stays on the theme's own pages", () => {
  for (const { head, at } of styleRules) {
    for (const selector of splitList(head)) {
      assert.match(selector, /html\[data-theme="arknights"\]|\[data-arknights\]|\.ak-|\[data-ak-/, `${selector} (in ${at.join(" ") || "top level"}) reaches other themes`);
    }
  }
  for (const { head } of all.filter(({ head }) => head.startsWith("@keyframes"))) {
    assert.match(head, /^@keyframes ak-/, `${head}: keyframe names are global, so they carry the theme's prefix`);
  }
  for (const { head } of styleRules.filter(({ head }) => head.includes("::view-transition"))) {
    for (const selector of splitList(head)) assert.ok(selector.startsWith('html[data-theme="arknights"]'), `${selector} would reach other themes' transitions`);
  }
});

test("timed motion plays only while motion is on and the system allows it", () => {
  const animated = styleRules.filter(({ body }) => /(^|;)\s*animation:(?!none)/.test(body));
  assert.ok(animated.length >= 10, `found ${animated.length}`);
  for (const { head, at } of animated) {
    // The rail's fill follows the scroll position: it is a gauge, not timed motion.
    if (head === ".ak-rail-fill") { assert.match(at.join(" "), /@supports \(animation-timeline:scroll\(\)\)/); continue; }
    assert.ok(at.some((rule) => rule.includes("prefers-reduced-motion:no-preference")), `${head} must sit under prefers-reduced-motion:no-preference`);
    for (const selector of splitList(head)) assert.ok(selector.startsWith('html:not([data-motion-paused="true"])'), `${selector} must stop with the pause button`);
  }
  const reduced = styleRules.filter(({ at }) => at.some((rule) => rule.includes("prefers-reduced-motion:reduce")));
  assert.ok(reduced.some(({ head, body }) => head.includes("[data-ak-enter]") && body.includes("animation:none!important")), "the opening sequence is off under reduced motion");
});

test("tap targets reach 44px without drawing anything", () => {
  const block = css.slice(css.indexOf("/* Tap targets."), css.indexOf("/* narrower windows */"));
  assert.ok(block.length > 500);
  const extensions = [...block.matchAll(/([^{}\n]+::(?:before|after)) \{([^}]*)\}/g)];
  assert.ok(extensions.length >= 10, `found ${extensions.length}`);
  for (const [, selector, body] of extensions) {
    const names = body.split(";").map((part) => part.trim().split(":")[0]).filter(Boolean);
    for (const name of names) assert.ok(["content", "position", "inset", "z-index"].includes(name), `${selector.trim()} sets ${name}: an extension only has a place and a size`);
  }
  assert.doesNotMatch(block.replace(/\/\*[\s\S]*?\*\//g, ""), /background|border|box-shadow|outline:|color:/, "nothing in this block may draw");
  // The header's icon buttons use both pseudo-elements (fill, hint), so each holds an empty element for its tap area.
  assert.equal(layout.split('<span class="ak-hit" aria-hidden="true"></span>').length - 1, 3);
  assert.ok(block.includes(".ak-hit { position:absolute; inset:-3px; }"), "40px + 2 × 3px");
  assert.match(css, /\[data-arknights\] \.ak-icon \{[^}]*width:40px; height:40px;/);
  assert.match(css, /\[data-arknights\] \.ak-button \{[^}]*min-height:50px;/);
});

test("the dot-matrix board draws real figures, every cell of them", () => {
  for (const [figure, rows] of Object.entries(glyphs)) {
    assert.equal(rows.length, 7, figure);
    for (const row of rows) assert.match(row, /^[.#]{5}$/, figure);
  }
  const board = dotMatrix("001");
  assert.deepEqual([board.width, board.height], [17, 7]);
  for (const row of board.rows) assert.equal(row.on.length + row.off.length, 15, "three figures of five cells; the gaps are left empty");
  assert.deepEqual(board.rows[0].on, [1, 2, 3, 7, 8, 9, 14]);
  assert.throws(() => dotMatrix("0a1"));
  assert.throws(() => dotMatrix(""));
  // The board shows the latest entry's serial, numbered oldest first, and zero when nothing is published.
  assert.match(home, /const board = dotMatrix\(latest \? serial\(0\) : "000"\);/);
  assert.match(home, /const serial = \(index: number\) => pad\(posts\.length - index, 3\);/);
});

test("the rail counts through the homepage's sectors in page order", () => {
  assert.deepEqual(homeSectors.map(({ id }) => id), ["ak-index", "ak-records", "ak-practice", "ak-play", "ak-status"]);
  for (const { id } of homeSectors) assert.ok(home.includes(`id="${id}"`), id);
  assert.equal(currentSector([0, 900, 1800], 900), 0);
  assert.equal(currentSector([-900, 300, 1200], 900), 1, "a sector counts once its top passes 42% of the window");
  assert.equal(currentSector([-900, 400, 1200], 900), 0);
  assert.equal(currentSector([-3000, -2000, -1000], 900), 2);
  assert.equal(scanDuration(900), 375);
  assert.equal(scanDuration(300), 320);
  assert.equal(scanDuration(3000), 620);
});

test("the homepage shows only shared content", () => {
  for (const source of ["getSiteContent(locale)", "getPublishedPosts(locale)"]) assert.ok(home.includes(source), source);
  // Favourite games link to the page the shared data gives them, in a new tab.
  assert.match(home, /href: game\.url, target: "_blank", rel: "noopener noreferrer"/);
  assert.match(home, /art: gameShelf\.find\(\(game\) => game\.key === item\.key\)\?\.art/);
  assert.match(home, /<img src=\{game\.art\.src\} alt="" loading="lazy"/);
  assert.doesNotMatch(home + layout, /Rhodes|PRTS|Originium|Terra|Doctor|Operator/i, "no game terminology");
});
