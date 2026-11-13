import test from "node:test";
import assert from "node:assert/strict";
import { mountEmaCursorRing, readRingChoice, RING_STORAGE_KEY } from "../src/themes/ema/lib/cursor-ring.mjs";
import { mountEmaConsole } from "../src/themes/ema/lib/console.mjs";

// A small element: event target, attributes, children, class list and inline style.
function el(tag = "div", extra = {}) {
  const classes = new Set();
  const node = Object.assign(new EventTarget(), {
    tagName: tag.toUpperCase(), dataset: {}, attributes: {}, children: [], parentNode: null, hidden: false, className: "", textContent: "",
    style: { setProperty(key, value) { this[key] = value; } },
    classList: { add: (name) => classes.add(name), remove: (name) => classes.delete(name), contains: (name) => classes.has(name), toggle: (name, on) => (on ? classes.add(name) : classes.delete(name)) },
    setAttribute(key, value) { this.attributes[key] = String(value); },
    getAttribute(key) { return this.attributes[key] ?? null; },
    append(...kids) {
      for (const kid of kids) { kid.remove?.(); kid.parentNode = this; this.children.push(kid); }
    },
    remove() {
      if (!this.parentNode) return;
      this.parentNode.children.splice(this.parentNode.children.indexOf(this), 1);
      this.parentNode = null;
    },
    get offsetWidth() { return 0; },
    closest() { return null; },
    querySelector() { return null; },
    focus() { focused.current = this; },
  }, extra);
  return node;
}
const focused = { current: null };
const media = (matches) => Object.assign(new EventTarget(), { matches });

function page({ fine = true, reduced = false, paused = false, store = new Map(), storageBlocked = false, withToggle = true, win: reuse } = {}) {
  const stateLabel = el("span", { dataset: { on: "On", off: "Off" } });
  const card = el("div", { hidden: true });
  const toggle = el("button", { closest: (s) => (s === "[data-ring-card]" ? card : null), querySelector: (s) => (s === "[data-ring-state]" ? stateLabel : null) });
  const status = el("p", { hidden: true, dataset: { paused: "Paused", reduced: "Reduced" } });
  const body = el("body");
  // A small control at x 100-180, y 100-140; anything else is plain page.
  const control = el("a", { getBoundingClientRect: () => ({ left: 100, top: 100, right: 180, bottom: 140, width: 80, height: 40 }) });
  control.closest = (s) => (s.includes("a") ? control : null);
  const plain = el("p");
  const html = el("html", { dataset: { motionPaused: String(paused || reduced) } });
  const doc = el("document", {
    documentElement: html, body,
    querySelector: (s) => ({ "[data-ring-toggle]": withToggle ? toggle : null, "[data-ring-status]": status }[s] ?? null),
    createElement: (tag) => el(tag),
    elementFromPoint: (x, y) => (x >= 100 && x <= 180 && y >= 100 && y <= 140 ? control : plain),
  });
  const frames = new Map();
  const queries = { fine: media(fine), reduced: media(reduced) };
  const win = reuse ?? Object.assign(new EventTarget(), {
    localStorage: storageBlocked
      ? { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } }
      : { getItem: (key) => store.get(key) ?? null, setItem: (key, value) => store.set(key, String(value)) },
    setTimeout: () => 0, clearTimeout() {},
    getComputedStyle: () => ({ borderTopLeftRadius: "999px" }),
    performance: { now: () => 0 },
  });
  Object.assign(win, {
    matchMedia: (query) => (query.includes("prefers-reduced-motion") ? queries.reduced : queries.fine),
    requestAnimationFrame: (fn) => { const id = frames.size + 1 + Math.random(); frames.set(id, fn); return id; },
    cancelAnimationFrame: (id) => frames.delete(id),
  });
  const cleanup = mountEmaCursorRing(doc, win);
  const flush = (limit = 500) => {
    let now = 0;
    while (frames.size && limit--) { const [id, fn] = frames.entries().next().value; frames.delete(id); now += 16; fn(now); }
  };
  const pointer = (type, x, y, pointerType = "mouse") => { win.dispatchEvent(Object.assign(new Event(type), { clientX: x, clientY: y, pointerType })); flush(); };
  const move = (x, y, pointerType) => pointer("pointermove", x, y, pointerType);
  const ring = () => body.children.find((child) => child.className === "ema-ring") ?? null;
  const setMotion = (motionPaused) => {
    html.dataset.motionPaused = String(motionPaused || queries.reduced.matches);
    doc.dispatchEvent(new Event("site:motion-change"));
  };
  return { doc, win, body, html, toggle, card, status, stateLabel, store, queries, cleanup, flush, pointer, move, ring, setMotion };
}

