import test from "node:test";
import assert from "node:assert/strict";
import { mountEmaScenes } from "../src/themes/ema/lib/scenes.mjs";

const settle = () => new Promise((resolve) => setImmediate(resolve));

// A 768px window over the real desktop geometry: the opening docks at 560,
// the rail pins from 1397 to 2546 and the next scene starts at 3263.
function scenes({ allowed = true, railMode = "scroll" } = {}) {
  const win = Object.assign(new EventTarget(), {
    scrollY: 0, innerHeight: 768, location: { hash: "" },
    matchMedia: () => ({ matches: true }),
    scrollTo({ top }) { this.scrollY = top; },
    getComputedStyle: () => ({ top: "127px", transform: "none" }),
    setTimeout: () => 1, clearTimeout() {},
  });
  const box = (docTop, offsetHeight, extra = {}) => Object.assign(new EventTarget(), {
    dataset: {}, offsetHeight, getBoundingClientRect: () => ({ top: docTop - win.scrollY }),
    querySelectorAll: () => [], ...extra,
  });
  const heroScene = box(0, 1328, { dataset: { sceneActive: "true" } });
  const hero = box(0, 768);
  const rail = box(1524, 1653, { dataset: { railMode } });
  const stage = box(1524, 504);
  const next = box(3263, 722);
  const cue = box(0, 40);
  const selectors = new Map([["[data-hero-scene]", heroScene], ["[data-hero]", hero], ["[data-rail]", rail],
    ["[data-rail-stage]", stage], ["[data-signal]", next], ["[data-scroll-cue]", cue]]);
  const root = { querySelector: (selector) => selectors.get(selector) ?? null };
  const classes = new Set();
  const cuts = [];
  const doc = Object.assign(new EventTarget(), {
    documentElement: { scrollHeight: 4786, classList: { add: (name) => classes.add(name), remove: (name) => classes.delete(name) } },
    body: { append(node) { this.node = node; } },
    querySelector: () => null,
    createElement: () => ({
      hidden: false, removed: false, setAttribute() {}, remove() { this.removed = true; },
      animate(frames, options) { const animation = { frames, options, finished: Promise.resolve(), cancel() {} }; cuts.push(animation); return animation; },
    }),
  });
  let time = 0;
  const wheel = (deltaY, gap = 400) => {
    time += gap;
    const event = new Event("wheel", { cancelable: true });
    Object.defineProperties(event, { deltaY: { value: deltaY }, deltaX: { value: 0 }, deltaMode: { value: 0 }, timeStamp: { value: time } });
    win.dispatchEvent(event);
    return event.defaultPrevented;
  };
  const handle = mountEmaScenes(root, doc, win, { canAnimate: () => allowed });
  return { win, doc, classes, cuts, wheel, handle, screen: () => doc.body.node };
}

test("wheel inside a pinned scene stays native", () => {
  const s = scenes();
  s.win.scrollY = 200;
  assert.equal(s.wheel(100), false);
  s.win.scrollY = 1800;
  assert.equal(s.wheel(-100), false);
  assert.equal(s.cuts.length, 0);
  s.handle.cleanup();
});

test("a wheel that would overrun the opening stops exactly where the card docks", () => {
  const s = scenes();
  s.win.scrollY = 500;
  assert.equal(s.wheel(120), true);
  assert.equal(s.win.scrollY, 560);
  assert.equal(s.cuts.length, 0);
  s.handle.cleanup();
});

test("the next wheel from a docked opening cuts straight to the pinned rail", async () => {
  const s = scenes();
  s.win.scrollY = 560;
  assert.equal(s.wheel(80), true);
  assert.equal(s.screen().hidden, false);
  assert.ok(s.classes.has("is-ema-scene-cut"));
  await settle();
  assert.equal(s.win.scrollY, 1397);
  assert.equal(s.screen().hidden, true);
  assert.equal(s.classes.has("is-ema-scene-cut"), false);
  // The tail of the same gesture does not run on through the rail ...
  assert.equal(s.wheel(60, 30), true);
  assert.equal(s.win.scrollY, 1397);
  // ... but a fresh gesture scrolls it natively.
  assert.equal(s.wheel(60, 400), false);
  s.handle.cleanup();
});

test("landing between two scenes is covered toward the direction of travel", async () => {
  const s = scenes();
  s.win.scrollY = 2900;
  assert.equal(s.wheel(-90), true);
  await settle();
  assert.equal(s.win.scrollY, 2546);
  s.win.scrollY = 2900;
  assert.equal(s.wheel(90), true);
  await settle();
  assert.equal(s.win.scrollY, 3263);
  s.handle.cleanup();
});

test("paused motion or a native rail never capture the wheel", () => {
  for (const config of [{ allowed: false }, { railMode: "native" }]) {
    const s = scenes(config);
    s.win.scrollY = 560;
    assert.equal(s.wheel(80), false);
    s.win.scrollY = 900;
    assert.equal(s.wheel(80), false);
    assert.equal(s.cuts.length, 0);
    s.handle.cleanup();
  }
});

test("cleanup removes the cover and stops listening", () => {
  const s = scenes();
  s.handle.cleanup();
  assert.equal(s.screen().removed, true);
  s.win.scrollY = 560;
  assert.equal(s.wheel(80), false);
});
