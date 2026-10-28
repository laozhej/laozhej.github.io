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

  const header = document.querySelector('[data-header]');
  const hero = $('[data-hero]');
  const profile = $('[data-profile-panel]');
  const profileToggles = $$('[data-profile-toggle]');
  function setProfile(open, animated = true) {
    if (!profile) return;
    const changed = profile.hidden === open;
    profile.hidden = !open;
    root.classList.toggle('is-profile-open', open);
    hero?.classList.toggle('is-docked', open);
    profileToggles.forEach((button) => button.setAttribute('aria-expanded', String(open)));
    profileToggles.forEach((button) => { const indicator = button.querySelector('span'); if (indicator) indicator.textContent = open ? '−' : '＋'; });
    if (open && changed && animated) enter(profile);
  }
  profileToggles.forEach((button) => listen(button, 'click', (event) => {
    setProfile(profile?.hidden ?? false, event.detail !== 0);
  }));
  if (profile) setProfile(!profile.hidden, false);

  const typed = $('[data-typed]');
  const commandResult = $('[data-command-result]');
  const commandButtons = $$('[data-command]');
  const commands = commandButtons.map((button) => ({
    id: button.dataset.command,
    text: button.dataset.commandText || '',
    result: button.dataset.commandResult || ''
  }));
  if (!commands.length) return () => {};
  let commandIndex = 0, chars = commands[0].text.length, phase = 'hold', typingTimer = 0;
  const commandFocused = () => commandButtons.some((button) => button.contains(document.activeElement));
  const canType = () => canAnimate() && heroVisible && !commandFocused() && !!typed;
  function clearTyping() { window.clearTimeout(typingTimer); typingTimer = 0; }
  function renderCommand() {
    const command = commands[commandIndex];
    if (typed) typed.textContent = command.text.slice(0, chars);
    if (commandResult) commandResult.textContent = command.result;
    commandButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.command === command.id)));
  }
  function queueTyping(delay = 2600) {
    clearTyping();
    if (canType()) typingTimer = window.setTimeout(typeTick, delay);
  }
  function typeTick() {
    typingTimer = 0;
    if (!canType()) return;
    if (phase === 'hold') { phase = 'erase'; queueTyping(32); return; }
    if (phase === 'erase') {
      chars = Math.max(0, chars - 1);
      if (typed) typed.textContent = commands[commandIndex].text.slice(0, chars);
      if (!chars) {
        commandIndex = (commandIndex + 1) % commands.length;
        phase = 'type'; renderCommand(); queueTyping(300);
      } else queueTyping(32);
      return;
    }
    chars = Math.min(commands[commandIndex].text.length, chars + 1);
    if (typed) typed.textContent = commands[commandIndex].text.slice(0, chars);
    if (chars === commands[commandIndex].text.length) { phase = 'hold'; queueTyping(); }
    else queueTyping(58);
  }
  commandButtons.forEach((button) => listen(button, 'click', () => {
    const selected = commands.findIndex((command) => command.id === button.dataset.command);
    if (selected < 0) return;
    commandIndex = selected; chars = commands[selected].text.length; phase = 'hold';
    renderCommand(); queueTyping(5000);
  }));
  listen(root, 'focusin', () => { if (commandFocused()) clearTyping(); });
  listen(root, 'focusout', () => window.queueMicrotask(() => { if (!disposed) queueTyping(); }));

  const avatarButton = $('[data-avatar-button]');
  const avatarMessage = $('[data-avatar-message]');
  let bubbleTimer = 0;
  listen(avatarButton, 'click', (event) => {
    if (!avatarMessage) return;
    window.clearTimeout(bubbleTimer);
    avatarMessage.hidden = false;
    if (event.detail !== 0) enter(avatarMessage);
    bubbleTimer = window.setTimeout(() => { avatarMessage.hidden = true; }, 2200);
  });
  const noteButton = $('[data-note-toggle]');
  const notePanel = $('[data-note-panel]');
  listen(noteButton, 'click', (event) => {
    if (!notePanel) return;
    notePanel.hidden = !notePanel.hidden;
    noteButton.setAttribute('aria-expanded', String(!notePanel.hidden));
    noteButton.querySelector('span').textContent = notePanel.hidden ? '＋' : '−';
    if (!notePanel.hidden && event.detail !== 0) enter(notePanel);
  });
  if (noteButton && notePanel) noteButton.setAttribute('aria-expanded', String(!notePanel.hidden));

  const parallaxLayers = $$('[data-parallax-layer]');
  const heroScene = $('[data-hero-scene]');
  const heroCopy = $('.hero-copy');
  const heroTitle = $('.hero h1');
  const polaroid = $('.shiroha-polaroid');
  let heroTravel = 0, sceneReady = false;
  function drawHeroLayers() {
    const enabled = canAnimate() && desktop.matches && heroVisible;
    const distance = enabled ? heroTravel : 0;
    parallaxLayers.forEach((layer) => {
      const front = layer.dataset.parallaxLayer === 'front';
      const px = enabled ? x * (front ? 9 : -4) : 0;
      const py = enabled ? y * (front ? 6 : -3) + distance * (front ? .23 : -.14) : 0;
      layer.style.transform = enabled ? `translate3d(${px.toFixed(2)}px,${py.toFixed(2)}px,0)` : '';
    });
    if (heroCopy) heroCopy.style.transform = enabled ? `translate3d(0,${(-distance * .12).toFixed(2)}px,0)` : '';
    if (heroTitle) heroTitle.style.opacity = enabled ? String(1 - clamp(distance / 280, 0, 1) * .58) : '';
    if (polaroid) polaroid.style.transform = enabled ? `translate3d(0,${(-distance * .2).toFixed(2)}px,0) rotate(${(8 - distance * .008).toFixed(2)}deg)` : '';
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
    heroTravel = clamp(-sceneTop, 0, 500);
    drawHeroLayers();
  }
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
  let railMode = 'native', travel = 0, railStart = 0, chapterIndex = 0, chapterTargets = [], railReady = false;
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
    if (railMode === 'scroll' && travel < 1) { railMode = 'native'; rail.dataset.railMode = railMode; rail.style.height = ''; }
    const firstLeft = chapters[0]?.offsetLeft ?? 0;
    chapterTargets = chapters.map((chapter) => clamp(chapter.offsetLeft - firstLeft + chapter.offsetWidth / 2 - viewportWidth / 2, 0, travel));
    if (railMode === 'scroll') rail.style.height = `${Math.ceil(stage.getBoundingClientRect().height + travel)}px`;
    railStart = rail.getBoundingClientRect().top + window.scrollY - 100;
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
    measureFrame = window.requestAnimationFrame(() => { measureFrame = 0; updateHeroScene(); measureRail(); updateScroll(); });
  }
  function scrollWindow(top, smooth) {
    if (smooth) { window.scrollTo({ top, behavior: 'smooth' }); return; }
    const oldBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo({ top, behavior: 'instant' });
    document.documentElement.style.scrollBehavior = oldBehavior;
  }
  function goChapter(index, keyboard = false, bringIntoView = false) {
    if (!rail || !track || !chapters.length) return;
    const selected = clamp(index, 0, chapters.length - 1);
    const target = chapterTargets[selected] ?? 0;
    const smooth = !keyboard && canAnimate();
    if (railMode === 'scroll') scrollWindow(Math.max(0, railStart + target), smooth);
    else {
      track.scrollTo({ left: target, behavior: smooth ? 'smooth' : 'instant' });
      if (bringIntoView) scrollWindow(Math.max(0, rail.getBoundingClientRect().top + window.scrollY - 90), smooth);
    }
    if (!smooth) updateRail();
  }
  listen(prev, 'click', (event) => goChapter(chapterIndex - 1, event.detail === 0));
  listen(next, 'click', (event) => goChapter(chapterIndex + 1, event.detail === 0));
  $$('[data-open-chapter]').forEach((button) => listen(button, 'click', (event) => {
    const index = Number(button.dataset.openChapter);
    if (Number.isInteger(index)) { event.preventDefault(); goChapter(index, event.detail === 0, true); }
  }));
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

  const tagCloud = $('[data-tag-cloud]');
  const tags = tagCloud ? [...tagCloud.querySelectorAll('[data-tag]')] : [];
  let tagsPlayed = false, tagObserver = null;
  function showTags() {
    if (tagsPlayed) return;
    tagsPlayed = true; tagObserver?.disconnect();
    tags.forEach((tag, index) => animate(tag,
      [{ opacity: 0, transform: `translateY(-${32 + index % 3 * 12}px) rotate(${index % 2 ? 7 : -6}deg)` },
        { opacity: 1, transform: 'translateY(0) rotate(0deg)' }],
      { duration: 650, delay: index * 70, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'backwards' }));
  }
  if (tagCloud && 'IntersectionObserver' in window) {
    tagObserver = new window.IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) showTags();
    }, { threshold: .15 });
    tagObserver.observe(tagCloud);
  } else if (tagCloud) showTags();

  function updateScroll() {
    if (disposed) return;
    header?.classList.toggle('is-scrolled', window.scrollY > 12);
    const rect = hero?.getBoundingClientRect();
    const nextVisible = !rect || (rect.bottom > 0 && rect.top < window.innerHeight);
    if (nextVisible !== heroVisible) {
      heroVisible = nextVisible;
      if (!heroVisible) { clearTyping(); resetParallax(); }
      else queueTyping();
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
    clearTyping();
    if (motionPaused()) { chars = commands[commandIndex].text.length; phase = 'hold'; renderCommand(); }
    if (!canAnimate() || !fine.matches) { resetParallax(); stopAnimations(); }
    updateScroll(); queueTyping(); scheduleMeasure();
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
    clearTyping(); resetParallax(); stopAnimations();
    window.clearTimeout(bubbleTimer);
    window.cancelAnimationFrame(scrollFrame); window.cancelAnimationFrame(measureFrame);
    tagObserver?.disconnect(); revealObserver?.disconnect(); resizeObserver?.disconnect();
    removers.splice(0).forEach((remove) => remove());
    if (window.__emaHomeCleanup === cleanup) delete window.__emaHomeCleanup;
  }
  listen(window, 'pagehide', (event) => {
    pageSuspended = true; root.dataset.suspended = 'true';
    clearTyping(); resetParallax(); stopAnimations();
    window.clearTimeout(bubbleTimer);
    if (avatarMessage) avatarMessage.hidden = true;
    window.cancelAnimationFrame(scrollFrame); window.cancelAnimationFrame(measureFrame);
    scrollFrame = measureFrame = 0;
    if (!event.persisted) cleanup();
  });
  listen(window, 'pageshow', () => { pageSuspended = false; refreshMotion(); });
  window.__emaHomeCleanup = cleanup;
  renderCommand(); updateHeroScene(); measureRail(); refreshMotion();
  return cleanup;
}
