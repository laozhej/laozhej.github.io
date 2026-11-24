// Regression tests for the frontend fixes of 2026-11-24. Each test names the
// visitor-facing failure it guards against; all were reproduced in Chrome and
// WebKit before the fix.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { mountCollection } from "../src/core/features/collection.mjs";
import { mountPrefetch } from "../src/core/navigation/prefetch.mjs";
import { versionedUrl, versionNavigationRequest } from "../src/core/navigation/request-version.mjs";
import { mountLanguagePreference } from "../src/core/i18n/preference.mjs";
import { getRadio } from "../src/themes/ema/lib/radio.mjs";

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const element = (extra = {}) => Object.assign(new EventTarget(), {
  dataset: {}, attributes: {}, hidden: false, value: "",
  setAttribute(key, value) { this.attributes[key] = value; },
  getAttribute(key) { return this.attributes[key]; },
  hasAttribute(key) { return key in this.attributes; },
  focus() { this.focused = true; },
}, extra);

test("Back from a filtered list to another page does not re-filter the page being left", () => {
  const entries = ["notes", "code"].map((category, i) => element({ id: String(i), dataset: { category, date: String(i), search: category } }));
  const buttons = ["all", "notes", "code"].map((siteCategory) => element({ dataset: { siteCategory } }));
  const nodes = { "filter-form": element(), entries: element({ querySelectorAll: () => entries, append() {} }) };
  const root = element({ dataset: { unit: "games" }, querySelector: (s) => nodes[s.slice("[data-site-".length, -1)] ?? null, querySelectorAll: (s) => (s === "[data-site-category]" ? buttons : []) });
  const win = element({ location: { href: "https://example.com/games/?category=code" }, setTimeout: () => 1, clearTimeout() {}, history: { state: {}, replaceState() {} } });
  const cleanup = mountCollection(root, win);
  const shown = () => entries.filter((entry) => !entry.hidden).map((entry) => entry.id);
  assert.deepEqual(shown(), ["1"]);
  win.location.href = "https://example.com/";
  win.dispatchEvent(new Event("popstate"));
  assert.deepEqual(shown(), ["1"], "the router is about to swap pages; the old list keeps its filter");
  win.location.href = "https://example.com/games/";
  win.dispatchEvent(new Event("popstate"));
  assert.deepEqual(shown(), ["0", "1"], "an entry of the same page still restores its filters");
  cleanup();
});

test("a hovered link is prefetched under the same versioned URL the router fetches", async () => {
  assert.equal(versionedUrl("https://example.com/projects/?a=1#top", "abc").href, "https://example.com/projects/?a=1&__site_build=abc");
  const event = { from: new URL("https://example.com/"), to: new URL("https://example.com/projects/?a=1#top") };
  let fetched;
  event.loader = async () => { fetched = event.to.href; };
  versionNavigationRequest(event, "abc");
  await event.loader();
  assert.equal(fetched, "https://example.com/projects/?a=1&__site_build=abc#top");
  assert.equal(event.to.href, "https://example.com/projects/?a=1#top");

  const head = { links: [], append(link) { this.links.push(link); } };
  const handlers = {};
  const doc = {
    head,
    addEventListener: (type, fn) => { handlers[type] = fn; },
    removeEventListener: (type) => { delete handlers[type]; },
    querySelector: (s) => (s === 'meta[name="site-build"]' ? { content: "abc" } : null),
    createElement: () => ({ relList: { supports: (value) => value === "prefetch" } }),
  };
  const timers = [];
  const win = { location: { href: "https://example.com/blog/", origin: "https://example.com", pathname: "/blog/", search: "" }, navigator: {}, setTimeout: (fn) => timers.push(fn), clearTimeout() {} };
  const link = (href, attributes = {}) => ({ href: new URL(href, win.location.href).href, target: "", dataset: {}, hasAttribute: (key) => key in attributes, closest() { return this; } });
  const cleanup = mountPrefetch(doc, win);
  const hover = (target) => { handlers.mouseover({ target }); timers.splice(0).forEach((fn) => fn()); };
  hover(link("/projects/#top"));
  hover(link("/projects/"));
  hover(link("#comments"));
  hover(link("https://other.example/"));
  hover(link("/themes/ema/", { "data-astro-reload": "" }));
  assert.deepEqual(head.links.map((l) => l.href), ["https://example.com/projects/?__site_build=abc"], "once, versioned, and never for anchors, other sites or full reloads");
  cleanup();
  assert.deepEqual(Object.keys(handlers), [], "cleanup removes every document listener");
});

test("one Escape closes only the nested language menu, not the panel around it", () => {
  const summary = element();
  const menu = element({ open: true, querySelector: (s) => (s === "summary" ? summary : null), querySelectorAll: () => [], contains: () => false });
  const doc = element({ querySelector: (s) => (s === "[data-site-language-menu]" ? menu : null) });
  const cleanup = mountLanguagePreference(doc, { localStorage: { setItem() {} }, location: { href: "https://example.com/" } });
  const escape = Object.assign(new Event("keydown", { cancelable: true }), { key: "Escape" });
  doc.dispatchEvent(escape);
  assert.equal(menu.open, false);
  assert.equal(summary.focused, true);
  assert.equal(escape.defaultPrevented, true, "marked as handled for the enclosing panel");
  assert.match(source("src/themes/ema/lib/settings.mjs"), /event\.defaultPrevented \|\| panel\.querySelector\('details\[open\]'\)/);
  cleanup();
});

test("a saved pause applies before first paint, and theme links load a new document", () => {
  const head = source("src/core/preferences/ColorModePreference.astro");
  assert.match(head, /is:inline define:vars=\{\{ storageKey: COLOR_MODE_STORAGE_KEY, motionKey: MOTION_STORAGE_KEY \}\}/);
  assert.match(head, /document\.documentElement\.dataset\.motionPaused = String\(/);
  assert.match(source("src/core/themes/ThemeSwitcher.astro"), /data-site-theme-target=\{theme\.id\} data-astro-reload/);
  assert.match(source("astro.config.mjs"), /prefetch: false/);
});

test("a quick pause and play never lets the pending suspend silence the radio", async () => {
  const timers = new Map();
  let next = 0;
  let context;
  const param = () => ({ value: 0, setValueAtTime() {}, setTargetAtTime() {}, cancelScheduledValues() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} });
  const node = () => ({ gain: param(), delayTime: param(), frequency: param(), connect() {}, start() {}, stop() {} });
  class FakeAudioContext extends EventTarget {
    state = "suspended"; currentTime = 0; destination = {};
    constructor() { super(); context = this; }
    createGain() { return node(); }
    createDelay() { return node(); }
    createOscillator() { return node(); }
    async resume() { this.state = "running"; }
    async suspend() { this.state = "suspended"; }
  }
  const win = {
    AudioContext: FakeAudioContext,
    setTimeout: (fn) => { timers.set(++next, fn); return next; }, clearTimeout: (id) => timers.delete(id),
    setInterval: () => 0, clearInterval() {},
  };
  const radio = getRadio(win);
  await radio.play();
  radio.pause();
  await radio.play();
  for (const fn of [...timers.values()]) fn();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(radio.playing, true);
  assert.equal(context.state, "running", "the suspend scheduled by pause() was cancelled by play()");
  // A system interruption (iOS) shows as paused instead of a silent "playing".
  context.state = "interrupted";
  context.dispatchEvent(new Event("statechange"));
  assert.equal(radio.playing, false);
});
