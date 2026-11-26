import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createReadouts, hasDigits, settleFrame, staggerGap } from "../src/themes/endfield/lib/readout.mjs";
import { mountEndfield, navShift, revealCircle } from "../src/themes/endfield/lib/runtime.mjs";

const css = readFileSync(new URL("../src/themes/endfield/styles/theme.css", import.meta.url), "utf8");
const layout = readFileSync(new URL("../src/themes/endfield/layouts/EndfieldLayout.astro", import.meta.url), "utf8");

test("Endfield figures: only digits spin, they lock in from the left, and the real value is what remains", () => {
  const nine = () => 0.95;
  assert.equal(settleFrame("No.001", 0, nine), "No.999", "letters and the full stop never change");
  assert.equal(settleFrame("No.001", 0.5, nine), "No.999", "half of six characters: 'No.' is locked, the digits still spin");
  assert.equal(settleFrame("No.001", 5 / 6, nine), "No.009", "the first two digits have locked");
  assert.equal(settleFrame("No.001", 1, nine), "No.001");
  assert.equal(settleFrame("2026/11/15", 0, () => 0), "0000/00/00", "separators stay, so a date keeps its shape");
  assert.equal(settleFrame("23 款游戏", 0, nine), "99 款游戏", "Chinese text is left alone");
  assert.equal(settleFrame("１２", 0, nine), "１２", "full-width digits are not tabular figures and are left alone");
  assert.equal([...settleFrame("04", 0.3)].length, 2, "the length never changes");
  assert.equal(settleFrame("12", 0, () => 0.9999999), "99", "a stand-in is always one digit");
  assert.equal(hasDigits("创作笔记"), false);
  assert.equal(hasDigits("No.001"), true);
});

test("Endfield stagger: steps of 38ms, squeezed so a long group still starts within its spread", () => {
  assert.equal(staggerGap(1), 0);
  assert.equal(staggerGap(4), 38);
  assert.equal(staggerGap(6, 38, 190), 38, "six rows: 5 × 38 = 190");
  assert.equal(staggerGap(11, 38, 190), 19);
  assert.equal(staggerGap(7, 40, 180), 30, "seven opening figures start within 180ms");
});

// A text node holder that a walker can visit, and a window whose frames are run by hand.
function figure(...texts) {
  const nodes = texts.map((data) => ({ data }));
  const el = {
    isConnected: true,
    nodes,
    ownerDocument: {
      createTreeWalker() {
        let index = -1;
        return { get currentNode() { return nodes[index]; }, nextNode: () => ++index < nodes.length };
      },
    },
    get text() { return nodes.map((node) => node.data).join(""); },
  };
  return el;
}
function clock() {
  let now = 0;
  let id = 0;
  const frames = new Map();
  return {
    performance: { now: () => now },
    requestAnimationFrame(run) { frames.set(++id, run); return id; },
    cancelAnimationFrame(handle) { frames.delete(handle); },
    advance(ms) {
      now += ms;
      for (const [handle, run] of [...frames]) { frames.delete(handle); run(now); }
    },
    get pending() { return frames.size; },
  };
}

test("Endfield figures: a readout ends on the real text, even when split into several nodes or stopped early", () => {
  const win = clock();
  const readouts = createReadouts(win);
  const date = figure("1 ", "篇记录");
  readouts.settle(date, 360);
  win.advance(100);
  assert.match(date.text, /^\d 篇记录$/, "the digit may differ mid-run, the words do not");
  win.advance(400);
  assert.equal(date.text, "1 篇记录");
  assert.equal(readouts.size, 0);
  assert.equal(win.pending, 0);

  const number = figure("No.", "001");
  readouts.settle(number, 600);
  win.advance(100);
  readouts.settle(number, 600); // pointed at again mid-run: starts over from the same real value
  win.advance(100);
  readouts.stop();
  assert.equal(number.text, "No.001", "stopping shows the real value at once");
  assert.equal(win.pending, 0);

  const words = figure("创作笔记");
  readouts.settle(words);
  assert.equal(readouts.size, 0, "text without digits is never touched");
  const gone = figure("07");
  gone.isConnected = false;
  readouts.settle(gone);
  assert.equal(readouts.size, 0, "an element no longer on the page is ignored");
});

test("Endfield header block: it starts where the last section's block was, and does not move for the same section", () => {
  assert.deepEqual(navShift({ left: 10, top: 0, width: 80, height: 40 }, { left: 250, top: 0, width: 100, height: 40 }), [-240, 0, 0.8]);
  assert.equal(navShift({ left: 90.2, top: 0, width: 80, height: 40 }, { left: 90, top: 0, width: 80, height: 40 }), null);
  assert.equal(navShift(null, { left: 0, top: 0, width: 80, height: 40 }), null);
  assert.equal(navShift({ left: 0, top: 0, width: 80, height: 40 }, { left: 40, top: 0, width: 0, height: 0 }), null, "a hidden target has no size to scale to");
});

