import test from "node:test";
import assert from "node:assert/strict";
import { collectionUrl, matchesEntry, mountCollection, readCollectionState } from "../src/core/features/collection.mjs";
import { mountReading, readingProgress } from "../src/core/features/reading.mjs";
import { mountSiteFeatures } from "../src/core/features/runtime.mjs";
import { mountDisclosure } from "../src/core/features/disclosure.mjs";

// Small DOM fixtures keep these behavior checks independent of any theme's CSS.
function element(extra = {}) {
  return Object.assign(new EventTarget(), {
    dataset: {}, attributes: {}, style: {}, hidden: false, value: "",
    setAttribute(key, value) { this.attributes[key] = value; },
    removeAttribute(key) { delete this.attributes[key]; },
    focus() { this.focused = true; },
  }, extra);
}

test("character lists show six, expand fully and keep collapse reachable after remount", () => {
  const items = Array.from({ length: 37 }, () => element());
  const label = element();
  const toggle = element({
    hidden: true, dataset: { labelMore: "显示更多", labelLess: "收起" },
    getAttribute(key) { return this.attributes[key]; },
    querySelector: () => label,
    getBoundingClientRect: () => ({ top: -300, bottom: -256 }),
    scrollIntoView() { this.scrolled = true; },
  });
  const root = element({ dataset: { limit: "6" }, querySelector: () => toggle, querySelectorAll: () => items });
  const visible = () => items.filter((item) => !item.hidden).length;
  let cleanup = mountDisclosure(root, { innerHeight: 600 });
  assert.equal(visible(), 6);
  assert.equal(toggle.hidden, false);
  assert.equal(toggle.attributes["aria-expanded"], "false");
  assert.equal(label.textContent, "显示更多");
  toggle.dispatchEvent(new Event("click"));
  assert.equal(visible(), 37);
  assert.equal(toggle.attributes["aria-expanded"], "true");
  assert.equal(label.textContent, "收起");
  cleanup();
  cleanup = mountDisclosure(root, { innerHeight: 600 });
  assert.equal(visible(), 37, "navigation remount preserves the restored state");
  toggle.dispatchEvent(new Event("click"));
  assert.equal(visible(), 6);
  assert.equal(toggle.scrolled, true);
  cleanup();
  toggle.dispatchEvent(new Event("click"));
  assert.equal(visible(), 6, "cleanup removes the old handler");
});

test("six or fewer characters leave the unnecessary toggle hidden", () => {
  for (const count of [0, 2, 6]) {
    const toggle = element({ hidden: true, querySelector: () => element() });
    const items = Array.from({ length: count }, () => element());
    mountDisclosure(element({ dataset: { limit: "6" }, querySelector: () => toggle, querySelectorAll: () => items }), {});
    assert.equal(toggle.hidden, true);
    assert.ok(items.every((item) => !item.hidden));
  }
});

function browser(href) {
  let next = 0;
  const timers = new Map();
  const frames = new Map();
  const system = element({ matches: false });
  const win = element({
    location: { href }, innerHeight: 600,
    localStorage: { getItem: () => null, setItem: () => {} },
    matchMedia: () => system,
    setTimeout(fn) { timers.set(++next, fn); return next; },
    clearTimeout(id) { timers.delete(id); },
    requestAnimationFrame(fn) { frames.set(++next, fn); return next; },
    cancelAnimationFrame(id) { frames.delete(id); },
  });
  let writes = 0;
  win.history = {
    state: { retained: true },
    replaceState(state, unused, value) {
      assert.deepEqual(state, { retained: true });
      win.location.href = new URL(value, win.location.href).href;
      writes++;
    },
  };
  const flush = (queue) => {
    const callbacks = [...queue.values()];
    queue.clear();
    callbacks.forEach((fn) => fn());
  };
  return { win, system, timers, frames, writes: () => writes, flushTimers: () => flush(timers), flushFrames: () => flush(frames) };
}

