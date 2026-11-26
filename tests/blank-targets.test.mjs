import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Blank's small links and buttons answer over at least 44px. Where the layout leaves room the extra area is an empty
// pseudo-element and nothing looks different; where links sat too close together they were spaced out (2026-11-26, at the
// owner's request, as on Endfield). These tests keep both kinds of rule in place, and keep them inside Blank.
const css = readFileSync(new URL("../src/themes/blank/styles/journal.css", import.meta.url), "utf8");
const block = css.slice(css.indexOf("/* ---------- Tap targets ----------"));
const rules = block.replace(/\/\*[\s\S]*?\*\//g, "");
const wide = rules.slice(rules.indexOf("@media (min-width: 761px) {"));
const has = (rule) => rules.includes(rule);

test("Blank tap targets: every rule is scoped to Blank, whose stylesheets also reach Ema and Endfield pages", () => {
  // Ema and Endfield pages carry data-blank too and load this file through the shared page layout.
  const selectors = rules.split("\n").map((line) => line.trim()).filter((line) => line.includes("{") && !line.startsWith("@media"));
  assert.ok(selectors.length >= 18, `found ${selectors.length}`);
  for (const line of selectors) assert.ok(line.startsWith('html[data-theme="blank"]'), `reaches other themes: ${line.slice(0, 80)}`);
});

test("Blank tap targets: each extension is an empty box around its control and paints nothing", () => {
  const extensions = [...rules.matchAll(/([^{}\n]+::(?:before|after)) \{([^}]*)\}/g)];
  assert.ok(extensions.length >= 10, `found ${extensions.length}`);
  for (const [, selector, body] of extensions) {
    const names = body.split(";").map((part) => part.trim().split(":")[0]).filter(Boolean);
    for (const name of names) assert.ok(["content", "position", "inset", "z-index"].includes(name), `${selector.trim()} sets ${name}: an extension only has a place and a size`);
    if (names.includes("content")) assert.match(body, /content: ""; position: absolute; inset: (0 )?-/, `${selector.trim()} reaches beyond its control`);
  }
  assert.doesNotMatch(rules, /background|border|box-shadow|outline|color:/, "nothing in this block may draw");
});

test("Blank tap targets: header", () => {
  assert.ok(has('html[data-theme="blank"] .blank-wordmark::after { content: ""; position: absolute; inset: -10px 0; }'), "the site name is 24px tall beside the sections");
  // ::after draws the sections' underline, so the sideways reach is ::before.
  assert.ok(has('html[data-theme="blank"] .blank-nav a::before { content: ""; position: absolute; inset: 0 -6px; }'), "sections about 42px wide, at least 12px apart");
  assert.ok(has('html[data-theme="blank"] .blank-header :is(.blank-icon-button, :is(.site-language-menu, .site-theme-dock) > summary)::after { content: ""; position: absolute; inset: -3px; }'), "40px with a 1px outline: an absolute box starts inside the outline");
  assert.ok(has('html[data-theme="blank"] .blank-search .blank-icon-button::after { content: ""; position: absolute; inset: -2px; }'), "the search clear button, 40px without an outline");
});

test("Blank tap targets: footer", () => {
  // Positioning the footer's links would otherwise change how their text is drawn on the article page, after the sticky
  // contents list (seen on Endfield, 2026-11-26).
  assert.ok(has('html[data-theme="blank"] .blank-footer { isolation: isolate; }'));
  assert.ok(has('html[data-theme="blank"] .bj-footer-links a::after { content: ""; position: absolute; inset: -4px 0; }'), "36px + 2 × 4px");
  assert.ok(wide.includes('html[data-theme="blank"] .blank-footer-bottom { position: relative; z-index: 0; row-gap: 25px; }'), "the last line wraps on some widths: its lines are 25px apart (12px before)");
  assert.ok(wide.includes('html[data-theme="blank"] .blank-footer-bottom > a:not(.blank-back-top)::after { content: ""; position: absolute; inset: -12.5px 0; z-index: -1; }'), "19.3px + 2 × 12.5px, under the links so a link's own text always answers for it");
});

test("Blank tap targets: pages", () => {
  assert.ok(has('html[data-theme="blank"] .blank-filters button::before { content: ""; position: absolute; inset: 0 -10px; }'), "::after draws the chosen filter's underline; 28px between filters (20px on phones)");
  assert.ok(has('html[data-theme="blank"] .blank-main .blank-post-meta a::after { content: ""; position: absolute; inset: -14px -3px; }'), "the category link is about 17px tall");
  assert.ok(has('html[data-theme="blank"] .blank-main .blank-tag-line { position: relative; z-index: 0; }'));
  assert.ok(has('html[data-theme="blank"] .blank-main .blank-tag-line a::after { content: ""; position: absolute; inset: -14px -9px; z-index: -1; }'), "tags can wrap: their areas lie under the tags");
  assert.ok(wide.includes('html[data-theme="blank"] :is(.blank-main, .blank-footer) :is(.blank-text-link, .blank-back-top)::after { content: ""; position: absolute; inset: -4px 0; }'), "text links are 36px above 760px");
  assert.doesNotMatch(rules.slice(0, rules.indexOf("@media (min-width: 761px) {")), /blank-text-link::after/, "below 761px they are 44px already, and some are stacked with no space between");
  assert.ok(wide.includes('html[data-theme="blank"] .blank-credits-body > a.blank-text-link::after { inset: -8px 0 0; }'), "a heading can follow a credits link directly");
});

test("Blank tap targets: the spacing that lets the closest links reach 44px", () => {
  // Visible changes, unlike everything above: remove one and its links are closer together than the areas that answer for them.
  assert.ok(has('html[data-theme="blank"] .blank-header .site-theme-dock a { min-height: 44px; }'), "the theme list's rows were 42.8px");
  assert.ok(wide.includes('html[data-theme="blank"] .blank-credits-body > a.blank-text-link + a.blank-text-link { margin-top: 8px; }'), "a credits link wrapped under another: 36px + 8px");
  assert.ok(wide.includes('html[data-theme="blank"] .blank-toc summary { min-height: 44px; }'), "the contents list's heading (40px before)");
  assert.ok(wide.includes('html[data-theme="blank"] .blank-toc a { min-height: 44px; padding-block: 12.5px; }'), "a one-line entry: 19.25px of text + 2 × 12.5px (33px before)");
});

test("Blank tap targets: the theme list stays on screen on phones", () => {
  // theme.css pins the list to the left edge of its button below 481px; the button is at the right end of the header, so
  // the 224px list ran off a 390px screen (seen on the live site, 2026-11-26). This rule must outrank that one.
  const phone = rules.slice(rules.indexOf("@media (max-width: 480px) {"));
  assert.ok(phone.includes('html[data-theme="blank"] .blank-header .site-theme-dock .site-theme-options { left: auto; right: 0; }'));
  const shared = readFileSync(new URL("../src/themes/blank/styles/theme.css", import.meta.url), "utf8");
  assert.match(shared, /\.blank-header \.site-theme-options \{ left:0; right:auto; \}/, "if the shared rule goes, this override can go too");
});