test("Endfield colour mode: the circle reaches the farthest corner at about 3000px a second, between 240 and 600ms", () => {
  const corner = revealCircle(1300, 30, 1440, 900);
  assert.equal(Math.round(corner.radius), Math.round(Math.hypot(1300, 870)));
  assert.equal(corner.duration, Math.round(corner.radius / 3));
  assert.equal(revealCircle(200, 200, 390, 400).duration, 240, "never shorter than 240ms");
  assert.equal(revealCircle(0, 0, 3000, 2000).duration, 600, "never longer than 600ms");
});

// The page as the runtime sees it: listeners are kept so a test can deliver events itself.
function page({ paused = false, reduced = false, viewTransitions = true, throws = false } = {}) {
  const listeners = [];
  const classes = new Set();
  const transitions = [];
  const style = new Map();
  const html = {
    dataset: { motionPaused: String(paused || reduced), colorMode: "light" },
    classList: { add: (name) => classes.add(name), remove: (name) => classes.delete(name), contains: (name) => classes.has(name) },
    style: { setProperty: (key, value) => style.set(key, value), removeProperty: (key) => style.delete(key) },
    animate: () => ({ finished: Promise.resolve(), cancel() {}, finish() {} }),
  };
  const doc = {
    documentElement: html,
    activeElement: null,
    addEventListener: (type, handler, options) => listeners.push({ type, handler, capture: options === true }),
    removeEventListener: (type, handler) => { const at = listeners.findIndex((entry) => entry.type === type && entry.handler === handler); if (at >= 0) listeners.splice(at, 1); },
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementById: () => null,
    createElement: () => ({ style: {}, setAttribute() {}, remove() {} }),
  };
  if (viewTransitions) {
    doc.startViewTransition = (update) => {
      if (throws) throw new Error("not now");
      update();
      const transition = { ready: Promise.resolve(), finished: Promise.resolve() };
      transitions.push(transition);
      return transition;
    };
  }
  const timers = new Map();
  let timer = 0;
  const win = {
    innerWidth: 1440, innerHeight: 900,
    matchMedia: (query) => ({ matches: query.includes("reduce") ? reduced : true }),
    setTimeout: (run) => { timers.set(++timer, run); return timer; },
    clearTimeout: (id) => timers.delete(id),
    requestAnimationFrame: () => 1, cancelAnimationFrame() {},
    queueMicrotask: (run) => run(),
    performance: { now: () => 0 },
  };
  // The shared toggle listens on the button itself. A click reaches it only if no capturing listener on the document stops it.
  let switched = 0;
  const button = {
    closest: (selector) => (selector === "[data-color-mode-toggle]" ? button : null),
    getBoundingClientRect: () => ({ left: 1262, top: 10, width: 42, height: 42 }),
    click: () => deliver(),
  };
  const deliver = (detail = 0) => {
    let stopped = false;
    const event = { target: button, detail, clientX: detail ? 1283 : 0, clientY: detail ? 31 : 0, stopImmediatePropagation: () => { stopped = true; }, preventDefault() {} };
    for (const entry of [...listeners]) if (entry.type === "click" && entry.capture && !stopped) entry.handler(event);
    if (!stopped) { switched++; html.dataset.colorMode = html.dataset.colorMode === "dark" ? "light" : "dark"; }
  };
  return { doc, win, html, classes, transitions, listeners, timers, style, press: () => deliver(1), key: () => deliver(0), get switched() { return switched; } };
}

test("Endfield colour mode: the click still switches exactly once, wrapped in a transition only while motion is on", async () => {
  const moving = page();
  const unmount = mountEndfield(moving.doc, moving.win);
  moving.press();
  assert.equal(moving.switched, 1, "the shared toggle ran once, from inside the transition");
  assert.equal(moving.transitions.length, 1);
  assert.equal(moving.html.dataset.colorMode, "dark");
  assert.ok(moving.classes.has("ef-moding"), "the whole page is captured as one picture while the circle grows");
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(moving.classes.has("ef-moding"), false, "and released when the transition is over");
  moving.key();
  assert.equal(moving.switched, 2, "a keyboard press works the same way");
  unmount();
  assert.equal(moving.listeners.length, 0, "every listener is removed with the page");
  assert.equal(moving.timers.size, 0, "and every timer cleared");

  for (const [name, options] of [["paused", { paused: true }], ["reduced motion", { reduced: true }], ["no view transitions", { viewTransitions: false }]]) {
    const still = page(options);
    mountEndfield(still.doc, still.win);
    still.press();
    assert.equal(still.switched, 1, `${name}: the click goes straight to the shared toggle`);
    assert.equal(still.transitions.length, 0, `${name}: no transition`);
    assert.equal(still.classes.has("ef-moding"), false);
  }

  const failing = page({ throws: true });
  mountEndfield(failing.doc, failing.win);
  failing.press();
  assert.equal(failing.switched, 1, "if the transition cannot start, the mode still switches");
  assert.equal(failing.classes.has("ef-moding"), false);
});

