import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { mountBackToTop } from "../src/core/features/back-to-top.mjs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

// The browser checks (Chrome and WebKit) live outside the repository; these cover the contract.
function fixture({ reduced = false, paused = false, inline = "" } = {}) {
  const frames = new Map();
  let nextFrame = 1;
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
  const win = {
    localStorage: { getItem: (key) => (key === "ema-home-motion-paused" && paused ? "true" : null) },
    matchMedia: () => ({ matches: reduced }),
    requestAnimationFrame(callback) { const id = nextFrame++; frames.set(id, callback); return id; },
    cancelAnimationFrame(id) { frames.delete(id); },
  };
  const runFrame = () => { const pending = [...frames.values()]; frames.clear(); pending.forEach((callback) => callback()); };
  const link = (selector) => ({ closest: (query) => (query === selector ? {} : null) });
  const topLink = link("a[data-site-top]");
  const otherLink = { closest: () => null };
  // The router's own click listener stands in for the jump it performs during the same click.
  const seen = [];
  doc.addEventListener("click", () => seen.push(style.scrollBehavior));
  const click = (target, init = {}) => {
    const event = new Event("click", { cancelable: true });
    Object.assign(event, { button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false, ...init });
    Object.defineProperty(event, "target", { value: target });
    if (init.prevented) event.preventDefault();
    doc.dispatchEvent(event);
  };
  return { doc, win, style, frames, runFrame, topLink, otherLink, click, seen };
}

test("a back-to-top link scrolls smoothly for that one jump, then hands the root back", () => {
  const f = fixture();
  const cleanup = mountBackToTop(f.doc, f.win);
  f.click(f.topLink);
  assert.deepEqual(f.seen, ["smooth"], "the router's jump runs while the root scrolls smoothly");
  assert.equal(f.frames.size, 1);
  f.runFrame();
  assert.equal(f.style.scrollBehavior, "", "the next frame restores the theme's own scrolling");
  f.click(f.topLink);
  f.click(f.topLink);
  assert.equal(f.frames.size, 1, "a second click reuses one release");
  f.runFrame();
  assert.equal(f.style.scrollBehavior, "");
  cleanup();
  f.click(f.topLink);
  assert.equal(f.seen.at(-1), "", "cleanup removes the listener");
});

test("an inline scroll-behavior already on the root is put back afterwards", () => {
  const f = fixture({ inline: "auto" });
  mountBackToTop(f.doc, f.win);
  f.click(f.topLink);
  assert.equal(f.seen.at(-1), "smooth");
  f.runFrame();
  assert.equal(f.style.scrollBehavior, "auto");
});

test("cleanup in the middle of a jump restores the root at once", () => {
  const f = fixture();
  const cleanup = mountBackToTop(f.doc, f.win);
  f.click(f.topLink);
  cleanup();
  assert.equal(f.style.scrollBehavior, "");
  assert.equal(f.frames.size, 0);
});

test("reduced motion, the pause button, other links and new-tab clicks keep the instant jump", () => {
  for (const options of [{ reduced: true }, { paused: true }]) {
    const f = fixture(options);
    mountBackToTop(f.doc, f.win);
    f.click(f.topLink);
    assert.deepEqual(f.seen, [""], JSON.stringify(options));
    assert.equal(f.frames.size, 0);
  }
  const f = fixture();
  mountBackToTop(f.doc, f.win);
  f.click(f.otherLink);
  f.click(f.topLink, { metaKey: true });
  f.click(f.topLink, { ctrlKey: true });
  f.click(f.topLink, { shiftKey: true });
  f.click(f.topLink, { altKey: true });
  f.click(f.topLink, { button: 1 });
  f.click(f.topLink, { prevented: true });
  assert.ok(f.seen.every((value) => value === ""), f.seen.join());
  assert.equal(f.frames.size, 0);
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
