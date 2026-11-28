import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Endfield's small links and buttons answer over at least 44px wherever the layout leaves room, and look exactly as they
// did. These tests keep the rules that do it, and keep them invisible.
const css = readFileSync(new URL("../src/themes/endfield/styles/theme.css", import.meta.url), "utf8");
const layout = readFileSync(new URL("../src/themes/endfield/layouts/EndfieldLayout.astro", import.meta.url), "utf8");
const block = css.slice(css.indexOf("/* Tap targets."), css.indexOf("/* narrow screens */"));
const narrow = css.slice(css.indexOf("/* narrow screens */"));
const has = (rule) => block.includes(rule);

test("Endfield tap targets: each extension is an empty box around the control and paints nothing", () => {
  const extensions = [...block.matchAll(/([^{}\n]+::(?:before|after)) \{([^}]*)\}/g)].filter(([, selector]) => !selector.includes(".ef-button-icon"));
  assert.ok(extensions.length >= 11, `found ${extensions.length}`);
  for (const [, selector, body] of extensions) {
    const names = body.split(";").map((part) => part.trim().split(":")[0]).filter(Boolean);
    for (const name of names) assert.ok(["content", "position", "inset", "top", "bottom", "z-index"].includes(name), `${selector.trim()} sets ${name}: an extension only has a place and a size`);
    if (names.includes("content")) assert.match(body, /content:""; position:absolute; inset:-/, `${selector.trim()} is an empty box reaching beyond the control`);
  }
  const rules = block.replace(/\/\*[\s\S]*?\*\//g, "");
  assert.doesNotMatch(rules, /background(?!-origin|-clip)|border|box-shadow|outline:|color:/, "nothing in this block may draw");
});

