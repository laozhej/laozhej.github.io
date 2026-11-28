import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { isIndexedPath } from "../src/core/themes/routing.mjs";
import { mountCollection } from "../src/core/features/collection.mjs";
import { filterPaletteItems, mountCommandPalette, resolveSitePath } from "../src/core/features/command-palette.mjs";
import { mountSerendipity, pickRandomEntry } from "../src/core/features/serendipity.mjs";
import { buildHeatmapGrid, getGitActivity, intensityLevel } from "../src/core/content/git-activity.mjs";
import { CODE_COLLAPSE_THRESHOLD, countCodeLines, mountProse } from "../src/core/features/prose.mjs";

const rootDir = fileURLToPath(new URL("..", import.meta.url));
const read = (path) => readFileSync(join(rootDir, path), "utf8");

function walkAstro(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walkAstro(full));
    else if (full.endsWith(".astro")) out.push(full);
  }
  return out;
}

// Minimal DOM mock helper for pure Node unit tests.
function makeEl(tag = "div", props = {}) {
  const attrs = new Map();
  const classes = new Set();
  const children = [];
  const el = Object.assign(new EventTarget(), {
    tagName: tag.toUpperCase(),
    id: "",
    className: "",
    dataset: {},
    style: {},
    hidden: false,
    open: false,
    value: "",
    tabIndex: 0,
    parentNode: null,
    isConnected: true,
    children,
    classList: {
      add: (...list) => list.forEach((c) => classes.add(c)),
      remove: (...list) => list.forEach((c) => classes.delete(c)),
      toggle: (c, force) => {
        const on = force === undefined ? !classes.has(c) : Boolean(force);
        if (on) classes.add(c); else classes.delete(c);
        return on;
      },
      contains: (c) => classes.has(c),
    },
    setAttribute(k, v) {
      attrs.set(k, String(v));
      if (k === "id") this.id = String(v);
      if (k === "class") {
        this.className = String(v);
        classes.clear();
        String(v).split(/\s+/).filter(Boolean).forEach((c) => classes.add(c));
      }
      if (k.startsWith("data-")) {
        const camel = k.slice(5).replace(/-([a-z])/g, (_, ch) => ch.toUpperCase());
        this.dataset[camel] = String(v);
      }
    },
    getAttribute(k) { return attrs.has(k) ? attrs.get(k) : null; },
    hasAttribute(k) { return attrs.has(k); },
    removeAttribute(k) {
      attrs.delete(k);
      if (k.startsWith("data-")) {
        const camel = k.slice(5).replace(/-([a-z])/g, (_, ch) => ch.toUpperCase());
        delete this.dataset[camel];
      }
    },
    append(...nodes) {
      for (const n of nodes) {
        if (typeof n === "string") continue;
        if (n.parentNode) n.remove();
        n.parentNode = this;
        children.push(n);
      }
    },
    before(node) {
      if (!this.parentNode) return;
      if (node.parentNode) node.remove();
      const idx = this.parentNode.children.indexOf(this);
      node.parentNode = this.parentNode;
      if (idx >= 0) this.parentNode.children.splice(idx, 0, node);
    },
    remove() {
      if (!this.parentNode) return;
      const idx = this.parentNode.children.indexOf(this);
      if (idx >= 0) this.parentNode.children.splice(idx, 1);
      this.parentNode = null;
    },
    matches(selector) {
      if (selector === '[role="option"]') return this.getAttribute("role") === "option";
      if (selector === ".line") return classes.has("line") || this.className.split(/\s+/).includes("line");
      if (selector === ".site-code-block") return classes.has("site-code-block") || this.className.includes("site-code-block");
      if (selector === "pre") return this.tagName === "PRE";
      if (selector === "code") return this.tagName === "CODE";
      if (selector === "button") return this.tagName === "BUTTON";
      return false;
    },
    closest(selector) {
      let cur = this;
      while (cur) {
        if (cur.matches?.(selector)) return cur;
        cur = cur.parentNode;
      }
      return null;
    },
    querySelectorAll(selector) {
      const found = [];
      const walk = (node) => {
        for (const child of node.children) {
          if (child.matches?.(selector)) found.push(child);
          walk(child);
        }
      };
      walk(this);
      return found;
    },
    querySelector(selector) { return this.querySelectorAll(selector)[0] ?? null; },
    focus() { this.focused = true; },
    click() { this.dispatchEvent(new Event("click", { bubbles: true, cancelable: true })); },
    scrollIntoView() { this.scrolled = true; },
    getBoundingClientRect() { return this._rect ?? { left: 100, right: 500, top: 80, bottom: 480, width: 400, height: 400 }; },
  }, props);
  if (props.className) {
    props.className.split(/\s+/).filter(Boolean).forEach((c) => classes.add(c));
  }
  Object.defineProperty(el, "textContent", {
    get() { return this._text !== undefined ? this._text : children.map((c) => c.textContent).join(""); },
    set(v) { this._text = String(v); children.length = 0; },
  });
  return el;
}

