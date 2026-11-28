import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { mountCollection } from "../src/core/features/collection.mjs";
import { mountReading } from "../src/core/features/reading.mjs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

function makeNode(tag = "div", extra = {}) {
  const classes = new Set();
  const node = Object.assign(new EventTarget(), {
    tagName: tag.toUpperCase(),
    id: "",
    className: "",
    dataset: {},
    attributes: {},
    style: {},
    hidden: false,
    value: "",
    textContent: "",
    classList: {
      add: (...list) => list.forEach((c) => classes.add(c)),
      remove: (...list) => list.forEach((c) => classes.delete(c)),
      contains: (c) => classes.has(c),
    },
    setAttribute(key, value) { this.attributes[key] = String(value); },
    getAttribute(key) { return this.attributes[key] ?? null; },
    removeAttribute(key) { delete this.attributes[key]; },
    focus() { this.focused = true; },
  }, extra);
  return node;
}

function collectionTransitionHarness({ theme = "ema", paused = false, reduced = false, withVT = true, throwVT = false, shelfSwap = false } = {}) {
  const classes = new Set();
  let finishResolve;
  let vtCalls = 0;
  const html = {
    dataset: { theme, motionPaused: String(paused) },
    hasAttribute: (attr) => attr === "data-shelf-swap" && shelfSwap,
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

test("collection filtering runs View Transitions on category/sort/reset, cleans up, and skips typing/Endfield/paused/reduced/shelfSwap", async () => {
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

  // Bypass cases: Endfield, paused, reduced motion, no support, shelfSwap, throwing.
  for (const opts of [{ theme: "endfield" }, { paused: true }, { reduced: true }, { withVT: false }, { shelfSwap: true }]) {
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
  const postRowSrc = read("src/themes/blank/components/PostRow.astro");
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

  // Article colophon, PostRow reading time, and Credits evolution timeline stay grounded.
  assert.match(articleSrc, /class="site-colophon"/);
  assert.match(postRowSrc, /article\.readingTime/);
  assert.match(creditsSrc, /class="site-evolution"/);
  assert.match(blankTheme, /\.blank-credits-body \.site-evolution \{[^}]*padding: 0 0 0 24px;/);
  assert.doesNotMatch(messagesSrc, /CC BY|Creative Commons/i);
});
