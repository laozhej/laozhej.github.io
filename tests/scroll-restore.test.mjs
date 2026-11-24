// A reader who comes Back, goes Forward or reloads lands where they were. Measured on the Ema homepage
// before these fixes (Chrome 158, WebKit 27.2): Back moved 300 and 700 to 900 and 2413 to 1963, and a
// reload moved 2413 and 3163 to the bottom of the page.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { installNavigationLifecycle } from "../src/core/navigation/lifecycle.mjs";
import { mountThemeRuntime, registerThemeRuntime } from "../src/core/themes/runtime.mjs";
import { mountSceneCovers } from "../src/themes/ema/lib/rail.mjs";

const node = (extra = {}) => Object.assign(new EventTarget(), { dataset: {} }, extra);

test("a reload's saved position is applied again after the page, and a late theme runtime, have mounted", () => {
  const calls = [];
  const doc = node({ body: {}, documentElement: { dataset: {} }, querySelector: () => null });
  const win = node({ location: { hash: "" }, scrollTo: (position) => calls.push(position), __siteRestoredScroll: { top: 2400, left: 0 } });
  const uninstall = installNavigationLifecycle(doc, win, () => { calls.push("mount"); });
  const position = { top: 2400, left: 0, behavior: "instant" };
  assert.deepEqual(calls, ["mount", position]);
  assert.equal(win.__siteRestoredScroll, null, "taken once");
  doc.dispatchEvent(new Event("site:theme-runtime-mounted"));
  assert.deepEqual(calls, ["mount", position, position]);
  win.dispatchEvent(new Event("wheel"));
  doc.dispatchEvent(new Event("site:theme-runtime-mounted"));
  assert.equal(calls.length, 3, "once the reader scrolls, the saved position is dropped");
  uninstall();
});

test("a fresh visit, or an arrival at an anchor, restores nothing", () => {
  for (const [saved, hash] of [[null, ""], [{ top: 0, left: 0 }, ""], [{ top: 900, left: 0 }, "#chapter"]]) {
    const calls = [];
    const doc = node({ body: {}, documentElement: { dataset: {} }, querySelector: () => null });
    const win = node({ location: { hash }, scrollTo: (position) => calls.push(position), __siteRestoredScroll: saved });
    installNavigationLifecycle(doc, win, () => {})();
    assert.deepEqual(calls, []);
  }
});

test("a theme runtime that mounts late announces it, and the router's saved position is kept before any module runs", () => {
  const doc = node({ documentElement: { dataset: { theme: "test-restore" } } });
  let announced = 0;
  doc.addEventListener("site:theme-runtime-mounted", () => announced++);
  const cleanup = mountThemeRuntime(doc, {});
  registerThemeRuntime("test-restore", () => () => {});
  assert.equal(announced, 1);
  cleanup();
  const head = readFileSync(new URL("../src/core/navigation/SiteNavigation.astro", import.meta.url), "utf8");
  assert.ok(head.indexOf("<script is:inline>\n  window.__siteRestoredScroll = history.state") < head.indexOf("<ClientRouter"), "inline, before the router");
});

function covers({ scrollY = 0, state = null, hash = "" } = {}) {
  const scrolls = [];
  const box = (top, extra = {}) => node({ getBoundingClientRect: () => ({ top: top - win.scrollY }), querySelector: () => null, querySelectorAll: () => [], ...extra });
  const railStage = { clientHeight: 900 };
  const rail = box(900, { offsetHeight: 1963, dataset: { mode: "scroll" }, querySelector: (s) => (s === ".k-rail-stage" ? railStage : null) });
  const parts = { "[data-k-stage]": box(0), "[data-k-rail]": rail, "[data-k-signal]": box(2863) };
  const root = { querySelector: (s) => parts[s] ?? null };
  const screen = { setAttribute() {}, remove() {}, animate: () => ({ finished: new Promise(() => {}), cancel() {} }) };
  const doc = node({ hidden: false, body: { append() {} }, createElement: () => screen, documentElement: { classList: { add() {}, remove() {}, contains: () => false } } });
  const win = node({
    scrollY, innerHeight: 900, location: { hash }, history: { state },
    matchMedia: () => node({ matches: true }), setTimeout: () => 1, clearTimeout() {},
    scrollTo(position) { scrolls.push(position.top); this.scrollY = position.top; },
  });
  const mounted = mountSceneCovers(root, doc, win);
  mounted.setHeroReady(true);
  const scroll = (y) => { win.scrollY = y; win.dispatchEvent(new Event("scroll")); };
  return { mounted, scrolls, scroll, win };
}

test("Ema's scene cuts leave a restored position alone until the reader uses the wheel", () => {
  // Control: a reader scrolling down from the top into the first scene is carried to the rail (0, then the cut).
  const fresh = covers();
  fresh.scroll(700);
  assert.deepEqual(fresh.scrolls.slice(0, 2), [0, 0]);
  fresh.mounted.cleanup();
  // Back through the router: mounted at the top, the history entry holds 700, then the lifecycle scrolls there.
  const back = covers({ scrollY: 0, state: { scrollY: 700 } });
  back.scroll(700); back.scroll(700); back.scroll(698);
  assert.deepEqual(back.scrolls, []);
  back.mounted.cleanup();
  // Reload: the router has already scrolled when the theme mounts, between the rail and the next scene.
  const reload = covers({ scrollY: 2413 });
  reload.scroll(2413); reload.scroll(2400);
  assert.deepEqual(reload.scrolls, []);
  reload.mounted.cleanup();
});