test("Item 5a: FontLinks avoids href-less <link rel=stylesheet> so client routing never requests /null", () => {
  const src = read("src/core/fonts/FontLinks.astro");
  assert.doesNotMatch(src, /<link\s+rel="stylesheet"\s+data-href=/);
  assert.match(src, /<meta name="site-font-pieces" content=\{href\} data-site-font-pieces \/>/);
  assert.match(src, /window\.__siteFontPiecesReady/);
  assert.match(src, /data-site-font-loaded/);
});

test("Item 5c: production routes bypass PageLayout for per-theme CSS split and every layout loads JetBrains Mono", () => {
  for (const layout of [
    "src/themes/blank/layouts/BlankLayout.astro",
    "src/themes/ema/layouts/EmaLayout.astro",
    "src/themes/endfield/layouts/EndfieldLayout.astro",
    "src/themes/arknights/layouts/ArknightsLayout.astro",
  ]) {
    assert.match(read(layout), /@fontsource-variable\/jetbrains-mono\/wght\.css/, layout);
  }
  for (const file of [...walkAstro(join(rootDir, "src/pages")), ...walkAstro(join(rootDir, "src/themes"))]) {
    const src = readFileSync(file, "utf8");
    assert.doesNotMatch(src, /@\/core\/themes\/PageLayout\.astro/, `${file} must not statically pull all four themes' CSS`);
  }
});

test("Item 5b: content-visibility: auto is scoped below the fold with contain-intrinsic-size, and collection VT caps large shelves", () => {
  const blankCss = read("src/themes/blank/styles/theme.css");
  const emaColCss = read("src/themes/ema/styles/collection.css");
  assert.match(blankCss, /\.blank-work-grid\.is-tall:not\(\.is-preview\) > li:nth-child\(n \+ 13\) \{[^}]*content-visibility: auto;[^}]*contain-intrinsic-size: auto none auto 360px;/);
  assert.match(emaColCss, /\.collection-posters:not\(\.is-preview\)>li:nth-child\(n\+11\) \{[^}]*content-visibility:auto;[^}]*contain-intrinsic-size:auto none auto 390px;/);

  // Large shelf (60 entries): View Transitions only name viewport-near items up to cap (24).
  const entries = Array.from({ length: 60 }, (_, i) =>
    makeEl("li", {
      id: `m-${i}`,
      dataset: { category: i % 2 === 0 ? "sci-fi" : "action", date: String(i), search: `film ${i}` },
      _rect: { top: i < 12 ? i * 60 : 5000, bottom: i < 12 ? i * 60 + 300 : 5300, height: 300 },
    }),
  );
  const html = { dataset: { theme: "blank", motionPaused: "false" }, hasAttribute: () => false, classList: { add() {}, remove() {}, contains: () => false } };
  let finish;
  const doc = {
    documentElement: html,
    startViewTransition: (cb) => { cb(); return { finished: new Promise((r) => { finish = r; }) }; },
  };
  const buttons = ["all", "sci-fi"].map((siteCategory) => makeEl("button", { dataset: { siteCategory } }));
  const nodes = Object.fromEntries(["filter-form", "query", "sort", "clear", "reset", "empty", "count"].map((n) => [n, makeEl("div")]));
  nodes.entries = makeEl("ol", { querySelectorAll: (s) => (s === "[data-site-entry]" ? entries : []), append() {} });
  const root = makeEl("section", {
    ownerDocument: doc,
    dataset: { unit: "movies", unitOne: "movie" },
    querySelector: (s) => nodes[s.slice("[data-site-".length, -1)] ?? null,
    querySelectorAll: (s) => (s === "[data-site-category]" ? buttons : []),
  });
  const win = Object.assign(new EventTarget(), {
    innerHeight: 900,
    location: { href: "https://neroarataki.com/themes/blank/collection/movies/" },
    history: { state: null, replaceState() {} },
    matchMedia: () => ({ matches: false }),
    setTimeout: (fn) => { fn(); return 1; },
    clearTimeout() {},
  });
  const cleanup = mountCollection(root, win);
  buttons[1].click();
  const named = entries.filter((e) => e.style.viewTransitionName);
  assert.ok(named.length > 0 && named.length <= 24, `expected <= 24 named entries, got ${named.length}`);
  assert.equal(entries[59].style.viewTransitionName ?? "", "", "deep off-screen card stays unnamed");
  finish();
  cleanup();
});

