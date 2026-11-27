import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { BACK_TO_TOP_HOLD_MS, mountBackToTop } from "../src/core/features/back-to-top.mjs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

// The browser checks (Chrome and WebKit) live outside the repository; these cover the contract.
function fixture({ reduced = false, paused = false, inline = "" } = {}) {
  const style = {
    scrollBehavior: inline,
    removeProperty(name) { if (name === "scroll-behavior") this.scrollBehavior = ""; },
  };
  // A document stub that, like the DOM, runs capturing listeners before bubbling ones: the router
  // registers its bubbling click listener before this feature mounts.
  const listeners = [];
  const doc = {
    documentElement: { style },
    addEventListener(type, callback, capture = false) { listeners.push({ type, callback, capture: Boolean(capture) }); },
    removeEventListener(type, callback, capture = false) {
      const index = listeners.findIndex((entry) => entry.type === type && entry.callback === callback && entry.capture === Boolean(capture));
      if (index >= 0) listeners.splice(index, 1);
    },
    dispatchEvent(event) {
      for (const phase of [true, false]) for (const entry of [...listeners]) if (entry.type === event.type && entry.capture === phase) entry.callback(event);
    },
  };
  const timers = new Map();
  let nextTimer = 1;
  const winListeners = new Map();
  const win = {
    localStorage: { getItem: (key) => (key === "ema-home-motion-paused" && paused ? "true" : null) },
    matchMedia: () => ({ matches: reduced }),
    setTimeout(callback, delay) { const id = nextTimer++; timers.set(id, { callback, delay }); return id; },
    clearTimeout(id) { timers.delete(id); },
    addEventListener(type, callback) { if (!winListeners.has(type)) winListeners.set(type, new Set()); winListeners.get(type).add(callback); },
    removeEventListener(type, callback) { winListeners.get(type)?.delete(callback); },
  };
  const scrollend = () => [...(winListeners.get("scrollend") ?? [])].forEach((callback) => callback());
  const scrollendListeners = () => winListeners.get("scrollend")?.size ?? 0;
  const runTimers = () => { const pending = [...timers.values()]; timers.clear(); pending.forEach(({ callback }) => callback()); };
  const topLink = { closest: (query) => (query === "a[data-site-top]" ? {} : null) };
  const otherLink = { closest: () => null };
  // The router's own click listener stands in for the jump it performs during the same click.
  const seen = [];
  doc.addEventListener("click", () => seen.push(style.scrollBehavior));
  const click = (target, init = {}) => {
    const event = { type: "click", button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false, defaultPrevented: false, target, ...init };
    doc.dispatchEvent(event);
  };
  return { doc, win, style, timers, runTimers, scrollend, scrollendListeners, topLink, otherLink, click, seen };
}

test("a back-to-top link keeps the root smooth until its scroll ends", () => {
  const f = fixture();
  const cleanup = mountBackToTop(f.doc, f.win);
  f.click(f.topLink);
  assert.deepEqual(f.seen, ["smooth"], "the router's jump runs while the root scrolls smoothly");
  assert.equal(f.style.scrollBehavior, "smooth", "still smooth afterwards: a loading page defers the jump to its next layout");
  assert.equal(f.scrollendListeners(), 1);
  assert.equal(f.timers.size, 1);
  f.scrollend();
  assert.equal(f.style.scrollBehavior, "", "scrollend hands the theme its own scrolling back");
  assert.equal(f.scrollendListeners(), 0);
  assert.equal(f.timers.size, 0);
  f.click(f.topLink);
  f.click(f.topLink);
  assert.equal(f.scrollendListeners(), 1, "a second click reuses one release");
  assert.equal(f.timers.size, 1);
  f.scrollend();
  assert.equal(f.style.scrollBehavior, "");
  cleanup();
  f.click(f.topLink);
  assert.equal(f.seen.at(-1), "", "cleanup removes the listener");
});

test("without a scrollend (already at the top, or no support) the hold ends after a fixed time", () => {
  const f = fixture();
  mountBackToTop(f.doc, f.win);
  f.click(f.topLink);
  assert.equal([...f.timers.values()][0].delay, BACK_TO_TOP_HOLD_MS);
  assert.ok(BACK_TO_TOP_HOLD_MS >= 2000 && BACK_TO_TOP_HOLD_MS <= 5000, "long enough for the slowest measured glide, short enough to end soon");
  f.runTimers();
  assert.equal(f.style.scrollBehavior, "");
  assert.equal(f.scrollendListeners(), 0);
});

test("an inline scroll-behavior already on the root is put back afterwards", () => {
  const f = fixture({ inline: "auto" });
  mountBackToTop(f.doc, f.win);
  f.click(f.topLink);
  assert.equal(f.seen.at(-1), "smooth");
  f.scrollend();
  assert.equal(f.style.scrollBehavior, "auto");
});

test("cleanup in the middle of a jump restores the root at once", () => {
  const f = fixture();
  const cleanup = mountBackToTop(f.doc, f.win);
  f.click(f.topLink);
  cleanup();
  assert.equal(f.style.scrollBehavior, "");
  assert.equal(f.timers.size, 0);
  assert.equal(f.scrollendListeners(), 0);
});

test("reduced motion, the pause button, other links and new-tab clicks keep the instant jump", () => {
  for (const options of [{ reduced: true }, { paused: true }]) {
    const f = fixture(options);
    mountBackToTop(f.doc, f.win);
    f.click(f.topLink);
    assert.deepEqual(f.seen, [""], JSON.stringify(options));
    assert.equal(f.timers.size, 0);
    assert.equal(f.scrollendListeners(), 0);
  }
  const f = fixture();
  mountBackToTop(f.doc, f.win);
  f.click(f.otherLink);
  f.click(f.topLink, { metaKey: true });
  f.click(f.topLink, { ctrlKey: true });
  f.click(f.topLink, { shiftKey: true });
  f.click(f.topLink, { altKey: true });
  f.click(f.topLink, { button: 1 });
  f.click(f.topLink, { defaultPrevented: true });
  assert.ok(f.seen.every((value) => value === ""), f.seen.join());
  assert.equal(f.timers.size, 0);
});

test("Ema, Endfield and Arknights mark their footer link; Blank keeps its own smooth root", () => {
  assert.match(read("src/core/features/runtime.mjs"), /mountBackToTop\(doc, win\)/);
  for (const [theme, layout] of [["ema", "EmaLayout"], ["endfield", "EndfieldLayout"], ["arknights", "ArknightsLayout"]]) {
    const source = read(`src/themes/${theme}/layouts/${layout}.astro`);
    assert.ok(source.includes(`<a href="#${theme}-main" data-site-top>{t("footer.top")} ↑</a>`), theme);
    assert.equal(source.match(/data-site-top/g).length, 1, `${theme} has one back-to-top link`);
    assert.doesNotMatch(source, /class="blank-skip-link"[^>]*data-site-top/, `${theme} skip link keeps its jump`);
  }
  const blank = read("src/themes/blank/styles/theme.css");
  assert.match(blank, /html\[data-theme="blank"\] \{[^}]*scroll-behavior: smooth;/);
  assert.match(blank, /html\[data-theme="blank"\]\[data-motion-paused="true"\] \{ scroll-behavior: auto; \}/);
});
