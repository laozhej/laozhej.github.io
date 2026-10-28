import test from "node:test";
import assert from "node:assert/strict";
import { mountEmaHome } from "../src/themes/ema/lib/home.mjs";

function element(extra = {}) {
  return Object.assign(new EventTarget(), {
    dataset: {}, style: {}, attributes: {}, hidden: false,
    setAttribute(key, value) { this.attributes[key] = value; },
    contains() { return false; },
  }, extra);
}

function page({ paused = false, reduced = false, desktop = true, withRail = false } = {}) {
  const animations = [], observers = [], frames = new Map();
  const scene = element({ getBoundingClientRect: () => ({ top: -200 }) });
  const front = element({ dataset: { parallaxLayer: "front" } });
  const back = element({ dataset: { parallaxLayer: "back" } });
  const copy = element(), title = element(), photo = element();
  const revealItem = element({ animate(keyframes, options) {
    const animation = { keyframes, options, cancelled: false, finished: new Promise(() => {}), cancel() { this.cancelled = true; } };
    animations.push(animation); return animation;
  } });
  const group = element({ querySelectorAll: () => [revealItem] });
  const heightWrites = [];
  const rail = element({ getBoundingClientRect: () => ({ top: 1000, height: 1000 }) });
  Object.defineProperty(rail.style, 'height', { set: value => heightWrites.push(value), get: () => heightWrites.at(-1) ?? '' });
  const stage = element({ clientWidth: 1000, getBoundingClientRect: () => ({ top: 1000, height: 400 }) });
  const track = element({ clientWidth: 1000, scrollWidth: 1600, scrollLeft: 0, tabIndex: 0 });
  const command = element({ dataset: { command: "hello", commandText: "Hello", commandResult: "Welcome" } });
  const selectors = new Map([
    ["[data-hero-scene]", scene], [".hero-copy", copy], [".hero h1", title], [".shiroha-polaroid", photo],
  ]);
  if (withRail) { selectors.set("[data-rail]", rail); selectors.set("[data-rail-stage]", stage); selectors.set("[data-rail-track]", track); }
  const root = element({
    querySelector: selector => selectors.get(selector) ?? null,
    querySelectorAll: selector => ({ "[data-command]": [command], "[data-parallax-layer]": [front, back], "[data-ema-reveal]": [group] }[selector] ?? []),
  });
  const doc = element({
    documentElement: element({ dataset: { motionPaused: String(paused || reduced) } }),
    getElementById: () => root, querySelector: () => null,
  });
  const system = element({ matches: reduced });
  const otherMedia = element({ matches: desktop });
  const win = element({
    scrollY: 200, innerHeight: 900,
    matchMedia: query => query.includes("prefers-reduced-motion") ? system : otherMedia,
    localStorage: { getItem: () => String(paused) },
    setTimeout: () => 1, clearTimeout() {},
    requestAnimationFrame: fn => { const id = frames.size + 1; frames.set(id, fn); return id; },
    cancelAnimationFrame: id => frames.delete(id),
    IntersectionObserver: class {
      constructor(callback) { this.callback = callback; this.disconnected = false; observers.push(this); }
      observe() {} unobserve() {}
      disconnect() { this.disconnected = true; }
    },
  });
  const cleanup = mountEmaHome(doc, win);
  const changeMotion = userPaused => {
    doc.documentElement.dataset.motionPaused = String(userPaused || system.matches);
    doc.dispatchEvent(new CustomEvent("site:motion-change", { detail: { paused: userPaused || system.matches, userPaused, reduced: system.matches } }));
  };
  return { root, doc, win, scene, front, back, copy, title, photo, group, animations, observers, frames, cleanup, changeMotion, system, heightWrites };
}

test("native scroll layers stop and reset when the shared motion preference changes", () => {
  const p = page();
  assert.equal(p.scene.dataset.sceneActive, "true");
  assert.match(p.front.style.transform, /46\.00px/);
  assert.match(p.back.style.transform, /-28\.00px/);
  assert.notEqual(p.copy.style.transform, "");
  p.changeMotion(true);
  assert.equal(p.root.dataset.paused, "true");
  assert.equal(p.scene.dataset.sceneActive, "false");
  assert.equal(p.front.style.transform, "");
  assert.equal(p.title.style.opacity, "");
  p.changeMotion(false);
  assert.equal(p.scene.dataset.sceneActive, "true");
  assert.equal(p.root.dataset.paused, "false");
  p.cleanup();
});

test("touch and reduced motion keep the hero in normal document flow", () => {
  for (const config of [{ desktop: false }, { reduced: true }, { paused: true }]) {
    const p = page(config);
    assert.equal(p.scene.dataset.sceneActive, "false");
    assert.equal(p.front.style.transform, "");
    p.cleanup();
  }
});

test("wheel gestures are never captured or cancelled by the homepage", () => {
  const p = page();
  const wheel = new Event("wheel", { cancelable: true });
  p.win.dispatchEvent(wheel);
  assert.equal(wheel.defaultPrevented, false);
  p.cleanup();
});

test("section entrances play once and shared pause cancels active animations", () => {
  const p = page();
  const observer = p.observers[0];
  observer.callback([{ target: p.group, isIntersecting: true }]);
  observer.callback([{ target: p.group, isIntersecting: true }]);
  assert.equal(p.animations.length, 1);
  p.changeMotion(true);
  assert.equal(p.animations[0].cancelled, true);
  p.cleanup();
  assert.equal(observer.disconnected, true);
  assert.equal(p.frames.size, 0);
  assert.equal(p.win.__emaHomeCleanup, undefined);
});

test("a paused entry remains visible and does not replay when resumed", () => {
  const p = page({ paused: true });
  p.observers[0].callback([{ target: p.group, isIntersecting: true }]);
  assert.equal(p.animations.length, 0);
  p.changeMotion(false);
  p.observers[0].callback([{ target: p.group, isIntersecting: true }]);
  assert.equal(p.animations.length, 0);
  p.cleanup();
});


test("remeasuring a scrolling chapter rail never collapses its existing runway", () => {
  const p = page({ withRail: true });
  assert.equal(p.heightWrites.at(-1), "1000px");
  p.heightWrites.length = 0;
  for (const [id, frame] of [...p.frames]) { p.frames.delete(id); frame(); }
  p.win.dispatchEvent(new Event("resize"));
  for (const [id, frame] of [...p.frames]) { p.frames.delete(id); frame(); }
  assert.ok(p.heightWrites.length > 0);
  assert.equal(p.heightWrites.includes(""), false);
  assert.equal(p.heightWrites.at(-1), "1000px");
  p.cleanup();
});
