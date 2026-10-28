import test from "node:test";
import assert from "node:assert/strict";
import { mountEmaHome } from "../src/themes/ema/lib/home.mjs";

function element(extra = {}) {
  return Object.assign(new EventTarget(), {
    dataset: {}, attributes: {}, hidden: false,
    setAttribute(key, value) { this.attributes[key] = value; },
    toggleAttribute(key, present) { if (present) this.attributes[key] = ""; else delete this.attributes[key]; },
    contains() { return false; },
  }, extra);
}

function page({ paused = false, reduced = false, labels = ["暂停动效", "启用动效", "系统减少动态"] } = {}) {
  const pause = element(), play = element();
  const button = element({ querySelector: (selector) => selector === "[data-motion-pause-icon]" ? pause : play });
  Object.defineProperty(button, "textContent", { set() { throw new Error("The icon children must survive state updates"); } });
  const command = element({ dataset: { command: "hello", commandText: "Hello", commandResult: "Welcome" } });
  const root = element({
    dataset: { motionPause: labels[0], motionResume: labels[1], motionReduced: labels[2] },
    querySelector: () => null,
    querySelectorAll: (selector) => selector === "[data-command]" ? [command] : [],
  });
  const doc = element({
    getElementById: () => root, querySelector: () => null,
    querySelectorAll: (selector) => selector === "[data-motion-toggle]" ? [button] : [],
  });
  const values = new Map([["ema-home-motion-paused", String(paused)]]);
  const system = element({ matches: reduced });
  const otherMedia = element({ matches: false });
  const win = element({
    scrollY: 0, innerHeight: 900,
    matchMedia: (query) => query.includes("prefers-reduced-motion") ? system : otherMedia,
    localStorage: { getItem: (key) => values.get(key), setItem: (key, value) => values.set(key, value) },
    setTimeout: () => 1, clearTimeout() {}, requestAnimationFrame: () => 1, cancelAnimationFrame() {},
  });
  const cleanup = mountEmaHome(doc, win);
  return { root, button, pause, play, system, values, cleanup };
}

test("motion toggle retains its icons, exposes the next action and remembers pause in every locale", () => {
  for (const labels of [["暂停动效", "启用动效"], ["動きを止める", "動きを再開"], ["Pause motion", "Resume motion"]]) {
    const p = page({ labels });
    assert.equal(p.button.hidden, false);
    assert.equal(p.button.title, labels[0]);
    assert.equal(p.button.attributes["aria-label"], labels[0]);
    assert.equal("hidden" in p.pause.attributes, false);
    assert.equal("hidden" in p.play.attributes, true);
    p.button.dispatchEvent(new Event("click"));
    assert.equal(p.root.dataset.paused, "true");
    assert.equal(p.button.title, labels[1]);
    assert.equal(p.button.attributes["aria-label"], labels[1]);
    assert.equal("hidden" in p.pause.attributes, true);
    assert.equal("hidden" in p.play.attributes, false);
    assert.equal(p.values.get("ema-home-motion-paused"), "true");
    p.button.dispatchEvent(new Event("click"));
    assert.equal(p.root.dataset.paused, "false");
    assert.equal(p.button.title, labels[0]);
    assert.equal(p.values.get("ema-home-motion-paused"), "false");
    p.cleanup();
  }
});

test("system reduced motion explains the unavailable action without replacing the saved preference", () => {
  for (const paused of [false, true]) {
    const p = page({ paused, reduced: true });
    assert.equal(p.root.dataset.paused, "true");
    assert.equal(p.button.attributes["aria-disabled"], "true");
    assert.equal(p.button.attributes["aria-pressed"], "true");
    assert.equal(p.button.attributes["aria-label"], "系统减少动态");
    assert.equal(p.button.title, "系统减少动态");
    assert.equal("hidden" in p.pause.attributes, true);
    assert.equal("hidden" in p.play.attributes, false);
    p.button.dispatchEvent(new Event("click"));
    assert.equal(p.values.get("ema-home-motion-paused"), String(paused));
    p.system.matches = false;
    p.system.dispatchEvent(new Event("change"));
    assert.equal(p.root.dataset.paused, String(paused));
    assert.equal(p.button.attributes["aria-disabled"], "false");
    assert.equal(p.button.title, paused ? "启用动效" : "暂停动效");
    p.cleanup();
  }
});