test("the cursor ring is on by default and follows a mouse, keeping the native pointer", () => {
  const p = page();
  assert.equal(p.toggle.getAttribute("aria-checked"), "true");
  assert.equal(p.stateLabel.textContent, "On");
  assert.equal(p.card.hidden, false, "the switch shows where a mouse or trackpad is the pointer");
  assert.equal(p.ring(), null, "nothing is drawn before the pointer moves");
  p.move(50, 60);
  const host = p.ring();
  assert.ok(host, "a mouse move draws the ring");
  assert.equal(host.getAttribute("aria-hidden"), "true");
  const [circle] = host.children;
  assert.equal(circle.style.transform, "translate3d(37.00px,47.00px,0)", "a 26px ring centred on the pointer");
  assert.ok(Number(circle.style.opacity) > .8);
  p.cleanup();
});

test("the ring hugs a small control from the outside", () => {
  const p = page();
  p.move(140, 120);
  const host = p.ring();
  const [circle] = host.children;
  assert.equal(host.dataset.on, "hug");
  assert.equal(circle.style.width, "90.00px");
  assert.equal(circle.style.height, "50.00px");
  assert.equal(circle.style.borderRadius, "25.00px");
  p.pointer("pointerup", 140, 120);
  assert.ok(host.children[1].classList.contains("is-pop"), "a click gives one ripple");
  p.cleanup();
});

test("touch and pen never draw the ring", () => {
  const coarse = page({ fine: false });
  coarse.move(50, 60);
  assert.equal(coarse.ring(), null, "no ring where touch is the primary pointer");
  assert.equal(coarse.card.hidden, true, "and no switch for it in the console");
  coarse.cleanup();
  const hybrid = page();
  hybrid.move(50, 60, "touch");
  hybrid.move(50, 60, "pen");
  assert.equal(hybrid.ring(), null, "touch or pen input on a mouse device draws nothing");
  hybrid.cleanup();
});

test("reduced motion keeps the ring off and says why; the visitor's choice stays as it was", () => {
  const p = page({ reduced: true });
  p.move(50, 60);
  assert.equal(p.ring(), null);
  assert.equal(p.toggle.getAttribute("aria-checked"), "true");
  assert.equal(p.status.hidden, false);
  assert.equal(p.status.textContent, "Reduced");
  p.queries.reduced.matches = false;
  p.html.dataset.motionPaused = "false";
  p.queries.reduced.dispatchEvent(new Event("change"));
  assert.equal(p.status.hidden, true);
  p.move(50, 60);
  assert.ok(p.ring(), "the ring returns once the system no longer asks for reduced motion");
  p.cleanup();
});

test("pausing motion removes the ring until motion resumes", () => {
  const p = page();
  p.move(50, 60);
  assert.ok(p.ring());
  p.setMotion(true);
  assert.equal(p.ring(), null, "the header's pause button takes the ring away at once");
  assert.equal(p.status.textContent, "Paused");
  p.move(70, 80);
  assert.equal(p.ring(), null);
  p.setMotion(false);
  assert.equal(p.status.hidden, true);
  p.move(70, 80);
  assert.ok(p.ring());
  p.cleanup();
});

