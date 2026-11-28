import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// The About pages of Endfield, Arknights and Ema (redrawn 2026-11-28). Endfield and Arknights used to show Blank's About
// page inside their own frame; each now has a page of its own, built from the same shared profile data.
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("Endfield's and Arknights' routes render their own About pages", () => {
  for (const route of ["src/pages/themes/endfield/[...page].astro", "src/pages/[lang]/themes/endfield/[...page].astro"]) {
    assert.match(read(route), /import AboutPage from "@\/themes\/endfield\/pages\/AboutPage\.astro";/, route);
  }
  for (const route of ["src/pages/about.astro", "src/pages/[lang]/[...page].astro"]) {
    assert.match(read(route), /import AboutPage from "@\/themes\/arknights\/pages\/AboutPage\.astro";/, route);
  }
});

test("every About page shows only the shared profile data and links to friends, games and the anime list", () => {
  for (const theme of ["endfield", "arknights", "ema"]) {
    const page = read(`src/themes/${theme}/pages/AboutPage.astro`);
    assert.match(page, /getSiteContent\(locale\)/, theme);
    for (const field of ["profileIdentity", "profileStatus", "profileTech", "favoriteGames", "xpFavorites", "animeFavorites", "currentSignals"]) assert.ok(page.includes(field), `${theme} ${field}`);
    assert.match(page, /href=\{href\("\/friends\/"\)\}/, theme);
    assert.match(page, /href=\{href\("\/collection\/games\/"\)\}>\{t\("about\.gamesMore"\)\}/, theme);
    assert.match(page, /href=\{animeListUrl\}/, theme);
    assert.match(page, /<SocialLinks /, theme);
    // The characters show a first page and open the rest with the shared disclosure.
    assert.match(page, /data-site-disclosure data-limit=\{/, theme);
  }
});

test("the two layouts give their About pages the full width without changing any other page", () => {
  const ef = read("src/themes/endfield/layouts/EndfieldLayout.astro");
  const ak = read("src/themes/arknights/layouts/ArknightsLayout.astro");
  assert.match(ef, /"ef-content blank-main": !home && !bleed, "ef-home-main": home \|\| bleed/);
  assert.match(ak, /"ak-content blank-main": !home && !bleed, "ak-home-main": home \|\| bleed/);
  assert.match(read("src/themes/endfield/pages/AboutPage.astro"), /<PageLayout [^>]* bleed>/);
  assert.match(read("src/themes/arknights/pages/AboutPage.astro"), /<PageLayout [^>]* bleed>/);
});

test("the About stylesheets reach no other page: every rule is scoped to the theme's own classes or attributes", () => {
  for (const [file, prefix] of [["src/themes/endfield/styles/about.css", /^(a?\.ef-|\[data-endfield\]|html\[data-|html:not|@|\}|:is\(\.ef-)/], ["src/themes/arknights/styles/about.css", /^(a?\.ak-|\[data-arknights\]|html\[data-|html:not|@|\}|:is\(\.ak-)/]]) {
    const css = read(file).replace(/\/\*[\s\S]*?\*\//g, "");
    for (const line of css.split("\n").map((l) => l.trim()).filter((l) => l && /\{/.test(l))) {
      assert.match(line, prefix, `${file}: ${line.slice(0, 80)}`);
    }
  }
});

test("Endfield keeps its fixed rules on the About page: the accent only fills, red is never used, nothing is rounded", () => {
  const css = read("src/themes/endfield/styles/about.css").replace(/\/\*[\s\S]*?\*\//g, "");
  assert.doesNotMatch(css, /[^-]color:var\(--ef-signal\)|border[^;]*var\(--ef-signal\)/, "the accent is never a line or a text colour");
  assert.doesNotMatch(css, /\bred\b|#f00|#e64532/i);
  assert.doesNotMatch(css, /border-radius:(?!0)/);
});

test("Arknights' About page uses no game assets: its mark is the owner's own character set in type", () => {
  const page = read("src/themes/arknights/pages/AboutPage.astro");
  assert.match(page, /const glyph = \[\.\.\.ownName\.displayName\]\.at\(-1\)/);
  assert.doesNotMatch(page, /<img[^>]+(logo|rhodes|prts)/i);
});

test("Ema's About page keeps to one family of sakura tones and draws its manga page in code", () => {
  const page = read("src/themes/ema/pages/AboutPage.astro");
  assert.doesNotMatch(page, /tone-(blue|green|yellow|lavender|orange|slate)/, "the owner asked that the colours stay with the pink (2026-11-28)");
  const css = read("src/themes/ema/styles/about.css");
  for (const tone of ["blush", "rose", "petal", "cream"]) assert.match(css, new RegExp(`\\.ema-about \\.sk-${tone} \\{--fill:`), tone);
  const manga = read("src/themes/ema/components/AboutManga.astro");
  assert.doesNotMatch(manga, /<img|href=|url\(http/, "no pictures from anywhere: the page is drawn here");
  assert.match(page, /<figure class="about-manga" aria-hidden="true">/);
});
