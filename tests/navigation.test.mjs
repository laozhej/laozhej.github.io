import test from "node:test";
import assert from "node:assert/strict";
import { installNavigationLifecycle } from "../src/core/navigation/lifecycle.mjs";
import { mountMotionPreference, MOTION_STORAGE_KEY } from "../src/core/preferences/motion.mjs";

const node = (extra = {}) => Object.assign(new EventTarget(), {
  dataset: {}, attributes: {}, hidden: true,
  setAttribute(key, value) { this.attributes[key] = value; },
  toggleAttribute(key, on) { if (on) this.attributes[key] = ""; else delete this.attributes[key]; },
}, extra);

function environment({ paused = false, reduced = false, blocked = false } = {}) {
  const values = new Map([[MOTION_STORAGE_KEY, String(paused)]]);
  const media = node({ matches: reduced });
  const win = node({
    CustomEvent, location: { hash: "" },
    matchMedia: () => media,
    localStorage: {
      getItem(key) { if (blocked) throw new Error("Blocked"); return values.get(key); },
      setItem(key, value) { if (blocked) throw new Error("Blocked"); values.set(key, value); },
    },
  });
  const pause = node(), play = node();
  const button = node({
    dataset: { motionPause: "暂停动效", motionResume: "启用动效", motionReduced: "系统减少动态" },
    querySelector: (selector) => selector === "[data-motion-pause-icon]" ? pause : play,
  });
  const main = { focus(options) { this.focused = options; } };
  const doc = node({
    body: {}, documentElement: { dataset: { colorMode: "dark" } },
    querySelector: () => main, querySelectorAll: () => [button],
  });
  return { win, doc, values, media, button, main, pause, play };
}

test("a page is mounted once and old listeners are cleaned before each Astro swap", () => {
  const p = environment();
  let mounts = 0, cleanups = 0, skipped = false;
  const uninstall = installNavigationLifecycle(p.doc, p.win, () => {
    mounts++;
    return () => { cleanups++; };
  });
  p.doc.dispatchEvent(new Event("astro:page-load"));
  assert.equal(mounts, 1);
  const meta = node({ dataset: { colorModeDark: "#20232c", colorModeLight: "#fafbf9" } });
  const destination = { documentElement: { dataset: {} }, querySelector: () => meta };
  p.doc.dispatchEvent(Object.assign(new Event("astro:before-swap"), {
    newDocument: destination, viewTransition: { skipTransition() { skipped = true; } },
  }));
  assert.equal(cleanups, 1);
  assert.equal(destination.documentElement.dataset.colorMode, "dark");
  assert.equal(destination.documentElement.dataset.motionPaused, "false");
  assert.equal(meta.attributes.content, "#20232c");
  assert.equal(skipped, false);
  p.doc.body = {};
  p.doc.dispatchEvent(new Event("astro:page-load"));
  p.doc.dispatchEvent(new Event("astro:page-load"));
  assert.equal(mounts, 2);
  uninstall();
  assert.equal(cleanups, 2);
  p.doc.body = {};
  p.doc.dispatchEvent(new Event("astro:page-load"));
  assert.equal(mounts, 2);
});

test("both saved pause and system reduced motion skip the route animation", () => {
  for (const preference of [{ paused: true }, { reduced: true }]) {
    const p = environment(preference);
    let skipped = 0;
    const uninstall = installNavigationLifecycle(p.doc, p.win, () => {});
    const destination = { documentElement: { dataset: {} }, querySelector: () => null };
    p.doc.dispatchEvent(Object.assign(new Event("astro:before-swap"), {
      newDocument: destination, viewTransition: { skipTransition() { skipped++; } },
    }));
    assert.equal(skipped, 1);
    assert.equal(destination.documentElement.dataset.motionPaused, "true");
    uninstall();
  }
});

test("intentional skips handle the native ready rejection without interrupting navigation", async () => {
  const p = environment({ paused: true });
  let rejectReady;
  const ready = new Promise((resolve, reject) => { rejectReady = reject; });
  let mounts = 0;
  const uninstall = installNavigationLifecycle(p.doc, p.win, () => { mounts++; });
  p.doc.dispatchEvent(Object.assign(new Event("astro:before-swap"), {
    newDocument: { documentElement: { dataset: {} }, querySelector: () => null },
    viewTransition: {
      ready,
      skipTransition() { rejectReady(new DOMException("Transition was skipped", "AbortError")); },
    },
  }));
  p.doc.body = {};
  p.doc.dispatchEvent(new Event("astro:after-swap"));
  // An unhandled promise rejection fails node:test after this event-loop turn.
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(mounts, 2);
  uninstall();
});