test("Item 1: search-index.json stays out of sitemap and CommandPalette follows native <dialog> + IME-safe contracts", async () => {
  for (const path of ["/search-index.json", "/zh-TW/search-index.json", "/ja/search-index.json", "/en/search-index.json"]) {
    assert.equal(isIndexedPath(path), false, path);
  }
  const tpl = read("src/core/components/CommandPalette.astro");
  assert.match(tpl, /<dialog class="site-cmdk" id="site-cmdk" closedby="any" aria-labelledby="site-cmdk-title"/);
  assert.doesNotMatch(tpl, /role="dialog"|aria-modal/);

  const css = read("src/themes/blank/styles/theme.css");
  assert.match(css, /dialog\.site-cmdk:modal \{\s*overscroll-behavior: contain;/);
  assert.match(css, /dialog\.site-cmdk::backdrop \{[^}]*overflow: hidden;\s*overscroll-behavior: contain;/);
  assert.doesNotMatch(css, /dialog\.site-cmdk\s*\{[^}]*\bdisplay:/);

  // Ranking & path resolution
  assert.equal(resolveSitePath("/collection/movies/#movies-x", "/ja", "/themes/ema"), "/ja/themes/ema/collection/movies/#movies-x");
  const filtered = filterPaletteItems({
    records: [
      { group: "collection", title: "奥本海默", sub: "电影 · 2023", path: "/collection/movies/#movies-oppenheimer", q: "奥本海默 oppenheimer nolan 2023" },
      { group: "pages", title: "收藏", sub: "全部收藏", path: "/collection/", q: "收藏 collection" },
    ],
    actions: [{ id: "mode", action: "mode", title: "切换深浅色模式", sub: "", q: "dark mode 深色" }],
    query: "oppenheimer",
  });
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].items[0].title, "奥本海默");

  // Runtime interaction: ⌘K open, lazy fetch, IME Enter block (isComposing + keyCode 229), real Enter, Safari closedby fallback, cleanup.
  const dialog = makeEl("dialog");
  dialog.showModal = () => { dialog.open = true; };
  dialog.close = () => { dialog.open = false; dialog.dispatchEvent(new Event("close")); };
  const input = makeEl("input");
  const list = makeEl("div");
  const empty = makeEl("p", { hidden: true });
  const notice = makeEl("p", { hidden: true });
  const status = makeEl("p");
  const clearBtn = makeEl("button", { hidden: true });
  const closeBtn = makeEl("button");
  const metaNode = makeEl("script", {
    _text: JSON.stringify({
      locale: "zh-CN", theme: "arknights", themeRoot: "", localePrefix: "", indexUrl: "/search-index.json",
      labels: { loading: "Loading", loadError: "Err", empty: "None", count: "{n}", groups: { collection: "收藏", actions: "操作" } },
      actions: [
        { id: "mode", action: "mode", title: "切换深浅色模式", sub: "", q: "mode dark" },
        { id: "theme-ema", action: "theme", themeId: "ema", href: "/themes/ema/", title: "切换主题：樱色档案", sub: "ema", q: "ema theme" },
      ],
    }),
  });
  const byAttr = {
    "[data-site-cmdk-meta]": metaNode, "[data-site-cmdk-input]": input, "[data-site-cmdk-list]": list,
    "[data-site-cmdk-empty]": empty, "[data-site-cmdk-notice]": notice, "[data-site-cmdk-status]": status,
    "[data-site-cmdk-clear]": clearBtn, "[data-site-cmdk-close]": closeBtn,
  };
  dialog.querySelector = (s) => byAttr[s] ?? null;

  let modeClicks = 0;
  const modeBtn = makeEl("button");
  modeBtn.addEventListener("click", () => modeClicks++);
  const trigger = makeEl("button", { hidden: true });
  const body = makeEl("body");
  let fetchCalls = 0;
  let assignedUrl = "";
  const stored = new Map();

  const doc = Object.assign(new EventTarget(), {
    body,
    documentElement: { dataset: { motionPaused: "true" } },
    activeElement: trigger,
    createElement: (tag) => makeEl(tag),
    querySelector: (s) => (s === "[data-site-cmdk]" ? dialog : s === "[data-color-mode-toggle]" ? modeBtn : null),
    querySelectorAll: (s) => (s === "[data-site-cmdk-open]" ? [trigger] : []),
    getElementById: () => null,
  });
  function FakeDialog() {}
  const win = {
    HTMLDialogElement: FakeDialog, // lacks `closedBy` -> enables Safari fallback
    CSS: { supports: () => true },
    getComputedStyle: () => ({ display: "block" }),
    navigator: { platform: "MacIntel" },
    location: { href: "https://neroarataki.com/", origin: "https://neroarataki.com", pathname: "/", assign: (u) => { assignedUrl = u; } },
    localStorage: { setItem: (k, v) => stored.set(k, v) },
    setTimeout: (fn) => { fn(); return 1; },
    clearTimeout() {},
    fetch: async () => {
      fetchCalls++;
      return { ok: true, json: async () => ({ items: [{ group: "collection", title: "奥本海默", sub: "电影", path: "/collection/movies/#movies-oppenheimer", q: "奥本海默 oppenheimer" }] }) };
    },
  };

  const cleanup = mountCommandPalette(doc, win);
  assert.equal(trigger.hidden, false, "hidden trigger reveals on mount");

  // Open via ⌘K
  const openEv = new Event("keydown", { cancelable: true });
  Object.assign(openEv, { key: "k", metaKey: true, ctrlKey: false, altKey: false, shiftKey: false });
  doc.dispatchEvent(openEv);
  assert.equal(dialog.open, true);
  assert.equal(fetchCalls, 1);
  await Promise.resolve();
  await Promise.resolve();

  // IME-safe Enter: isComposing=true MUST NOT activate!
  const imeEv1 = new Event("keydown", { cancelable: true });
  Object.assign(imeEv1, { key: "Enter", isComposing: true, keyCode: 13 });
  input.dispatchEvent(imeEv1);
  assert.equal(modeClicks, 0);
  assert.equal(dialog.open, true);

  // Safari WebKit bug 165004: keyCode=229 MUST NOT activate!
  const imeEv2 = new Event("keydown", { cancelable: true });
  Object.assign(imeEv2, { key: "Enter", isComposing: false, keyCode: 229 });
  input.dispatchEvent(imeEv2);
  assert.equal(modeClicks, 0);
  assert.equal(dialog.open, true);

  // Safari closedby fallback: press + release outside rect closes dialog.
  const pd = new Event("pointerdown");
  Object.assign(pd, { clientX: 10, clientY: 10 });
  const pu = new Event("pointerup");
  Object.assign(pu, { clientX: 10, clientY: 10 });
  dialog.dispatchEvent(pd);
  dialog.dispatchEvent(pu);
  assert.equal(dialog.open, false);

  // Reopen, filter to theme switch, press real Enter (keyCode 13) -> saves preference and reloads into new theme.
  trigger.click();
  assert.equal(dialog.open, true);
  input.value = "ema";
  input.dispatchEvent(new Event("input"));
  const enterEv = new Event("keydown", { cancelable: true });
  Object.assign(enterEv, { key: "Enter", isComposing: false, keyCode: 13 });
  input.dispatchEvent(enterEv);
  await Promise.resolve();
  assert.equal(stored.get("site-theme"), "ema");
  assert.equal(assignedUrl, "/themes/ema/");

  cleanup();
  assert.equal(trigger.hidden, true, "cleanup restores hidden trigger");
});

