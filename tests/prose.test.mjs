import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { readingStats } from "../src/core/content/reading-time.mjs";
import { mountProse } from "../src/core/features/prose.mjs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

// Minimal DOM harness matching the browser surface used by mountProse (no third-party DOM dependency).
function createDom({ commandEvent = true, closedBy = true, topLayerExit = true, clipboardOk = true, execCopyOk = false, motionPaused = false } = {}) {
  const docListeners = new Map();
  let activeElement = null;

  class Node extends EventTarget {
    constructor(tag) {
      super();
      this.tagName = tag.toUpperCase();
      this.parentNode = null;
      this.children = [];
      this.attributes = new Map();
      this.dataset = {};
      this.style = { cssText: "", display: "" };
      this.hidden = false;
      this.open = false;
      this._text = "";
      this.offsetWidth = 0;
      this.classList = {
        add: (...names) => {
          const set = new Set((this.className || "").split(/\s+/).filter(Boolean));
          for (const n of names) set.add(n);
          this.className = [...set].join(" ");
        },
        remove: (...names) => {
          const set = new Set((this.className || "").split(/\s+/).filter(Boolean));
          for (const n of names) set.delete(n);
          this.className = [...set].join(" ");
        },
        contains: (name) => (this.className || "").split(/\s+/).includes(name),
      };
    }
    get className() { return this.attributes.get("class") ?? ""; }
    set className(v) { this.attributes.set("class", String(v)); }
    get id() { return this.attributes.get("id") ?? ""; }
    set id(v) { this.attributes.set("id", String(v)); }
    get childNodes() { return this.children; }
    get textContent() {
      if (this.children.length === 0) return this._text;
      return this.children.map((c) => c.textContent).join("");
    }
    set textContent(v) {
      this.children = [];
      this._text = String(v);
    }
    get innerText() { return this.textContent; }
    get nextElementSibling() {
      if (!this.parentNode) return null;
      const idx = this.parentNode.children.indexOf(this);
      return idx >= 0 ? (this.parentNode.children[idx + 1] ?? null) : null;
    }
    setAttribute(name, value) {
      const str = String(value);
      this.attributes.set(name, str);
      if (name.startsWith("data-")) {
        const key = name.slice(5).replace(/-([a-z])/g, (_, ch) => ch.toUpperCase());
        this.dataset[key] = str;
      }
    }
    getAttribute(name) { return this.attributes.get(name) ?? null; }
    hasAttribute(name) { return this.attributes.has(name); }
    removeAttribute(name) {
      this.attributes.delete(name);
      if (name.startsWith("data-")) {
        const key = name.slice(5).replace(/-([a-z])/g, (_, ch) => ch.toUpperCase());
        delete this.dataset[key];
      }
    }
    append(...nodes) {
      for (const node of nodes) {
        if (node.parentNode) node.remove();
        node.parentNode = this;
        this.children.push(node);
      }
    }
    before(...nodes) {
      if (!this.parentNode) return;
      const parent = this.parentNode;
      for (const node of nodes) {
        if (node.parentNode) node.remove();
        const idx = parent.children.indexOf(this);
        node.parentNode = parent;
        parent.children.splice(idx, 0, node);
      }
    }
    remove() {
      if (!this.parentNode) return;
      const idx = this.parentNode.children.indexOf(this);
      if (idx >= 0) this.parentNode.children.splice(idx, 1);
      this.parentNode = null;
    }
    contains(other) {
      let cur = other;
      while (cur) {
        if (cur === this) return true;
        cur = cur.parentNode;
      }
      return false;
    }
    matches(selector) {
      return selector.split(",").map((s) => s.trim()).some((part) => {
        if (part.startsWith(".")) return this.classList.contains(part.slice(1));
        if (part === 'button[command="--copy"]') return this.tagName === "BUTTON" && this.getAttribute("command") === "--copy";
        if (part === "[aria-hidden='true']") return this.getAttribute("aria-hidden") === "true";
        if (part === "[data-site-prose]") return this.hasAttribute("data-site-prose");
        if (part === "[data-site-lightbox]") return this.hasAttribute("data-site-lightbox");
        if (part === "h2[id]") return this.tagName === "H2" && Boolean(this.id);
        if (part === "h3[id]") return this.tagName === "H3" && Boolean(this.id);
        return this.tagName === part.toUpperCase();
      });
    }
    closest(selector) {
      let cur = this;
      while (cur) {
        if (cur.matches(selector)) return cur;
        cur = cur.parentNode;
      }
      return null;
    }
    querySelectorAll(selector) {
      const out = [];
      const walk = (el) => {
        for (const child of el.children) {
          if (child.matches(selector)) out.push(child);
          walk(child);
        }
      };
      walk(this);
      return out;
    }
    querySelector(selector) { return this.querySelectorAll(selector)[0] ?? null; }
    focus() { activeElement = this; }
    select() { activeElement = this; }
    getBoundingClientRect() { return { left: 100, top: 100, right: 500, bottom: 400, width: 400, height: 300 }; }
    getAnimations() { return []; }
    showModal() { this.open = true; this.setAttribute("open", ""); }
    close() {
      if (!this.open) return;
      this.open = false;
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    }
  }

  const documentElement = new Node("html");
  if (motionPaused) documentElement.dataset.motionPaused = "true";
  const body = new Node("body");
  documentElement.append(body);

  const copiedTexts = [];
  let execCopyCalls = 0;
  const scheduledTimeouts = [];
  const doc = {
    documentElement,
    body,
    get activeElement() { return activeElement; },
    createElement: (tag) => new Node(tag),
    createElementNS: (_ns, tag) => new Node(tag),
    querySelector: (sel) => documentElement.querySelector(sel),
    querySelectorAll: (sel) => documentElement.querySelectorAll(sel),
    getElementById: (id) => {
      const walk = (el) => {
        for (const c of el.children) {
          if (c.id === id) return c;
          const found = walk(c);
          if (found) return found;
        }
        return null;
      };
      return walk(documentElement);
    },
    execCommand: (cmd) => {
      if (cmd === "copy") {
        execCopyCalls += 1;
        return execCopyOk;
      }
      return false;
    },
    addEventListener: (type, fn, capture = false) => {
      if (!docListeners.has(type)) docListeners.set(type, []);
      docListeners.get(type).push({ fn, capture });
    },
    removeEventListener: (type, fn, capture = false) => {
      const list = docListeners.get(type);
      if (!list) return;
      const idx = list.findIndex((item) => item.fn === fn && item.capture === capture);
      if (idx >= 0) list.splice(idx, 1);
    },
    dispatchDoc: (type, event) => {
      for (const item of [...(docListeners.get(type) ?? [])]) item.fn(event);
    },
  };

  class MockDialog {}
  if (closedBy) MockDialog.prototype.closedBy = "any";

  const win = {
    location: { href: "https://neroarataki.com/blog/dev-log-01/" },
    HTMLDialogElement: MockDialog,
    CSS: {
      supports: (prop, val) => {
        if (prop === "overlay" && val === "auto") return topLayerExit;
        if (prop === "transition-behavior" && val === "allow-discrete") return topLayerExit;
        return false;
      },
    },
    getComputedStyle: (el) => ({ display: topLayerExit ? "block" : el.style.display }),
    navigator: {
      clipboard: {
        writeText: async (text) => {
          if (!clipboardOk) throw new Error("Denied");
          copiedTexts.push(text);
        },
      },
    },
    requestAnimationFrame: (cb) => { cb(); return 1; },
    setTimeout: (cb, ms) => {
      const id = scheduledTimeouts.length + 1;
      scheduledTimeouts.push({ id, cb, ms, cleared: false });
      return id;
    },
    clearTimeout: (id) => {
      const item = scheduledTimeouts.find((t) => t.id === id);
      if (item) item.cleared = true;
    },
  };
  if (commandEvent) win.CommandEvent = function CommandEvent() {};

  return { doc, win, body, copiedTexts, getExecCopyCalls: () => execCopyCalls, scheduledTimeouts };
}

