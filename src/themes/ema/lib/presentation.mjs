// Theme presentation only. Search, reading and preferences stay in the shared core.
export function mountEmaPresentation(doc, win) {
  const header = doc.querySelector('.ema-header');
  if (!header) return () => {};
  const reduced = win.matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new Set();
  const removers = [];
  let frame = 0;
  let disposed = false;
  const paused = () => reduced.matches || doc.documentElement.dataset.motionPaused === 'true';
  const listen = (target, name, handler, options) => {
    target.addEventListener(name, handler, options);
    removers.push(() => target.removeEventListener(name, handler, options));
  };
  const animate = (element, frames, options = {}) => {
    if (paused() || doc.hidden || !element.animate) return;
    const animation = element.animate(frames, {
      duration: 500, easing: 'cubic-bezier(.23,1,.32,1)', ...options,
    });
    animations.add(animation);
    animation.finished.catch(() => {}).finally(() => animations.delete(animation));
  };
  const cancel = () => {
    animations.forEach(animation => animation.cancel());
    animations.clear();
  };

  // A thin page marker makes the long scrapbook scroll legible; article reading
  // progress remains owned by mountReading and uses its own existing track.
  const progress = doc.createElement('span');
  progress.className = 'ema-page-progress';
  progress.setAttribute('aria-hidden', 'true');
  // On wide screens the same position is shown as a blossom on a side track.
  const track = doc.createElement('div');
  track.className = 'ema-scroll-track';
  track.setAttribute('aria-hidden', 'true');
  track.append(doc.createElement('span'));
  track.firstChild.className = 'ema-scroll-thumb';
  if (!header.querySelector('[data-site-progress]')) { header.append(progress); doc.body.append(track); }
  function update() {
    frame = 0;
    if (disposed) return;
    header.classList.toggle('is-scrolled', win.scrollY > 12);
    const distance = doc.documentElement.scrollHeight - win.innerHeight;
    const ratio = distance > 0 ? Math.max(0, Math.min(1, win.scrollY / distance)) : 0;
    progress.style.transform = `scaleX(${ratio})`;
    track.style.setProperty('--scroll-ratio', ratio.toFixed(4));
  }
  const schedule = () => { if (!frame) frame = win.requestAnimationFrame(update); };
  listen(win, 'scroll', schedule, { passive: true });
  listen(win, 'resize', schedule, { passive: true });

  // Observe concrete reading groups rather than an entire tall section. Content
  // is always visible in CSS; unsupported/disabled motion cannot hide an entry.
  const targets = [...doc.querySelectorAll([
    '.ema-content .blank-page-head > .blank-kicker',
    '.ema-content .blank-page-heading',
    '.ema-content .blank-page-description',
    '.ema-content .blank-post-list > li',
    '.ema-content .blank-project',
    '.ema-content .about-side > *',
    '.ema-content .about-letter',
    '.ema-content .shelf-heading',
    '.ema-content .shelf-card',
    '.ema-content .blank-profile > div',
    '.ema-content .blank-about-section > div',
    '.ema-content .blank-about-section > dl',
    '.ema-content .blank-toolkit > div',
    '.ema-content .blank-endnote',
    '.ema-footer',
  ].join(','))];
  let observer;
  if ('IntersectionObserver' in win) {
    observer = new win.IntersectionObserver(entries => {
      let order = 0;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        // A deep history/hash arrival should settle immediately above the viewport.
        if (entry.boundingClientRect.bottom <= 0) continue;
        animate(entry.target,
          [{ opacity: 0, transform: 'translateY(22px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { delay: Math.min(order++ * 55, 165), fill: 'backwards' });
      }
    }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });
    targets.forEach(target => {
      const rect = target.getBoundingClientRect();
      // The page transition already introduces what is visible in its snapshot.
      if (doc.documentElement.hasAttribute('data-astro-transition') && rect.top < win.innerHeight && rect.bottom > 0) return;
      observer.observe(target);
    });
  }
  // Native details keep keyboard semantics and still get a small pointer response.
  doc.querySelectorAll('.ema-content .blank-project').forEach(details => {
    let pointer = false;
    listen(details, 'pointerdown', () => { pointer = true; });
    listen(details, 'keydown', () => { pointer = false; });
    listen(details, 'toggle', () => {
      if (details.open && pointer) {
        const body = details.querySelector('.blank-project-body');
        if (body) animate(body, [{ opacity: .25, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 220 });
      }
      pointer = false;
      schedule();
    });
  });
  const refresh = () => {
    if (paused() || doc.hidden) cancel();
    schedule();
  };
  listen(doc, 'site:motion-change', refresh);
  listen(doc, 'visibilitychange', refresh);
  listen(reduced, 'change', refresh);
  update();
  return () => {
    disposed = true;
    win.cancelAnimationFrame(frame);
    observer?.disconnect();
    cancel();
    progress.remove();
    track.remove();
    removers.forEach(remove => remove());
  };
}