function collection(theme = "blank", searchable = true, empty = false) {
  const entries = empty ? [] : [
    element({ id: "first", dataset: { category: "notes", date: "100", search: "你好 Ema journal" } }),
    element({ id: "second", dataset: { category: "notes", date: "300", search: "日本語 Ema journal" } }),
    element({ id: "third", dataset: { category: "code", date: "200", search: "ＥＭＡ Website" } }),
  ];
  const buttons = ["all", "notes", "code"].map((siteCategory) => element({ dataset: { siteCategory } }));
  const nodes = Object.fromEntries(["filter-form", "clear", "reset", "empty", "count"].map((name) => [name, element()]));
  if (searchable) Object.assign(nodes, { query: element(), sort: element() });
  nodes.entries = element({
    children: [...entries],
    querySelectorAll: (selector) => selector === "[data-site-entry]" ? entries : [],
    append(entry) { this.children = this.children.filter((node) => node !== entry).concat(entry); },
  });
  const root = element({
    className: `${theme}-archive`, dataset: { unit: "articles", unitOne: "article" },
    querySelector: (selector) => nodes[selector.slice("[data-site-".length, -1)] ?? null,
    querySelectorAll: (selector) => selector === "[data-site-category]" ? buttons : [],
  });
  return { root, nodes, entries, buttons, visible: () => nodes.entries.children.filter((node) => !node.hidden).map((node) => node.id) };
}

function reading() {
  const prose = element({ rect: { top: 80, height: 1000 }, getBoundingClientRect() { return this.rect; } });
  const progress = element();
  const header = { getBoundingClientRect: () => ({ height: 80 }) };
  const links = [element({ hash: "#first" }), element({ hash: "#%E6%97%A5%E6%9C%AC%E8%AA%9E" })];
  const sections = [
    { getBoundingClientRect: () => ({ top: 100 }) },
    { getBoundingClientRect: () => ({ top: 500 }) },
  ];
  const nodes = { "[data-site-prose]": prose, "[data-site-progress]": progress, "[data-site-header]": header };
  const doc = element({
    hidden: false, documentElement: { dataset: {} },
    querySelector: (selector) => nodes[selector] ?? null,
    querySelectorAll: (selector) => selector === "[data-site-toc] a" ? links : [],
    getElementById: (id) => sections[{ first: 0, 日本語: 1 }[id]] ?? null,
  });
  return { doc, prose, progress, links };
}

test("collection URLs retain locale, theme, unrelated parameters and anchors", () => {
  for (const prefix of ["", "/ja", "/en/themes/ema", "/themes/blank"]) {
    const source = `https://example.com${prefix}/blog/?utm_source=profile&tag=a&tag=b#blank-search`;
    const url = collectionUrl(source, { query: "  日本語 Ema ", category: "notes", sort: "oldest" });
    const parsed = new URL(url, source);
    assert.equal(parsed.pathname, `${prefix}/blog/`);
    assert.equal(parsed.hash, "#blank-search");
    assert.equal(parsed.searchParams.get("utm_source"), "profile");
    assert.deepEqual(parsed.searchParams.getAll("tag"), ["a", "b"]);
    assert.deepEqual(readCollectionState(parsed.href, ["all", "notes"]), { query: "日本語 Ema", category: "notes", sort: "oldest" });
    assert.equal(collectionUrl(parsed.href, { query: "", category: "all", sort: "newest" }), `${prefix}/blog/?utm_source=profile&tag=a&tag=b#blank-search`);
  }
});

test("search normalizes multilingual text and rejects unknown URL state", () => {
  assert.equal(matchesEntry({ category: "notes", search: "Ｅｍａ 日本語 journal" }, "  EMA   日本語 ", "notes"), true);
  assert.equal(matchesEntry({ category: "code", search: "Ema 日本語" }, "Ema", "notes"), false);
  assert.equal(matchesEntry({ category: "notes", search: "Ema 日本語" }, "Ema missing", "all"), false);
  const state = readCollectionState(`https://example.com/blog/?category=unknown&sort=invalid&q=${"a".repeat(301)}`, ["all", "notes"]);
  assert.equal(state.category, "all");
  assert.equal(state.sort, "newest");
  assert.equal(state.query.length, 300);
});

