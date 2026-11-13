import test from "node:test";
import assert from "node:assert/strict";
import { mountGallery } from "../src/themes/ema/lib/gallery.mjs";

const focused = { current: null };
function el(extra = {}) {
  return Object.assign(new EventTarget(), {
    dataset: {}, attributes: {}, hidden: false, textContent: "",
    setAttribute(key, value) { this.attributes[key] = String(value); },
    getAttribute(key) { return this.attributes[key] ?? null; },
    removeAttribute(key) { delete this.attributes[key]; },
    getClientRects: () => [{}],
    focus() { focused.current = this; },
  }, extra);
}

const SHOTS = [1, 2, 3, 4, 5, 6].map((n) => ({ src: `/projects/gallery/s${n}.png`, width: n > 4 ? "390" : "1440", height: n > 4 ? "844" : "960", label: `Shot ${n}`, meta: `Light · ${n}`, alt: `Alt ${n}` }));

function page({ withDialog = true } = {}) {
  const thumbs = SHOTS.map((shot) => el({ dataset: { ...shot }, scrolled: 0, scrollIntoView() { this.scrolled += 1; } }));
  const image = el({ src: "", alt: "", width: 0, height: 0 });
  const count = el(), label = el(), meta = el();
  const stage = el(), prev = el(), next = el(), close = el();
  const parts = { "[data-gallery-image]": image, "[data-gallery-count]": count, "[data-gallery-label]": label, "[data-gallery-meta]": meta, "[data-gallery-stage]": stage, "[data-gallery-close]": close, "[data-gallery-prev]": prev, "[data-gallery-next]": next };
  const dialog = el({
    open: false, modalCalls: 0,
    showModal() { this.open = true; this.modalCalls += 1; },
    close() { if (!this.open) return; this.open = false; this.dispatchEvent(new Event("close")); },
    querySelector: (s) => parts[s] ?? null,
    querySelectorAll: (s) => (s === "[data-gallery-thumb]" ? thumbs : s.startsWith("a[href]") ? [close, prev, next, ...thumbs] : []),
    contains: (node) => [close, prev, next, ...thumbs].includes(node),
  });
  const opener = el({ hidden: true });
  const root = el({
    querySelector: (s) => (s === "[data-gallery]" && withDialog ? dialog : null),
    querySelectorAll: (s) => (s === "[data-gallery-open]" ? [opener] : []),
  });
  const preloaded = [];
  const win = { Image: class { set src(value) { preloaded.push(value); } } };
  const doc = { get activeElement() { return focused.current; } };
  const cleanup = mountGallery(root, doc, win);
  const key = (k, extra = {}) => { const event = Object.assign(new Event("keydown", { cancelable: true }), { key: k, ...extra }); dialog.dispatchEvent(event); return event; };
  const swipe = (dx, dy = 0, pointerType = "touch") => {
    stage.dispatchEvent(Object.assign(new Event("pointerdown"), { pointerType, clientX: 200, clientY: 300 }));
    stage.dispatchEvent(Object.assign(new Event("pointerup"), { pointerType, clientX: 200 + dx, clientY: 300 + dy }));
  };
  const current = () => thumbs.findIndex((thumb) => thumb.getAttribute("aria-current") === "true");
  return { root, dialog, opener, thumbs, image, count, label, meta, prev, next, close, cleanup, key, swipe, current, preloaded };
}

test("the screenshot button appears with the script and opens the first shot with its caption", () => {
  const p = page();
  assert.equal(p.opener.hidden, false);
  assert.equal(p.dialog.open, false, "nothing opens by itself");
  p.opener.dispatchEvent(new Event("click"));
  assert.equal(p.dialog.open, true);
  assert.equal(p.image.src, "/projects/gallery/s1.png");
  assert.equal(p.image.alt, "Alt 1");
  assert.deepEqual([p.image.width, p.image.height], [1440, 960]);
  assert.equal(p.count.textContent, "1 / 6");
  assert.equal(p.label.textContent, "Shot 1");
  assert.equal(p.meta.textContent, "Light · 1");
  assert.equal(p.current(), 0);
  assert.equal(focused.current, p.close, "focus starts on the close button");
  assert.deepEqual(p.preloaded, ["/projects/gallery/s2.png"], "the next shot is fetched ahead");
  p.cleanup();
});

