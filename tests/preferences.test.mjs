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
  const blank = page({ dark: true, values });
  assert.equal(blank.mode(), "light");
  blank.click();
  blank.cleanup();

  const other = page({ theme: "other", dark: false, values, colors: { light: "#f8f0ed", dark: "#211722" } });
  assert.equal(other.mode(), "dark");
  assert.equal(other.doc.documentElement.dataset.theme, "other");
  assert.equal(other.meta.content, "#211722");
  other.click();
  assert.equal(other.meta.content, "#f8f0ed");
  other.cleanup();

  const back = page({ values, dark: true });
  assert.equal(back.mode(), "light");
  back.cleanup();
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
