import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { stripMarkdown, readingStats } from "../src/core/content/reading-time.mjs";
import { mountProseAnchors } from "../src/core/features/prose-anchors.mjs";
import { mountCollection } from "../src/core/features/collection.mjs";
import { mountReading } from "../src/core/features/reading.mjs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

function makeNode(tag = "div", extra = {}) {
  const classes = new Set();
  const children = [];
  const node = Object.assign(new EventTarget(), {
    tagName: tag.toUpperCase(),
    nodeType: 1,
    id: "",
    className: "",
    dataset: {},
    attributes: {},
    style: {},
    hidden: false,
    value: "",
    textContent: "",
    innerHTML: "",
    parentNode: null,
    childNodes: children,
    classList: {
      add: (...list) => list.forEach((c) => classes.add(c)),
      remove: (...list) => list.forEach((c) => classes.delete(c)),
      contains: (c) => classes.has(c) || node.className.split(/\s+/).includes(c),
    },
    setAttribute(key, value) {
      this.attributes[key] = String(value);
      if (key === "id") this.id = String(value);
    },
    getAttribute(key) { return this.attributes[key] ?? null; },
    hasAttribute(key) { return key in this.attributes; },
    removeAttribute(key) { delete this.attributes[key]; },
    append(...items) {
      for (const item of items) {
        if (item && typeof item === "object") item.parentNode = this;
        children.push(item);
      }
    },
    remove() {
      if (!this.parentNode) return;
      const list = this.parentNode.childNodes;
      const idx = list.indexOf(this);
      if (idx >= 0) list.splice(idx, 1);
      this.parentNode = null;
    },
    contains(target) {
      if (target === this) return true;
      for (const child of children) {
        if (child === target) return true;
        if (child?.contains?.(target)) return true;
      }
      return false;
    },
    closest(selector) {
      if (selector === 'button[command="--copy-heading"]') {
        return this.tagName === "BUTTON" && this.attributes.command === "--copy-heading" ? this : this.parentNode?.closest?.(selector) ?? null;
      }
      if (selector === "[data-copy-heading-label]") {
        return this.dataset.copyHeadingLabel ? this : this.parentNode?.closest?.(selector) ?? null;
      }
      return null;
    },
    querySelector(selector) {
      if (selector === ".site-heading-copy") {
        return children.find((c) => c?.classList?.contains("site-heading-copy")) ?? null;
      }
      return null;
    },
    focus() { this.focused = true; },
  }, extra);
  Object.defineProperty(node, "nextElementSibling", {
    get() {
      if (!this.parentNode) return null;
      const list = this.parentNode.childNodes;
      const idx = list.indexOf(this);
      return idx >= 0 ? (list[idx + 1] ?? null) : null;
    },
  });
  return node;
}

