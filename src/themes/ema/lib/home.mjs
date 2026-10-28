import { mountNotice } from './notice.mjs';
import { mountTagRain } from './tag-rain.mjs';
import { mountEmaScenes } from './scenes.mjs';

export function mountEmaHome(document, window) {
  window.__emaHomeCleanup?.();
  const root = document.getElementById('ema-home');
  if (!root) return () => {};
  const $ = (selector) => root.querySelector(selector);
  const $$ = (selector) => [...root.querySelectorAll(selector)];
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const desktop = window.matchMedia('(min-width: 1000px) and (hover: hover) and (pointer: fine)');
  const removers = [];
  const animations = new Set();
  let disposed = false, pageSuspended = false, userPaused = false;
  let scrollFrame = 0, measureFrame = 0, heroVisible = true;
  try { userPaused = window.localStorage.getItem('ema-home-motion-paused') === 'true'; } catch (_) {}
  const motionPaused = () => document.documentElement?.dataset.motionPaused === 'true' || userPaused || reduced.matches;
  const suspended = () => document.hidden || pageSuspended;
  const canAnimate = () => !disposed && !motionPaused() && !suspended();
  function listen(target, event, handler, options) {
    if (!target) return;
    target.addEventListener(event, handler, options);
    removers.push(() => target.removeEventListener(event, handler, options));
  }
  function animate(element, frames, options) {
    if (!element || !canAnimate() || !element.animate) return;
    const animation = element.animate(frames, options);
    animations.add(animation);
    animation.finished.catch(() => {}).finally(() => animations.delete(animation));
  }
  function stopAnimations() {
    animations.forEach((animation) => animation.cancel());
    animations.clear();
  }
  function enter(element) {
    animate(element, [{ opacity: 0, transform: 'translateY(9px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 300, easing: 'cubic-bezier(.23,1,.32,1)' });
  }
  function scrollWindow(top, smooth) {
    if (smooth) { window.scrollTo({ top, behavior: 'smooth' }); return; }
    const oldBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo({ top, behavior: 'instant' });
    document.documentElement.style.scrollBehavior = oldBehavior;
  }
  const parseList = (value, fallback) => {
    try { const list = JSON.parse(value || '[]'); return Array.isArray(list) && list.length ? list.map(String) : fallback; }
    catch (_) { return fallback; }
  };

  const header = document.querySelector('[data-header]');
  const hero = $('[data-hero]');

  // Typing lines pause off screen and show their first full line when motion is off.
  function typer(target, lines, { write = 58, erase = 32, hold = 2200 } = {}) {
    let index = 0, chars = lines[0]?.length ?? 0, phase = 'hold', timer = 0;
    const draw = () => { if (target) target.textContent = lines[index].slice(0, chars); };
    const clear = () => { window.clearTimeout(timer); timer = 0; };
    const allowed = () => !!target && lines.length > 0 && canAnimate() && heroVisible;
    const queue = (delay) => { clear(); if (allowed()) timer = window.setTimeout(tick, delay); };
    function tick() {
      timer = 0;
      if (!allowed()) return;
      if (phase === 'hold') { phase = 'erase'; queue(erase); return; }
      if (phase === 'erase') {
        chars = Math.max(0, chars - 1); draw();
        if (!chars) { index = (index + 1) % lines.length; phase = 'type'; queue(320); } else queue(erase);
        return;
      }
      chars = Math.min(lines[index].length, chars + 1); draw();
      if (chars === lines[index].length) { phase = 'hold'; queue(hold); } else queue(write);
    }
    return {
      resume() { if (!timer) queue(phase === 'hold' ? hold : write); },
      stop: clear,
      settle() { clear(); index = 0; chars = lines[0]?.length ?? 0; phase = 'hold'; draw(); },
    };
  }
  const typed = $('[data-typed]');
  const commandTyper = typer(typed, parseList(typed?.dataset.commands, [typed?.textContent ?? '']));
  const named = $('[data-name-typed]');
  const nameTyper = typer(named, parseList(named?.dataset.names, [named?.textContent ?? '']), { write: 96, erase: 46, hold: 2600 });
  const typers = [commandTyper, nameTyper];

  // A few quick pokes earn a gentle "slow down" from the avatar.
  const avatar = $('[data-avatar-button]');
  const bubble = $('[data-avatar-message]');
  let bubbleTimer = 0, pokes = [];
  listen(avatar, 'click', (event) => {
    if (!bubble) return;
    const now = Date.now();
    pokes = pokes.filter((time) => now - time < 1600).concat(now);
    bubble.textContent = pokes.length >= 4 ? avatar.dataset.tooFast : avatar.dataset.message;
    window.clearTimeout(bubbleTimer);
    bubble.hidden = false;
    if (event.detail !== 0) enter(bubble);
    avatar.classList.remove('is-poked');
    if (canAnimate()) { void avatar.offsetWidth; avatar.classList.add('is-poked'); }
    bubbleTimer = window.setTimeout(() => { bubble.hidden = true; }, 2400);
  });

  // The pinned opening: scroll lifts the profile card in as the title steps back.
  const parallaxLayers = $$('[data-parallax-layer]');
  const heroScene = $('[data-hero-scene]');
  const identity = $('[data-identity]');
  let runway = 560, heroProgress = 0, sceneReady = false;
  const sceneActive = () => heroScene?.dataset.sceneActive === 'true';
  function drawHeroLayers() {
    const enabled = canAnimate() && desktop.matches && heroVisible;
    parallaxLayers.forEach((layer) => {
      const front = layer.dataset.parallaxLayer === 'front';
      const px = enabled ? x * (front ? 10 : -5) : 0;
      const py = enabled ? y * (front ? 7 : -4) + heroProgress * (front ? 36 : -24) : 0;
      layer.style.transform = enabled ? `translate3d(${px.toFixed(2)}px,${py.toFixed(2)}px,0)` : '';
    });
  }
  function setHeroProgress(progress) {
    heroProgress = progress;
    if (!hero?.style) return;
    if (!sceneActive()) {
      ['--copy-out', '--profile-in', '--cue-out'].forEach((name) => hero.style.removeProperty?.(name));
      hero.classList?.remove('is-docked');
      return;
    }
    // The card settles just before the runway ends, so the pinned stretch never idles.
    const profileIn = clamp((progress - .1) / .75, 0, 1);
    hero.style.setProperty('--copy-out', clamp((progress - .03) / .4, 0, 1).toFixed(3));
    hero.style.setProperty('--profile-in', profileIn.toFixed(3));
    hero.style.setProperty('--cue-out', clamp(progress / .26, 0, 1).toFixed(3));
    hero.classList?.toggle('is-docked', profileIn > .6);
  }
  function updateHeroScene() {
    if (heroScene) {
      const active = String(desktop.matches && window.innerHeight >= 650 && !motionPaused());
      if (heroScene.dataset.sceneActive !== active) {
        const oldHeroTop = hero?.getBoundingClientRect().top;
        heroScene.dataset.sceneActive = active;
        // Removing a sticky segment must not pull the reader to another section.
        if (sceneReady && oldHeroTop !== undefined) {
          const shift = hero.getBoundingClientRect().top - oldHeroTop;
          if (Math.abs(shift) > 1) scrollWindow(Math.max(0, window.scrollY + shift), false);
        }
      }
      sceneReady = true;
    }
    const sceneTop = heroScene?.getBoundingClientRect().top ?? 0;
    setHeroProgress(sceneActive() ? clamp(-sceneTop / runway, 0, 1) : 0);
    drawHeroLayers();
  }
  function measureHero() {
    const value = parseFloat(window.getComputedStyle?.(root)?.getPropertyValue('--hero-runway') ?? '');
    if (value > 0) runway = value;
  }
  // Keyboard users reaching the card while it is still tucked away get scrolled to it.
  listen(identity, 'focusin', () => {
    if (!sceneActive() || heroProgress >= .7 || !heroScene) return;
    scrollWindow(heroScene.getBoundingClientRect().top + window.scrollY + runway * .72, false);
  });

  let parallaxFrameId = 0, lastFrameTime = 0;
  let x = 0, y = 0, vx = 0, vy = 0, targetX = 0, targetY = 0;
  function resetParallax() {
    window.cancelAnimationFrame(parallaxFrameId); parallaxFrameId = 0; lastFrameTime = 0;
    x = y = vx = vy = targetX = targetY = 0;
    drawHeroLayers();
  }
  function parallaxFrame(now) {
    parallaxFrameId = 0;
    if (!canAnimate() || !heroVisible || !fine.matches) { resetParallax(); return; }
    const dt = Math.min(lastFrameTime ? (now - lastFrameTime) / 1000 : 1 / 60, 1 / 30);
    lastFrameTime = now;
    const steps = Math.max(1, Math.ceil(dt * 120));
    for (let step = 0; step < steps; step += 1) {
      const h = dt / steps;
      vx += ((targetX - x) * 100 - vx * 10) * h;
      vy += ((targetY - y) * 100 - vy * 10) * h;
      x += vx * h; y += vy * h;
    }
    drawHeroLayers();
    if (Math.abs(x - targetX) + Math.abs(y - targetY) + Math.abs(vx) + Math.abs(vy) > .002) {
      parallaxFrameId = window.requestAnimationFrame(parallaxFrame);
    } else lastFrameTime = 0;
  }
  function wakeParallax() { if (!parallaxFrameId) parallaxFrameId = window.requestAnimationFrame(parallaxFrame); }
  listen(hero, 'pointermove', (event) => {
    if (!canAnimate() || !heroVisible || !fine.matches || event.pointerType === 'touch') return;
    const rect = hero.getBoundingClientRect();
    targetX = clamp((event.clientX - rect.left) / rect.width * 2 - 1, -1, 1);
    targetY = clamp((event.clientY - rect.top) / rect.height * 2 - 1, -1, 1);
    wakeParallax();
  }, { passive: true });
  listen(hero, 'pointerleave', () => {
    targetX = targetY = 0;
    if (canAnimate() && fine.matches && heroVisible) wakeParallax();
  });

  const rail = $('[data-rail]');
  const stage = $('[data-rail-stage]');
  const track = $('[data-rail-track]');
  const chapters = $$('[data-chapter]');
  const prev = $('[data-rail-prev]');
  const next = $('[data-rail-next]');
  const position = $('[data-rail-position]');
  const railProgress = $('[data-rail-progress]');
  let railMode = 'native', travel = 0, railStart = 0, railTop = 100, chapterIndex = 0, chapterTargets = [], railReady = false;
  function updateActive(offset) {
    if (!chapters.length) return;
    let nearest = 0;
    chapterTargets.forEach((target, index) => {
      if (Math.abs(offset - target) < Math.abs(offset - (chapterTargets[nearest] ?? 0))) nearest = index;
    });
    chapterIndex = nearest;
    chapters.forEach((chapter, index) => chapter.classList.toggle('is-active', index === nearest));
    const countText = `${String(nearest + 1).padStart(2, '0')} / ${String(chapters.length).padStart(2, '0')}`;
    if (position && position.textContent !== countText) position.textContent = countText;
    if (prev) prev.disabled = nearest === 0;
    if (next) next.disabled = nearest === chapters.length - 1;
  }
  function updateRail() {
    if (!rail || !stage || !track) return;
    const offset = railMode === 'scroll' ? clamp(window.scrollY - railStart, 0, travel) : track.scrollLeft;
    if (railMode === 'scroll') track.style.transform = `translate3d(${-offset}px,0,0)`;
    updateActive(offset);
    if (railProgress) railProgress.style.transform = `scaleX(${travel > 0 ? clamp(offset / travel, 0, 1) : 1})`;
  }
  function measureRail() {
    if (!rail || !stage || !track) return;
    const formerMode = railMode, savedIndex = chapterIndex;
    const oldStageTop = stage.getBoundingClientRect().top;
    const oldStageHeight = stage.getBoundingClientRect().height;
    const wasInScrollRail = formerMode === 'scroll' && window.scrollY >= railStart - 1 && window.scrollY <= railStart + travel + 1;
    railMode = desktop.matches && window.innerHeight >= 650 && !motionPaused() ? 'scroll' : 'native';
    rail.dataset.railMode = railMode;
    // Keep the existing scroll runway while measuring: collapsing it first
    // can clamp scrollY on a deep page before the new geometry is known.
    if (railMode === 'native') rail.style.height = '';
    track.style.transform = '';
    if (railMode === 'scroll') track.scrollLeft = 0;
    const viewportWidth = Math.min(track.clientWidth || stage.clientWidth, stage.clientWidth);
    travel = Math.max(0, track.scrollWidth - viewportWidth);
    // The pinned stage sits centred below the header, and only pins when all of it fits.
    const headerHeight = header?.offsetHeight ?? 0;
    const room = window.innerHeight - headerHeight;
    const stageHeight = stage.getBoundingClientRect().height;
    if (railMode === 'scroll' && (travel < 1 || stageHeight > room - 16)) { railMode = 'native'; rail.dataset.railMode = railMode; rail.style.height = ''; }
    railTop = railMode === 'scroll' ? Math.round(headerHeight + Math.max(8, (room - stageHeight) / 2)) : 100;
    rail.style.setProperty?.('--rail-top', `${railTop}px`);
    const firstLeft = chapters[0]?.offsetLeft ?? 0;
    chapterTargets = chapters.map((chapter) => clamp(chapter.offsetLeft - firstLeft + chapter.offsetWidth / 2 - viewportWidth / 2, 0, travel));
    if (railMode === 'scroll') rail.style.height = `${Math.ceil(stage.getBoundingClientRect().height + travel)}px`;
    railStart = rail.getBoundingClientRect().top + window.scrollY - railTop;
    if (railMode === 'native' && formerMode !== railMode) track.scrollLeft = chapterTargets[savedIndex] ?? 0;
    if (railReady && formerMode !== railMode) {
      if (railMode === 'native' && wasInScrollRail) {
        scrollWindow(rail.getBoundingClientRect().top + window.scrollY - oldStageTop, false);
      } else if (railMode === 'scroll' && oldStageTop >= -oldStageHeight && oldStageTop < window.innerHeight * .75) {
        scrollWindow(railStart + (chapterTargets[savedIndex] ?? 0), false);
      }
    }
    railReady = true;
    updateRail();
  }
  function scheduleMeasure() {
    if (measureFrame || disposed || suspended()) return;
    measureFrame = window.requestAnimationFrame(() => { measureFrame = 0; measureHero(); updateHeroScene(); measureRail(); rain.measure(); updateScroll(); });
  }
  function goChapter(index, keyboard = false) {
    if (!rail || !track || !chapters.length) return;
    const selected = clamp(index, 0, chapters.length - 1);
    const target = chapterTargets[selected] ?? 0;
    const smooth = !keyboard && canAnimate();
    if (railMode === 'scroll') scrollWindow(Math.max(0, railStart + target), smooth);
    else track.scrollTo({ left: target, behavior: smooth ? 'smooth' : 'instant' });
    if (!smooth) updateRail();
  }
  listen(prev, 'click', (event) => goChapter(chapterIndex - 1, event.detail === 0));
  listen(next, 'click', (event) => goChapter(chapterIndex + 1, event.detail === 0));
  listen(track, 'focusin', event => {
    const chapter = event.target.closest('[data-chapter]');
    if (railMode === 'scroll' && chapter) goChapter(chapters.indexOf(chapter), true);
  });
  if (track && track.tabIndex < 0) track.tabIndex = 0;
  listen(track, 'keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName) || event.target.isContentEditable) return;
    let target;
    if (event.key === 'ArrowRight') target = chapterIndex + 1;
    else if (event.key === 'ArrowLeft') target = chapterIndex - 1;
    else if (event.key === 'Home') target = 0;
    else if (event.key === 'End') target = chapters.length - 1;
    else return;
    event.preventDefault(); goChapter(target, true);
  });
  listen(track, 'scroll', () => { if (railMode === 'native') scheduleScroll(); }, { passive: true });

  // Nothing is hidden in the HTML/CSS. A reveal only starts as it enters the
  // viewport, and plays once. Cancelling it always reveals the final content.
  const revealGroups = $$('[data-ema-reveal]');
  const revealed = new Set();
  let revealObserver = null;
  function reveal(group) {
    if (revealed.has(group)) return;
    revealed.add(group);
    revealObserver?.unobserve(group);
    const items = [...group.querySelectorAll('[data-ema-reveal-item]')];
    (items.length ? items : [group]).forEach((item, index) => {
      animate(item,
        [{ opacity: 0, transform: 'translate3d(0,28px,0)' }, { opacity: 1, transform: 'translate3d(0,0,0)' }],
        { duration: 600, delay: Math.min(index, 5) * 65, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'backwards' });
    });
  }
  if ('IntersectionObserver' in window) {
    revealObserver = new window.IntersectionObserver((entries) => {
      entries.filter(entry => entry.isIntersecting).forEach(entry => reveal(entry.target));
    }, { threshold: .08, rootMargin: '0px 0px -30px 0px' });
    revealGroups.forEach(group => revealObserver.observe(group));
  }

  // Scene two: the visitor's own clock, ticking only while the scene is near.
  const signal = $('[data-signal]');
  const clockDate = $('[data-clock-date]'), clockTime = $('[data-clock-time]'), clockZone = $('[data-clock-zone]');
  let clockTimer = 0, signalVisible = false, dateFormat = null, timeFormat = null;
  try {
    const language = document.documentElement?.lang || undefined;
    dateFormat = new Intl.DateTimeFormat(language, { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'long' });
    timeFormat = new Intl.DateTimeFormat(language, { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (clockZone && zone) clockZone.textContent = `${clockZone.dataset.label} · ${zone.replace(/_/g, ' ')}`;
  } catch (_) {}
  function tickClock() {
    window.clearTimeout(clockTimer); clockTimer = 0;
    if (disposed || !timeFormat) return;
    const now = new Date();
    if (clockDate) clockDate.textContent = dateFormat.format(now);
    if (clockTime) clockTime.textContent = timeFormat.format(now);
    if (signalVisible && !suspended()) clockTimer = window.setTimeout(tickClock, 1005 - now.getMilliseconds());
  }
  const rain = mountTagRain(signal, document, window, { canAnimate });
  let signalObserver = null;
  if (signal && 'IntersectionObserver' in window) {
    signalObserver = new window.IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1];
      signalVisible = entry.isIntersecting;
      tickClock();
      rain.visibility(entry.intersectionRatio, entry.boundingClientRect.top);
    }, { threshold: [0, .3, .6] });
    signalObserver.observe(signal);
  }
  tickClock();

  const closeNotice = mountNotice(root, document, window);
  const scenes = mountEmaScenes(root, document, window, { canAnimate });

  function updateScroll() {
    if (disposed) return;
    header?.classList.toggle('is-scrolled', window.scrollY > 12);
    const rect = hero?.getBoundingClientRect();
    const nextVisible = !rect || (rect.bottom > 0 && rect.top < window.innerHeight);
    if (nextVisible !== heroVisible) {
      heroVisible = nextVisible;
      if (!heroVisible) { typers.forEach((item) => item.stop()); resetParallax(); }
      else typers.forEach((item) => item.resume());
    }
    if (hero) hero.dataset.suspended = String(suspended() || !heroVisible);
    updateHeroScene();
    updateRail();
  }
  function scheduleScroll() {
    if (!scrollFrame && !disposed && !suspended()) scrollFrame = window.requestAnimationFrame(() => { scrollFrame = 0; updateScroll(); });
  }
  function refreshMotion() {
    if (disposed) return;
    root.dataset.paused = String(motionPaused());
    root.dataset.suspended = String(suspended());
    if (motionPaused()) typers.forEach((item) => item.settle());
    if (!canAnimate() || !fine.matches) { resetParallax(); stopAnimations(); scenes.cancel(); }
    rain.refresh();
    updateScroll(); typers.forEach((item) => item.resume()); tickClock(); scheduleMeasure();
  }
  listen(document, 'site:motion-change', (event) => {
    userPaused = Boolean(event.detail?.userPaused);
    refreshMotion();
  });
  listen(window, 'scroll', scheduleScroll, { passive: true });
  listen(window, 'resize', scheduleMeasure, { passive: true });
  listen(document, 'visibilitychange', refreshMotion);
  [reduced, fine, desktop].forEach((query) => listen(query, 'change', refreshMotion));
  let resizeObserver = null;
  if ('ResizeObserver' in window) {
    resizeObserver = new window.ResizeObserver(scheduleMeasure);
    if (stage) resizeObserver.observe(stage);
    if (hero) resizeObserver.observe(hero);
    chapters.forEach((chapter) => resizeObserver.observe(chapter));
  }
  $$('img').forEach((image) => { if (!image.complete) listen(image, 'load', scheduleMeasure, { once: true }); });
  document.fonts?.ready.then(() => { if (!disposed) scheduleMeasure(); });
  function cleanup() {
    if (disposed) return;
    disposed = true;
    typers.forEach((item) => item.stop()); resetParallax(); stopAnimations();
    window.clearTimeout(bubbleTimer); window.clearTimeout(clockTimer);
    window.cancelAnimationFrame(scrollFrame); window.cancelAnimationFrame(measureFrame);
    revealObserver?.disconnect(); resizeObserver?.disconnect(); signalObserver?.disconnect();
    rain.cleanup(); scenes.cleanup(); closeNotice();
    removers.splice(0).forEach((remove) => remove());
    if (window.__emaHomeCleanup === cleanup) delete window.__emaHomeCleanup;
  }
  listen(window, 'pagehide', (event) => {
    pageSuspended = true; root.dataset.suspended = 'true';
    typers.forEach((item) => item.stop()); resetParallax(); stopAnimations(); scenes.cancel(); rain.refresh();
    window.clearTimeout(bubbleTimer); window.clearTimeout(clockTimer);
    if (bubble) bubble.hidden = true;
    window.cancelAnimationFrame(scrollFrame); window.cancelAnimationFrame(measureFrame);
    scrollFrame = measureFrame = 0;
    if (!event.persisted) cleanup();
  });
  listen(window, 'pageshow', () => { pageSuspended = false; refreshMotion(); });
  window.__emaHomeCleanup = cleanup;
  measureHero(); updateHeroScene(); measureRail(); refreshMotion();
  return cleanup;
}