test("the switch turns the ring off and the choice is remembered", () => {
  const store = new Map();
  const p = page({ store });
  p.move(50, 60);
  p.toggle.dispatchEvent(new Event("click"));
  assert.equal(p.toggle.getAttribute("aria-checked"), "false");
  assert.equal(p.stateLabel.textContent, "Off");
  assert.equal(store.get(RING_STORAGE_KEY), "off");
  assert.equal(p.ring(), null, "switching off removes the ring at once");
  p.move(60, 70);
  assert.equal(p.ring(), null);
  p.cleanup();

  const next = page({ store });
  assert.equal(next.toggle.getAttribute("aria-checked"), "false", "the next page starts with the remembered choice");
  next.move(50, 60);
  assert.equal(next.ring(), null);
  next.toggle.dispatchEvent(new Event("click"));
  assert.equal(store.get(RING_STORAGE_KEY), "on");
  next.move(50, 60);
  assert.ok(next.ring());
  next.cleanup();
});

test("another tab's choice applies here too, and blocked storage still remembers it for the visit", () => {
  const store = new Map();
  const p = page({ store });
  store.set(RING_STORAGE_KEY, "off");
  p.win.dispatchEvent(Object.assign(new Event("storage"), { key: RING_STORAGE_KEY }));
  assert.equal(p.toggle.getAttribute("aria-checked"), "false");
  p.cleanup();

  const blocked = page({ storageBlocked: true });
  assert.equal(readRingChoice(blocked.win), true, "on by default when nothing can be stored");
  blocked.toggle.dispatchEvent(new Event("click"));
  blocked.cleanup();
  const again = page({ win: blocked.win });
  assert.equal(again.toggle.getAttribute("aria-checked"), "false", "the choice holds across page swaps in the same visit");
  again.cleanup();
});

test("pages without the switch get no ring, and cleanup removes it", () => {
  const other = page({ withToggle: false });
  other.move(50, 60);
  assert.equal(other.ring(), null, "only Home and Games render the switch, so only they run the ring");
  other.cleanup();

  const p = page();
  p.move(50, 60);
  assert.ok(p.ring());
  p.cleanup();
  assert.equal(p.ring(), null);
  p.move(50, 60);
  assert.equal(p.ring(), null, "no listener survives cleanup");
});

test("the console opens from the edge tab or the footer and returns focus to the opener in view", () => {
  const panel = el("section", { hidden: true });
  const closeButton = el("button");
  const tab = el("button", { hidden: true, getClientRects: () => [] });
  const dock = el("button", { hidden: true, getClientRects: () => [{}] });
  const root = el("div", { querySelector: (s) => ({ "[data-console-panel]": panel, "[data-console-close]": closeButton }[s] ?? null) });
  const doc = el("document", {
    querySelector: (s) => (s === "[data-ema-console]" ? root : null),
    querySelectorAll: (s) => (s === "[data-console-toggle]" ? [tab, dock] : []),
  });
  const win = Object.assign(new EventTarget(), { requestAnimationFrame: () => 1, cancelAnimationFrame() {}, setTimeout: () => 1, clearTimeout() {} });
  const cleanup = mountEmaConsole(doc, win);
  assert.equal(tab.hidden, false);
  assert.equal(dock.hidden, false, "both openers appear once the script runs; the layout shows one of them");
  dock.dispatchEvent(new Event("click"));
  assert.equal(panel.hidden, false);
  assert.deepEqual([tab.getAttribute("aria-expanded"), dock.getAttribute("aria-expanded")], ["true", "true"]);
  doc.dispatchEvent(Object.assign(new Event("keydown"), { key: "Escape" }));
  assert.equal(panel.hidden, true);
  assert.equal(focused.current, dock, "Escape returns focus to the footer opener that was used");
  tab.dispatchEvent(new Event("click"));
  closeButton.dispatchEvent(new Event("click"));
  assert.equal(focused.current, dock, "an opener that is not shown in this layout never takes focus");
  cleanup();
});
