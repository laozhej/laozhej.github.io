// Narrow windows fold the header controls (language, colour mode, motion, palette) behind one button,
// so the navigation pill keeps the centre of the band as in the reference. Without the script the
// controls simply stay visible; on wide windows the button is hidden by CSS and nothing here matters.
export function mountEmaSettings(doc, win) {
  const header = doc.querySelector('.ema-header');
  const toggle = header?.querySelector('[data-ema-settings-toggle]');
  const panel = header?.querySelector('[data-ema-controls]');
  if (!header || !toggle || !panel) return () => {};
  const removers = [];
  const listen = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    removers.push(() => target.removeEventListener(type, handler, options));
  };
  const isOpen = () => panel.hasAttribute('data-open');
  const setOpen = (open, { focus = false } = {}) => {
    if (open) panel.setAttribute('data-open', ''); else panel.removeAttribute('data-open');
    toggle.setAttribute('aria-expanded', String(open));
    if (!open) panel.querySelectorAll('details[open]').forEach((details) => { details.open = false; });
    if (open && focus) panel.querySelector('summary, button:not([hidden]), a')?.focus();
    if (!open && focus) toggle.focus();
  };
  header.dataset.settingsReady = '';
  toggle.hidden = false;
  listen(toggle, 'click', () => setOpen(!isOpen(), { focus: !isOpen() }));
  listen(doc, 'keydown', (event) => {
    if (event.key !== 'Escape' || !isOpen()) return;
    // A nested menu (language or palette) closes first; the next Escape closes the panel.
    if (panel.querySelector('details[open]')) return;
    setOpen(false, { focus: true });
  });
  listen(doc, 'pointerdown', (event) => {
    if (isOpen() && !panel.contains(event.target) && !toggle.contains(event.target)) setOpen(false);
  });
  listen(panel, 'click', (event) => { if (event.target.closest?.('a[href]')) setOpen(false); });
  const wide = win.matchMedia('(min-width: 1101px)');
  const onWide = () => { if (wide.matches) setOpen(false); };
  listen(wide, 'change', onWide);
  return () => {
    setOpen(false);
    removers.forEach((remove) => remove());
    toggle.hidden = true;
    delete header.dataset.settingsReady;
  };
}