test("readingStats counts CJK characters and Latin words cleanly while ignoring Markdown syntax", () => {
  assert.deepEqual(readingStats(""), { count: 0, cjk: 0, latin: 0, minutes: 0 });
  assert.deepEqual(readingStats("   \n<!-- comment -->\n"), { count: 0, cjk: 0, latin: 0, minutes: 0 });

  const zh = readingStats("# 标题\n\n这是一篇测试文章，带有 [链接文本](https://example.com) 和 `Astro`。\n");
  assert.equal(zh.cjk, 17);
  assert.equal(zh.latin, 1);
  assert.equal(zh.count, 18);
  assert.equal(zh.minutes, 1);

  const en = readingStats("Hello world! ".repeat(220));
  assert.equal(en.cjk, 0);
  assert.equal(en.latin, 440);
  assert.equal(en.minutes, 3);

  const devLog = read("src/content/blog/dev-log-01.md");
  const stats = readingStats(devLog.replace(/^---[\s\S]*?---\n/, ""));
  assert.ok(stats.count > 200, `expected >200 chars in dev-log-01, got ${stats.count}`);
  assert.ok(stats.minutes >= 1);
});

test("mountProse code copy uses Invoker Commands, VoiceOver deduplication, and cleans up", async () => {
  const { doc, win, body, copiedTexts, scheduledTimeouts } = createDom({ commandEvent: true });
  const prose = doc.createElement("div");
  prose.setAttribute("data-site-prose", "");
  prose.setAttribute("data-copy-code", "Copy code");
  prose.setAttribute("data-copy-code-lang", "Copy {lang} code");
  prose.setAttribute("data-copied", "Copied");
  prose.setAttribute("data-copy-failed", "Copy failed");

  const pre = doc.createElement("pre");
  pre.setAttribute("data-language", "ts");
  const code = doc.createElement("code");
  code.textContent = "const hello = 1;\n";
  pre.append(code);
  prose.append(pre);
  body.append(prose);

  const cleanup = mountProse(doc, win);
  const button = prose.querySelector("button");
  const tip = button.nextElementSibling;
  assert.equal(button.getAttribute("command"), "--copy");
  assert.equal(button.getAttribute("commandfor"), code.id);
  assert.equal(button.getAttribute("aria-label"), "Copy ts code");
  assert.equal(tip.getAttribute("role"), "status");
  assert.equal(button.contains(tip), false, "status bubble stays outside button");
  assert.equal(pre.getAttribute("tabindex"), "0");

  // Command event triggers copy once.
  const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
  doc.dispatchDoc("command", { command: "--copy", source: button, target: code });
  await flush();
  assert.deepEqual(copiedTexts, ["const hello = 1;"]);
  assert.equal(button.hasAttribute("data-copied"), true);
  assert.equal(button.disabled, undefined, "button is never disabled while showing feedback");
  assert.equal(tip.textContent, "Copied");

  // Click event must NOT double-copy when CommandEvent is supported.
  doc.dispatchDoc("click", { defaultPrevented: false, target: button });
  await flush();
  assert.equal(copiedTexts.length, 1);

  // Repeat copy appends \u00A0 so VoiceOver announces it again.
  doc.dispatchDoc("command", { command: "--copy", source: button, target: code });
  await flush();
  assert.equal(tip.textContent, "Copied\u00A0");

  // Timeout clears copied state and status text.
  const activeTimer = scheduledTimeouts.find((t) => !t.cleared);
  activeTimer.cb();
  assert.equal(button.hasAttribute("data-copied"), false);
  assert.equal(tip.textContent, "");

  cleanup();
  assert.equal(prose.querySelector(".site-code-block"), null);
  assert.equal(prose.querySelector("pre"), pre);
});

