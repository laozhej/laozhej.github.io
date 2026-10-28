// A small guide in the corner, in the spirit of Kagari's Live2D helper but drawn
// from the existing Ema art: she greets, comments on the page and answers pokes.
export const MASCOT_HIDDEN_KEY = 'ema-mascot-hidden';
const GREETED_KEY = 'ema-mascot-greeted';
const IDLE_DELAY = 45000;

export function mountEmaMascot(doc, win) {
  const root = doc.querySelector('[data-ema-mascot]');
  const recall = doc.querySelector('[data-mascot-show]');
  if (!root || !recall) return () => {};
  const bubble = root.querySelector('[data-mascot-bubble]');
  const figure = root.querySelector('[data-mascot-poke]');
  const hide = root.querySelector('[data-mascot-hide]');
  const removers = [];
  const timers = new Set();
  const listen = (target, event, handler) => {
    if (!target) return;
    target.addEventListener(event, handler);
    removers.push(() => target.removeEventListener(event, handler));
  };
  const later = (callback, delay) => {
    const id = win.setTimeout(() => { timers.delete(id); callback(); }, delay);
    timers.add(id);
    return id;
  };
  const cancel = (id) => { win.clearTimeout(id); timers.delete(id); };
  const parse = (value) => { try { const list = JSON.parse(value || '[]'); return Array.isArray(list) ? list : []; } catch { return []; } };
  const read = (area, key) => { try { return win[area].getItem(key); } catch { return null; } };
  const write = (area, key, value) => {
    try { if (value === null) win[area].removeItem(key); else win[area].setItem(key, value); } catch {}
  };
  const paused = () => doc.documentElement?.dataset.motionPaused === 'true';
  const pokes = parse(root.dataset.pokes);
  const greetings = parse(root.dataset.greetings);
  let bubbleTimer = 0, idleTimer = 0, lastPoke = -1, recent = [], awayAt = 0;

  function say(text, duration = 4800) {
    if (!bubble || !text || root.hidden) return;
    bubble.textContent = text;
    bubble.hidden = false;
    cancel(bubbleTimer);
    bubbleTimer = later(() => { bubble.hidden = true; }, duration);
    if (!paused() && bubble.animate) {
      bubble.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }],
        { duration: 260, easing: 'cubic-bezier(.23,1,.32,1)' });
    }
    cancel(idleTimer);
    idleTimer = later(() => { if (!doc.hidden) say(pick()); }, IDLE_DELAY);
  }
  function pick() {
    if (!pokes.length) return '';
    let index = Math.floor(Math.random() * pokes.length);
    if (pokes.length > 1 && index === lastPoke) index = (index + 1) % pokes.length;
    lastPoke = index;
    return pokes[index];
  }
  function greeting() {
    const hour = new Date().getHours();
    return greetings[hour < 5 || hour >= 22 ? 3 : hour < 11 ? 0 : hour < 17 ? 1 : 2];
  }
  function show(visible) {
    root.hidden = !visible;
    recall.hidden = visible;
    write('localStorage', MASCOT_HIDDEN_KEY, visible ? null : 'true');
    if (!visible) {
      if (bubble) bubble.hidden = true;
      cancel(bubbleTimer); cancel(idleTimer);
    }
  }

  listen(figure, 'click', () => {
    const now = Date.now();
    recent = recent.filter((time) => now - time < 1600).concat(now);
    say(recent.length >= 4 ? root.dataset.tooFast : pick());
    figure.classList.remove('is-poked');
    if (!paused()) { void figure.offsetWidth; figure.classList.add('is-poked'); }
  });
  listen(hide, 'click', () => { show(false); recall.focus?.(); });
  listen(recall, 'click', () => { show(true); figure?.focus?.(); say(root.dataset.back); });
  listen(doc, 'copy', () => say(root.dataset.copy));
  listen(doc, 'visibilitychange', () => {
    if (doc.hidden) { awayAt = Date.now(); return; }
    if (awayAt && Date.now() - awayAt > 60000) say(root.dataset.back);
    awayAt = 0;
  });

  // The visitor's choice to send her away is remembered across pages.
  const hidden = read('localStorage', MASCOT_HIDDEN_KEY) === 'true';
  root.hidden = hidden;
  recall.hidden = !hidden;
  if (!hidden) {
    const firstPage = read('sessionStorage', GREETED_KEY) !== '1';
    write('sessionStorage', GREETED_KEY, '1');
    later(() => {
      if (!firstPage) { say(root.dataset.pageLine); return; }
      say(greeting());
      later(() => say(root.dataset.pageLine), 5200);
    }, 1400);
  }

  return () => {
    timers.forEach((id) => win.clearTimeout(id));
    timers.clear();
    removers.forEach((remove) => remove());
    if (bubble) bubble.hidden = true;
    figure?.classList.remove('is-poked');
  };
}
