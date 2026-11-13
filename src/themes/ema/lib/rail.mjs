// Chapter rail and scene covers for the Sakura Archive homepage, adapted from
// src/themes/fuyukawa-kagari/lib/manga-runtime.mjs (mountChapterRail) and lib/home-transitions.mjs
// in Yuimi-chaya/Yuimi-chaya.github.io (MIT License, Copyright (c) 2026 Yuimi-chaya; full text in LICENSE).
// Changes here: our selectors, the site's pause button counts as reduced motion, and both features
// stay off unless the stage is in its docking mode (wide fine pointers with motion on).
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const easeOut = 'cubic-bezier(.23, 1, .32, 1)';
const easeInOut = 'cubic-bezier(.77, 0, .175, 1)';

export function nearestIndex(offsets, left) {
  return offsets.reduce((best, offset, i) => (Math.abs(offset - left) < Math.abs(offsets[best] - left) ? i : best), 0);
}

// Fine pointers walk the leaves sideways with ordinary vertical scrolling: a sticky, viewport-high
// stage over a measured runway. Touch screens and reduced motion keep a native sideways swipe.
export function mountRail(root, win, { paused = () => false } = {}) {
  const rail = root.querySelector('[data-k-rail]');
  const stage = rail?.querySelector('.k-rail-stage');
  const track = rail?.querySelector('[data-k-track]');
  const items = rail ? [...rail.querySelectorAll('[data-k-leaf]')] : [];
  const position = rail?.querySelector('[data-k-rail-position]');
  const progress = rail?.querySelector('[data-k-rail-progress]');
  const idle = { refresh() {}, cleanup() {} };
  if (!rail || !stage || !track || !items.length) return idle;
  const fine = win.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 761px)');
  let frame = 0, scrollMode = false, travel = 0, active = -1;
  const offsets = () => items.map((item, index) => (index === 0 ? 0 : index === items.length - 1 ? travel
    : clamp(item.offsetLeft + item.offsetWidth / 2 - stage.clientWidth / 2, 0, travel)));
  const top = () => rail.getBoundingClientRect().top + win.scrollY;
  const select = (index) => {
    if (active === index) return;
    active = index;
    items.forEach((item, i) => { if (i === index) item.setAttribute('data-active', 'true'); else item.removeAttribute('data-active'); });
    if (position) position.textContent = `${String(index + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
  };
  const update = () => {
    frame = 0;
    const left = clamp(scrollMode ? win.scrollY - top() : track.scrollLeft, 0, travel);
    if (scrollMode) track.style.transform = `translate3d(${(-left).toFixed(1)}px, 0, 0)`;
    if (progress) progress.style.transform = `scaleX(${travel ? left / travel : 0})`;
    select(left <= 1 ? 0 : left >= travel - 1 ? items.length - 1 : nearestIndex(offsets(), left));
  };
  const schedule = () => { if (!frame) frame = win.requestAnimationFrame(update); };
  const measure = () => {
    const enabled = fine.matches && !paused() && items.length > 1;
    rail.dataset.mode = enabled ? 'scroll' : 'native';
    scrollMode = enabled;
    if (enabled) {
      track.style.transform = '';
      travel = Math.max(0, track.scrollWidth - stage.clientWidth);
      if (travel > 2) rail.style.setProperty('--rail-runway', `${stage.clientHeight + travel}px`);
      else { scrollMode = false; rail.dataset.mode = 'native'; }
    }
    track.tabIndex = scrollMode ? -1 : 0;
    if (!scrollMode) {
      rail.style.removeProperty('--rail-runway');
      track.style.transform = '';
      travel = Math.max(0, track.scrollWidth - stage.clientWidth);
    } else track.scrollLeft = 0;
    update();
  };
  const focusIn = (event) => {
    const index = items.indexOf(event.target);
    if (index < 0 || !scrollMode) return;
    win.scrollTo({ top: top() + clamp(offsets()[index], 0, travel), behavior: 'instant' });
    schedule();
  };
  const onScroll = () => { if (scrollMode) schedule(); };
  track.addEventListener('focusin', focusIn);
  track.addEventListener('scroll', schedule, { passive: true });
  win.addEventListener('scroll', onScroll, { passive: true });
  win.addEventListener('resize', measure, { passive: true });
  fine.addEventListener('change', measure);
  measure();
  return {
    refresh: measure,
    cleanup() {
      win.cancelAnimationFrame(frame);
      delete rail.dataset.mode;
      rail.style.removeProperty('--rail-runway');
      if (progress) progress.style.transform = '';
      track.style.transform = '';
      track.tabIndex = 0;
      track.removeEventListener('focusin', focusIn);
      track.removeEventListener('scroll', schedule);
      win.removeEventListener('scroll', onScroll);
      win.removeEventListener('resize', measure);
      fine.removeEventListener('change', measure);
    },
  };
}

// Scene covers: crossing the stage/rail boundary fades a paper screen over the page, crossing the
// rail/signal boundary wipes it sideways; the page jumps underneath and the next scene's pieces
// enter with a short stagger. A wheel against the travel direction reverses the move.
export function mountSceneCovers(root, doc, win, { paused = () => false, stageMode = () => true } = {}) {
  const hero = root.querySelector('[data-k-stage]');
  const rail = root.querySelector('[data-k-rail]');
  const railStage = rail?.querySelector('.k-rail-stage');
  const nextScene = root.querySelector('[data-k-signal]');
  const idle = { enterContents() {}, setHeroReady() {}, isRunning: () => false, refresh() {}, cleanup() {} };
  if (!hero || !railStage || !nextScene) return idle;
  const fine = win.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 761px)');
  const html = doc.documentElement;
  const lockClass = 'is-ema-cover-locked';
  const screen = doc.createElement('div');
  screen.className = 'k-cover';
  screen.setAttribute('aria-hidden', 'true');
  screen.hidden = true;
  doc.body.append(screen);
  const animations = new Set();
  const timers = new Map();
  const removers = [];
  let running = false, disposed = false, generation = 0, lockedY = 0;
  let direction = 1, reversePull = 0, reverse = null;
  let previousY = win.scrollY, nativeNavigation = Boolean(win.location?.hash), heroReady = false;
  const listen = (node, type, callback, options) => { node.addEventListener(type, callback, options); removers.push(() => node.removeEventListener(type, callback, options)); };
  const allowed = () => !disposed && !paused() && stageMode() && fine.matches && !doc.hidden
    && !root.querySelector('dialog[open]') && typeof screen.animate === 'function' && rail.dataset.mode === 'scroll';
  const top = (element) => element.getBoundingClientRect().top + win.scrollY;
  const railStart = () => top(rail);
  const railEnd = () => railStart() + Math.max(0, rail.offsetHeight - railStage.clientHeight);
  const delta = (event) => event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? win.innerHeight : 1);
  const ignoresWheel = (event) => event.ctrlKey || event.metaKey || Math.abs(event.deltaX || 0) > Math.abs(event.deltaY)
    || event.target?.closest?.('input, select, textarea, [contenteditable], [role=dialog], dialog, .ema-console');
  const clearAnimations = () => {
    for (const animation of animations) animation.cancel();
    animations.clear();
    for (const [timer, resolve] of timers) { win.clearTimeout(timer); resolve(); }
    timers.clear();
  };
  const finish = () => { running = false; clearAnimations(); screen.hidden = true; html.classList.remove(lockClass); previousY = win.scrollY; };
  const cancel = () => { generation++; reverse = null; finish(); };
  const animate = (element, frames, duration, delay = 0, easing = easeOut) => {
    const animation = element.animate(frames, { duration, delay, easing, fill: 'both' });
    animations.add(animation);
    return animation;
  };
  const wait = async (animation, duration) => {
    let timer;
    await Promise.race([
      animation.finished.catch(() => {}),
      new Promise((resolve) => { timer = win.setTimeout(resolve, duration + 100); timers.set(timer, resolve); }),
    ]);
    win.clearTimeout(timer); timers.delete(timer);
  };
  const reveal = (target, kind, travelDirection) => {
    const elements = target === rail
      ? [rail.querySelector('.k-rail-head'), ...rail.querySelectorAll('[data-k-leaf]')]
      : target === hero ? [] : [...nextScene.querySelectorAll('.k-signal-word, .k-clock, .k-bubble')];
    return elements.filter((element) => element?.animate).map((element, index) => {
      const settled = win.getComputedStyle(element).transform;
      const base = settled === 'none' ? '' : settled;
      return animate(element, [
        { opacity: 0, transform: `${base} translate3d(${kind === 'wipe' ? travelDirection * 18 : 0}px, ${kind === 'fade' ? 14 : 0}px, 0)` },
        { opacity: 1, transform: settled },
      ], 240, index * 50);
    });
  };
  const transition = async (from, target, kind, travelDirection, destination, returnTo) => {
    if (running || !allowed()) return;
    const token = ++generation;
    const duration = kind === 'fade' ? 240 : 300;
    direction = travelDirection; reversePull = 0; reverse = null; running = true;
    lockedY = win.scrollY;
    html.classList.add(lockClass);
    win.scrollTo({ top: lockedY, behavior: 'instant' });
    screen.hidden = false;
    const covered = { opacity: 1, clipPath: 'inset(0)' };
    const enter = kind === 'fade' ? { opacity: 0, clipPath: 'inset(0)' } : { opacity: 1, clipPath: travelDirection > 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)' };
    const leave = kind === 'fade' ? { opacity: 0, clipPath: 'inset(0)' } : { opacity: 1, clipPath: travelDirection > 0 ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)' };
    try {
      await wait(animate(screen, [enter, covered], duration, 0, kind === 'fade' ? easeOut : easeInOut), duration);
      if (disposed || token !== generation) return;
      lockedY = destination();
      win.scrollTo({ top: lockedY, behavior: 'instant' });
      const entrances = reveal(target, kind, travelDirection);
      const exit = animate(screen, [covered, leave], duration, 0, kind === 'fade' ? easeOut : easeInOut);
      await Promise.all([wait(exit, duration), ...entrances.map((animation, index) => wait(animation, 240 + index * 50))]);
      if (disposed || token !== generation) return;
      const shouldReverse = reverse;
      finish();
      if (shouldReverse) transition(target, from, kind, -travelDirection, returnTo, destination);
    } catch (_) {
      if (token === generation) cancel();
    }
  };
  const consume = (event, from, target, kind, travelDirection, destination, returnTo) => { event.preventDefault(); transition(from, target, kind, travelDirection, destination, returnTo); };
  const coverRailBoundary = (travelDirection) => {
    const boundary = travelDirection > 0 ? railEnd() : top(nextScene);
    previousY = boundary;
    win.scrollTo({ top: boundary, behavior: 'instant' });
    if (travelDirection > 0) transition(rail, nextScene, 'wipe', 1, () => top(nextScene), railEnd);
    else transition(nextScene, rail, 'wipe', -1, railEnd, () => top(nextScene));
  };
  const coverHeroBoundary = (travelDirection) => {
    const boundary = travelDirection > 0 ? 0 : railStart();
    previousY = boundary;
    win.scrollTo({ top: boundary, behavior: 'instant' });
    if (travelDirection > 0) transition(hero, rail, 'fade', 1, railStart, () => 0);
    else transition(rail, hero, 'fade', -1, () => 0, railStart);
  };
  const enterContents = (event) => {
    if (!allowed() || running || event.defaultPrevented || ignoresWheel(event) || delta(event) <= 0
      || !heroReady || win.scrollY >= railStart() - 2) return;
    event.preventDefault();
    coverHeroBoundary(1);
  };
  const onWheel = (event) => {
    if (!allowed() || ignoresWheel(event)) return;
    const movement = delta(event);
    if (!movement) return;
    if (running) {
      event.preventDefault();
      reversePull = movement * direction < 0 ? reversePull + Math.abs(movement) : 0;
      reverse = reversePull >= 36;
      return;
    }
    if (event.defaultPrevented || html.classList.contains('is-ema-stage-locked')) return;
    const start = railStart(), end = railEnd(), next = top(nextScene), y = win.scrollY;
    nativeNavigation = false;
    if ((heroReady || movement < 0) && y > 2 && y < start - 2) { event.preventDefault(); coverHeroBoundary(movement > 0 ? 1 : -1); return; }
    if (y > end + 2 && y < next - 2) { event.preventDefault(); coverRailBoundary(movement > 0 ? 1 : -1); return; }
    if (movement > 0 && y >= start - 2 && y <= end + 2) {
      if (y >= end - 2) consume(event, rail, nextScene, 'wipe', 1, () => top(nextScene), railEnd);
      else if (y + movement > end) { event.preventDefault(); win.scrollTo({ top: end, behavior: 'instant' }); }
    } else if (movement < 0 && y >= start - 2 && y <= end + 2) {
      if (y <= start + 2) consume(event, rail, hero, 'fade', -1, () => 0, railStart);
      else if (y + movement < start) { event.preventDefault(); win.scrollTo({ top: start, behavior: 'instant' }); }
    } else if (movement < 0 && y >= next - 2 && y <= next + 2) {
      consume(event, nextScene, rail, 'wipe', -1, railEnd, () => top(nextScene));
    } else if (movement < 0 && y > next && y + movement < next) {
      event.preventDefault(); win.scrollTo({ top: next, behavior: 'instant' });
    }
  };
  const onScroll = () => {
    const y = win.scrollY, before = previousY;
    previousY = y;
    if (running && Math.abs(y - lockedY) > 2) { previousY = lockedY; win.scrollTo({ top: lockedY, behavior: 'instant' }); return; }
    if (running || nativeNavigation || !allowed() || html.classList.contains('is-ema-stage-locked')) return;
    const start = railStart(), end = railEnd(), next = top(nextScene);
    if (before >= next - 2 && y < next - 2) coverRailBoundary(-1);
    else if (heroReady && y > 2 && (before <= 2 || (y < start - 2 && y >= before))) coverHeroBoundary(1);
    else if (y < start - 2 && y >= 0 && (before >= start - 2 || (y > 2 && y < before))) coverHeroBoundary(-1);
    else if (y > end + 2 && ((before <= end + 2 && before >= start - 2) || (y < next - 2 && y >= before))) coverRailBoundary(1);
    else if (y < next - 2 && y >= start - 2 && (before >= next - 2 || (y > end + 2 && y < before))) coverRailBoundary(-1);
  };
  const navigate = () => { nativeNavigation = true; previousY = win.scrollY; cancel(); };
  listen(win, 'wheel', onWheel, { passive: false });
  listen(win, 'scroll', onScroll, { passive: true });
  listen(win, 'resize', cancel, { passive: true });
  listen(win, 'pagehide', cancel);
  listen(win, 'hashchange', navigate);
  listen(fine, 'change', cancel);
  listen(doc, 'visibilitychange', () => { if (doc.hidden) cancel(); });
  listen(doc, 'keydown', (event) => { if (['Tab', 'Escape', 'Home', 'End', 'PageUp', 'PageDown', 'ArrowUp', 'ArrowDown', ' '].includes(event.key)) navigate(); });
  listen(doc, 'click', (event) => { if (event.target?.closest?.('a[href], [data-notice-open]')) navigate(); }, true);
  listen(doc, 'focusin', navigate);
  return {
    enterContents,
    setHeroReady(value) { heroReady = Boolean(value); },
    isRunning: () => running,
    refresh() { if (!allowed()) cancel(); },
    cleanup() { disposed = true; cancel(); removers.splice(0).forEach((remove) => remove()); screen.remove(); },
  };
}
