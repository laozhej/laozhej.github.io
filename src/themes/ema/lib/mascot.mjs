import { mountFrieren } from './frieren.mjs';

// Keep the existing preference when the corner guide changes character.
export const MASCOT_HIDDEN_KEY = 'ema-mascot-hidden';

export function mountEmaMascot(doc, win, mountGuide = mountFrieren) {
  const root = doc.querySelector('[data-ema-mascot]');
  const recall = doc.querySelector('[data-mascot-show]');
  if (!root || !recall) return () => {};
  const bubble = root.querySelector('[data-mascot-bubble]');
  const figure = root.querySelector('[data-mascot-poke]');
  const hide = root.querySelector('[data-mascot-hide]');
  const removers = [];
  const listen = (target, event, handler) => {
    if (!target) return;
    target.addEventListener(event, handler);
    removers.push(() => target.removeEventListener(event, handler));
  };
  const parse = (value) => { try { const list = JSON.parse(value || '[]'); return Array.isArray(list) ? list : []; } catch { return []; } };
  const readHidden = () => { try { return win.localStorage.getItem(MASCOT_HIDDEN_KEY) === 'true'; } catch { return false; } };
  const writeHidden = (hidden) => {
    try { if (hidden) win.localStorage.setItem(MASCOT_HIDDEN_KEY, 'true'); else win.localStorage.removeItem(MASCOT_HIDDEN_KEY); } catch {}
  };
  const paused = () => doc.documentElement?.dataset.motionPaused === 'true';
  const pokes = parse(root.dataset.pokes);
  let bubbleTimer = 0, bubbleAnimation, lastPoke = -1, recent = [];

  function clearBubble() {
    win.clearTimeout(bubbleTimer);
    bubbleTimer = 0;
    bubbleAnimation?.cancel();
    bubbleAnimation = undefined;
    if (bubble) bubble.hidden = true;
  }
  function say(text, pointer = false) {
    if (!bubble || !text || root.hidden) return;
    clearBubble();
    bubble.textContent = text;
    bubble.hidden = false;
    bubbleTimer = win.setTimeout(clearBubble, 4800);
    if (pointer && !paused() && bubble.animate) {
      bubbleAnimation = bubble.animate([{ opacity: 0 }, { opacity: 1 }],
        { duration: 180, easing: 'cubic-bezier(.23,1,.32,1)' });
    }
  }
  function pick() {
    if (!pokes.length) return '';
    let index = Math.floor(Math.random() * pokes.length);
    if (pokes.length > 1 && index === lastPoke) index = (index + 1) % pokes.length;
    lastPoke = index;
    return pokes[index];
  }
  function show(visible) {
    root.hidden = !visible;
    recall.hidden = visible;
    writeHidden(!visible);
    if (!visible) clearBubble();
    guide.refresh();
  }

  // No arrival, idle or copy messages: Frieren speaks only when asked.
  const hidden = readHidden();
  root.hidden = hidden;
  recall.hidden = !hidden;
  const guide = mountGuide(root, doc, win);

  listen(figure, 'click', (event) => {
    const now = Date.now();
    recent = recent.filter((time) => now - time < 1600).concat(now);
    say(recent.length >= 4 ? root.dataset.tooFast : pick(), event.detail > 0);
  });
  listen(hide, 'click', () => { show(false); recall.focus?.(); });
  listen(recall, 'click', (event) => { show(true); figure?.focus?.(); say(root.dataset.back, event.detail > 0); });
  listen(doc, 'site:motion-change', () => {
    if (paused()) { bubbleAnimation?.cancel(); bubbleAnimation = undefined; }
  });

  return () => {
    clearBubble();
    removers.forEach((remove) => remove());
    guide.cleanup();
  };
}
