import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Ema's touch targets. (The Games page went back to its reference-style layout on 2026-11-27, whose controls are 44px by
// design; tests/ema-games.test.mjs covers it. The About page was redrawn on 2026-11-28 with 44px controls throughout.)
const read = (name) => readFileSync(new URL(`../src/themes/ema/styles/${name}`, import.meta.url), "utf8");

test("Profile contact icons have a full 44px circular touch target", () => {
  const component = readFileSync(new URL("../src/core/components/SocialLinks.astro", import.meta.url), "utf8");
  const circle = component.match(/\.social-circle\s*\{([^}]+)\}/)?.[1] ?? "";
  assert.match(circle, /inline-size:\s*44px/);
  assert.match(circle, /block-size:\s*44px/);
  assert.match(circle, /border-radius:\s*50%/);
  const home = readFileSync(new URL("../src/themes/ema/pages/HomePage.astro", import.meta.url), "utf8");
  assert.match(home, /<SocialLinks class="k-card-links" iconsOnly \/>/);
});

test("Ema About: its links and buttons are at least 44px tall as drawn", () => {
  // The About page was redrawn on 2026-11-28 (card and manga page, binder tabs, polaroids, posters, tickets). Its
  // controls are sized to 44px or more by design, so no invisible hit areas are needed.
  const css = read("about.css");
  assert.match(css, /\.about-more \{display:inline-flex;align-items:center;gap:6px;min-height:44px;/);
  assert.match(css, /\.about-tabs a \{[^}]*min-height:58px;/);
  assert.match(css, /\.about-tabs a \{display:flex;[^}]*min-height:48px;/, "the phone contents list");
  assert.match(css, /\.ema-about \.about-character-toggle \{[^}]*padding:6px 14px;/);
  const page = readFileSync(new URL("../src/themes/ema/pages/AboutPage.astro", import.meta.url), "utf8");
  // Posters and tickets are links as a whole, so each answers over its full picture.
  assert.match(page, /<a href=\{item\.url\} target="_blank" rel="noopener noreferrer">\s*<span class="about-poster-frame"/);
  assert.match(page, /<Tag class="about-ticket"/);
});