test("mountProse code copy falls back to click + legacyCopy and surfaces failures", async () => {
  const { doc, win, body, getExecCopyCalls } = createDom({ commandEvent: false, clipboardOk: false, execCopyOk: false });
  const prose = doc.createElement("div");
  prose.setAttribute("data-site-prose", "");
  prose.setAttribute("data-copy-failed", "Copy failed");
  const pre = doc.createElement("pre");
  const code = doc.createElement("code");
  code.textContent = "echo hi";
  pre.append(code);
  prose.append(pre);
  body.append(prose);

  const cleanup = mountProse(doc, win);
  const button = prose.querySelector("button");
  const tip = button.nextElementSibling;

  doc.dispatchDoc("click", { defaultPrevented: false, target: button });
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(getExecCopyCalls(), 1);
  assert.equal(button.hasAttribute("data-failed"), true);
  assert.equal(tip.textContent, "Copy failed");
  cleanup();
});

test("mountProse appends heading # anchors that copy section permalinks", async () => {
  const { doc, win, body, copiedTexts } = createDom();
  const prose = doc.createElement("div");
  prose.setAttribute("data-site-prose", "");
  prose.setAttribute("data-copy-heading", "Copy link to {title}");
  prose.setAttribute("data-copied", "Copied");

  const h2 = doc.createElement("h2");
  h2.id = "design-notes";
  h2.textContent = "Design Notes";
  const h2NoId = doc.createElement("h2");
  h2NoId.textContent = "No ID";
  prose.append(h2, h2NoId);
  body.append(prose);

  const cleanup = mountProse(doc, win);
  const anchor = h2.querySelector(".heading-anchor");
  assert.ok(anchor);
  assert.equal(anchor.getAttribute("aria-label"), "Copy link to Design Notes");
  assert.equal(h2NoId.querySelector(".heading-anchor"), null);

  anchor.dispatchEvent(Object.assign(new Event("click"), { button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false }));
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.deepEqual(copiedTexts, ["https://neroarataki.com/blog/dev-log-01/#design-notes"]);
  assert.equal(anchor.hasAttribute("data-copied"), true);

  cleanup();
  assert.equal(h2.querySelector(".heading-anchor"), null);
});

