import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { mountNotice } from "../src/themes/ema/lib/notice.mjs";

// Fixes from the 2026-11-26 check against current web-platform guidance and an axe-core run.
// None of them changes how a page looks; they change what assistive technology is told and
// when the sakura note closes.
const read = (path) => readFileSync(new URL(`../src/${path}`, import.meta.url), "utf8");

test("Cloudflare's email opt-out encloses the public contact anchors", () => {
  const source = read("core/components/SocialLinks.astro");
  const region = source.match(/<!--email_off-->([\s\S]*?)<!--\/email_off-->/)?.[1] ?? "";
  assert.match(region, /<a\s[^>]*\bhref=\{link\.href\}/);
});

test("the language button's name contains the language code it shows (WCAG 2.5.3 Label in Name)", () => {
  const source = read("core/i18n/LanguageSwitcher.astro");
  // Speech-input users say what they see ("简中", "EN"), so that text has to be part of the name.
  assert.match(source, /<summary aria-label=\{`\$\{t\("a11y\.language"\)\} \$\{localeCodes\[locale\]\}`\}/);
  assert.match(source, /<span>\{localeCodes\[locale\]\}<\/span>/, "the visible code is the same string");
});

test("the journal's search and filters sit in a <search> landmark", () => {
  const source = read("themes/blank/pages/BlogIndexPage.astro");
  // The landmark itself carries the hook and starts hidden, so without JavaScript there is no empty search region.
  // collection.mjs unhides it and hears the form's submit, which bubbles up to it.
  assert.match(source, /<search data-site-filter-form hidden><form class="blank-filter-form">/);
  assert.match(source, /<\/form><\/search>/);
  assert.doesNotMatch(source, /role="search"/);
});

test("the focusable bookmarks track on the Ema home page has a role, so its label is announced", () => {
  // aria-label on an element with no role is not allowed and screen readers ignore it.
  assert.match(read("themes/ema/pages/HomePage.astro"), /<div class="k-track" data-k-track tabindex="0" role="region" aria-label=\{t\("ema\.about\.bookmarks"\)\}>/);
});

test("the sakura note asks for native light dismiss", () => {
  assert.match(read("themes/ema/pages/HomePage.astro"), /<dialog class="ema-notice" id="ema-notice" data-notice closedby="any" /);
});

const noteDialog = (closedBy) => {
  const handlers = {};
  const dialog = {
    open: false,
    dataset: { title: "No.{n}", notes: JSON.stringify([{ number: 1, date: "2020-01-01", text: "a", lang: "en", translated: true }]) },
    showModal() { this.open = true; },
    close() { this.open = false; },
    querySelector: () => null,
    addEventListener: (type, fn) => { (handlers[type] ??= []).push(fn); },
    removeEventListener: (type, fn) => { handlers[type] = (handlers[type] ?? []).filter((h) => h !== fn); },
  };
  if (closedBy) dialog.closedBy = "any";
  const opener = Object.assign(new EventTarget(), { hidden: true });
  const root = { querySelector: () => dialog, querySelectorAll: () => [opener] };
  const cleanup = mountNotice(root, { documentElement: { lang: "en" } });
  const fire = (type, target) => (handlers[type] ?? []).forEach((fn) => fn({ type, target }));
  // A gesture as the browser reports it: the click goes to the nearest element containing both ends.
  const gesture = (down, up) => {
    opener.dispatchEvent(new Event("click"));
    fire("pointerdown", down);
    fire("pointerup", up);
    fire("click", down === up ? down : dialog);
    return dialog.open;
  };
  return { dialog, handlers, gesture, cleanup };
};

test("without closedby support, only a press and release on the backdrop close the note", () => {
  const { dialog, gesture, cleanup } = noteDialog(false);
  const card = { inside: true };
  assert.equal(gesture(card, dialog), true, "selecting text and letting go over the backdrop keeps it open");
  assert.equal(gesture(dialog, card), true, "pressing the backdrop and letting go inside keeps it open");
  assert.equal(gesture(card, card), true, "a click inside keeps it open");
  assert.equal(gesture(dialog, dialog), false, "a click on the backdrop closes it");
  cleanup();
});

test("with closedby support, the browser handles light dismiss and the script adds nothing", () => {
  const { handlers, cleanup } = noteDialog(true);
  assert.deepEqual(Object.keys(handlers).filter((type) => handlers[type].length), []);
  cleanup();
});

test("sorting the collection leaves the entry list as it was", () => {
  const source = read("core/features/collection.mjs");
  assert.match(source, /const ordered = entries\.toSorted\(/);
  assert.doesNotMatch(source, /\[\.\.\.entries\]\.sort\(/);
});

test("on narrow screens the journal's sort label is hidden only visually, so the select keeps its name", () => {
  const css = read("themes/blank/styles/theme.css");
  const narrow = css.slice(css.indexOf("@media (max-width: 760px) {"));
  assert.match(narrow, /\.blank-sort label \{ position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset\(50%\); white-space: nowrap; \}/);
  assert.doesNotMatch(css, /\.blank-sort label \{[^}]*display: *none/, "a label with display:none names nothing");
});

test("pre-paint JS marker prevents filter-bar CLS and collapses extra portraits before lazy fetch", () => {
  assert.match(read("core/preferences/ColorModePreference.astro"), /document\.documentElement\.dataset\.siteJs = "true";/);
  const blankCss = read("themes/blank/styles/theme.css");
  assert.match(blankCss, /html\[data-site-js="true"\] \[data-site-filter-form\]\[hidden\] \{ display: block; \}/);
  assert.match(blankCss, /html\[data-site-js="true"\] \[data-site-disclosure\]:not\(\[data-disclosure-ready\]\) \[data-site-disclosure-item\]:nth-child\(n\+7\) \{ display: none; \}/);
  const emaGamesCss = read("themes/ema/styles/games.css");
  assert.match(emaGamesCss, /html\[data-site-js="true"\] \.ema-games \[data-site-filter-form\]\[hidden\] \{display:block;\}/);
  assert.match(read("core/features/disclosure.mjs"), /root\.dataset\.disclosureReady = "true";/);
});

test("above-the-fold game covers are not lazy-loaded and the first promotes LCP priority", () => {
  for (const path of ["themes/ema/pages/GamesPage.astro", "themes/blank/pages/GamesPage.astro"]) {
    const source = read(path);
    assert.match(source, /loading=\{index < 3 \? undefined : "lazy"\}/, path);
    assert.match(source, /fetchpriority=\{index === 0 \? "high" : undefined\}/, path);
  }
});
