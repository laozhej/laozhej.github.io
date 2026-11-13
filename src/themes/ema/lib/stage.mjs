// Sakura Archive homepage runtime (the stage). The pull-and-dock reveal is adapted from
// src/themes/fuyukawa-kagari/lib/home-hero.mjs in Yuimi-chaya/Yuimi-chaya.github.io
// (MIT License, Copyright (c) 2026 Yuimi-chaya; full text in LICENSE). Changes here: it engages only
// at the very top of the page and never scrolls the reader on load; keyboard users dock it with
// ArrowDown, PageDown or Space, and focusing the card docks it; touch screens, the pause button and
// reduced motion get the static page instead (the card in the flow, native scrolling throughout).
import { mountNotice } from './notice.mjs';
import { mountEmaFrames } from './frames.mjs';
import { mountRail, mountSceneCovers } from './rail.mjs';
import { mountTagRain } from './tag-rain.mjs';
import { localDay, noteNumber, pickNote } from '../../../core/content/select-notes.mjs';

export const PULL_DISTANCE = 260;
export const DOCK_THRESHOLD = 0.56;
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

// The pointer spring and depth offsets follow the reference's manga-runtime.mjs (MIT).
export function springStep(position, velocity, target, seconds) {
  const dt = clamp(seconds, 0, 1 / 30);
  const steps = Math.max(1, Math.ceil(dt / (1 / 120)));
  for (let i = 0; i < steps; i++) {
    velocity += ((target - position) * 100 - velocity * 10) * dt / steps;
    position += velocity * dt / steps;
  }
  return { position: clamp(position, -1.08, 1.08), velocity };
}
export function layerOffsets(x, y, scroll = 0) {
  return {
    back: { x: -clamp(x, -1.08, 1.08) * 4, y: -clamp(y, -1.08, 1.08) * 3 - clamp(scroll, 0, 1) * 5 },
    front: { x: clamp(x, -1.08, 1.08) * 9, y: clamp(y, -1.08, 1.08) * 6 + clamp(scroll, 0, 1) * 8 },
  };
}
// Stage values for a pull between 0 (resting) and 1 (docked).
export function stageProgress(value) {
  const v = clamp(value);
  return {
    avatarY: (1 - v) * 56,
    avatarScale: 0.78 + v * 0.22,
    profileOpacity: clamp((v - 0.08) / 0.48),
    copyOpacity: 1 - clamp((v - 0.12) / 0.42),
    cueOpacity: 1 - clamp(v / 0.48),
  };
}

