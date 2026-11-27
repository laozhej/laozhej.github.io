import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { mountColorModeReveal, revealRadius } from "../src/core/preferences/color-mode-reveal.mjs";
import { BLANK_REVEAL_TARGETS, revealDelay } from "../src/themes/blank/lib/reveal.mjs";

// Motion added to Blank and Ema on 2026-11-27 at the owner's request ("补动态效果，增加并优化"): the circular
// light/dark reveal, the homepage's first-visit entrance, Blank's scroll reveal and hover underlines, and Ema's
// contents-leaf lift. These tests keep it out of Endfield and Arknights and keep it still when motion is off.
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const blankMotion = read("src/themes/blank/styles/motion.css");
const emaTheme = read("src/themes/ema/styles/theme.css");
const emaStage = read("src/themes/ema/styles/stage.css");
const rules = (css) => css.replace(/\/\*[\s\S]*?\*\//g, "").split("\n").map((line) => line.trim()).filter((line) => line.includes("{") && !line.startsWith("@"));

test("reveal radius reaches the farthest corner of the window", () => {
  assert.equal(revealRadius(0, 0, 300, 400), 500);
  assert.equal(revealRadius(300, 400, 300, 400), 500);
  assert.equal(revealRadius(150, 200, 300, 400), 250);
});

test("scroll reveal: one batch starts 60ms apart and within 240ms", () => {
  assert.deepEqual([0, 1, 2, 3, 4, 9].map((n) => revealDelay(n)), [0, 60, 120, 180, 240, 240]);
  assert.match(BLANK_REVEAL_TARGETS, /\.blank-post-list > li/);
});

test("Blank's motion styles stay inside Blank", () => {
  for (const line of rules(blankMotion)) assert.ok(line.startsWith('html[data-theme="blank"]'), `reaches other themes: ${line.slice(0, 80)}`);
});

test("Ema's new rules stay inside Ema", () => {
  const added = emaStage.slice(emaStage.indexOf("/* Motion (2026-11-27"));
  for (const line of rules(added)) assert.match(line, /#ema-stage/, `reaches other pages: ${line.slice(0, 80)}`);
  const reveal = emaTheme.slice(emaTheme.indexOf("/* Light and dark: the new mode opens"));
  for (const line of rules(reveal)) assert.ok(line.startsWith('html[data-theme="ema"]'), line.slice(0, 80));
});

test("entrances only run with motion on: inside no-preference, never while paused", () => {
  for (const [css, name] of [[blankMotion, "bj-intro"], [emaStage, "k-intro-rise"]]) {
    const block = css.slice(css.indexOf("@media (prefers-reduced-motion: no-preference)"));
    assert.match(block, new RegExp(name));
    for (const line of rules(block).filter((line) => line.includes("[data-intro]"))) assert.match(line, /:not\(\[data-motion-paused="true"\]\)/, line.slice(0, 90));
  }
});

test("the entrance flag is set only on a homepage's first full load, never mid-navigation or with motion off", () => {
  for (const layout of ["src/themes/blank/layouts/BlankLayout.astro", "src/themes/ema/layouts/EmaLayout.astro"]) {
    const source = read(layout);
    const start = source.indexOf("<script is:inline>", source.indexOf("First full visit"));
    const script = source.slice(start, source.indexOf("</script>", start));
    assert.match(script, /hasAttribute\("data-astro-transition"\) \|\| html\.dataset\.motionPaused === "true"\) return/);
    assert.match(script, /setTimeout\(\(\) => \{ delete html\.dataset\.intro; \}/);
    assert.ok(source.indexOf("<ColorModePreference") < start, "the pause preference is read first");
  }
});

// A document with one colour button whose own click handler counts switches.
function harness({ paused = false, reduced = false, transitions = true } = {}) {
  const listeners = [];
  const classes = new Set();
  const animations = [];
  let switches = 0;
  const html = { dataset: { motionPaused: String(paused) }, classList: { add: (c) => classes.add(c), remove: (c) => classes.delete(c), contains: (c) => classes.has(c) }, animate: (frames, options) => animations.push({ frames, options }) };
  const button = {
    closest: (selector) => (selector === "[data-color-mode-toggle]" ? button : null),
    getBoundingClientRect: () => ({ left: 100, top: 10, width: 40, height: 40 }),
    click: () => dispatch({ target: button, detail: 0 }),
  };
  const doc = {
    documentElement: html,
    addEventListener: (type, handler, capture) => listeners.push({ type, handler, capture }),
    removeEventListener: (type, handler) => listeners.splice(listeners.findIndex((l) => l.handler === handler), 1),
  };
  if (transitions) doc.startViewTransition = (update) => { update(); return { ready: Promise.resolve(), finished: Promise.resolve() }; };
  function dispatch(event) {
    let stopped = false;
    const e = { ...event, stopImmediatePropagation: () => { stopped = true; }, preventDefault() {} };
    for (const l of [...listeners].filter((l) => l.type === "click")) { l.handler(e); if (stopped) return; }
    switches++; // the button's own handler (color-mode.mjs)
  }
  const win = { innerWidth: 1000, innerHeight: 800, matchMedia: () => ({ matches: reduced }) };
  return { doc, win, dispatch, button, classes, animations, switches: () => switches };
}

test("light/dark reveal: one switch through a view transition, grown from the pointer", async () => {
  const h = harness();
  const cleanup = mountColorModeReveal(h.doc, h.win);
  h.dispatch({ target: h.button, detail: 1, clientX: 120, clientY: 30 });
  assert.equal(h.switches(), 1);
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(h.animations.length, 1);
  assert.equal(h.animations[0].options.pseudoElement, "::view-transition-new(root)");
  assert.match(h.animations[0].frames.clipPath[0], /circle\(0px at 120px 30px\)/);
  assert.equal(h.classes.has("site-mode-reveal"), false, "the class is gone once the transition ends");
  cleanup();
});

test("light/dark reveal: the keyboard grows it from the button's centre", async () => {
  const h = harness();
  mountColorModeReveal(h.doc, h.win);
  h.dispatch({ target: h.button, detail: 0 });
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(h.switches(), 1);
  assert.match(h.animations[0].frames.clipPath[0], /at 120px 30px/);
});

test("light/dark reveal: paused, reduced or unsupported, the switch happens at once and only once", () => {
  for (const options of [{ paused: true }, { reduced: true }, { transitions: false }]) {
    const h = harness(options);
    mountColorModeReveal(h.doc, h.win);
    h.dispatch({ target: h.button, detail: 1, clientX: 5, clientY: 5 });
    assert.equal(h.switches(), 1, JSON.stringify(options));
    assert.equal(h.animations.length, 0, JSON.stringify(options));
  }
});
