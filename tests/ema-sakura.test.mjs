import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { mountEmaSakura, sakuraDelay, SAKURA_DELAY } from "../src/themes/ema/lib/sakura.mjs";

// A stand-in for Sakura.js that records what the mount asks of it.
function fakeLibrary() {
  const made = [];
  function Sakura(selector, options) {
    this.selector = selector; this.settings = { ...options }; this.calls = ["start"];
    made.push(this);
  }
  Sakura.prototype.start = function () { this.calls.push("start"); };
  Sakura.prototype.stop = function () { this.calls.push("stop"); };
  return { Sakura, made };
}

function page({ home = true, phone = false, paused = false, reduced = false, layer = true, library = true } = {}) {
  const doc = new EventTarget();
  const media = new EventTarget();
  media.matches = phone;
  Object.assign(doc, {
    documentElement: { dataset: { motionPaused: String(paused) } },
    body: { hasAttribute: (name) => name === "data-ema-home" && home },
    querySelector: (selector) => (selector === ".ema-sakura" && layer ? {} : null),
  });
  const lib = fakeLibrary();
  const win = {
    matchMedia: (query) => (query.includes("reduced-motion") ? { matches: reduced } : media),
    ...(library ? { Sakura: lib.Sakura } : {}),
  };
  const motion = (value) => {
    doc.documentElement.dataset.motionPaused = String(value);
    doc.dispatchEvent(new Event("site:motion-change"));
  };
  return { doc, win, media, made: lib.made, motion };
}

test("Ema starts Sakura.js in its petal layer with the page's density", () => {
  const { doc, win, made } = page();
  const cleanup = mountEmaSakura(doc, win);
  assert.equal(made.length, 1);
  assert.equal(made[0].selector, ".ema-sakura");
  assert.equal(made[0].settings.delay, SAKURA_DELAY.home);
  assert.equal(made[0].settings.hideScrollbars, false);
  cleanup();
  assert.deepEqual(made[0].calls, ["start", "stop"]);
});

test("inner pages and phones drop petals less often than the desktop homepage", () => {
  assert.ok(sakuraDelay(false, false) > sakuraDelay(true, false));
  assert.ok(sakuraDelay(true, true) > sakuraDelay(true, false));
  assert.ok(sakuraDelay(false, true) > sakuraDelay(true, true));
  const { doc, win, made, media } = page({ home: false });
  mountEmaSakura(doc, win);
  assert.equal(made[0].settings.delay, SAKURA_DELAY.page);
  media.matches = true;
  media.dispatchEvent(new Event("change"));
  assert.equal(made[0].settings.delay, SAKURA_DELAY.phonePage);
});

test("the motion switch stops and restarts the petals without a second instance", () => {
  const { doc, win, made, motion } = page();
  const cleanup = mountEmaSakura(doc, win);
  motion(true);
  motion(true);
  motion(false);
  assert.equal(made.length, 1);
  assert.deepEqual(made[0].calls, ["start", "stop", "start"]);
  cleanup();
  motion(false);
  assert.deepEqual(made[0].calls, ["start", "stop", "start", "stop"]);
});

test("paused or reduced motion never starts the library", () => {
  for (const options of [{ paused: true }, { reduced: true }]) {
    const { doc, win, made } = page(options);
    mountEmaSakura(doc, win)();
    assert.equal(made.length, 0);
  }
});

test("pages without the layer or without the script do nothing", () => {
  for (const options of [{ layer: false }, { library: false }]) {
    const { doc, win } = page(options);
    assert.equal(mountEmaSakura(doc, win), undefined);
  }
});

test("the layout loads the pinned library, its stylesheet and an empty layer", () => {
  const layout = readFileSync(new URL("../src/themes/ema/layouts/EmaLayout.astro", import.meta.url), "utf8");
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  assert.equal(pkg.dependencies["sakura-js"], "1.2.0");
  assert.match(layout, /import "sakura-js\/dist\/sakura\.min\.css";/);
  assert.match(layout, /<script is:inline defer src=\{sakuraScript\}><\/script>/);
  assert.match(layout, /<div class="ema-sakura" aria-hidden="true"><\/div>/);
  const credits = readFileSync(new URL("../src/themes/blank/pages/CreditsPage.astro", import.meta.url), "utf8");
  assert.match(credits, /sakura-js-MIT\.txt/);
});
