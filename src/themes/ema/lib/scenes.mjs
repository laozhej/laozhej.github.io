// Scene handoffs for the Ema homepage. Adapted from the home transitions in
// Yuimi-chaya's Fuyukawa Kagari theme (MIT License, see
// public/licenses/yuimi-chaya-MIT.txt).
//
// Native scroll still drives each pinned scene (the opening runway and the
// chapter rail). Only the stretch between two scenes is replaced by a short
// covered cut, so a wheel never leaves the page half in one scene and half in
// the next. Keyboard, touch, links and the scrollbar stay fully native.
const easeOut = 'cubic-bezier(.23,1,.32,1)';
const easeInOut = 'cubic-bezier(.77,0,.175,1)';
const lockClass = 'is-ema-scene-cut';
// Wheel events closer together than this belong to one gesture (or its momentum).
const gestureGap = 170;

export function mountEmaScenes(root, document, window, { canAnimate }) {
  const heroScene = root.querySelector('[data-hero-scene]');
  const hero = root.querySelector('[data-hero]');
  const rail = root.querySelector('[data-rail]');
  const stage = root.querySelector('[data-rail-stage]');
  const next = root.querySelector('[data-signal]');
  const cue = root.querySelector('[data-scroll-cue]');
  const idle = { cancel() {}, cleanup() {} };
  if (!heroScene || !hero || !rail || !stage || !next || !document.body || !document.createElement) return idle;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const html = document.documentElement;
  const screen = document.createElement('div');
  screen.className = 'ema-scene-cut';
  screen.setAttribute('aria-hidden', 'true');
  screen.hidden = true;
  document.body.append(screen);
  const animations = new Set();
  const timers = new Map();
  const removers = [];
  let running = false, disposed = false, generation = 0, lockedY = 0;
  let direction = 1, reversePull = 0, reverse = false;
  let previousY = window.scrollY, nativeNavigation = Boolean(window.location?.hash);
  let lastWheel = -Infinity, settling = false;
  const listen = (node, type, callback, options) => {
    node.addEventListener(type, callback, options);
    removers.push(() => node.removeEventListener(type, callback, options));
  };
  const active = () => !disposed && canAnimate() && fine.matches
    && heroScene.dataset.sceneActive === 'true' && rail.dataset.railMode === 'scroll'
    && !document.querySelector('dialog[open]') && typeof screen.animate === 'function';
  const jump = (top) => window.scrollTo({ top, behavior: 'instant' });
  const top = (element) => element.getBoundingClientRect().top + window.scrollY;
  const maxY = () => Math.max(0, html.scrollHeight - window.innerHeight);
  // The four resting points: opening fully docked, rail start and end, next scene.
  const heroEnd = () => top(heroScene) + Math.max(0, heroScene.offsetHeight - hero.offsetHeight);
  const railStart = () => top(rail) - (parseFloat(window.getComputedStyle(stage).top) || 0);
  const railEnd = () => railStart() + Math.max(0, rail.offsetHeight - stage.offsetHeight);
  const nextTop = () => Math.min(top(next), maxY());
  const delta = (event) => event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1);
  const ignoresWheel = (event) => event.ctrlKey || event.metaKey || Math.abs(event.deltaX || 0) > Math.abs(event.deltaY)
    || event.target?.closest?.('input, select, textarea, [contenteditable], dialog, [role=dialog], .console-panel');

  const clearAnimations = () => {
    for (const animation of animations) animation.cancel();
    animations.clear();
    for (const [timer, resolve] of timers) { window.clearTimeout(timer); resolve(); }
    timers.clear();
  };
  const finish = () => {
    running = false;
    clearAnimations();
    screen.hidden = true;
    html.classList.remove(lockClass);
    previousY = window.scrollY;
  };
  const cancel = () => {
    generation++;
    reverse = false;
    finish();
  };
  const animate = (element, frames, duration, delay = 0, easing = easeOut) => {
    const animation = element.animate(frames, { duration, delay, easing, fill: 'both' });
    animations.add(animation);
    return animation;
  };
  const wait = async (animation, duration) => {
    let timer;
    await Promise.race([
      animation.finished.catch(() => {}),
      new Promise((resolve) => {
        timer = window.setTimeout(resolve, duration + 100);
        timers.set(timer, resolve);
      }),
    ]);
    window.clearTimeout(timer);
    timers.delete(timer);
  };
  const reveal = (target, kind, way) => {
    const elements = target === rail ? [...stage.querySelectorAll('.section-heading, [data-chapter]')]
      : target === next ? [...next.querySelectorAll('.signal-word, .signal-card, .welcome-bubble')] : [];
    // An element still playing its first entrance keeps that one.
    return elements.filter((element) => element?.animate && !element.getAnimations?.().length).map((element, index) => {
      const settled = window.getComputedStyle(element).transform;
      const base = settled === 'none' ? '' : settled;
      return animate(element, [
        { opacity: 0, transform: `${base} translate3d(${kind === 'wipe' ? way * 18 : 0}px,${kind === 'fade' ? 14 : 0}px,0)` },
        { opacity: 1, transform: base || 'none' },
      ], 240, index * 50);
    });
  };
  const transition = async (from, target, kind, way, destination, returnTo) => {
    if (running || !active()) return;
    const token = ++generation;
    const duration = kind === 'fade' ? 240 : 300;
    const curve = kind === 'fade' ? easeOut : easeInOut;
    direction = way;
    reversePull = 0;
    reverse = false;
    running = true;
    lockedY = window.scrollY;
    html.classList.add(lockClass);
    // Cancel any native smooth scroll before the cover arrives.
    jump(lockedY);
    screen.hidden = false;
    const covered = { opacity: 1, clipPath: 'inset(0)' };
    const enter = kind === 'fade' ? { opacity: 0, clipPath: 'inset(0)' }
      : { opacity: 1, clipPath: way > 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)' };
    const leave = kind === 'fade' ? { opacity: 0, clipPath: 'inset(0)' }
      : { opacity: 1, clipPath: way > 0 ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)' };
    try {
      await wait(animate(screen, [enter, covered], duration, 0, curve), duration);
      if (disposed || token !== generation) return;
      lockedY = destination();
      jump(lockedY);
      const entrances = reveal(target, kind, way);
      const exit = animate(screen, [covered, leave], duration, 0, curve);
      await Promise.all([wait(exit, duration), ...entrances.map((animation, index) => wait(animation, 240 + index * 50))]);
      if (disposed || token !== generation) return;
      const goBack = reverse;
      finish();
      // The rest of this gesture's momentum should not run straight on through the new scene.
      settling = !goBack;
      if (goBack) transition(target, from, kind, -way, returnTo, destination);
    } catch {
      if (token === generation) cancel();
    }
  };
  const consume = (event, ...args) => {
    event.preventDefault();
    transition(...args);
  };
  // Landed between two scenes: frame the one being left, then cut to the other.
  const coverHeroGap = (way) => {
    jump(way > 0 ? heroEnd() : railStart());
    if (way > 0) transition(hero, rail, 'fade', 1, railStart, heroEnd);
    else transition(rail, hero, 'fade', -1, heroEnd, railStart);
  };
  const coverRailGap = (way) => {
    jump(way > 0 ? railEnd() : nextTop());
    if (way > 0) transition(rail, next, 'wipe', 1, nextTop, railEnd);
    else transition(next, rail, 'wipe', -1, railEnd, nextTop);
  };

  const onWheel = (event) => {
    if (ignoresWheel(event)) return;
    const movement = delta(event);
    if (!movement) return;
    const gap = event.timeStamp - lastWheel;
    lastWheel = event.timeStamp;
    nativeNavigation = false;
    if (running) {
      event.preventDefault();
      reversePull = movement * direction < 0 ? reversePull + Math.abs(movement) : 0;
      reverse = reversePull >= 36;
      return;
    }
    if (settling) {
      if (gap < gestureGap && movement * direction > 0) { event.preventDefault(); return; }
      settling = false;
    }
    if (event.defaultPrevented || !active()) return;
    const y = window.scrollY, h = heroEnd(), s = railStart(), e = railEnd(), n = nextTop();
    if (y > h + 2 && y < s - 2) { event.preventDefault(); coverHeroGap(movement > 0 ? 1 : -1); return; }
    if (y > e + 2 && y < n - 2) { event.preventDefault(); coverRailGap(movement > 0 ? 1 : -1); return; }
    if (movement > 0) {
      if (y >= h - 2 && y <= h + 2) consume(event, hero, rail, 'fade', 1, railStart, heroEnd);
      else if (y < h && y + movement > h) { event.preventDefault(); jump(h); }
      else if (y >= s - 2 && y <= e + 2) {
        if (y >= e - 2) consume(event, rail, next, 'wipe', 1, nextTop, railEnd);
        else if (y + movement > e) { event.preventDefault(); jump(e); }
      }
    } else if (y >= s - 2 && y <= e + 2) {
      if (y <= s + 2) consume(event, rail, hero, 'fade', -1, heroEnd, railStart);
      else if (y + movement < s) { event.preventDefault(); jump(s); }
    } else if (y >= n - 2 && y <= n + 2) {
      consume(event, next, rail, 'wipe', -1, railEnd, nextTop);
    } else if (y > n && y + movement < n) {
      event.preventDefault(); jump(n);
    }
  };
  const onScroll = () => {
    const y = window.scrollY, before = previousY;
    previousY = y;
    if (running) {
      if (Math.abs(y - lockedY) > 2) { previousY = lockedY; jump(lockedY); }
      return;
    }
    if (nativeNavigation || !active()) return;
    // A scroll can travel further than its wheel delta (or arrive without one).
    const way = y >= before ? 1 : -1;
    if (y > heroEnd() + 2 && y < railStart() - 2) coverHeroGap(way);
    else if (y > railEnd() + 2 && y < nextTop() - 2) coverRailGap(way);
  };
  const navigate = () => {
    nativeNavigation = true;
    settling = false;
    cancel();
  };
  listen(window, 'wheel', onWheel, { passive: false });
  listen(window, 'scroll', onScroll, { passive: true });
  listen(window, 'resize', cancel, { passive: true });
  listen(window, 'hashchange', navigate);
  listen(document, 'keydown', (event) => {
    if (['Tab', 'Escape', 'Home', 'End', 'PageUp', 'PageDown', 'ArrowUp', 'ArrowDown', ' '].includes(event.key)) navigate();
  });
  listen(document, 'click', (event) => {
    if (event.target?.closest?.('a[href], [data-notice-open]')) navigate();
  }, true);
  listen(document, 'focusin', navigate);
  // The opening's "scroll down" cue takes the same cut as the wheel.
  if (cue) listen(cue, 'click', (event) => {
    if (event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || !active()) return;
    event.preventDefault();
    const from = window.scrollY;
    transition(hero, rail, 'fade', 1, railStart, () => from);
  });
  return {
    cancel,
    cleanup() {
      disposed = true;
      cancel();
      removers.splice(0).forEach((remove) => remove());
      screen.remove();
    },
  };
}