test("handling an intentional skip does not swallow unexpected transition failures", () => {
  const p = environment({ paused: true });
  let reject;
  const uninstall = installNavigationLifecycle(p.doc, p.win, () => {});
  p.doc.dispatchEvent(Object.assign(new Event("astro:before-swap"), {
    newDocument: { documentElement: { dataset: {} }, querySelector: () => null },
    viewTransition: { ready: { catch(handler) { reject = handler; } }, skipTransition() {} },
  }));
  const failure = new Error("Unexpected rendering failure");
  assert.throws(() => reject(failure), (error) => error === failure);
  uninstall();
});

test("history position is restored after a destination's measured layout is mounted", () => {
  const p = environment();
  const calls = [];
  p.win.history = { state: { scrollX: 0, scrollY: 2400 } };
  p.win.scrollTo = (position) => calls.push(position);
  const uninstall = installNavigationLifecycle(p.doc, p.win, () => { calls.push("mount"); });
  p.doc.dispatchEvent(Object.assign(new Event("astro:before-swap"), {
    navigationType: "traverse",
    newDocument: { documentElement: { dataset: {} }, querySelector: () => null },
    viewTransition: { skipTransition() {} },
  }));
  p.doc.body = {};
  p.win.history.state.scrollY = 1200;
  p.doc.dispatchEvent(new Event("astro:after-swap"));
  p.doc.dispatchEvent(new Event("astro:page-load"));
  assert.deepEqual(calls, ["mount", "mount", { top: 2400, left: 0, behavior: "instant" }]);
  uninstall();
});

test("cross-page anchors are positioned after the enhanced layout has mounted", () => {
  const p = environment();
  const calls = [];
  p.win.location.hash = "#chapter";
  p.doc.getElementById = (id) => id === "chapter" ? { scrollIntoView(options) { calls.push(options); } } : null;
  const uninstall = installNavigationLifecycle(p.doc, p.win, () => { calls.push("mount"); });
  p.doc.body = {};
  p.doc.dispatchEvent(new Event("astro:after-swap"));
  assert.deepEqual(calls, ["mount", "mount", { block: "start", behavior: "instant" }]);
  uninstall();
});

test("the shared motion button keeps icons, broadcasts changes, and cleans up", () => {
  const p = environment();
  const states = [];
  p.doc.addEventListener("site:motion-change", (event) => states.push(event.detail));
  const cleanup = mountMotionPreference(p.doc, p.win);
  assert.equal(p.button.hidden, false);
  assert.equal(p.button.attributes["aria-label"], "暂停动效");
  assert.equal("hidden" in p.pause.attributes, false);
  assert.equal("hidden" in p.play.attributes, true);
  p.button.dispatchEvent(new Event("click"));
  assert.equal(p.doc.documentElement.dataset.motionPaused, "true");
  assert.equal(p.button.title, "启用动效");
  assert.equal("hidden" in p.pause.attributes, true);
  assert.equal("hidden" in p.play.attributes, false);
  assert.equal(p.values.get(MOTION_STORAGE_KEY), "true");
  assert.deepEqual(states.at(-1), { paused: true, userPaused: true, reduced: false });
  cleanup();
  p.button.dispatchEvent(new Event("click"));
  assert.equal(states.length, 2);
  const restore = mountMotionPreference(p.doc, p.win);
  assert.equal(p.doc.documentElement.dataset.motionPaused, "true");
  restore();
});

test("reduced motion overrides pause without replacing the saved manual preference", () => {
  const p = environment({ reduced: true });
  const cleanup = mountMotionPreference(p.doc, p.win);
  assert.equal(p.button.title, "系统减少动态");
  assert.equal(p.button.attributes["aria-disabled"], "true");
  p.button.dispatchEvent(new Event("click"));
  assert.equal(p.values.get(MOTION_STORAGE_KEY), "false");
  p.media.matches = false;
  p.media.dispatchEvent(new Event("change"));
  assert.equal(p.doc.documentElement.dataset.motionPaused, "false");
  assert.equal(p.button.title, "暂停动效");
  cleanup();
});

test("motion pause survives client navigation when storage is blocked", () => {
  const p = environment({ blocked: true });
  const cleanup = mountMotionPreference(p.doc, p.win);
  p.button.dispatchEvent(new Event("click"));
  cleanup();
  const restore = mountMotionPreference(p.doc, p.win);
  assert.equal(p.doc.documentElement.dataset.motionPaused, "true");
  restore();
});
