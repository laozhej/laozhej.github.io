import test from "node:test";
import assert from "node:assert/strict";
import { COLOR_MODE_STORAGE_KEY, mountColorMode } from "../src/core/preferences/color-mode.mjs";

function page({ theme = "blank", dark = false, values = new Map(), blocked = false, colors = {} } = {}) {
  const button = Object.assign(new EventTarget(), {
    dataset: { labelLight: "Switch to light mode", labelDark: "Switch to dark mode" },
    attributes: {},
    setAttribute(key, value) { this.attributes[key] = value; },
    hidden: true,
  });
  const meta = {
    dataset: { colorModeLight: colors.light, colorModeDark: colors.dark },
    setAttribute(key, value) { this[key] = value; },
  };
  const doc = {
    documentElement: { dataset: { theme } },
    querySelectorAll: () => [button],
    querySelector: () => meta,
  };
  const system = Object.assign(new EventTarget(), { matches: dark });
  const win = Object.assign(new EventTarget(), {
    matchMedia: () => system,
    localStorage: {
      getItem(key) { if (blocked) throw new Error("Storage unavailable"); return values.get(key) ?? null; },
      setItem(key, value) { if (blocked) throw new Error("Storage unavailable"); values.set(key, value); },
      removeItem(key) { if (blocked) throw new Error("Storage unavailable"); values.delete(key); },
    },
  });
  const cleanup = mountColorMode(doc, win);
  return {
    mode: () => doc.documentElement.dataset.colorMode,
    doc, button, meta, win, values, cleanup,
    click() { button.dispatchEvent(new Event("click")); },
    systemChange(dark) { system.matches = dark; system.dispatchEvent(new Event("change")); },
    storageChange(key = COLOR_MODE_STORAGE_KEY) {
      win.dispatchEvent(Object.assign(new Event("storage"), { key }));
    },
  };
}

test("visitors follow system changes until a manual choice overrides them", () => {
  const p = page({ dark: true });
  assert.equal(p.mode(), "dark");
  p.systemChange(false);
  assert.equal(p.mode(), "light");
  p.systemChange(true);
  p.click();
  assert.equal(p.mode(), "light");
  assert.equal(p.values.get(COLOR_MODE_STORAGE_KEY), "light");
  p.systemChange(false);
  p.systemChange(true);
  assert.equal(p.mode(), "light");
  assert.equal(p.button.attributes["aria-pressed"], "false");
  assert.equal(p.button.title, "Switch to dark mode");
  p.cleanup();
});

test("the same saved choice follows visitors into another theme with its own colors", () => {
  const values = new Map([["blank-color-mode", "light"]]);
  const blank = page({ dark: false, values });
  assert.equal(blank.mode(), "light");
  blank.click();
  assert.equal(values.get(COLOR_MODE_STORAGE_KEY), "dark");
  blank.cleanup();

  const other = page({ theme: "other", dark: false, values, colors: { light: "#f8f0ed", dark: "#211722" } });
  assert.equal(other.mode(), "dark");
  assert.equal(other.doc.documentElement.dataset.theme, "other");
  assert.equal(other.meta.content, "#211722");
  other.cleanup();

  const back = page({ values, dark: false });
  assert.equal(back.mode(), "dark");
  back.click();
  assert.equal(back.mode(), "light");
  assert.equal(values.has(COLOR_MODE_STORAGE_KEY), false);
  back.cleanup();
});

test("switching to the mode the system uses drops the saved choice and follows the system again", () => {
  const p = page({ dark: false });
  p.click();
  assert.equal(p.mode(), "dark");
  assert.equal(p.values.get(COLOR_MODE_STORAGE_KEY), "dark");
  p.click();
  assert.equal(p.mode(), "light");
  assert.equal(p.values.has(COLOR_MODE_STORAGE_KEY), false);
  assert.equal(p.button.attributes["aria-pressed"], "false");
  assert.equal(p.button.title, "Switch to dark mode");
  p.systemChange(true);
  assert.equal(p.mode(), "dark");
  assert.equal(p.button.title, "Switch to light mode");
  p.systemChange(false);
  assert.equal(p.mode(), "light");
  p.cleanup();

  const next = page({ dark: true, values: p.values });
  assert.equal(next.mode(), "dark");
  next.cleanup();
});

test("every press switches to the other mode, whatever the system does in between", () => {
  const p = page({ dark: true });
  const seen = [];
  for (const system of [true, true, false, false, true, false]) {
    p.systemChange(system);
    const before = p.mode();
    p.click();
    assert.notEqual(p.mode(), before);
    seen.push(p.values.get(COLOR_MODE_STORAGE_KEY) ?? "system");
  }
  assert.deepEqual(seen, ["light", "system", "dark", "system", "light", "dark"]);
  p.cleanup();
});

test("a choice saved before this change stays until the visitor presses the button", () => {
  const values = new Map([["blank-color-mode", "light"]]);
  const p = page({ dark: false, values });
  p.systemChange(true);
  p.systemChange(false);
  p.systemChange(true);
  assert.equal(p.mode(), "light");
  assert.equal(values.get(COLOR_MODE_STORAGE_KEY), "light");
  p.cleanup();
});

test("another tab sees the dropped choice and follows the system", () => {
  const values = new Map();
  const first = page({ dark: false, values });
  const second = page({ theme: "other", dark: false, values });
  first.click();
  second.storageChange();
  assert.equal(second.mode(), "dark");
  first.click();
  second.storageChange();
  assert.equal(second.mode(), "light");
  second.systemChange(true);
  assert.equal(second.mode(), "dark");
  first.cleanup();
  second.cleanup();
});

test("tabs and restored pages receive preference updates, and clearing returns to system", () => {
  const values = new Map();
  const first = page({ dark: true, values });
  const second = page({ theme: "other", dark: true, values });
  first.click();
  second.storageChange();
  assert.equal(second.mode(), "light");
  values.set(COLOR_MODE_STORAGE_KEY, "dark");
  second.win.dispatchEvent(new Event("pageshow"));
  assert.equal(second.mode(), "dark");
  values.clear();
  second.storageChange(null);
  second.systemChange(false);
  assert.equal(second.mode(), "light");
  first.cleanup();
  second.cleanup();
});

test("manual switching still works for the current page when browser storage is blocked", () => {
  const p = page({ blocked: true, dark: true });
  assert.equal(p.mode(), "dark");
  p.click();
  assert.equal(p.mode(), "light");
  p.win.dispatchEvent(new Event("pageshow"));
  p.systemChange(false);
  p.systemChange(true);
  assert.equal(p.mode(), "light");
  p.cleanup();
});

test("with storage blocked, switching back to the system's mode follows the system on that page", () => {
  const p = page({ blocked: true, dark: true });
  p.click();
  p.click();
  assert.equal(p.mode(), "dark");
  p.win.dispatchEvent(new Event("pageshow"));
  p.systemChange(false);
  assert.equal(p.mode(), "light");
  p.cleanup();
});
