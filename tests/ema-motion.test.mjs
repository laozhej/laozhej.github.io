import test from "node:test";
import assert from "node:assert/strict";
import { mountEmaHome } from "../src/themes/ema/lib/home.mjs";
import { getRadio, TRACKS } from "../src/themes/ema/lib/radio.mjs";

// Records every listener so a test can prove what the homepage never listens to.
function element(extra = {}) {
  const target = new EventTarget();
  const types = [];
  const add = target.addEventListener.bind(target);
  target.addEventListener = (type, ...rest) => { types.push(type); add(type, ...rest); };
  return Object.assign(target, {
    listenerTypes: types,
    dataset: {}, style: {}, attributes: {}, hidden: false,
    setAttribute(key, value) { this.attributes[key] = String(value); },
    getAttribute(key) { return this.attributes[key] ?? null; },
    removeAttribute(key) { delete this.attributes[key]; },
    contains() { return false; },
  }, extra);
}

function page({ paused = false, reduced = false, desktop = true, sections = { works: 100, games: 300, journal: 700, tags: 1200 }, chips = 20, limit = 14 } = {}) {
  const animations = [], observers = [], frames = new Map();
  const animated = (extra = {}) => element({ ...extra, animate(keyframes, options) {
    const animation = { keyframes, options, cancelled: false, finished: new Promise(() => {}), cancel() { this.cancelled = true; } };
    animations.push(animation); return animation;
  } });
  const front = element({ dataset: { parallaxLayer: "front" } });
  const back = element({ dataset: { parallaxLayer: "back" } });
  const heroStyle = { props: {}, setProperty(key, value) { this.props[key] = value; } };
  const hero = element({ style: heroStyle, getBoundingClientRect: () => ({ top: 0, bottom: 900, left: 0, width: 1000, height: 900 }) });
  const group = animated();
  const targets = Object.fromEntries(Object.entries(sections).map(([id, top]) => [`#${id}`, element({ getBoundingClientRect: () => ({ top: top - (win?.scrollY ?? 0) }) })]));
  const links = Object.keys(targets).map((href) => element({ attributes: { href } }));
  const items = Array.from({ length: chips }, () => animated());
  const label = element();
  const toggle = element({ dataset: { open: "Show less", closed: "Show {n} more" }, hidden: true, querySelector: () => label });
  const tagGroup = element({ dataset: { limit: String(limit) }, querySelector: (s) => (s === "[data-tag-toggle]" ? toggle : null), querySelectorAll: () => items });
  const drop = element({ hidden: true });
  const single = new Map([["[data-hero]", hero], ["[data-tags-drop]", drop], ...Object.entries(targets)]);
  const lists = { "[data-parallax-layer]": [front, back], "[data-ema-reveal]": [group], ".chapters a": links, "[data-tag-group]": [tagGroup], "[data-tag-group] .chips li": items };
  const root = element({ querySelector: (s) => single.get(s) ?? null, querySelectorAll: (s) => lists[s] ?? [] });
  const doc = element({
    documentElement: element({ dataset: { motionPaused: String(paused || reduced) }, scrollHeight: 5000 }),
    getElementById: () => root, querySelector: () => null,
  });
  const system = element({ matches: reduced });
  const otherMedia = element({ matches: desktop });
  var win = element({
    scrollY: 0, innerHeight: 900,
    matchMedia: (query) => (query.includes("prefers-reduced-motion") ? system : otherMedia),
    localStorage: { getItem: () => String(paused) },
    setTimeout: () => 1, clearTimeout() {},
    requestAnimationFrame: (fn) => { const id = frames.size + 1 + Math.random(); frames.set(id, fn); return id; },
    cancelAnimationFrame: (id) => frames.delete(id),
    IntersectionObserver: class {
      constructor(callback) { this.callback = callback; this.disconnected = false; observers.push(this); }
      observe() {} unobserve() {}
      disconnect() { this.disconnected = true; }
    },
  });
  const cleanup = mountEmaHome(doc, win);
  const changeMotion = (userPaused) => {
    doc.documentElement.dataset.motionPaused = String(userPaused || system.matches);
    doc.dispatchEvent(new CustomEvent("site:motion-change", { detail: { paused: userPaused || system.matches, userPaused, reduced: system.matches } }));
  };
  // Runs queued animation frames (the pointer spring and scroll updates) until none are left.
  const flush = (limitFrames = 400) => {
    let now = 0;
    while (frames.size && limitFrames--) {
      const [id, fn] = frames.entries().next().value;
      frames.delete(id); now += 16; fn(now);
    }
  };
  const point = (clientX, clientY, pointerType = "mouse") => {
    hero.dispatchEvent(Object.assign(new Event("pointermove"), { clientX, clientY, pointerType }));
    flush();
  };
  const scrollTo = (y) => { win.scrollY = y; win.dispatchEvent(new Event("scroll")); flush(); };
  return { root, doc, win, hero, heroStyle, front, back, group, links, items, toggle, label, drop, animations, observers, frames, cleanup, changeMotion, flush, point, scrollTo, system };
}
const current = (p) => p.links.findIndex((link) => link.attributes["aria-current"] === "true");

