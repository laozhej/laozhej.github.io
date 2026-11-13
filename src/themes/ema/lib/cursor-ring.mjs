// Optional cursor ring for Sakura Archive's Home and Games pages (reviewed prototype r3).
// The system pointer always stays. A thin ring keeps close to it (about 25ms behind), hugs small controls from
// the outside, fades over text and after a pause, and gives one short ripple on click. It runs only where a mouse
// or trackpad is the primary pointer, never for touch or pen input, and stays off while motion is paused (the
// header button) or the system asks for reduced motion. The console's switch turns it off; the visitor's choice
// is remembered and the default is on. Pages opt in by rendering the switch ([data-ring-toggle]).
export const RING_STORAGE_KEY = 'ema-cursor-ring';
const sessionChoices = new WeakMap();
const HUG = "a, button, summary, [role='button']";
const TAU = { move: 24, hug: 60, size: 70, fadeOut: 150, fadeIn: 90 }; // easing time constants in ms

export function readRingChoice(win) {
  try {
    const saved = win.localStorage.getItem(RING_STORAGE_KEY);
    if (saved === 'on' || saved === 'off') return saved === 'on';
  } catch {}
  return sessionChoices.get(win) ?? true;
}

export function mountEmaCursorRing(doc, win) {
  const toggle = doc.querySelector('[data-ring-toggle]');
  if (!toggle) return () => {};
  const card = toggle.closest?.('[data-ring-card]') ?? null;
  const stateLabel = toggle.querySelector?.('[data-ring-state]') ?? null;
  const status = doc.querySelector('[data-ring-status]');
  const root = doc.documentElement;
  const fineQuery = win.matchMedia('(hover: hover) and (pointer: fine)');
  const reducedQuery = win.matchMedia('(prefers-reduced-motion: reduce)');
  const removers = [];
  const listen = (target, type, handler, options) => {
    if (!target) return;
    target.addEventListener(type, handler, options);
    removers.push(() => target.removeEventListener(type, handler, options));
  };
  const now = () => win.performance?.now?.() ?? Date.now();
  let wanted = readRingChoice(win);
  let running = false;

  const cur = { x: 0, y: 0, w: 26, h: 26, r: 13, o: 0 }, tgt = { ...cur };
  let host = null, ring = null, pop = null, frame = 0, retargetFrame = 0, last = 0, idle = 0, textTimer = 0, textUntil = 0;
  let px = -99, py = -99, down = false, hugging = false;

  const reduced = () => reducedQuery.matches;
  const paused = () => reduced() || root.dataset.motionPaused === 'true';

  function ensure() {
    if (!host) {
      host = doc.createElement('div');
      host.className = 'ema-ring';
      host.setAttribute('aria-hidden', 'true');
      ring = doc.createElement('i');
      pop = doc.createElement('b');
      pop.style.width = pop.style.height = '26px';
      host.append(ring, pop);
    }
    // A modal dialog sits in the top layer; the ring joins it so it stays visible above the backdrop.
    const home = doc.querySelector('dialog[open]') ?? doc.body;
    if (host.parentNode !== home) home.append(host);
  }
  function destroy() {
    win.cancelAnimationFrame(frame); win.cancelAnimationFrame(retargetFrame);
    frame = retargetFrame = last = 0;
    win.clearTimeout(idle); win.clearTimeout(textTimer);
    host?.remove();
    host = ring = pop = null;
    cur.o = tgt.o = 0; hugging = down = false;
  }
  function paint() {
    ring.style.transform = `translate3d(${cur.x.toFixed(2)}px,${cur.y.toFixed(2)}px,0)`;
    ring.style.width = `${cur.w.toFixed(2)}px`;
    ring.style.height = `${cur.h.toFixed(2)}px`;
    ring.style.borderRadius = `${cur.r.toFixed(2)}px`;
    ring.style.opacity = cur.o.toFixed(3);
  }
  function step(time) {
    frame = 0;
    if (!ring) return;
    const dt = Math.min(48, last ? time - last : 16);
    last = time;
    const ease = (tau) => 1 - Math.exp(-dt / tau);
    const k = { x: ease(hugging ? TAU.hug : TAU.move), w: ease(TAU.size), o: ease(tgt.o < cur.o ? TAU.fadeOut : TAU.fadeIn) };
    k.y = k.x; k.h = k.w; k.r = k.w;
    let delta = 0;
    for (const key in cur) { const gap = tgt[key] - cur[key]; cur[key] += gap * k[key]; delta += Math.abs(gap); }
    paint();
    if (delta > 0.05) frame = win.requestAnimationFrame(step); else last = 0;
  }
  const kick = () => { if (!frame && ring) frame = win.requestAnimationFrame(step); };

  // True on a block of text. Line gaps count as text too, so the ring does not flicker between lines.
  function overText(x, y, element) {
    if (element?.closest?.("input, textarea, select, [contenteditable='true']")) return true;
    let node = null;
    if (doc.caretPositionFromPoint) node = doc.caretPositionFromPoint(x, y)?.offsetNode;
    else if (doc.caretRangeFromPoint) node = doc.caretRangeFromPoint(x, y)?.startContainer;
    if (!node || node.nodeType !== 3 || !node.textContent.trim()) return false;
    const range = doc.createRange();
    range.selectNodeContents(node);
    for (const box of range.getClientRects()) if (x >= box.left - 8 && x <= box.right + 8 && y >= box.top - 9 && y <= box.bottom + 9) return true;
    return false;
  }
  function retarget() {
    if (!host) return;
    const element = doc.elementFromPoint(px, py);
    const hit = element?.closest?.(HUG);
    let box = null;
    if (hit && !hit.disabled && hit.getAttribute('aria-disabled') !== 'true') {
      const rect = hit.getBoundingClientRect();
      const inside = px >= rect.left - 6 && px <= rect.right + 6 && py >= rect.top - 6 && py <= rect.bottom + 6;
      if (inside && rect.width > 0 && rect.width <= 340 && rect.height <= 76) box = { rect, radius: parseFloat(win.getComputedStyle(hit).borderTopLeftRadius) || 8 };
    }
    hugging = Boolean(box);
    if (box) {
      const pad = 5;
      tgt.x = box.rect.left - pad; tgt.y = box.rect.top - pad;
      tgt.w = box.rect.width + pad * 2; tgt.h = box.rect.height + pad * 2;
      tgt.r = Math.min(box.radius + pad, tgt.h / 2); tgt.o = 0.9; textUntil = 0;
    } else {
      const time = now();
      if (overText(px, py, element)) textUntil = time + 170; // stays hidden a moment after leaving text
      const hidden = time < textUntil;
      const size = hidden ? 18 : down ? 20 : 26;
      tgt.w = tgt.h = size; tgt.r = size / 2; tgt.x = px - size / 2; tgt.y = py - size / 2;
      tgt.o = hidden ? 0 : 0.85;
      win.clearTimeout(textTimer);
      if (hidden) textTimer = win.setTimeout(retarget, textUntil - time + 10);
    }
    // An invisible ring reappears where the pointer is instead of flying in from where it faded.
    if (cur.o < 0.04) Object.assign(cur, { x: tgt.x, y: tgt.y, w: tgt.w, h: tgt.h, r: tgt.r });
    host.dataset.on = hugging ? 'hug' : 'ring';
    kick();
  }
  const scheduleRetarget = () => {
    if (!retargetFrame && host) retargetFrame = win.requestAnimationFrame(() => { retargetFrame = 0; retarget(); });
  };
  const fade = () => { if (host) { tgt.o = 0; kick(); } };

  listen(win, 'pointermove', (event) => {
    if (!running) return;
    if (event.pointerType !== 'mouse') { fade(); return; }
    px = event.clientX; py = event.clientY;
    ensure(); retarget();
    win.clearTimeout(idle);
    idle = win.setTimeout(() => { if (!hugging) fade(); }, 2600);
  }, { passive: true });
  listen(win, 'pointerdown', (event) => {
    if (!running || !host) return;
    if (event.pointerType !== 'mouse') { cur.o = tgt.o = 0; paint(); return; }
    down = true; retarget();
  }, { passive: true });
  listen(win, 'pointerup', (event) => {
    if (!running || !host || event.pointerType !== 'mouse') return;
    down = false;
    pop.style.setProperty('--x', `${px - 13}px`);
    pop.style.setProperty('--y', `${py - 13}px`);
    pop.classList.remove('is-pop'); void pop.offsetWidth; pop.classList.add('is-pop');
    ensure(); retarget();
  }, { passive: true });
  listen(win, 'scroll', scheduleRetarget, { passive: true });
  listen(root, 'mouseleave', fade);
  listen(win, 'blur', fade);

  // The switch shows the visitor's choice; a note says when the page keeps the ring off regardless.
  function render() {
    toggle.setAttribute('aria-checked', String(wanted));
    if (stateLabel) stateLabel.textContent = wanted ? stateLabel.dataset.on : stateLabel.dataset.off;
    if (card) card.hidden = !fineQuery.matches;
    if (status) {
      const reason = reduced() ? status.dataset.reduced : paused() ? status.dataset.paused : '';
      status.textContent = reason ?? '';
      status.hidden = !reason;
    }
  }
  function refresh() {
    const next = wanted && fineQuery.matches && !paused();
    if (next !== running) {
      running = next;
      if (!running) destroy();
    }
    render();
  }
  listen(toggle, 'click', () => {
    wanted = !wanted;
    sessionChoices.set(win, wanted);
    try { win.localStorage.setItem(RING_STORAGE_KEY, wanted ? 'on' : 'off'); } catch {}
    refresh();
  });
  const restore = () => { wanted = readRingChoice(win); refresh(); };
  listen(win, 'storage', (event) => { if (event.key === RING_STORAGE_KEY || event.key === null) restore(); });
  listen(win, 'pageshow', restore);
  listen(doc, 'site:motion-change', refresh);
  listen(fineQuery, 'change', refresh);
  listen(reducedQuery, 'change', refresh);
  refresh();
  return () => {
    running = false;
    destroy();
    removers.splice(0).forEach((remove) => remove());
  };
}