test("arrow keys, Home and End move between shots and wrap at both ends", () => {
  const p = page();
  p.opener.dispatchEvent(new Event("click"));
  assert.equal(p.key("ArrowRight").defaultPrevented, true);
  assert.equal(p.count.textContent, "2 / 6");
  p.key("End");
  assert.equal(p.count.textContent, "6 / 6");
  assert.deepEqual([p.image.width, p.image.height, p.image.alt], [390, 844, "Alt 6"], "phone shots keep their own size");
  p.key("ArrowRight");
  assert.equal(p.count.textContent, "1 / 6", "after the last shot comes the first");
  p.key("ArrowLeft");
  assert.equal(p.count.textContent, "6 / 6");
  p.key("Home");
  assert.equal(p.current(), 0);
  assert.equal(p.key("ArrowRight", { metaKey: true }).defaultPrevented, false, "shortcuts with modifiers are left to the browser");
  assert.equal(p.count.textContent, "1 / 6");
  p.cleanup();
});

test("buttons and thumbnails choose shots; the current thumbnail is marked and kept in view", () => {
  const p = page();
  p.opener.dispatchEvent(new Event("click"));
  p.thumbs[3].dispatchEvent(new Event("click"));
  assert.equal(p.current(), 3);
  assert.equal(p.label.textContent, "Shot 4");
  assert.ok(p.thumbs[3].scrolled > 0);
  p.prev.dispatchEvent(new Event("click"));
  assert.equal(p.current(), 2);
  p.next.dispatchEvent(new Event("click"));
  p.next.dispatchEvent(new Event("click"));
  assert.equal(p.current(), 4);
  assert.equal(p.thumbs.filter((thumb) => thumb.getAttribute("aria-current") === "true").length, 1);
  p.cleanup();
});

test("a horizontal swipe switches shots on touch; mouse drags and vertical moves do not", () => {
  const p = page();
  p.opener.dispatchEvent(new Event("click"));
  p.swipe(-80);
  assert.equal(p.current(), 1, "swipe left shows the next shot");
  p.swipe(80);
  assert.equal(p.current(), 0, "swipe right shows the previous shot");
  p.swipe(-80, 0, "mouse");
  p.swipe(-50, 120);
  p.swipe(-30);
  assert.equal(p.current(), 0);
  p.cleanup();
});

test("closing returns focus to the opener; the backdrop closes; Tab stays inside", () => {
  const p = page();
  p.opener.dispatchEvent(new Event("click"));
  p.dialog.close();
  assert.equal(focused.current, p.opener, "focus goes back to the screenshot button");
  p.opener.dispatchEvent(new Event("click"));
  p.dialog.dispatchEvent(new Event("click")); // dispatched on the dialog itself, as a backdrop click is
  assert.equal(p.dialog.open, false, "a click on the dimmed backdrop closes the viewer");
  p.opener.dispatchEvent(new Event("click"));
  focused.current = p.thumbs[5];
  assert.equal(p.key("Tab").defaultPrevented, true);
  assert.equal(focused.current, p.close, "Tab from the last control wraps to the first");
  assert.equal(p.key("Tab", { shiftKey: true }).defaultPrevented, true);
  assert.equal(focused.current, p.thumbs[5], "Shift+Tab from the first wraps to the last");
  p.cleanup();
  assert.equal(p.dialog.open, false, "cleanup closes an open viewer");
  p.opener.dispatchEvent(new Event("click"));
  assert.equal(p.dialog.modalCalls, 3, "no listener survives cleanup");
});

test("a page without screenshots mounts nothing", () => {
  const p = page({ withDialog: false });
  assert.equal(p.opener.hidden, true);
  p.opener.dispatchEvent(new Event("click"));
  assert.equal(p.dialog.open, false);
  p.cleanup();
});