test("reading-time strips Markdown syntax and estimates CJK and English lengths", () => {
  const md = [
    "---",
    "title: Test",
    "---",
    "# 标题",
    "",
    "这是一段包含 [链接](https://example.com)、`inline()` 和 **加粗** 的文字。",
    "",
    "```js",
    "const x = 1;",
    "```",
    "",
    "![图片说明](/img.png)",
  ].join("\n");
  const plain = stripMarkdown(md);
  assert.doesNotMatch(plain, /title: Test|https:\/\/example\.com|```|\*\*|\/img\.png/);
  assert.match(plain, /这是一段包含/);
  assert.match(plain, /图片说明/);

  const zh = readingStats("中".repeat(820), "zh-CN");
  assert.equal(zh.cjk, 820);
  assert.equal(zh.count, 820);
  assert.equal(zh.minutes, 2);

  const en = readingStats(Array.from({ length: 440 }, () => "word").join(" "), "en");
  assert.equal(en.latin, 440);
  assert.equal(en.minutes, 2);

  const tiny = readingStats("短", "ja");
  assert.equal(tiny.count, 1);
  assert.equal(tiny.minutes, 1);
});

function proseHarness({ withCommandEvent = true, clipboardOk = true } = {}) {
  let nextTimer = 0;
  let nextFrame = 0;
  const timers = new Map();
  const frames = new Map();
  const writes = [];

  const host = makeNode("article", {
    dataset: {
      copyHeadingLabel: "复制小节链接：{title}",
      copiedText: "已复制链接",
      copyFailedText: "复制失败",
    },
  });
  const prose = makeNode("div");
  const h2 = makeNode("h2", { id: "intro-section" });
  h2.childNodes.push({ nodeType: 3, nodeValue: "第一步" });
  const h3 = makeNode("h3", { id: "中文小节" });
  h3.childNodes.push({ nodeType: 3, nodeValue: "细节说明" });
  prose.append(h2, h3);
  host.append(prose);
  prose.querySelectorAll = (selector) => (selector === "h2[id], h3[id]" ? [h2, h3] : []);

  const docListeners = [];
  const doc = {
    querySelector: (selector) => (selector === "[data-site-prose]" ? prose : null),
    getElementById: (id) => [h2, h3].find((node) => node.id === id) ?? null,
    createElement: (tag) => makeNode(tag),
    addEventListener(type, fn, capture = false) { docListeners.push({ type, fn, capture: Boolean(capture) }); },
    removeEventListener(type, fn, capture = false) {
      const idx = docListeners.findIndex((l) => l.type === type && l.fn === fn && l.capture === Boolean(capture));
      if (idx >= 0) docListeners.splice(idx, 1);
    },
    dispatch(type, event) {
      for (const l of [...docListeners]) if (l.type === type) l.fn(event);
    },
  };

  const win = {
    location: { origin: "https://neroarataki.com", pathname: "/blog/test/" },
    navigator: {
      clipboard: {
        async writeText(text) {
          writes.push(text);
          if (!clipboardOk) throw new Error("denied");
        },
      },
    },
    requestAnimationFrame(fn) { frames.set(++nextFrame, fn); return nextFrame; },
    setTimeout(fn, ms) { timers.set(++nextTimer, { fn, ms }); return nextTimer; },
    clearTimeout(id) { timers.delete(id); },
  };
  if (withCommandEvent) win.CommandEvent = function CommandEvent() {};

  const flushFrames = () => {
    const fns = [...frames.values()];
    frames.clear();
    fns.forEach((fn) => fn());
  };
  const flushTimers = () => {
    const entries = [...timers.values()];
    timers.clear();
    entries.forEach((entry) => entry.fn());
  };

  return { doc, win, prose, h2, h3, writes, timers, flushFrames, flushTimers };
}

test("prose-anchors uses Invoker Commands when supported, keeps live region outside button, and toggles VoiceOver nbsp", async () => {
  const h = proseHarness({ withCommandEvent: true, clipboardOk: true });
  const cleanup = mountProseAnchors(h.doc, h.win);

  const wrap = h.h2.childNodes.find((n) => n?.className === "site-heading-copy");
  assert.ok(wrap);
  const [button, tip] = wrap.childNodes;
  assert.equal(button.attributes.command, "--copy-heading");
  assert.equal(button.attributes.commandfor, "intro-section");
  assert.equal(button.attributes["aria-label"], "复制小节链接：第一步");
  assert.equal(tip.attributes.role, "status");
  assert.equal(tip.textContent, "");
  assert.equal(button.contains(tip), false, "live region must stay outside button");

  // Click fallback should NOT run when CommandEvent is supported.
  h.doc.dispatch("click", { target: button, defaultPrevented: false });
  assert.equal(h.writes.length, 0);

  // Dispatch Invoker Command event on heading target.
  const cmdEvt = { command: "--copy-heading", source: button, target: h.h2 };
  h.doc.dispatch("command", cmdEvt);
  await Promise.resolve();
  assert.deepEqual(h.writes, ["https://neroarataki.com/blog/test/#intro-section"]);
  assert.equal(button.hasAttribute("data-copied"), true);
  h.flushFrames();
  assert.equal(tip.textContent, "已复制链接");
  assert.equal(h.timers.size, 1);

  // Second consecutive copy resets previous timer and appends nbsp for VoiceOver.
  h.doc.dispatch("command", cmdEvt);
  await Promise.resolve();
  assert.equal(h.timers.size, 1);
  h.flushFrames();
  assert.equal(tip.textContent, "已复制链接\u00A0");

  // After timeout, status resets cleanly.
  h.flushTimers();
  assert.equal(button.hasAttribute("data-copied"), false);
  assert.equal(tip.textContent, "");

  // Cleanup removes injected controls and listeners.
  cleanup();
  assert.equal(h.h2.classList.contains("site-copyable-heading"), false);
  assert.equal(h.h2.childNodes.find((n) => n?.className === "site-heading-copy"), undefined);
  h.doc.dispatch("command", cmdEvt);
  await Promise.resolve();
  assert.equal(h.writes.length, 2);
});

test("prose-anchors falls back to click when CommandEvent is unsupported and reports clipboard failures", async () => {
  const h = proseHarness({ withCommandEvent: false, clipboardOk: false });
  const cleanup = mountProseAnchors(h.doc, h.win);

  const wrap = h.h3.childNodes.find((n) => n?.className === "site-heading-copy");
  const [button, tip] = wrap.childNodes;
  h.doc.dispatch("click", { target: button, defaultPrevented: false });
  await Promise.resolve();
  await Promise.resolve();
  assert.deepEqual(h.writes, ["https://neroarataki.com/blog/test/#%E4%B8%AD%E6%96%87%E5%B0%8F%E8%8A%82"]);
  assert.equal(button.hasAttribute("data-failed"), true);
  h.flushFrames();
  assert.equal(tip.textContent, "复制失败");
  cleanup();
});

function collectionTransitionHarness({ theme = "ema", paused = false, reduced = false, withVT = true, throwVT = false } = {}) {
  const classes = new Set();
  let finishResolve;
  let vtCalls = 0;
  const html = {
    dataset: { theme, motionPaused: String(paused) },
    classList: {
      add: (c) => classes.add(c),
      remove: (c) => classes.delete(c),
      contains: (c) => classes.has(c),
    },
  };
  const doc = { documentElement: html };
  if (withVT) {
    doc.startViewTransition = (cb) => {
      vtCalls++;
      if (throwVT) throw new Error("vt unsupported");
      cb();
      const finished = new Promise((resolve) => { finishResolve = resolve; });
      return { finished };
    };
  }
  const entries = [
    makeNode("li", { id: "a", dataset: { category: "notes", date: "100", search: "alpha" } }),
    makeNode("li", { id: "b", dataset: { category: "code", date: "200", search: "beta" } }),
  ];
  const buttons = ["all", "notes", "code"].map((siteCategory) => makeNode("button", { dataset: { siteCategory } }));
  const nodes = Object.fromEntries(["filter-form", "query", "sort", "clear", "reset", "empty", "count"].map((n) => [n, makeNode("div")]));
  nodes.entries = makeNode("ol", {
    querySelectorAll: (s) => (s === "[data-site-entry]" ? entries : []),
    append() {},
  });
  const root = makeNode("section", {
    ownerDocument: doc,
    dataset: { unit: "items", unitOne: "item" },
    querySelector: (s) => nodes[s.slice("[data-site-".length, -1)] ?? null,
    querySelectorAll: (s) => (s === "[data-site-category]" ? buttons : []),
  });
  const win = Object.assign(new EventTarget(), {
    location: { href: "https://neroarataki.com/themes/ema/blog/" },
    history: { state: null, replaceState() {} },
    matchMedia: () => ({ matches: reduced }),
    setTimeout: (fn) => { fn(); return 1; },
    clearTimeout() {},
  });
  return { root, nodes, entries, buttons, win, html, classes, vtCalls: () => vtCalls, finish: () => finishResolve?.() };
}

test("collection filtering runs View Transitions on category/sort/reset, cleans up, and skips typing/Endfield/paused/reduced", async () => {
  const h = collectionTransitionHarness({ theme: "ema" });
  const cleanup = mountCollection(h.root, h.win);
  assert.equal(h.vtCalls(), 0, "initial restore does not animate");

  // Typing never uses View Transition.
  h.nodes.query.value = "alpha";
  h.nodes.query.dispatchEvent(new Event("input"));
  assert.equal(h.vtCalls(), 0);

  // Category click uses View Transition and cleans up after finished.
  h.buttons[1].dispatchEvent(new Event("click"));
  assert.equal(h.vtCalls(), 1);
  assert.equal(h.classes.has("site-filtering"), true);
  assert.equal(h.entries[0].style.viewTransitionName, "site-col-0");
  assert.equal(h.entries[0].style.viewTransitionClass, "site-collection-item");
  h.finish();
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(h.classes.has("site-filtering"), false);
  assert.equal(h.entries[0].style.viewTransitionName, "");
  assert.equal(h.entries[0].style.viewTransitionClass, "");

  // Sort change & reset also use View Transition.
  h.nodes.sort.value = "oldest";
  h.nodes.sort.dispatchEvent(new Event("change"));
  assert.equal(h.vtCalls(), 2);
  h.finish();
  await Promise.resolve();
  await Promise.resolve();
  h.nodes.reset.dispatchEvent(new Event("click"));
  assert.equal(h.vtCalls(), 3);
  cleanup();
  assert.equal(h.classes.has("site-filtering"), false, "cleanup clears in-flight state");

  // Bypass cases: Endfield, paused, reduced motion, no support, throwing.
  for (const opts of [{ theme: "endfield" }, { paused: true }, { reduced: true }, { withVT: false }]) {
    const skip = collectionTransitionHarness(opts);
    const done = mountCollection(skip.root, skip.win);
    skip.buttons[1].dispatchEvent(new Event("click"));
    assert.equal(skip.vtCalls(), 0, JSON.stringify(opts));
    done();
  }
  const err = collectionTransitionHarness({ throwVT: true });
  const doneErr = mountCollection(err.root, err.win);
  err.buttons[1].dispatchEvent(new Event("click"));
  assert.equal(err.classes.has("site-filtering"), false);
  assert.equal(err.entries[1].hidden, true, "fallback still filters entries when startViewTransition throws");
  doneErr();
});

test("reading progress updates [data-site-reading-pct] alongside the progress bar", () => {
  const prose = Object.assign(new EventTarget(), { rect: { top: 80, height: 1000 }, getBoundingClientRect() { return this.rect; } });
  const progress = { style: {} };
  const pct = { textContent: "" };
  const header = { getBoundingClientRect: () => ({ height: 80 }) };
  const nodes = { "[data-site-prose]": prose, "[data-site-progress]": progress, "[data-site-header]": header, "[data-site-reading-pct]": pct };
  const doc = Object.assign(new EventTarget(), {
    hidden: false,
    querySelector: (s) => nodes[s] ?? null,
    querySelectorAll: () => [],
  });
  let frameFn = null;
  const win = Object.assign(new EventTarget(), {
    innerHeight: 600,
    requestAnimationFrame: (fn) => { frameFn = fn; return 1; },
    cancelAnimationFrame: () => { frameFn = null; },
  });
  const cleanup = mountReading(doc, win);
  frameFn();
  assert.equal(pct.textContent, "0%");
  prose.rect.top = -160;
  win.dispatchEvent(new Event("scroll"));
  frameFn();
  assert.equal(pct.textContent, "50%");
  prose.rect.top = -500;
  win.dispatchEvent(new Event("scroll"));
  frameFn();
  assert.equal(pct.textContent, "100%");
  cleanup();
});

test("Direction A & B CSS and template contracts hold across themes", () => {
  const blankTheme = read("src/themes/blank/styles/theme.css");
  const blankMotion = read("src/themes/blank/styles/motion.css");
  const emaTheme = read("src/themes/ema/styles/theme.css");
  const animesSrc = read("src/core/data/animes.ts");
  const articleSrc = read("src/themes/blank/pages/ArticlePage.astro");
  const creditsSrc = read("src/themes/blank/pages/CreditsPage.astro");
  const messagesSrc = read("src/core/i18n/messages.ts");

  // Ema consolidated surface tokens exist.
  for (const token of ["--ema-r-sm:", "--ema-r-md:", "--ema-r-pill:", "--ema-shadow-flat:", "--ema-shadow-lift:", "--ema-shadow-panel:"]) {
    assert.ok(emaTheme.includes(token), `missing Ema surface token ${token}`);
  }
  // allow-discrete stays outside transition shorthand.
  assert.doesNotMatch(blankMotion, /transition:[^;]*allow-discrete/);
  assert.doesNotMatch(emaTheme, /transition:[^;]*allow-discrete/);
  assert.match(blankMotion, /transition-behavior:\s*allow-discrete/);
  assert.match(emaTheme, /transition-behavior:\s*allow-discrete/);

  // Sliding TOC indicator uses anchor positioning + border (not background/box-shadow) with @supports not fallback.
  assert.match(blankTheme, /anchor-name:\s*--site-toc-active/);
  assert.match(blankTheme, /border-inline-start:/);
  assert.match(blankTheme, /@supports not \(position-anchor:\s*--site-toc-active\)/);
  assert.match(emaTheme, /@supports \(position-anchor:\s*--site-toc-active\)/);

  // Anime schema supports optional status/note without inventing entries.
  assert.match(animesSrc, /export type AnimeStatus = "watching" \| "watched" \| "dropped"/);
  assert.doesNotMatch(animesSrc, /status:\s*"/);

  // Article colophon, 44px heading copy target, and Credits evolution timeline stay grounded.
  assert.match(articleSrc, /class="site-colophon"/);
  assert.match(creditsSrc, /class="site-evolution"/);
  assert.match(blankTheme, /\.site-copy-button::after \{ content: ""; position: absolute; inset: -9px; \}/);
  assert.match(blankTheme, /\.blank-credits-body \.site-evolution \{[^}]*padding: 0 0 0 24px;/);
  assert.doesNotMatch(messagesSrc, /CC BY|Creative Commons/i);
});
