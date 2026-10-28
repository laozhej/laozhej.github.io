// Today's note: a native modal dialog that opens by itself once per browser
// session (unless dismissed for the day) and stays available from the hero.
export function mountNotice(root, doc, win) {
  const dialog = root.querySelector('[data-notice]');
  const openers = [...root.querySelectorAll('[data-notice-open]')];
  if (!dialog || typeof dialog.showModal !== 'function') return () => {};
  const removers = [];
  const listen = (target, event, handler) => {
    target.addEventListener(event, handler);
    removers.push(() => target.removeEventListener(event, handler));
  };
  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  const day = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const hiddenKey = `ema-notice-hidden-${day}`, seenKey = `ema-notice-seen-${day}`;
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  let tips = [];
  try { tips = JSON.parse(dialog.dataset.tips || '[]'); } catch (_) {}
  const title = dialog.querySelector('[data-notice-title]');
  const date = dialog.querySelector('[data-notice-date]');
  const tip = dialog.querySelector('[data-notice-tip]');
  const skip = dialog.querySelector('[data-notice-skip]');
  if (title && dialog.dataset.title) title.textContent = dialog.dataset.title.replace('{n}', String(dayOfYear));
  if (tip && tips.length) tip.textContent = tips[(dayOfYear - 1) % tips.length];
  try {
    if (date) date.textContent = new Intl.DateTimeFormat(doc.documentElement.lang || undefined, { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'long' }).format(now);
  } catch (_) {}

  const open = () => { if (!dialog.open) dialog.showModal(); };
  openers.forEach((button) => { button.hidden = false; listen(button, 'click', open); });
  // Clicks on the dimmed backdrop land on the dialog element itself.
  listen(dialog, 'click', (event) => { if (event.target === dialog) dialog.close(); });
  listen(dialog, 'close', () => {
    if (!skip?.checked) return;
    try { win.localStorage.setItem(hiddenKey, '1'); } catch (_) {}
  });

  let timer = 0;
  let automatic = !win.location?.hash && win.scrollY < 40;
  try {
    if (win.localStorage.getItem(hiddenKey) === '1' || win.sessionStorage.getItem(seenKey) === '1') automatic = false;
    else if (automatic) win.sessionStorage.setItem(seenKey, '1');
  } catch (_) { automatic = false; }
  if (automatic) timer = win.setTimeout(() => { if (!doc.hidden && win.scrollY < 120) open(); }, 900);

  return () => {
    win.clearTimeout(timer);
    if (dialog.open) dialog.close();
    removers.forEach((remove) => remove());
  };
}
