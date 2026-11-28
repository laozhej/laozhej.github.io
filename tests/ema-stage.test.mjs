import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stageProgress, springStep, layerOffsets, PULL_DISTANCE, DOCK_THRESHOLD } from "../src/themes/ema/lib/stage.mjs";
import { nearestIndex } from "../src/themes/ema/lib/rail.mjs";
import { stepBody, stepPile } from "../src/themes/ema/lib/tag-rain-physics.mjs";
import { mountTagRain, RAIN_INTRO_MS } from "../src/themes/ema/lib/tag-rain.mjs";
import { mountEmaSettings } from "../src/themes/ema/lib/settings.mjs";

test("the stage pull follows the reference curve: copy fades as the card rises, then the card docks", () => {
  const rest = stageProgress(0);
  assert.deepEqual([rest.avatarY, rest.avatarScale, rest.profileOpacity, rest.copyOpacity, rest.cueOpacity], [56, 0.78, 0, 1, 1]);
  const docked = stageProgress(1);
  assert.deepEqual([docked.avatarY, docked.avatarScale, docked.profileOpacity, docked.copyOpacity, docked.cueOpacity], [0, 1, 1, 0, 0]);
  assert.equal(stageProgress(2).avatarY, 0, "progress is clamped");
  assert.equal(PULL_DISTANCE, 260);
  assert.equal(DOCK_THRESHOLD, 0.56);
  const half = stageProgress(0.5);
  assert.ok(half.profileOpacity > 0 && half.profileOpacity < 1);
  assert.ok(half.copyOpacity > 0 && half.copyOpacity < 1);
});

test("the pointer spring settles on its target and stays within bounds after a long frame", () => {
  let position = 0, velocity = 0;
  for (let i = 0; i < 240; i++) ({ position, velocity } = springStep(position, velocity, 1, 1 / 60));
  assert.ok(Math.abs(position - 1) < 0.01);
  const jump = springStep(0, 0, 1, 5);
  assert.ok(Math.abs(jump.position) <= 1.08, "a slow frame is capped at 1/30 s");
});

test("depth moves the backdrop against the pointer and Ema with it, and scrolling separates them", () => {
  const { back, front } = layerOffsets(1, 1, 0);
  assert.ok(back.x < 0 && back.y < 0);
  assert.ok(front.x > 0 && front.y > 0);
  const scrolled = layerOffsets(0, 0, 1);
  assert.equal(scrolled.back.y, -5);
  assert.equal(scrolled.front.y, 8);
});

test("the chapter rail marks the leaf nearest the current travel", () => {
  assert.equal(nearestIndex([0, 300, 700, 1000], 0), 0);
  assert.equal(nearestIndex([0, 300, 700, 1000], 480), 1);
  assert.equal(nearestIndex([0, 300, 700, 1000], 900), 3);
});

test("falling tags come to rest on the floor and bounce off the side walls", () => {
  let body = { x: 50, y: 0, vx: 0, vy: 0, angle: 0, spin: 0.01, radius: 20, halfSpine: 0 };
  for (let i = 0; i < 400; i++) body = stepBody(body, 1, 400, 300);
  assert.equal(body.y, 280);
  assert.equal(body.vy, 0);
  let wall = { ...body, x: 395, y: 100, vx: 5, vy: 0 };
  wall = stepBody(wall, 1, 400, 300);
  assert.ok(wall.vx < 0 && wall.x <= 370);
});

test("a long rotating capsule has the same clearance at both walls, even after a pile collision", () => {
  const width = 760, floor = 320;
  const tag = { x: 0, y: 160, vx: -4, vy: 0, angle: 0.28, spin: 0.01, radius: 18, halfSpine: 105 };
  for (const side of [1, -1]) {
    const edge = side === 1 ? 0 : width;
    const outer = { ...tag, x: edge, vx: tag.vx * side };
    const inner = { ...tag, x: edge + 170 * side };
    stepPile([outer, inner], 1, width, floor);
    const reach = outer.radius + Math.abs(outer.halfSpine * Math.cos(outer.angle));
    assert.ok(Math.abs(Math.abs(outer.x - edge) - reach - 10) < 1e-8);
    assert.ok(outer.vx * side >= 0);
  }
});