test("mountProse lightbox opens modal dialog, joins figcaption parts, skips linked images, and supports Safari fallback", async () => {
  const { doc, win, body } = createDom({ closedBy: false, topLayerExit: false });
  const gallery = doc.createElement("section");
  gallery.setAttribute("data-site-lightbox", "");
  gallery.setAttribute("data-lightbox-open", "Zoom {alt}");
  gallery.setAttribute("data-lightbox-label", "Image preview");
  gallery.setAttribute("data-lightbox-close", "Close preview");

  const figure = doc.createElement("figure");
  const img = doc.createElement("img");
  img.setAttribute("alt", "Homepage screenshot");
  img.src = "/projects/gallery/blank-home-light.png";
  const figcaption = doc.createElement("figcaption");
  const num = doc.createElement("b"); num.textContent = "01";
  const label = doc.createElement("span"); label.textContent = "Blank Home";
  const meta = doc.createElement("small"); meta.textContent = "Light · 1440×960";
  figcaption.append(num, label, meta);
  figure.append(img, figcaption);

  // Linked image should not be wrapped in a zoom button.
  const link = doc.createElement("a");
  const linkedImg = doc.createElement("img");
  linkedImg.src = "/skip.png";
  link.append(linkedImg);

  gallery.append(figure, link);
  body.append(gallery);

  const cleanup = mountProse(doc, win);
  const triggers = gallery.querySelectorAll(".site-zoom-trigger");
  assert.equal(triggers.length, 1);
  assert.equal(triggers[0].getAttribute("aria-label"), "Zoom Homepage screenshot");

  const dialog = body.querySelector("dialog");
  assert.equal(dialog.getAttribute("closedby"), "any");
  assert.equal(dialog.getAttribute("aria-label"), "Image preview");

  triggers[0].dispatchEvent(new Event("click"));
  assert.equal(dialog.open, true);
  assert.equal(dialog.querySelector(".site-lightbox-img").src, "/projects/gallery/blank-home-light.png");
  assert.equal(dialog.querySelector(".site-lightbox-caption").textContent, "01 · Blank Home · Light · 1440×960");

  // Click inside dialog bounds should NOT close it.
  dialog.dispatchEvent(Object.assign(new Event("pointerdown"), { clientX: 200, clientY: 200 }));
  dialog.dispatchEvent(Object.assign(new Event("click"), { clientX: 200, clientY: 200 }));
  await Promise.resolve();
  assert.equal(dialog.open, true);

  // Click outside dialog bounds (on backdrop) closes it via Safari fallback and restores focus.
  dialog.dispatchEvent(Object.assign(new Event("pointerdown"), { clientX: 10, clientY: 10 }));
  dialog.dispatchEvent(Object.assign(new Event("click"), { clientX: 10, clientY: 10 }));
  await Promise.resolve();
  assert.equal(dialog.open, false);
  assert.equal(doc.activeElement, triggers[0]);

  cleanup();
  assert.equal(body.querySelector("dialog"), null);
  assert.equal(gallery.querySelector(".site-zoom-trigger"), null);
});

test("RSS XSLT stylesheet, feed link, JSON-LD structured data, and four-locale UI strings are wired", () => {
  const xsl = read("public/rss.xsl");
  assert.match(xsl, /<xsl:stylesheet/);
  assert.match(xsl, /rss\/channel/);

  const feed = read("src/core/content/feed.ts");
  assert.match(feed, /<\?xml-stylesheet type="text\/xsl" href="\/rss\.xsl"\?>/);

  const meta = read("src/core/components/SiteMeta.astro");
  assert.match(meta, /"@type":\s*"BlogPosting"/);
  assert.match(meta, /"@type":\s*"WebSite"/);
  assert.match(meta, /application\/ld\+json/);
  assert.match(meta, /\\u003c/);

  const messages = read("src/core/i18n/messages.ts");
  for (const key of [
    "blog.rss",
    "article.words",
    "article.readingTime",
    "article.copyCode",
    "article.copyCodeLang",
    "article.copied",
    "article.copyFailed",
    "article.copyHeading",
    "article.lightboxOpen",
    "article.lightboxLabel",
    "article.lightboxClose",
  ]) {
    const matches = messages.match(new RegExp(`"${key.replace(".", "\\.")}":`, "g")) ?? [];
    assert.equal(matches.length, 4, `${key} should exist in all 4 locales`);
  }
});
