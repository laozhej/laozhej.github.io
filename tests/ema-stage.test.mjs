import test from "node:test";
import assert from "node:assert/strict";
import { stageProgress, springStep, layerOffsets, PULL_DISTANCE, DOCK_THRESHOLD } from "../src/themes/ema/lib/stage.mjs";
import { nearestIndex } from "../src/themes/ema/lib/rail.mjs";
import { stepBody } from "../src/themes/ema/lib/tag-rain.mjs";
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
  let body = { x: 50, y: 0, vx: 0, vy: 0, angle: 0, spin: 0.01, radius: 20 };
  for (let i = 0; i < 400; i++) body = stepBody(body, 1, 400, 300);
  assert.equal(body.y, 280);
  assert.equal(body.vy, 0);
  let wall = { x: 395, y: 100, vx: 5, vy: 0, angle: 0, spin: 0, radius: 20 };
  wall = stepBody(wall, 1, 400, 300);
  assert.ok(wall.vx < 0 && wall.x <= 370);
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