test("pointer depth moves the picture and the echo word, never the heading, and follows the shared motion preference", () => {
  const p = page();
  assert.equal(p.front.style.transform, "translate3d(0.00px,0.00px,0)");
  p.point(1000, 450);
  assert.match(p.front.style.transform, /^translate3d\([1-9]\.\d\dpx,0\.00px,0\)$/, "the picture follows the pointer to the right");
  assert.match(p.back.style.transform, /^translate3d\(-[1-9]\.\d\dpx,/, "the echo word drifts the other way");
  assert.ok(Number(p.heroStyle.props["--px"]) > .9, "only the heading's shadow takes the offset");
  assert.equal(p.hero.style.transform, undefined, "the heading block itself is never transformed");
  p.changeMotion(true);
  assert.equal(p.root.dataset.paused, "true");
  assert.equal(p.front.style.transform, "");
  assert.equal(p.heroStyle.props["--px"], "0");
  p.changeMotion(false);
  assert.equal(p.root.dataset.paused, "false");
  p.cleanup();
});

test("touch, small screens, reduced motion and pause keep the opening still", () => {
  for (const config of [{ desktop: false }, { reduced: true }, { paused: true }]) {
    const p = page(config);
    p.point(1000, 450);
    p.scrollTo(300);
    assert.equal(p.front.style.transform, "");
    assert.equal(p.back.style.transform, "");
    p.cleanup();
  }
  const touch = page();
  touch.point(1000, 450, "touch");
  assert.equal(touch.front.style.transform, "translate3d(0.00px,0.00px,0)");
  touch.cleanup();
});

test("the first 420px of scrolling lift the picture and settle the echo word, then stop", () => {
  const p = page();
  p.scrollTo(210);
  assert.equal(p.front.style.transform, "translate3d(0.00px,-3.00px,0)");
  assert.equal(p.back.style.transform, "translate3d(0.00px,4.00px,0)");
  p.scrollTo(2000);
  assert.equal(p.front.style.transform, "translate3d(0.00px,-6.00px,0)");
  p.cleanup();
});

test("the homepage scrolls natively: it never listens to, captures or cancels a wheel", () => {
  const p = page();
  const wheel = new Event("wheel", { cancelable: true });
  p.win.dispatchEvent(wheel);
  p.doc.dispatchEvent(wheel);
  assert.equal(wheel.defaultPrevented, false);
  for (const target of [p.win, p.doc, p.root, p.hero]) assert.equal(target.listenerTypes.includes("wheel"), false);
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

test("the chapter index marks the section whose top has passed 42% of the window, and the last at the bottom", () => {
  const p = page();
  assert.equal(current(p), 1, "works and games have passed the line at 378px; journal has not");
  p.scrollTo(450);
  assert.equal(current(p), 2);
  p.scrollTo(4100);
  assert.equal(current(p), 3, "at the bottom of the page the last section is current");
  assert.equal(p.links.filter((link) => link.attributes["aria-current"]).length, 1);
  p.cleanup();
});

test("a long tag group shows its first chips and a toggle that names how many more there are", () => {
  const p = page({ chips: 20, limit: 14 });
  assert.equal(p.toggle.hidden, false);
  assert.deepEqual(p.items.map((item) => item.hidden), [...Array(14).fill(false), ...Array(6).fill(true)]);
  assert.equal(p.label.textContent, "Show 6 more");
  assert.equal(p.toggle.attributes["aria-expanded"], "false");
  p.toggle.dispatchEvent(new Event("click"));
  assert.equal(p.items.every((item) => !item.hidden), true);
  assert.equal(p.label.textContent, "Show less");
  assert.equal(p.toggle.attributes["aria-expanded"], "true");
  p.toggle.dispatchEvent(new Event("click"));
  assert.equal(p.items.filter((item) => item.hidden).length, 6);
  p.cleanup();
  const short = page({ chips: 10, limit: 14 });
  assert.equal(short.toggle.hidden, true, "a group within the limit keeps every chip and no toggle");
  assert.equal(short.items.some((item) => item.hidden), false);
  short.cleanup();
});

test("the tag drop plays once per press for the visible chips, and is withdrawn while motion is off", () => {
  const p = page({ chips: 20, limit: 14 });
  assert.equal(p.drop.hidden, false);
  p.drop.dispatchEvent(new Event("click"));
  assert.equal(p.animations.length, 14, "only the 14 chips in view fall");
  p.changeMotion(true);
  assert.equal(p.drop.hidden, true);
  assert.equal(p.animations.every((animation) => animation.cancelled), true);
  p.drop.dispatchEvent(new Event("click"));
  assert.equal(p.animations.length, 14, "a paused page plays nothing");
  p.cleanup();
});

function fakeAudio() {
  let audio;
  class Audio extends EventTarget {
    paused = true;
    ended = false;
    currentTime = 0;
    constructor() { super(); audio = this; }
    hasAttribute(name) { return Object.hasOwn(this, name); }
    removeAttribute(name) { delete this[name]; }
    load() { this.currentTime = 0; this.ended = false; }
    async play() { this.paused = false; }
    pause() { this.paused = true; }
    finish() {
      this.ended = true;
      this.paused = true;
      this.dispatchEvent(new Event("pause"));
      this.dispatchEvent(new Event("ended"));
    }
  }
  const timers = new Map();
  let id = 1;
  const win = {
    Audio,
    setTimeout: (fn) => { timers.set(id, fn); return id++; }, clearTimeout: (key) => timers.delete(key),
  };
  const radio = getRadio(win);
  return { win, radio, audio, timers };
}

test("Sakura Radio starts with Omoide, followed by Hoshi and Shanghai Teahouse", () => {
  const { radio, audio } = fakeAudio();
  assert.deepEqual(TRACKS.map(({ id }) => id), ["omoide", "hoshi", "shanghai"]);
  assert.equal(radio.index, 0);
  assert.equal(radio.duration, TRACKS[0].duration);
  assert.equal(audio.preload, "none");
  radio.select(1);
  assert.equal(audio.src, undefined, "selecting while paused does not fetch a track");
});

test("the radio cycles through the tracks and pauses after the last Ema page lets go", async () => {
  const { win, radio, audio, timers } = fakeAudio();
  assert.equal(getRadio(win), radio, "one engine per window survives page swaps");
  radio.hold();
  await radio.play();
  assert.equal(radio.playing, true);
  assert.equal(audio.src, TRACKS[0].src);
  radio.select(radio.index + 1);
  assert.equal(radio.index, 1);
  assert.equal(audio.src, TRACKS[1].src);
  radio.select(-1);
  assert.equal(radio.index, TRACKS.length - 1, "wraps around");
  radio.release();
  radio.hold();
  [...timers.values()].forEach((fn) => fn());
  assert.equal(radio.playing, true, "a new Ema page mounting in time keeps the tune going");
  radio.release();
  audio.finish();
  assert.equal(radio.index, 0, "the last track automatically leads back to Omoide");
  assert.equal(audio.src, TRACKS[0].src);
  const pending = [...timers.entries()];
  pending.forEach(([key, fn]) => { timers.delete(key); fn(); });
  assert.equal(radio.playing, false, "leaving Ema stops the radio");
});

test("the radio seeks within the track, keeping a seek made before the track has loaded", async () => {
  const { radio, audio } = fakeAudio();
  radio.seek(42);
  assert.equal(radio.position(), 42, "the chosen position shows before anything loads");
  assert.equal(audio.src, undefined, "seeking while paused does not fetch the track");
  await radio.play();
  audio.readyState = 1;
  audio.duration = TRACKS[0].duration;
  audio.dispatchEvent(new Event("loadedmetadata"));
  assert.equal(audio.currentTime, 42, "the kept position is applied once metadata arrives");
  radio.seek(10);
  assert.equal(audio.currentTime, 10, "a loaded track seeks at once");
  radio.seek(-5);
  assert.equal(audio.currentTime, 0);
  radio.seek(1e6);
  assert.equal(audio.currentTime, TRACKS[0].duration, "clamped to the track's length");
  radio.seek(30);
  radio.select(1);
  assert.equal(radio.position(), 0, "a new track starts from the top");
});