test("different theme markup gets the same search, ordering, history and reset behavior", () => {
  for (const theme of ["blank", "ema"]) {
    const c = collection(theme);
    const b = browser(`https://example.com/ja/themes/${theme}/blog/?q=Ema&category=notes&sort=oldest&ref=profile#blank-search`);
    const cleanup = mountCollection(c.root, b.win);
    assert.deepEqual(c.visible(), ["first", "second"]);
    assert.equal(c.nodes.query.value, "Ema");
    assert.equal(c.buttons[1].attributes["aria-pressed"], "true");
    c.nodes.query.value = "日本語";
    c.nodes.query.dispatchEvent(Object.assign(new Event("input"), { isComposing: true }));
    assert.deepEqual(c.visible(), ["first", "second"]);
    c.nodes.query.dispatchEvent(new Event("compositionend"));
    assert.deepEqual(c.visible(), ["second"]);
    assert.equal(c.nodes.count.textContent, "1 article");
    b.flushTimers();
    assert.equal(new URL(b.win.location.href).searchParams.get("q"), "日本語");
    assert.equal(new URL(b.win.location.href).pathname, `/ja/themes/${theme}/blog/`);
    c.buttons[2].dispatchEvent(new Event("click"));
    assert.equal(c.nodes.empty.hidden, false);
    c.nodes.reset.dispatchEvent(new Event("click"));
    assert.deepEqual(c.visible(), ["second", "third", "first"]);
    assert.equal(c.nodes.empty.hidden, true);
    assert.equal(c.nodes.query.focused, true);
    assert.equal(b.win.location.href, `https://example.com/ja/themes/${theme}/blog/?ref=profile#blank-search`);
    b.win.location.href = `https://example.com/ja/themes/${theme}/blog/?category=code`;
    b.win.dispatchEvent(new Event("popstate"));
    assert.deepEqual(c.visible(), ["third"]);
    cleanup();
  }
});

test("an empty collection never claims its filters matched nothing", () => {
  const c = collection("blank", true, true);
  const b = browser("https://example.com/blog/?q=anything");
  const cleanup = mountCollection(c.root, b.win);
  assert.equal(c.nodes.empty.hidden, true);
  assert.equal(c.nodes.count.textContent, "0 articles");
  cleanup();
});

test("category-only collections work without optional search and sort controls", () => {
  const c = collection("ema", false);
  const b = browser("https://example.com/en/themes/ema/projects/?q=ignored&sort=oldest&category=code");
  const cleanup = mountCollection(c.root, b.win);
  assert.deepEqual(c.visible(), ["third"]);
  c.buttons[0].dispatchEvent(new Event("click"));
  assert.deepEqual(c.visible(), ["first", "second", "third"]);
  assert.equal(b.win.location.href, "https://example.com/en/themes/ema/projects/");
  cleanup();
});

test("collection cleanup prevents pending search writes and stale page listeners", () => {
  const c = collection();
  const b = browser("https://example.com/blog/?ref=profile");
  const cleanup = mountCollection(c.root, b.win);
  c.nodes.query.value = "日本語";
  c.nodes.query.dispatchEvent(new Event("input"));
  assert.equal(b.timers.size, 1);
  cleanup();
  assert.equal(b.timers.size, 0);
  b.win.location.href = "https://example.com/en/themes/ema/about/?ref=profile";
  c.buttons[2].dispatchEvent(new Event("click"));
  b.win.dispatchEvent(new Event("popstate"));
  b.win.dispatchEvent(new Event("pagehide"));
  b.flushTimers();
  assert.equal(b.writes(), 0);
  assert.deepEqual(c.visible(), ["second"]);
});