export function mountEmaStage(doc, win) {
  win.__emaStageCleanup?.();
  const root = doc.getElementById('ema-stage');
  if (!root) return () => {};
  const html = doc.documentElement;
  const stage = root.querySelector('[data-k-stage]');
  const hero = root.querySelector('[data-k-hero]');
  const card = root.querySelector('.k-card');
  const profile = root.querySelector('[data-k-profile]');
  const back = root.querySelector('[data-k-back]');
  const front = root.querySelector('[data-k-front]');
  const reduced = win.matchMedia('(prefers-reduced-motion: reduce)');
  const wide = win.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 761px)');
  const fine = win.matchMedia('(hover: hover) and (pointer: fine)');
  const lockClass = 'is-ema-stage-locked';
  const removers = [];
  const timers = new Set();
  let disposed = false;
  let userPaused = false;
  try { userPaused = win.localStorage.getItem('ema-home-motion-paused') === 'true'; } catch (_) {}
  const paused = () => html.dataset.motionPaused === 'true' || userPaused || reduced.matches;
  const canAnimate = () => !disposed && !paused() && !doc.hidden;
  const listen = (target, type, handler, options) => {
    if (!target) return;
    target.addEventListener(type, handler, options);
    removers.push(() => target.removeEventListener(type, handler, options));
  };
  const later = (callback, delay) => {
    const timer = win.setTimeout(() => { timers.delete(timer); callback(); }, delay);
    timers.add(timer);
    return timer;
  };
  const cancelTimer = (timer) => { win.clearTimeout(timer); timers.delete(timer); };
  const dialogOpen = () => Boolean(root.querySelector('dialog[open]'));

  // ---- Pull and dock -------------------------------------------------------------------------
  let pull = 0, reversePull = 0, gate = 'idle', resetTimer = 0, releaseTimer = 0;
  const stageMode = () => root.dataset.mode === 'stage';
  const lock = () => { if (!html.classList.contains(lockClass)) { html.classList.add(lockClass); win.scrollTo({ top: 0, left: 0, behavior: 'instant' }); } };
  const unlock = () => html.classList.remove(lockClass);
  function setProgress(value) {
    const p = stageProgress(value);
    if (value < 1) covers?.setHeroReady(false);
    stage.style.setProperty('--avatar-y', `${p.avatarY}vh`);
    stage.style.setProperty('--avatar-scale', String(p.avatarScale));
    stage.style.setProperty('--profile-opacity', String(p.profileOpacity));
    stage.style.setProperty('--copy-opacity', String(p.copyOpacity));
    stage.style.setProperty('--cue-opacity', String(p.cueOpacity));
  }
  function clearProgress() {
    ['--avatar-y', '--avatar-scale', '--profile-opacity', '--copy-opacity', '--cue-opacity'].forEach((name) => stage.style.removeProperty(name));
  }
  function resetPull() {
    cancelTimer(resetTimer); cancelTimer(releaseTimer);
    pull = 0; reversePull = 0; gate = 'idle';
    unlock();
    stage.classList.remove('is-docked', 'is-pulling');
    setProgress(0);
  }
  function release() {
    if (gate !== 'docked') return;
    cancelTimer(releaseTimer);
    gate = 'passed';
    covers?.setHeroReady(true);
    if (html.classList.contains(lockClass) && win.scrollY > 2) win.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    unlock();
  }
  function dock() {
    cancelTimer(resetTimer);
    if (win.scrollY <= 2) lock();
    pull = PULL_DISTANCE; reversePull = 0; gate = 'docked';
    stage.classList.remove('is-pulling');
    stage.classList.add('is-docked');
    setProgress(1);
    cancelTimer(releaseTimer);
    releaseTimer = later(release, reduced.matches ? 0 : 900);
  }
  function settle() {
    if (gate !== 'pulling') return;
    if (pull / PULL_DISTANCE >= DOCK_THRESHOLD) dock(); else resetPull();
  }
  const wheelDelta = (event) => event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? win.innerHeight : 1);
  function onWheel(event) {
    if (!stageMode() || dialogOpen() || event.defaultPrevented || covers?.isRunning()) return;
    if (event.ctrlKey || event.metaKey || Math.abs(event.deltaX || 0) > Math.abs(event.deltaY)) return;
    const rect = stage.getBoundingClientRect();
    if (!(win.scrollY <= 2 && rect.top >= -2)) return;
    const delta = wheelDelta(event);
    if (delta < 0) {
      if (gate === 'passed' || gate === 'docked') {
        event.preventDefault();
        reversePull += -delta;
        if (reversePull < 36) return;
        resetPull();
        return;
      }
      if (gate !== 'pulling') return;
      event.preventDefault();
      pull = clamp(pull + delta * 0.82, 0, PULL_DISTANCE);
      gate = pull > 0 ? 'pulling' : 'idle';
      stage.classList.toggle('is-pulling', gate === 'pulling');
      if (gate === 'idle') unlock();
      setProgress(pull / PULL_DISTANCE);
      cancelTimer(resetTimer);
      if (gate === 'pulling') resetTimer = later(settle, 260);
      return;
    }
    reversePull = 0;
    if (gate === 'passed') { covers?.enterContents(event); return; }
    if (gate === 'docked') { event.preventDefault(); return; }
    event.preventDefault();
    cancelTimer(releaseTimer);
    lock();
    const resistance = 1 - clamp(pull / PULL_DISTANCE) * 0.5;
    pull = clamp(pull + delta * resistance, 0, PULL_DISTANCE);
    gate = 'pulling';
    stage.classList.add('is-pulling');
    stage.classList.remove('is-docked');
    setProgress(pull / PULL_DISTANCE);
    cancelTimer(resetTimer);
    resetTimer = later(settle, 260);
  }
  function onScroll() {
    if (!stageMode()) return;
    if (html.classList.contains(lockClass) && win.scrollY > 2 && !dialogOpen()) win.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (win.scrollY > 2 && gate === 'idle') {
      // The reader went past the stage another way (scroll bar, keyboard, anchor): treat it as read.
      gate = 'passed'; pull = PULL_DISTANCE;
      stage.classList.add('is-docked'); setProgress(1); covers?.setHeroReady(true);
    }
  }
  function skip() {
    if (!stageMode() || gate === 'passed') return;
    dock(); release();
  }
  function onKey(event) {
    if (!stageMode() || dialogOpen() || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.target?.closest?.('a, button, input, select, textarea, summary, [contenteditable], [role="group"]') && event.key === ' ') return;
    if (!['ArrowDown', 'PageDown', ' ', 'End'].includes(event.key) || win.scrollY > 2) return;
    if (event.key === 'End') { skip(); return; }
    if (gate === 'idle' || gate === 'pulling') { event.preventDefault(); dock(); }
  }
  function onFocusIn(event) {
    if (!stageMode()) return;
    if (profile?.contains(event.target) && gate !== 'docked' && gate !== 'passed') dock();
    else if (html.classList.contains(lockClass) && !stage.contains(event.target)) skip();
  }

  // ---- Typing lines --------------------------------------------------------------------------
  const typingTimers = new Set();
  function typeLoop(target, lines, write = 58, erase = 32, hold = 1250) {
    if (!target || !lines.length) return;
    let line = 0, chars = 0, deleting = false;
    const tick = () => {
      if (!canAnimate()) { target.textContent = lines[line]; return; }
      const text = lines[line];
      target.textContent = text.slice(0, chars);
      let delay;
      if (!deleting && chars < text.length) { chars += 1; delay = write; }
      else if (!deleting) { deleting = true; delay = hold + text.length * 40; }
      else if (chars > 0) { chars -= 1; delay = erase; }
      else { deleting = false; line = (line + 1) % lines.length; delay = 360; }
      const timer = win.setTimeout(() => { typingTimers.delete(timer); tick(); }, delay);
      typingTimers.add(timer);
    };
    tick();
  }
  function stopTyping() { typingTimers.forEach((timer) => win.clearTimeout(timer)); typingTimers.clear(); }
  const typing = root.querySelector('[data-k-typing]');
  const nameTarget = root.querySelector('[data-k-name]');
  const parse = (value) => { try { return JSON.parse(value || '[]'); } catch (_) { return []; } };
  const terminalLines = parse(root.querySelector('[data-k-terminal]')?.dataset.lines);
  const nameLines = parse(nameTarget?.dataset.names);
  function startTyping() {
    stopTyping();
    if (!canAnimate()) {
      if (typing && terminalLines[0]) typing.textContent = terminalLines[0];
      if (nameTarget && nameLines[0]) nameTarget.textContent = nameLines[0];
      return;
    }
    typeLoop(typing, terminalLines);
    typeLoop(nameTarget, nameLines, 96, 46, 1500);
  }

  // ---- Depth: pointer spring and scroll ------------------------------------------------------
  let tx = 0, ty = 0, x = 0, y = 0, vx = 0, vy = 0, depthFrame = 0, lastFrame = 0, heroVisible = true;
  const depthAllowed = () => canAnimate() && fine.matches && heroVisible && html.dataset.yuimiPerformance !== 'lite';
  function paintDepth() {
    const rect = hero.getBoundingClientRect();
    const scroll = clamp(-rect.top / Math.max(rect.height, 1));
    const offsets = layerOffsets(x, y, scroll);
    if (back) back.style.transform = `translate3d(${offsets.back.x.toFixed(2)}px, ${offsets.back.y.toFixed(2)}px, 0)`;
    if (front) front.style.transform = `translate3d(${offsets.front.x.toFixed(2)}px, ${offsets.front.y.toFixed(2)}px, 0)`;
  }
  function resetDepth() {
    win.cancelAnimationFrame(depthFrame); depthFrame = 0; lastFrame = 0;
    tx = ty = x = y = vx = vy = 0;
    if (back) back.style.transform = '';
    if (front) front.style.transform = '';
  }
  function depthTick(now) {
    depthFrame = 0;
    if (!depthAllowed()) { resetDepth(); return; }
    const dt = lastFrame ? (now - lastFrame) / 1000 : 1 / 60;
    lastFrame = now;
    ({ position: x, velocity: vx } = springStep(x, vx, tx, dt));
    ({ position: y, velocity: vy } = springStep(y, vy, ty, dt));
    paintDepth();
    if (Math.abs(x - tx) + Math.abs(y - ty) + Math.abs(vx) + Math.abs(vy) > 0.002) depthFrame = win.requestAnimationFrame(depthTick);
    else { x = tx; y = ty; vx = vy = 0; lastFrame = 0; paintDepth(); }
  }
  const wakeDepth = () => { if (depthAllowed() && !depthFrame) depthFrame = win.requestAnimationFrame(depthTick); };
  listen(hero, 'pointermove', (event) => {
    if (!depthAllowed() || event.pointerType === 'touch') return;
    const rect = hero.getBoundingClientRect();
    tx = clamp((event.clientX - rect.left) / Math.max(rect.width, 1) * 2 - 1, -1, 1);
    ty = clamp((event.clientY - rect.top) / Math.max(rect.height, 1) * 2 - 1, -1, 1);
    wakeDepth();
  }, { passive: true });
  listen(hero, 'pointerleave', () => { tx = ty = 0; wakeDepth(); });
  const heroObserver = 'IntersectionObserver' in win ? new win.IntersectionObserver(([entry]) => {
    heroVisible = entry.isIntersecting;
    if (!heroVisible) resetDepth();
  }, { threshold: 0 }) : null;
  heroObserver?.observe(hero);

  // ---- The avatar's blossom sways with the pointer and can be flicked ------------------------
  const flower = root.querySelector('[data-k-flower]');
  const avatar = root.querySelector('.k-avatar');
  let flowerPointer = null, flowerStartX = 0, flowerStart = 0, flowerAngle = 0;
  const setFlower = (angle) => { flowerAngle = clamp(angle, -32, 32); avatar?.style.setProperty('--flower-sway', `${flowerAngle}deg`); };
  listen(avatar, 'pointermove', (event) => {
    if (flowerPointer !== null) { if (event.pointerId === flowerPointer) setFlower(flowerStart + (event.clientX - flowerStartX) * 0.45); return; }
    if (!canAnimate() || (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen')) return;
    const rect = avatar.getBoundingClientRect();
    setFlower(((event.clientX - rect.left) / Math.max(rect.width, 1) - 0.5) * 40);
  });
  listen(avatar, 'pointerdown', (event) => {
    if (flowerPointer !== null || event.isPrimary === false || event.button !== 0 || !flower) return;
    flowerPointer = event.pointerId; flowerStartX = event.clientX; flowerStart = flowerAngle;
    avatar.setPointerCapture?.(event.pointerId);
  });
  const dropFlower = (event) => {
    if (event && flowerPointer !== null && event.pointerId !== flowerPointer) return;
    if (flowerPointer !== null && avatar?.hasPointerCapture?.(flowerPointer)) avatar.releasePointerCapture(flowerPointer);
    flowerPointer = null; setFlower(0);
  };
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((type) => listen(avatar, type, dropFlower));
  listen(avatar, 'pointerleave', () => { if (flowerPointer === null) setFlower(0); });

  // ---- Clock and today's note ----------------------------------------------------------------
  const dateTarget = root.querySelector('[data-k-date]');
  const timeTarget = root.querySelector('[data-k-time]');
  const lang = html.lang || 'zh-CN';
  let clockTimer = 0;
  const dateFormat = new Intl.DateTimeFormat(lang, { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
  const timeFormat = new Intl.DateTimeFormat(lang, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  function tickClock() {
    win.clearTimeout(clockTimer); clockTimer = 0;
    if (disposed || doc.hidden) return;
    const now = new Date();
    if (dateTarget) dateTarget.textContent = dateFormat.format(now);
    if (timeTarget) timeTarget.textContent = timeFormat.format(now);
    clockTimer = win.setTimeout(tickClock, 1000 - now.getMilliseconds());
  }
  const dialog = root.querySelector('[data-notice]');
  const bubbleTitle = root.querySelector('[data-k-bubble-title]');
  const bubbleText = root.querySelector('[data-k-bubble-text]');
  if (dialog && (bubbleTitle || bubbleText)) {
    const note = pickNote(parse(dialog.dataset.notes), localDay(new Date()));
    if (note) {
      if (bubbleTitle && dialog.dataset.title) bubbleTitle.textContent = dialog.dataset.title.replace('{n}', noteNumber(note.number));
      if (bubbleText) { bubbleText.textContent = note.text; bubbleText.lang = note.lang; }
    }
  }

  // ---- Shared pieces ---------------------------------------------------------------------------
  const closeNotice = mountNotice(root, doc);
  const frames = mountEmaFrames(root, win, { canAnimate, onChange: () => {} });
  const rail = mountRail(root, win, { paused });
  const covers = mountSceneCovers(root, doc, win, { paused, stageMode });
  const rain = mountTagRain(root, win, { canAnimate });

  // ---- Mode: the docking stage only on wide fine pointers with motion on ---------------------
  function applyMode() {
    if (disposed) return;
    const next = wide.matches && !paused() ? 'stage' : 'static';
    root.dataset.paused = String(paused());
    if (root.dataset.mode !== next) {
      root.dataset.mode = next;
      cancelTimer(resetTimer); cancelTimer(releaseTimer);
      unlock();
      stage.classList.remove('is-pulling', 'is-docked');
      clearProgress();
      pull = 0; reversePull = 0;
      if (next === 'stage') {
        if (win.scrollY > 2) { gate = 'passed'; stage.classList.add('is-docked'); setProgress(1); covers?.setHeroReady(true); }
        else { gate = 'idle'; setProgress(0); }
      } else gate = 'idle';
    }
    if (!depthAllowed()) resetDepth();
    frames.refresh();
    rail.refresh();
    covers.refresh();
    rain.refresh();
    startTyping();
    tickClock();
  }

  listen(win, 'wheel', onWheel, { passive: false });
  listen(win, 'scroll', onScroll, { passive: true });
  listen(doc, 'keydown', onKey);
  listen(doc, 'focusin', onFocusIn);
  root.querySelectorAll('[data-k-cue]').forEach((link) => listen(link, 'click', skip));
  listen(doc, 'site:motion-change', (event) => { userPaused = Boolean(event.detail?.userPaused); applyMode(); });
  listen(doc, 'visibilitychange', applyMode);
  [reduced, wide, fine].forEach((query) => listen(query, 'change', applyMode));
  listen(win, 'pagehide', () => { resetDepth(); stopTyping(); win.clearTimeout(clockTimer); });
  listen(win, 'pageshow', applyMode);
  applyMode();

  function cleanup() {
    if (disposed) return;
    disposed = true;
    timers.forEach((timer) => win.clearTimeout(timer)); timers.clear();
    stopTyping(); resetDepth(); win.clearTimeout(clockTimer);
    heroObserver?.disconnect();
    unlock();
    stage.classList.remove('is-pulling', 'is-docked');
    clearProgress();
    rain.cleanup(); covers.cleanup(); rail.cleanup(); frames.cleanup(); closeNotice();
    removers.splice(0).forEach((remove) => remove());
    delete root.dataset.mode;
    if (win.__emaStageCleanup === cleanup) delete win.__emaStageCleanup;
  }
  win.__emaStageCleanup = cleanup;
  return cleanup;
}