test("Endfield tap targets: header", () => {
  assert.ok(has('.ef-wordmark::after { content:""; position:absolute; inset:-14px 0; }'), "the site name: 16 to 19px tall, plus 2 × 14px");
  assert.ok(has('.ef-header .site-language-menu>summary::after { content:""; position:absolute; inset:-2px; }'), "the language button: 42px, plus 1px beyond its border on each side");
  // The icon buttons already use ::before (the accent) and ::after (the motion hint), so each holds an empty element as its
  // tap area. The button itself is left exactly as it was: padding or a clipped background on it changes how WebKit draws
  // the header's grey blocks.
  assert.ok(has(".ef-hit { position:absolute; inset:-1px; }"), "42px + 2 × 1px");
  assert.ok(narrow.includes("[data-endfield] .ef-button-icon { width:40px; height:40px; }\n  .ef-hit { inset:-2px; }"), "on phones the block is 40px, so the rim is 2px");
  assert.equal(layout.split('<span class="ef-hit" aria-hidden="true"></span>').length - 1, 3, "the colour mode button, the search link and the motion button");
  for (const closing of ['<span class="ef-hit" aria-hidden="true"></span></button>', '<span class="ef-hit" aria-hidden="true"></span></a>']) assert.ok(layout.includes(closing), "the tap area is the last thing inside its control");
  assert.doesNotMatch(css, /\.ef-button-icon[^{]*\{[^}]*(background-clip|box-sizing|--ef-pad)/, "the icon buttons' own box and background stay untouched");
  assert.match(css, /\.ef-motion-toggle::after \{ content:attr\(aria-label\); position:absolute; top:calc\(100% \+ 10px\); right:0;/, "the hint hangs where it always did");
});

test("Endfield tap targets: home and footer", () => {
  // Without this, the footer's text is blended differently on the article page (measured: about 2,000 pixels by 1/255, and
  // some letter edges by up to 49/255 on screens wider than 1600px), because positioned text there lands in a separate layer.
  assert.ok(has(".ef-footer { isolation:isolate; }"), "the footer is drawn as one layer, so positioning its links changes no pixel");
  assert.ok(has('.ef-link::after { content:""; position:absolute; inset:-6px 0; }'), "32px, plus 2 × 6px");
  assert.ok(has('.ef-footer-brand::after { content:""; position:absolute; inset:-14px 0 -5px; }'));
  assert.ok(has('.ef-footer-links a:not(.blank-text-link)::after { content:""; position:absolute; inset:-12px 0; }'), "half of the 24px between two section links: 21px + 2 × 12px");
  assert.doesNotMatch(block, /\.ef-footer-links a:not\(\.blank-text-link\):(first|last)-child/, "every section link has the same room now");
  // The last row wraps: its extensions lie under the links, inside a stacking context of the row's own, so a link's text always wins.
  assert.ok(has(".ef-footer-bottom,.ef-content .blank-tag-line { position:relative; z-index:0; }"));
  assert.ok(has('.ef-footer-bottom a::after { content:""; position:absolute; inset:-13px 0; z-index:-1; }'), "half of the 26px between two lines: 19px + 2 × 13px, within the row's 16px and 28px padding");
  assert.doesNotMatch(narrow, /\.ef-footer-bottom a::after/, "one rule serves a single line and a wrapped row alike");
});

// The owner asked (2026-11-26) for the spacing that the last four groups needed to reach 44px. These are visible changes,
// unlike everything above: remove one and its links are closer together than the areas that answer for them.
test("Endfield tap targets: the spacing that lets the closest links reach 44px", () => {
  assert.ok(has(".ef-footer-sections { gap:24px; }"), "the three section links: 21px tall, 45px from one to the next (29px before)");
  assert.ok(layout.includes('<nav class="ef-footer-links ef-footer-sections"'), "only the section links get the wider gap; the social links beside them keep theirs");
  assert.ok(has(".ef-footer-bottom { row-gap:26px; }"), "the last row when it wraps: 19px tall lines, 45px from one to the next (27px before)");
  const wide = block.slice(block.indexOf("@media(min-width:761px) {"));
  assert.ok(wide.includes(".ef-content .blank-credits-body>a.blank-text-link+a.blank-text-link { margin-top:8px; }"), "a link wrapped under another on the credits page: 36px + 8px");
  // Since 2026-11-28 the article is Endfield's own page (.ef-article); the credits page keeps the shared one (.ef-content).
  assert.ok(wide.includes(":is(.ef-content,.ef-article) .blank-toc summary { min-height:44px; }"), "the contents list's heading (40px before)");
  assert.ok(wide.includes(":is(.ef-content,.ef-article) .blank-toc a { min-height:44px; padding-block:12.5px; }"), "a one-line entry: 19.25px of text + 2 × 12.5px (33px before); the floor covers smaller sub-entries");
  // Below 761px the shared stylesheet already gives the contents list 48px and 44px, and text links 44px.
  assert.doesNotMatch(block.slice(0, block.indexOf("@media(min-width:761px) {")), /blank-toc|blank-credits-body/, "the phone layout needs none of this");
});

test("Endfield tap targets: the shared pages as Endfield shows them", () => {
  // The Collection is Endfield's own page since 2026-11-28 (.ef-coll) and keeps the shared filter buttons.
  assert.ok(has(':is(.ef-content,.ef-coll) .blank-filters button::before { content:""; position:absolute; inset:-2px 0; }'), "40px, plus 2 × 2px, inside the 6px between rows");
  assert.ok(has('.ef-content .blank-post-meta a::after { content:""; position:absolute; inset:-13px 0; }'));
  assert.ok(has('.ef-content .blank-tag-line a::after { content:""; position:absolute; inset:-12px -6px; z-index:-1; }'), "tags are about 35 × 21px and at least 12px apart");
  const wide = block.slice(block.indexOf("@media(min-width:761px) {"));
  assert.ok(wide.includes(':is(.ef-content,.ef-coll,.ef-footer) .blank-text-link::after { content:""; position:absolute; inset:-4px 0; }'), "text links are 36px above 760px and 44px below it, so only the wide layout extends them");
  assert.ok(wide.includes(".ef-content .blank-credits-body>a.blank-text-link::after { inset:-8px 0 0; }"), "credits: upward only, because a heading can follow a link directly; a link stacked above is 8px away");
  assert.doesNotMatch(block, /\.blank-credits-body[^{]*\{[^}]*z-index/, "an extension laid under the links does not answer inside a line of text, which is where the pair's 8px now are");
  assert.doesNotMatch(block.slice(0, block.indexOf("@media(min-width:761px) {")), /\.blank-text-link::after/, "extending the 44px phone links would overlap the ones stacked below them");
});

test("Endfield tap targets: every rule stays inside the theme", () => {
  // PageLayout carries this stylesheet to Blank and Ema pages too.
  for (const line of block.split("\n").filter((entry) => entry.includes("{") && !entry.trim().startsWith("@media") && !entry.trim().startsWith("/*"))) {
    assert.match(line, /\.ef-|\[data-endfield\]/, `reaches other themes: ${line.trim().slice(0, 80)}`);
  }
});