test("Item 2: Serendipity picker avoids immediate repeats and works across overview and filtered shelves", () => {
  const pool = [
    { key: "movies:a", shelf: "movies", shelfName: "电影", name: "Film A", meta: "科幻 · 2023", anchorId: "movies-a", shelfHref: "/collection/movies/#movies-a" },
    { key: "movies:b", shelf: "movies", shelfName: "电影", name: "Film B", meta: "剧情 · 2024", anchorId: "movies-b", shelfHref: "/collection/movies/#movies-b" },
  ];
  assert.equal(pickRandomEntry(pool, "movies:a", () => 0).key, "movies:b");
  assert.equal(pickRandomEntry(pool, "movies:b", () => 0).key, "movies:a");
  assert.equal(pickRandomEntry([pool[0]], "movies:a", () => 0).key, "movies:a");
  assert.equal(pickRandomEntry([], "", () => 0), null);

  const pickBtn = makeEl("button");
  const againBtn = makeEl("button");
  const closeBtn = makeEl("button");
  const jumpBtn = makeEl("button", { hidden: true });
  const openLink = makeEl("a", { hidden: true });
  const extLink = makeEl("a", { hidden: true });
  const extLabel = makeEl("span");
  const card = makeEl("article", { hidden: true });
  const media = makeEl("div");
  const shelfTag = makeEl("span");
  const titleEl = makeEl("h3");
  const originalEl = makeEl("p", { hidden: true });
  const metaEl = makeEl("p", { hidden: true });
  const statusEl = makeEl("p");
  const dataNode = makeEl("script", {
    _text: JSON.stringify({ isShelf: true, pool, labels: { announced: "抽中了{shelf}：{name}" } }),
  });
  const map = {
    "[data-site-serendipity-data]": dataNode, "[data-site-serendipity-pick]": pickBtn,
    "[data-site-serendipity-again]": againBtn, "[data-site-serendipity-close]": closeBtn,
    "[data-site-serendipity-jump]": jumpBtn, "[data-site-serendipity-open]": openLink,
    "[data-site-serendipity-ext]": extLink, "[data-site-serendipity-ext-label]": extLabel,
    "[data-site-serendipity-card]": card, "[data-site-serendipity-media]": media,
    "[data-site-serendipity-shelf-tag]": shelfTag, "[data-site-serendipity-title]": titleEl,
    "[data-site-serendipity-original]": originalEl, "[data-site-serendipity-meta]": metaEl,
    "[data-site-serendipity-status]": statusEl,
  };
  const targetCard = makeEl("li", { id: "movies-a" });
  const doc = {
    documentElement: { dataset: { motionPaused: "true" } },
    createElement: (tag) => makeEl(tag),
    querySelector: () => null,
    getElementById: (id) => (id === "movies-a" ? targetCard : null),
  };
  const root = makeEl("section", { ownerDocument: doc, hidden: true, querySelector: (s) => map[s] ?? null });
  const win = { setTimeout: () => 1, clearTimeout() {} };

  const cleanup = mountSerendipity(root, win, () => 0);
  assert.equal(root.hidden, false);
  pickBtn.click();
  assert.equal(card.hidden, false);
  assert.equal(titleEl.textContent, "Film A");
  assert.equal(jumpBtn.hidden, false);
  assert.equal(statusEl.textContent, "抽中了电影：Film A");

  jumpBtn.click();
  assert.equal(targetCard.scrolled, true);

  againBtn.click();
  assert.equal(titleEl.textContent, "Film B", "re-roll avoids immediate repeat");

  closeBtn.click();
  assert.equal(card.hidden, true);
  cleanup();
});