test("the top pill rests on the ends of two lower pills", () => {
  const pill = { x: 160, y: 282, vx: 0, vy: 0, spin: 0, angle: 0, radius: 18, halfSpine: 70 };
  const bodies = [{ ...pill }, { ...pill, x: 370 }, { ...pill, x: 265, y: 24 }];
  for (let i = 0; i < 360; i++) stepPile(bodies, 1, 600, 300);
  assert.ok(Math.abs(bodies[2].y - (282 - 36 - 2)) < 1);
  assert.equal(bodies[2].x, 265);
  assert.equal(bodies[0].y, 282);
  assert.equal(bodies[1].y, 282);
});

function fakeSettings() {
  const listeners = new Map();
  const on = (target) => {
    target.addEventListener = (type, fn) => listeners.set(`${target.name}:${type}`, fn);
    target.removeEventListener = (type) => listeners.delete(`${target.name}:${type}`);
    return target;
  };
  const attrs = new Map();
  const first = { focused: false, focus() { this.focused = true; } };
  const panel = on({ name: "panel", hasAttribute: (n) => attrs.has(n), setAttribute: (n, v) => attrs.set(n, v), removeAttribute: (n) => attrs.delete(n), querySelectorAll: () => [], querySelector: (s) => (s === "details[open]" ? null : first), contains: (el) => el === first });
  const toggleAttrs = {};
  const toggle = on({ name: "toggle", hidden: true, focused: false, setAttribute: (n, v) => { toggleAttrs[n] = v; }, focus() { this.focused = true; }, contains: (el) => el === toggle });
  const header = { dataset: {}, querySelector: (s) => (s === "[data-ema-settings-toggle]" ? toggle : panel) };
  const doc = on({ name: "doc", querySelector: () => header });
  const wide = on({ name: "wide", matches: false });
  const win = { matchMedia: () => wide };
  return { listeners, attrs, toggle, toggleAttrs, header, doc, win, first };
}

test("narrow headers fold the controls behind one button that opens, closes on Escape and returns focus", () => {
  const f = fakeSettings();
  const cleanup = mountEmaSettings(f.doc, f.win);
  assert.equal(f.toggle.hidden, false);
  assert.ok("settingsReady" in f.header.dataset);
  f.listeners.get("toggle:click")();
  assert.ok(f.attrs.has("data-open"));
  assert.equal(f.toggleAttrs["aria-expanded"], "true");
  assert.ok(f.first.focused, "focus moves into the panel");
  f.listeners.get("doc:keydown")({ key: "Escape" });
  assert.ok(!f.attrs.has("data-open"));
  assert.equal(f.toggleAttrs["aria-expanded"], "false");
  assert.ok(f.toggle.focused, "focus returns to the button");
  cleanup();
  assert.equal(f.toggle.hidden, true);
  assert.ok(!("settingsReady" in f.header.dataset));
});