test("Endfield motion: paused or reduced, the runtime schedules no figures to spin", () => {
  for (const options of [{ paused: true }, { reduced: true }]) {
    const still = page(options);
    let asked = 0;
    still.doc.querySelectorAll = (selector) => { if (selector.includes("ef-hollow-no")) asked++; return []; };
    mountEndfield(still.doc, still.win);
    assert.equal(asked, 0);
  }
});

test("Endfield layout registers its runtime the way the other themes do", () => {
  assert.match(layout, /import \{ mountEndfield \} from "\.\.\/lib\/runtime\.mjs";\s+registerThemeRuntime\("endfield", mountEndfield\);/);
});

test("Endfield stylesheet: wipes can travel, because their closed and open shapes have the same corners", () => {
  const closed = "polygon(0 0,0 0,0 calc(100% - var(--ef-cut)),0 100%,0 100%)";
  const open = "polygon(0 0,100% 0,100% calc(100% - var(--ef-cut)),calc(100% - var(--ef-cut)) 100%,0 100%)";
  assert.equal(css.split(closed).length - 1, 2, "buttons and the theme dock");
  assert.equal(css.split(open).length - 1, 4);
  assert.doesNotMatch(css, /clip-path:polygon\(0 0,0 0,0 100%,0 100%\)/, "four corners cannot be moved to five: the fill would switch on instead of wiping");
  assert.match(css, /@keyframes ef-drive \{ from \{ clip-path:inset\(-\.2em 100% -\.2em 0\); \} to \{ clip-path:inset\(-\.2em -5% -\.2em 0\); \} \}/, "an opening wipe needs both ends: from a shape to no clip is a jump");
  for (const name of ["ef-shutter-left", "ef-shutter-right"]) {
    const frames = css.match(new RegExp(`@keyframes ${name} \\{\\n  from \\{ clip-path:(polygon\\(.*\\)); \\}\\n  to \\{ clip-path:(polygon\\(.*\\)); \\}\\n\\}`));
    assert.ok(frames, `${name} has both ends`);
    // Corners are separated by the commas outside any calc() or var().
    const corners = (shape) => {
      let depth = 0;
      let count = 1;
      for (const ch of shape.slice("polygon(".length, -1)) {
        if (ch === "(") depth++;
        else if (ch === ")") depth--;
        else if (ch === "," && depth === 0) count++;
      }
      return count;
    };
    assert.equal(corners(frames[1]), 6);
    assert.equal(corners(frames[2]), 6);
  }
});

test("Endfield stylesheet: opening and page-change motion stops with the pause button, and stays inside the theme", () => {
  const rules = css.split("\n").map((line) => line.trim()).filter((line) => line.includes("{"));
  const animated = rules.filter((line) => /[{;\s]animation:(?!none)/.test(line) && !line.startsWith("@keyframes"));
  assert.ok(animated.length >= 10, "the opening sequences, the button edge and the page shutter are there");
  for (const rule of animated) assert.ok(rule.startsWith('html:not([data-motion-paused="true"])') || rule.startsWith('html[data-theme="endfield"]:not([data-motion-paused="true"])'), `paused motion still plays: ${rule.slice(0, 90)}`);
  // PageLayout carries this stylesheet to Blank and Ema pages too: anything that names a view transition must name the theme.
  for (const rule of rules.filter((line) => line.includes("::view-transition") || line.includes("view-transition-name"))) {
    assert.ok(rule.startsWith('html[data-theme="endfield"]'), `reaches other themes: ${rule.slice(0, 90)}`);
  }
  assert.match(css, /html\[data-theme="endfield"\]\.ef-moding \{ view-transition-name:root!important; \}/);
  assert.match(css, /html\[data-theme="endfield"\]\.ef-moding \[data-astro-transition-scope\] \{ view-transition-name:none!important; \}/);
  // Pointer depth only exists for a mouse or trackpad with motion on; at rest nothing carries a transform.
  const depth = css.slice(css.indexOf("@media(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference) {"));
  assert.ok(depth.length > 0);
  for (const line of css.split("\n").filter((entry) => entry.includes("var(--ef-mx)"))) {
    assert.ok(line.trim().startsWith('html:not([data-motion-paused="true"]) .ef-hero[data-ef-live]'), `depth outside the live first screen: ${line.trim().slice(0, 90)}`);
  }
  assert.ok(depth.includes(".ef-hero[data-ef-live] .ef-frame-window"), "the depth rules sit inside that media query");
});