test("Item 3: Git heatmap builds accurate 52-week static grid, handles empty repos, and CI checks out full history", () => {
  const workflow = read(".github/workflows/deploy.yml");
  assert.match(workflow, /uses:\s*actions\/checkout@v\d+\s*\n\s*with:\s*\n\s*fetch-depth:\s*0/);

  assert.equal(intensityLevel(0, 10), 0);
  assert.equal(intensityLevel(10, 10), 4);
  assert.ok(intensityLevel(1, 20) >= 1);

  const grid = buildHeatmapGrid({ "2026-11-28": 5, "2026-11-27": 2, "2020-01-01": 9 }, { endDate: "2026-11-28", weeks: 52 });
  assert.equal(grid.weeks.length, 52);
  assert.equal(grid.weeks[0].days.length, 7);
  assert.equal(grid.totalCommits, 7, "ignores commits older than 52 weeks");
  assert.equal(grid.activeDays, 2);
  assert.equal(grid.maxPerDay, 5);
  assert.equal(grid.latestDate, "2026-11-28");

  const emptyGrid = buildHeatmapGrid({}, { endDate: "2026-11-28", weeks: 52 });
  assert.equal(emptyGrid.totalCommits, 0);
  assert.equal(emptyGrid.activeDays, 0);
  assert.equal(emptyGrid.latestDate, null);

  const real = getGitActivity({ cwd: rootDir });
  assert.ok(real.totalCommits >= 10, `expected real git history, got ${real.totalCommits}`);
  const fallback = getGitActivity({ cwd: "/tmp" });
  assert.equal(fallback.totalCommits, 0, "non-git dir degrades safely");
});