test("reading progress clamps article geometry at both ends", () => {
  assert.equal(readingProgress(500, 1200, 600, 80), 0);
  assert.equal(readingProgress(80, 1200, 600, 80), 0);
  assert.equal(readingProgress(-260, 1200, 600, 80), 0.5);
  assert.equal(readingProgress(-2000, 1200, 600, 80), 1);
  assert.equal(readingProgress(80, 200, 600, 80), 1);
});

test("reader follows shared markers and removes animation, observers and captured events", () => {
  const r = reading();
  const b = browser("https://example.com/en/themes/ema/blog/hello/");
  const subscriptions = [];
  const capture = (options) => options === true || options?.capture === true;
  for (const target of [r.doc, r.prose, b.win]) {
    const add = target.addEventListener.bind(target);
    const remove = target.removeEventListener.bind(target);
    target.addEventListener = (type, handler, options) => {
      subscriptions.push({ target, type, handler, capture: capture(options) });
      add(type, handler, options);
    };
    target.removeEventListener = (type, handler, options) => {
      const index = subscriptions.findIndex((entry) => entry.target === target && entry.type === type && entry.handler === handler && entry.capture === capture(options));
      if (index >= 0) subscriptions.splice(index, 1);
      remove(type, handler, options);
    };
  }
  let disconnected = false;
  b.win.ResizeObserver = class {
    observe(node) { assert.equal(node, r.prose); }
    disconnect() { disconnected = true; }
  };
  const cleanup = mountReading(r.doc, b.win);
  b.flushFrames();
  assert.equal(r.progress.style.transform, "scaleX(0)");
  assert.equal(r.links[0].attributes["aria-current"], "location");
  r.prose.rect.top = -160;
  b.win.dispatchEvent(new Event("scroll"));
  b.flushFrames();
  assert.equal(r.progress.style.transform, "scaleX(0.5)");
  b.win.dispatchEvent(new Event("resize"));
  assert.equal(b.frames.size, 1);
  cleanup();
  assert.equal(b.frames.size, 0);
  assert.equal(disconnected, true);
  assert.equal(r.links[0].attributes["aria-current"], undefined, "cleanup must remove the old section highlight before remounting");
  assert.equal(subscriptions.length, 0, "all listener registrations, including capture, must be removed");
  for (const event of ["load", "toggle"]) r.prose.dispatchEvent(new Event(event));
  for (const event of ["scroll", "resize", "pageshow"]) b.win.dispatchEvent(new Event(event));
  r.doc.dispatchEvent(new Event("visibilitychange"));
  assert.equal(b.frames.size, 0);
});

test("shared runtime survives cached navigation and remounts without duplicate handlers", () => {
  const c = collection();
  const r = reading();
  const b = browser("https://example.com/blog/");
  const queryAll = r.doc.querySelectorAll;
  r.doc.querySelectorAll = (selector) => selector === "[data-site-collection]" ? [c.root] : queryAll(selector);
  mountSiteFeatures(r.doc, b.win);
  const cleanup = mountSiteFeatures(r.doc, b.win);
  b.win.dispatchEvent(Object.assign(new Event("pagehide"), { persisted: true }));
  const beforeClick = b.writes();
  c.buttons[1].dispatchEvent(new Event("click"));
  assert.equal(b.writes(), beforeClick + 1);
  assert.deepEqual(c.visible(), ["second", "first"]);
  b.win.dispatchEvent(Object.assign(new Event("pagehide"), { persisted: false }));
  const afterLeave = b.writes();
  c.buttons[2].dispatchEvent(new Event("click"));
  b.system.matches = true;
  b.system.dispatchEvent(new Event("change"));
  assert.equal(b.writes(), afterLeave);
  assert.equal(r.doc.documentElement.dataset.colorMode, "light");
  assert.equal(b.frames.size, 0);
  cleanup();
});
