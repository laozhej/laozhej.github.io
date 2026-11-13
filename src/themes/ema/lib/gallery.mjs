// Screenshot viewer for the featured project (reviewed prototype r3, "截图 6"). The shots, captions and alt text
// come from the shared project data (projectEntries[n].gallery) and the page renders every thumbnail, so this script
// only moves between them. It is a native modal dialog: ← → Home End switch shots, Escape closes, Tab stays inside,
// a horizontal swipe switches on touch screens, and focus returns to the button that opened it.
export function mountGallery(root, doc, win) {
  const dialog = root.querySelector('[data-gallery]');
  const openers = [...root.querySelectorAll('[data-gallery-open]')];
  const thumbs = dialog ? [...dialog.querySelectorAll('[data-gallery-thumb]')] : [];
  if (!dialog || typeof dialog.showModal !== 'function' || !thumbs.length) return () => {};
  const $ = (selector) => dialog.querySelector(selector);
  const image = $('[data-gallery-image]'), count = $('[data-gallery-count]');
  const label = $('[data-gallery-label]'), meta = $('[data-gallery-meta]');
  const stage = $('[data-gallery-stage]'), close = $('[data-gallery-close]');
  const removers = [];
  const listen = (target, event, handler, options) => {
    if (!target) return;
    target.addEventListener(event, handler, options);
    removers.push(() => target.removeEventListener(event, handler, options));
  };
  let at = 0, opener = null;

  function show(index) {
    at = (index + thumbs.length) % thumbs.length;
    const shot = thumbs[at].dataset;
    if (image) {
      image.width = Number(shot.width); image.height = Number(shot.height);
      image.src = shot.src; image.alt = shot.alt;
    }
    if (count) count.textContent = `${at + 1} / ${thumbs.length}`;
    if (label) label.textContent = shot.label;
    if (meta) meta.textContent = shot.meta;
    thumbs.forEach((thumb, i) => { if (i === at) thumb.setAttribute('aria-current', 'true'); else thumb.removeAttribute('aria-current'); });
    thumbs[at].scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
    // The next shot starts loading while this one is being looked at.
    const ahead = thumbs[(at + 1) % thumbs.length].dataset.src;
    if (ahead && win.Image) new win.Image().src = ahead;
  }

  openers.forEach((button) => {
    button.hidden = false;
    listen(button, 'click', () => {
      opener = button;
      show(0);
      if (!dialog.open) dialog.showModal();
      close?.focus();
    });
  });
  thumbs.forEach((thumb, index) => listen(thumb, 'click', () => show(index)));
  listen($('[data-gallery-prev]'), 'click', () => show(at - 1));
  listen($('[data-gallery-next]'), 'click', () => show(at + 1));
  // Clicks on the dimmed backdrop land on the dialog element itself.
  listen(dialog, 'click', (event) => { if (event.target === dialog) dialog.close(); });
  listen(dialog, 'close', () => { opener?.focus(); opener = null; });
  listen(dialog, 'keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'Tab') {
      // Tab and Shift+Tab wrap inside the dialog instead of leaving for the browser's own controls.
      const stops = [...dialog.querySelectorAll('a[href], button:not([disabled])')].filter((el) => el.getClientRects?.().length);
      if (!stops.length) return;
      const first = stops[0], last = stops[stops.length - 1];
      if (event.shiftKey && (doc.activeElement === first || !dialog.contains(doc.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && doc.activeElement === last) { event.preventDefault(); first.focus(); }
      return;
    }
    if (event.shiftKey) return;
    const index = { ArrowLeft: at - 1, ArrowRight: at + 1, Home: 0, End: thumbs.length - 1 }[event.key];
    if (index === undefined) return;
    event.preventDefault();
    show(index);
  });
  // Touch: a horizontal swipe on the picture; the buttons stay available. Mouse drags do nothing.
  let startX = 0, startY = 0, swiping = false;
  listen(stage, 'pointerdown', (event) => { swiping = event.pointerType !== 'mouse'; startX = event.clientX; startY = event.clientY; });
  listen(stage, 'pointerup', (event) => {
    if (!swiping) return;
    swiping = false;
    const dx = event.clientX - startX, dy = event.clientY - startY;
    if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.4) show(at + (dx < 0 ? 1 : -1));
  });
  listen(stage, 'pointercancel', () => { swiping = false; });

  return () => {
    if (dialog.open) dialog.close();
    removers.splice(0).forEach((remove) => remove());
  };
}
