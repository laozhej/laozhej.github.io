import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Ema's links and buttons answer over at least 44px (2026-11-26, at the owner's request, as on Endfield and Blank). Where the
// layout leaves room the extra area is an empty pseudo-element and nothing looks different; where controls sat too close
// together they were spaced out. The Games and About pages are covered by tests/ema-targets.test.mjs (PR 31).
const css = readFileSync(new URL("../src/themes/ema/styles/theme.css", import.meta.url), "utf8");
const block = css.slice(css.indexOf("/* ---------- Tap targets"));
const rules = block.replace(/\/\*[\s\S]*?\*\//g, "");
const wide = rules.slice(rules.indexOf("@media (min-width: 761px) {"), rules.indexOf("@media (min-width: 340px) and (max-width: 760px) {"));
const phone = rules.slice(rules.indexOf("@media (min-width: 340px) and (max-width: 760px) {"));
const has = (rule) => rules.includes(rule);

test("Ema tap targets: every rule is scoped to Ema, whose stylesheet also reaches Blank and Endfield pages", () => {
  const selectors = rules.split("\n").map((line) => line.trim()).filter((line) => line.includes("{") && !line.startsWith("@media"));
  assert.ok(selectors.length >= 25, `found ${selectors.length}`);
  for (const line of selectors) assert.ok(line.startsWith('html[data-theme="ema"]'), `reaches other themes: ${line.slice(0, 80)}`);
});

test("Ema tap targets: each extension is an empty box around its control and paints nothing", () => {
  const extensions = [...rules.matchAll(/([^{}\n]+::(?:before|after)) \{([^}]*)\}/g)];
  assert.ok(extensions.length >= 17, `found ${extensions.length}`);
  for (const [, selector, body] of extensions) {
    const names = body.split(";").map((part) => part.trim().split(":")[0]).filter(Boolean);
    for (const name of names) assert.ok(["content", "position", "inset", "z-index", "will-change"].includes(name), `${selector.trim()} sets ${name}: an extension only has a place and a size`);
    if (names.includes("content")) assert.match(body, /content: ""; position: absolute; inset: (0 )?-/, `${selector.trim()} reaches beyond its control`);
  }
  assert.doesNotMatch(rules, /background|border|box-shadow|outline|color:/, "nothing in this block may draw");
});

test("Ema tap targets: header, console and theme list", () => {
  assert.ok(has('html[data-theme="ema"] .ema-wordmark::after { content: ""; position: absolute; inset: -5px; }'), "34px, and only the 34px mark below 1101px");
  assert.ok(has('html[data-theme="ema"] .ema-header :is(.ema-icon-button, .ema-settings-toggle)::after { content: ""; position: absolute; inset: -3px; }'), "40px with a 1px outline");
  // Frosted buttons: a box reaching out of them sideways changed a few of their edge pixels in Chrome (measured 2026-11-26).
  assert.ok(has('html[data-theme="ema"] .ema-header .site-language-menu > summary::after { content: ""; position: absolute; inset: -3px 0; }'), "84px wide already: up and down only");
  // The motion button's ::after is its hint; its box gets a layer of its own so the button's own drawing does not change.
  assert.ok(has('html[data-theme="ema"] .ema-header .ema-motion-toggle::before { content: ""; position: absolute; inset: -3px; will-change: transform; }'));
  assert.match(css, /\.ema-motion-toggle::after \{content:attr\(aria-label\);/, "the hint still lives in ::after");
  assert.ok(has('html[data-theme="ema"] .console-tab::after { content: ""; position: absolute; inset: 0 -11px 0 0; }'), "34px wide at the window's edge");
  assert.ok(has('html[data-theme="ema"] .site-theme-dock a { min-height: 44px; }'), "the theme list's rows were 42.8px");
  // The console tab is fixed; giving it position:relative would take it off the window's edge.
  assert.doesNotMatch(rules.slice(0, rules.indexOf("{")), /console-tab|k-cue|k-note-open/, "already positioned controls are not repositioned");
});

test("Ema tap targets: home stage and footer", () => {
  for (const [selector, inset] of [["k-note-open", "-3px 0"], ["k-cue", "-5px 0"], ["k-text-button", "-2px 0"], ["k-journal-head > a", "-10px 0"]]) {
    assert.ok(has(`html[data-theme="ema"] #ema-stage .${selector}::after { content: ""; position: absolute; inset: ${inset}; }`), selector);
  }
  assert.ok(has('html[data-theme="ema"] .ema-footer { isolation: isolate; }'), "positioning the footer's links must not change how their text is drawn after the sticky contents list");
  assert.ok(has('html[data-theme="ema"] .ema-footer-brand::after { content: ""; position: absolute; inset: -3px 0; }'));
  assert.ok(has('html[data-theme="ema"] .ema-social-links a::after { content: ""; position: absolute; inset: -4px 0; }'));
  assert.ok(has('html[data-theme="ema"] .ema-footer-bottom { position: relative; z-index: 0; row-gap: 25px; }'), "the last row's lines are 25px apart when it wraps (12px before)");
  assert.ok(has('html[data-theme="ema"] .ema-footer-bottom a::after { content: ""; position: absolute; inset: -12.5px 0; z-index: -1; }'), "19.3px + 2 × 12.5px, under the links");
});

test("Ema tap targets: shared pages as Ema shows them", () => {
  assert.ok(has('html[data-theme="ema"] .ema-content .blank-filters button::before { content: ""; position: absolute; inset: 0 -10px; }'), "::after draws the chosen filter's line");
  assert.ok(has('html[data-theme="ema"] .ema-content .blank-post-meta a::after { content: ""; position: absolute; inset: -14px -3px; }'));
  assert.ok(has('html[data-theme="ema"] .ema-content .blank-tag-line a::after { content: ""; position: absolute; inset: -14px -9px; z-index: -1; }'), "tags can wrap: their areas lie under the tags");
  assert.ok(wide.includes('html[data-theme="ema"] .ema-content .blank-text-link::after { content: ""; position: absolute; inset: -4px 0; }'), "text links are 36px above 760px, 44px below");
  assert.ok(wide.includes('html[data-theme="ema"] .ema-content .blank-credits-body > a.blank-text-link::after { inset: -8px 0 0; }'), "a heading can follow a credits link directly");
});

test("Ema tap targets: the spacing that lets the closest controls reach 44px", () => {
  assert.ok(wide.includes('html[data-theme="ema"] .ema-content .blank-credits-body > a.blank-text-link + a.blank-text-link { margin-top: 8px; }'));
  assert.ok(wide.includes('html[data-theme="ema"] .ema-content .blank-toc summary { min-height: 44px; }'));
  assert.ok(wide.includes('html[data-theme="ema"] .ema-content .blank-toc a { min-height: 44px; padding-block: 12.5px; }'));
  // Five 44px sections stay centred between the window's edges and the 40px settings button only from about 332px up.
  assert.ok(phone.includes('html[data-theme="ema"] .ema-nav a { min-width: 44px; align-items: center; }'));
  assert.doesNotMatch(rules, /\.ema-nav \{ gap/, "the sections keep their 2px gap; they grow instead, so longer labels do not push the nav into the settings button");
});
