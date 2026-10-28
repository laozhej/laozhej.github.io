import test from "node:test";
import assert from "node:assert/strict";
import { mountEmaHome } from "../src/themes/ema/lib/home.mjs";
import { mountTagRain } from "../src/themes/ema/lib/tag-rain.mjs";
import { mountEmaMascot, MASCOT_HIDDEN_KEY } from "../src/themes/ema/lib/mascot.mjs";
import { getRadio, TRACKS, trackLength } from "../src/themes/ema/lib/radio.mjs";

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
  const heroStyle = { props: {}, setProperty(key, value) { this.props[key] = value; }, removeProperty(key) { delete this.props[key]; } };
  const docked = new Set();
  const hero = element({
    style: heroStyle,
    classList: { toggle: (name, on) => (on ? docked.add(name) : docked.delete(name)), remove: name => docked.delete(name) },
    getBoundingClientRect: () => ({ top: 0, bottom: 900, left: 0, width: 1000, height: 900 }),
  });
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
  const selectors = new Map([["[data-hero-scene]", scene], ["[data-hero]", hero]]);
  if (withRail) { selectors.set("[data-rail]", rail); selectors.set("[data-rail-stage]", stage); selectors.set("[data-rail-track]", track); }
  const root = element({
    querySelector: selector => selectors.get(selector) ?? null,
    querySelectorAll: selector => ({ "[data-parallax-layer]": [front, back], "[data-ema-reveal]": [group] }[selector] ?? []),
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
  return { root, doc, win, scene, hero, docked, front, back, group, animations, observers, frames, cleanup, changeMotion, system, heightWrites };
}

test("native scroll drives the pinned opening and resets when the shared motion preference changes", () => {
  const p = page();
  assert.equal(p.scene.dataset.sceneActive, "true");
  // 200px into a 560px runway: the title steps back while the profile card rises.
  assert.match(p.front.style.transform, /12\.86px/);
  assert.match(p.back.style.transform, /-8\.57px/);
  assert.equal(p.hero.style.props["--copy-out"], "0.881");
  assert.equal(p.hero.style.props["--profile-in"], "0.472");
  assert.equal(p.docked.has("is-docked"), false);
  p.changeMotion(true);
  assert.equal(p.root.dataset.paused, "true");
  assert.equal(p.scene.dataset.sceneActive, "false");
  assert.equal(p.front.style.transform, "");
  assert.equal(p.hero.style.props["--profile-in"], undefined);
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

function rainScene({ width = 375, height = 900, widths = [96, 260, 140, 72, 180, 120, 88, 150, 110, 210, 64, 130] } = {}) {
  const node = (extra = {}) => ({
    style: {}, children: [], classes: new Set(),
    classList: { add(name) { node.owner(this).classes.add(name); }, remove(name) { node.owner(this).classes.delete(name); } },
    setAttribute() {}, remove() { this.removed = true; },
    appendChild(child) { this.children.push(child); return child; },
    append(child) { this.children.push(child); },
    ...extra,
  });
  node.owner = (classList) => [list, section].find((item) => item.classList === classList);
  const tags = widths.map((w) => node({ offsetWidth: w, offsetHeight: 36 }));
  const list = node({ querySelectorAll: () => tags });
  const section = node({ clientWidth: width, clientHeight: height, querySelector: () => list });
  const frames = [];
  const doc = { createElement: () => node({ offsetWidth: 36, offsetHeight: 36 }) };
  const win = { requestAnimationFrame: (fn) => frames.push(fn), cancelAnimationFrame() { frames.length = 0; } };
  let allowed = true;
  const rain = mountTagRain(section, doc, win, { canAnimate: () => allowed });
  const run = (limit = 4000) => {
    let now = 0;
    for (let step = 0; step < limit && frames.length; step += 1) { now += 16; frames.shift()(now); }
    return frames.length;
  };
  return { rain, section, list, tags, run, setAllowed: (value) => { allowed = value; } };
}

const placement = (element, size) => {
  const [, x, y, angle] = element.style.transform.match(/translate3d\(([-\d.]+)px,([-\d.]+)px,0\) rotate\(([-\d.]+)rad\)/).map(Number);
  return { x, y, angle, ...size };
};

test("tag rain waits for the scene, then every tag comes to rest inside it", () => {
  const p = rainScene();
  p.rain.visibility(.1, 200);
  assert.equal(p.list.classes.has("is-raining"), false);
  p.rain.visibility(.4, 0);
  assert.equal(p.list.classes.has("is-raining"), true);
  assert.equal(p.section.style.minHeight, "996px", "narrow scenes keep the static height plus a little floor");
  assert.equal(p.run(), 0, "the animation finishes and stops requesting frames");
  for (const tag of p.tags) {
    const body = placement(tag, { w: tag.offsetWidth, h: tag.offsetHeight });
    assert.ok(body.x >= 0 && body.x + body.w <= 375, `inside the walls: ${body.x}`);
    assert.ok(body.y + body.h / 2 <= 996, `above the floor: ${body.y}`);
    assert.ok(body.y > -40, `not left hanging above the scene: ${body.y}`);
    assert.ok(Math.abs(body.angle) <= .35, `tilted at most ~20°: ${body.angle}`);
  }
});

test("pausing mid-rain restores the ordinary tag list, and scrolling back up replays it", () => {
  const p = rainScene();
  p.rain.visibility(.6, 0);
  p.run(20);
  p.setAllowed(false);
  p.rain.refresh();
  assert.equal(p.list.classes.has("is-raining"), false);
  assert.equal(p.section.style.minHeight, "");
  assert.ok(p.tags.every((tag) => tag.style.transform === ""));
  p.setAllowed(true);
  p.rain.refresh();
  assert.equal(p.list.classes.has("is-raining"), true);
  p.run();
  p.rain.visibility(0, 900);
  assert.equal(p.list.classes.has("is-raining"), false, "leaving below the viewport resets for the next pass");
  p.rain.cleanup();
});

function mascotPage({ hidden = null } = {}) {
  const store = new Map(hidden ? [[MASCOT_HIDDEN_KEY, hidden]] : []);
  const session = new Map();
  const el = (extra = {}) => Object.assign(new EventTarget(), { hidden: false, dataset: {}, focus() { focused = this; }, classList: { add() {}, remove() {} } }, extra);
  let focused = null;
  const bubble = el({ hidden: true });
  const figure = el(), hide = el();
  const root = el({
    hidden: true,
    dataset: { pokes: JSON.stringify(["a", "b", "c"]), greetings: JSON.stringify(["m", "n", "e", "z"]), pageLine: "page", back: "back", copy: "copy", tooFast: "slow" },
    querySelector: (selector) => ({ "[data-mascot-bubble]": bubble, "[data-mascot-poke]": figure, "[data-mascot-hide]": hide })[selector],
  });
  const recall = el({ hidden: true });
  const doc = Object.assign(new EventTarget(), {
    hidden: false, documentElement: { dataset: { motionPaused: "true" } },
    querySelector: (selector) => ({ "[data-ema-mascot]": root, "[data-mascot-show]": recall })[selector],
  });
  const timers = new Map();
  let next = 1;
  const win = {
    localStorage: { getItem: (key) => store.get(key) ?? null, setItem: (key, value) => store.set(key, value), removeItem: (key) => store.delete(key) },
    sessionStorage: { getItem: (key) => session.get(key) ?? null, setItem: (key, value) => session.set(key, value), removeItem: (key) => session.delete(key) },
    setTimeout: (fn) => { timers.set(next, fn); return next++; },
    clearTimeout: (id) => timers.delete(id),
  };
  const cleanup = mountEmaMascot(doc, win);
  return { root, recall, bubble, figure, hide, doc, store, timers, cleanup, focused: () => focused };
}

test("the corner guide answers pokes and copies, and asks for a break after rapid pokes", () => {
  const p = mascotPage();
  assert.equal(p.root.hidden, false);
  assert.equal(p.recall.hidden, true);
  p.figure.dispatchEvent(new Event("click"));
  assert.equal(p.bubble.hidden, false);
  assert.ok(["a", "b", "c"].includes(p.bubble.textContent));
  for (let poke = 0; poke < 3; poke += 1) p.figure.dispatchEvent(new Event("click"));
  assert.equal(p.bubble.textContent, "slow");
  p.doc.dispatchEvent(new Event("copy"));
  assert.equal(p.bubble.textContent, "copy");
  p.cleanup();
  assert.equal(p.timers.size, 0, "cleanup cancels every pending line");
  assert.equal(p.bubble.hidden, true);
});

test("sending the guide to rest is remembered, and calling her back restores her", () => {
  const p = mascotPage();
  p.hide.dispatchEvent(new Event("click"));
  assert.equal(p.root.hidden, true);
  assert.equal(p.recall.hidden, false);
  assert.equal(p.store.get(MASCOT_HIDDEN_KEY), "true");
  assert.equal(p.focused(), p.recall);
  p.cleanup();
  const again = mascotPage({ hidden: "true" });
  assert.equal(again.root.hidden, true, "stays away on the next page");
  again.recall.dispatchEvent(new Event("click"));
  assert.equal(again.root.hidden, false);
  assert.equal(again.store.has(MASCOT_HIDDEN_KEY), false);
  assert.equal(again.bubble.textContent, "back");
  again.cleanup();
});

function fakeAudio() {
  const started = [];
  const param = () => ({ value: 0, setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {}, setTargetAtTime() {}, cancelScheduledValues() {} });
  const node = (extra = {}) => ({ connect() {}, ...extra });
  class Context {
    constructor() { this.currentTime = 0; this.state = "running"; this.destination = node(); }
    createGain() { return node({ gain: param() }); }
    createDelay() { return node({ delayTime: param() }); }
    createOscillator() { return node({ type: "sine", frequency: param(), start: (time) => started.push(time), stop() {} }); }
    resume() { this.state = "running"; return Promise.resolve(); }
    suspend() { this.state = "suspended"; }
  }
  const timers = new Map();
  let id = 1;
  const win = {
    AudioContext: Context,
    setInterval: (fn) => { timers.set(id, fn); return id++; }, clearInterval: (key) => timers.delete(key),
    setTimeout: (fn) => { timers.set(id, fn); return id++; }, clearTimeout: (key) => timers.delete(key),
  };
  return { win, started, timers };
}

test("every Sakura Radio tune is eight full bars with a chord per bar", () => {
  for (const track of TRACKS) {
    assert.equal(track.steps.length, 64);
    assert.equal(track.chordNotes.length, 8);
    assert.ok(track.steps.every((note) => note === null || (note >= 55 && note <= 90)), "melody stays in a music-box range");
    assert.ok(trackLength(track) >= 20 && trackLength(track) <= 30, "each loop lasts 20–30 seconds");
  }
});

test("the radio plays, pauses, switches tunes and stops after the last Ema page lets go", async () => {
  const { win, started, timers } = fakeAudio();
  const radio = getRadio(win);
  assert.equal(getRadio(win), radio, "one engine per window survives page swaps");
  radio.hold();
  await radio.play();
  assert.equal(radio.playing, true);
  assert.ok(started.length > 0, "notes are scheduled ahead of time");
  radio.select(radio.index + 1);
  assert.equal(radio.index, 1);
  radio.select(-1);
  assert.equal(radio.index, TRACKS.length - 1, "wraps around");
  radio.release();
  radio.hold();
  [...timers.values()].forEach((fn) => fn());
  assert.equal(radio.playing, true, "a new Ema page mounting in time keeps the tune going");
  radio.release();
  const pending = [...timers.entries()];
  pending.forEach(([key, fn]) => { timers.delete(key); fn(); });
  assert.equal(radio.playing, false, "leaving Ema stops the radio");
  delete win.__emaRadio;
});
