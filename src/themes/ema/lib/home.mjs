import { mountNotice } from './notice.mjs';
import { mountGallery } from './gallery.mjs';
import { mountEmaFrames } from './frames.mjs';

// Sakura Archive homepage (reviewed prototype r3). The page scrolls normally: nothing here listens to
// wheel events or moves the reader. The heading never moves; the picture and the echo word drift a few
// pixels with the pointer and with the first stretch of scrolling. Sections reveal once, the chapter index
// follows the reading position, the long tag group folds, and the Sakura note and the project's screenshot
// viewer open only when asked.
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
  let scrollFrame = 0, heroVisible = true;
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

  // Depth around a still heading: a spring follows the pointer on desktop; the first 420px of scrolling
  // lift the picture slightly and let the echo word settle. Touch, pause and reduced motion keep all still.
  const hero = $('[data-hero]');
  const layers = $$('[data-parallax-layer]');
  let x = 0, y = 0, vx = 0, vy = 0, targetX = 0, targetY = 0, lift = 0, parallaxFrameId = 0, lastFrameTime = 0;
  function drawLayers() {
    const enabled = canAnimate() && desktop.matches && heroVisible;
    layers.forEach((layer) => {
      const front = layer.dataset.parallaxLayer === 'front';
      const px = enabled ? x * (front ? 9 : -9) : 0;
      const py = enabled ? y * (front ? 6 : -4) + lift * (front ? -6 : 8) : 0;
      layer.style.transform = enabled ? `translate3d(${px.toFixed(2)}px,${py.toFixed(2)}px,0)` : '';
    });
    // The heading's shadow and the picture's light take the same offset; the heading itself stays put.
    hero?.style?.setProperty?.('--px', enabled ? x.toFixed(3) : '0');
    hero?.style?.setProperty?.('--py', enabled ? y.toFixed(3) : '0');
  }
  function resetParallax() {
    window.cancelAnimationFrame(parallaxFrameId); parallaxFrameId = 0; lastFrameTime = 0;
    x = y = vx = vy = targetX = targetY = 0;
    drawLayers();
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
    drawLayers();
    if (Math.abs(x - targetX) + Math.abs(y - targetY) + Math.abs(vx) + Math.abs(vy) > .002) {
      parallaxFrameId = window.requestAnimationFrame(parallaxFrame);
    } else lastFrameTime = 0;
  }
  function wakeParallax() { if (!parallaxFrameId) parallaxFrameId = window.requestAnimationFrame(parallaxFrame); }
  listen(hero, 'pointermove', (event) => {
    if (!canAnimate() || !heroVisible || !desktop.matches || event.pointerType === 'touch') return;
    const rect = hero.getBoundingClientRect();
    targetX = clamp((event.clientX - rect.left) / rect.width * 2 - 1, -1, 1);
    targetY = clamp((event.clientY - rect.top) / rect.height * 2 - 1, -1, 1);
    wakeParallax();
  }, { passive: true });
  listen(hero, 'pointerleave', () => {
    targetX = targetY = 0;
    if (canAnimate() && desktop.matches && heroVisible) wakeParallax();
  });

  // Nothing is hidden in the HTML/CSS. A reveal only starts as a section enters the viewport, and
  // plays once. Cancelling it always shows the final content.
  const revealGroups = $$('[data-ema-reveal]');
  const revealed = new Set();
  let revealObserver = null;
  function reveal(group) {
    if (revealed.has(group)) return;
    revealed.add(group);
    revealObserver?.unobserve(group);
    animate(group,
      [{ opacity: 0, transform: 'translate3d(0,24px,0)' }, { opacity: 1, transform: 'translate3d(0,0,0)' }],
      { duration: 560, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'backwards' });
  }
  if ('IntersectionObserver' in window) {
    revealObserver = new window.IntersectionObserver((entries) => {
      entries.filter((entry) => entry.isIntersecting).forEach((entry) => reveal(entry.target));
    }, { threshold: .08, rootMargin: '0px 0px -30px 0px' });
    revealGroups.forEach((group) => revealObserver.observe(group));
  }

  // The page's own contents: the section whose top has passed 42% of the window is current;
  // at the very bottom the last one is.
  const chapterLinks = $$('.chapters a');
  const chapterTargets = chapterLinks.map((link) => root.querySelector(link.getAttribute('href')));
  function updateChapters() {
    if (!chapterLinks.length) return;
    const line = window.innerHeight * .42;
    let current = -1;
    chapterTargets.forEach((target, index) => { if (target && target.getBoundingClientRect().top <= line) current = index; });
    const height = document.documentElement?.scrollHeight;
    if (height && window.innerHeight + window.scrollY >= height - 4) current = chapterTargets.length - 1;
    chapterLinks.forEach((link, index) => {
      if (index === current) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }

  // Favourite tags: a long group shows its first few with a button for the rest. Every chip is in the
  // HTML, so without the script all of them show. The drop button replays a short fall, once per press.
  $$('[data-tag-group]').forEach((group) => {
    const toggle = group.querySelector('[data-tag-toggle]');
    const items = [...group.querySelectorAll('.chips li')];
    const limit = Number(group.dataset.limit);
    if (!toggle || !(limit < items.length)) return;
    const label = toggle.querySelector('span');
    const set = (open) => {
      items.forEach((item, index) => { item.hidden = !open && index >= limit; });
      toggle.setAttribute('aria-expanded', String(open));
      if (label) label.textContent = open ? toggle.dataset.open : toggle.dataset.closed.replace('{n}', String(items.length - limit));
    };
    toggle.hidden = false;
    set(false);
    listen(toggle, 'click', () => set(toggle.getAttribute('aria-expanded') !== 'true'));
  });
  const drop = $('[data-tags-drop]');
  listen(drop, 'click', () => {
    $$('[data-tag-group] .chips li').filter((item) => !item.hidden).forEach((item, index) => {
      animate(item,
        [{ opacity: 0, transform: `translate3d(0,-26px,0) rotate(${((index * 37) % 17) - 8}deg)` }, { opacity: 1, transform: 'translate3d(0,0,0)' }],
        { duration: 500, delay: index * 9, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'backwards' });
    });
  });

  const closeNotice = mountNotice(root, document);
  const closeGallery = mountGallery(root, document, window);
  const frames = mountEmaFrames(root, window, { canAnimate, onChange: resetParallax });

  function updateScroll() {
    if (disposed) return;
    const rect = hero?.getBoundingClientRect?.();
    const nextVisible = !rect || (rect.bottom > 0 && rect.top < window.innerHeight);
    if (nextVisible !== heroVisible) {
      heroVisible = nextVisible;
      if (!heroVisible) resetParallax();
    }
    if (hero) hero.dataset.suspended = String(suspended() || !heroVisible);
    lift = clamp((window.scrollY || 0) / 420, 0, 1);
    drawLayers();
    updateChapters();
  }
  function scheduleScroll() {
    if (!scrollFrame && !disposed && !suspended()) scrollFrame = window.requestAnimationFrame(() => { scrollFrame = 0; updateScroll(); });
  }
  function refreshMotion() {
    if (disposed) return;
    root.dataset.paused = String(motionPaused());
    root.dataset.suspended = String(suspended());
    if (!canAnimate() || !fine.matches) { resetParallax(); stopAnimations(); }
    if (drop) drop.hidden = motionPaused();
    frames.refresh();
    updateScroll();
  }
  listen(document, 'site:motion-change', (event) => {
    userPaused = Boolean(event.detail?.userPaused);
    refreshMotion();
  });
  listen(window, 'scroll', scheduleScroll, { passive: true });
  listen(window, 'resize', scheduleScroll, { passive: true });
  listen(document, 'visibilitychange', refreshMotion);
  [reduced, fine, desktop].forEach((query) => listen(query, 'change', refreshMotion));
  function cleanup() {
    if (disposed) return;
    disposed = true;
    resetParallax(); stopAnimations();
    window.cancelAnimationFrame(scrollFrame);
    revealObserver?.disconnect();
    frames.cleanup(); closeNotice(); closeGallery();
    removers.splice(0).forEach((remove) => remove());
    if (window.__emaHomeCleanup === cleanup) delete window.__emaHomeCleanup;
  }
  listen(window, 'pagehide', (event) => {
    pageSuspended = true; root.dataset.suspended = 'true';
    resetParallax(); stopAnimations();
    window.cancelAnimationFrame(scrollFrame); scrollFrame = 0;
    if (!event.persisted) cleanup();
  });
  listen(window, 'pageshow', () => { pageSuspended = false; refreshMotion(); });
  window.__emaHomeCleanup = cleanup;
  refreshMotion();
  return cleanup;
}