test("Item 4: long code blocks auto-collapse with 44px toggle while short blocks stay open and line numbers stay CSS-only", () => {
  const css = read("src/themes/blank/styles/theme.css");
  assert.match(css, /\.blank-prose pre\.astro-code > code \{[^}]*counter-reset: site-code-line;/);
  assert.match(css, /\.blank-prose pre\.astro-code \.line::before \{[^}]*user-select: none;/);
  assert.match(css, /\.site-code-fold \{[^}]*min-height: 44px;/);

  const makePre = (lines) => {
    const code = makeEl("code");
    for (let i = 0; i < lines; i++) {
      const span = makeEl("span", { className: "line", _text: `const x${i} = ${i};` });
      code.append(span);
    }
    const pre = makeEl("pre", { dataset: { language: "ts" } });
    pre.append(code);
    return pre;
  };

  const shortPre = makePre(5);
  const longPre = makePre(CODE_COLLAPSE_THRESHOLD + 6);
  assert.equal(countCodeLines(shortPre), 5);
  assert.equal(countCodeLines(longPre), CODE_COLLAPSE_THRESHOLD + 6);

  const prose = makeEl("div", {
    dataset: { copyCode: "Copy", codeExpand: "Expand {n}", codeCollapse: "Collapse" },
  });
  prose.append(shortPre, longPre);
  const doc = Object.assign(new EventTarget(), {
    body: makeEl("body"),
    documentElement: { dataset: {} },
    createElement: (tag) => makeEl(tag),
    createElementNS: (_, tag) => makeEl(tag),
    querySelector: (s) => (s === "[data-site-prose]" ? prose : null),
    querySelectorAll: () => [],
    getElementById: () => null,
  });
  const win = {
    location: { href: "https://neroarataki.com/blog/test/" },
    setTimeout: () => 1,
    clearTimeout() {},
    requestAnimationFrame: (fn) => { fn(); return 1; },
  };

  const cleanup = mountProse(doc, win);
  const blocks = prose.children;
  assert.equal(blocks.length, 2);
  assert.equal(blocks[0].dataset.collapsed, undefined, "short code block stays expanded");
  assert.equal(blocks[1].dataset.collapsed, "true", "long code block starts collapsed");
  const foldBtn = blocks[1].children.find((c) => c.className === "site-code-fold");
  assert.ok(foldBtn, "long code block renders expand button");
  assert.equal(foldBtn.getAttribute("aria-expanded"), "false");
  assert.match(foldBtn.textContent, /^Expand \d+$/);

  foldBtn.click();
  assert.equal(blocks[1].dataset.collapsed, "false");
  assert.equal(foldBtn.getAttribute("aria-expanded"), "true");
  assert.equal(foldBtn.textContent, "Collapse");

  cleanup();
  assert.equal(prose.children[0], shortPre);
  assert.equal(prose.children[1], longPre);
});