function fakeRainEnvironment() {
  let nextTimer = 1;
  const timers = new Map();
  let ioCallback = null;
  let ioOptions = null;
  const classes = new Set();
  const makeStyle = () => ({ transform: "", removeProperty(k) { if (k === "transform") this.transform = ""; } });
  const tags = Array.from({ length: 3 }, () => ({ offsetWidth: 80, offsetHeight: 36, style: makeStyle() }));
  const listeners = new Map();
  const again = {
    hidden: true,
    dataset: {},
    addEventListener(type, fn) { listeners.set(`again:${type}`, fn); },
    removeEventListener(type) { listeners.delete(`again:${type}`); },
  };
  const field = {
    clientWidth: 1000,
    clientHeight: 640,
    append() {},
    querySelectorAll(sel) { return sel === "[data-k-tags] li" ? tags : []; },
  };
  const stage = {
    classList: {
      add: (c) => classes.add(c),
      remove: (c) => classes.delete(c),
      has: (c) => classes.has(c),
    },
    querySelector(sel) {
      if (sel === "[data-k-rain]") return field;
      if (sel === "[data-k-rain-again]") return again;
      return null;
    },
  };
  const root = { querySelector: (sel) => (sel === "[data-k-signal]" ? stage : null) };
  const wide = {
    matches: true,
    addEventListener(type, fn) { listeners.set(`wide:${type}`, fn); },
    removeEventListener(type) { listeners.delete(`wide:${type}`); },
  };
  const win = {
    document: {
      hidden: false,
      createElement: () => ({ className: "", offsetWidth: 28, offsetHeight: 28, style: makeStyle(), setAttribute() {}, remove() {} }),
    },
    performance: { now: () => 0 },
    matchMedia: () => wide,
    requestAnimationFrame: () => 1,
    cancelAnimationFrame() {},
    setTimeout(fn, ms) {
      const id = nextTimer++;
      timers.set(id, { fn, ms });
      return id;
    },
    clearTimeout(id) { timers.delete(id); },
    IntersectionObserver: class {
      constructor(cb, opts) { ioCallback = cb; ioOptions = opts; }
      observe() {}
      disconnect() {}
    },
    ResizeObserver: class {
      observe() {}
      disconnect() {}
    },
  };
  return { root, win, again, classes, wide, timers, listeners, triggerInView: (v) => ioCallback?.([{ isIntersecting: v }]), getIoOptions: () => ioOptions };
}

test("the tag-rain replay button shows for 1s when capsules begin falling, hides afterwards, and restarts on click", () => {
  assert.equal(RAIN_INTRO_MS, 1000);
  const env = fakeRainEnvironment();
  let animate = true;
  const rain = mountTagRain(env.root, env.win, { canAnimate: () => animate });
  assert.equal(env.again.hidden, true);
  assert.equal(env.again.dataset.rainIntro, undefined);
  assert.equal(env.getIoOptions()?.threshold, 0.15);

  // Refresh while off-screen prepares the control in layout (hidden via CSS opacity until intro/hover).
  rain.refresh();
  assert.equal(env.again.hidden, false);
  assert.equal(env.again.dataset.rainIntro, undefined);
  assert.equal(env.timers.size, 0);

  env.triggerInView(true);
  assert.equal(env.again.hidden, false);
  assert.equal(env.again.dataset.rainIntro, "true");
  assert.equal(env.timers.size, 1);
  const [firstId, firstTimer] = [...env.timers.entries()][0];
  assert.equal(firstTimer.ms, 1000);

  // After 1s elapses, the intro marker is cleared so CSS hides the button until hover/focus.
  env.timers.delete(firstId);
  firstTimer.fn();
  assert.equal(env.again.hidden, false);
  assert.equal(env.again.dataset.rainIntro, undefined);

  // Clicking replay starts a fresh 1s reveal window and replaces any pending timer.
  env.listeners.get("again:click")();
  assert.equal(env.again.dataset.rainIntro, "true");
  assert.equal(env.timers.size, 1);
  const [secondId] = [...env.timers.entries()][0];
  env.listeners.get("again:click")();
  assert.ok(!env.timers.has(secondId), "earlier intro timer is cancelled on rapid replay");
  assert.equal(env.timers.size, 1);

  // Pausing motion hides the button and cancels the pending 1s timer.
  animate = false;
  rain.refresh();
  assert.equal(env.again.hidden, true);
  assert.equal(env.again.dataset.rainIntro, undefined);
  assert.equal(env.timers.size, 0);

  rain.cleanup();
});

test("stage.css keeps the replay pill tucked under the clock and hidden after the 1s intro unless hovered or focused", () => {
  const css = readFileSync(new URL("../src/themes/ema/styles/stage.css", import.meta.url), "utf8");
  const html = readFileSync(new URL("../src/themes/ema/pages/HomePage.astro", import.meta.url), "utf8");
  assert.match(html, /class="k-signal-side"[\s\S]*class="k-clock"[\s\S]*class="k-rain-again"/);
  assert.match(css, /@media \(hover: hover\) and \(pointer: fine\) \{\s*#ema-stage \.k-rain-again \{ opacity: 0;/);
  assert.match(css, /#ema-stage \.k-rain-again:is\(\[data-rain-intro="true"\], :hover, :focus-visible\) \{\s*opacity: 1;/);
});
