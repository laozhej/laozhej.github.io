import { formatNoteDay, localDay, noteNumber, pickNote } from '../../../core/content/select-notes.mjs';

// Today's note: a native modal dialog that opens by itself once per browser
// session (unless dismissed for the day) and stays available from the hero.
// The notes come from src/core/data/notes.ts; each visitor sees the one for their own day.
export function mountNotice(root, doc, win) {
  const dialog = root.querySelector('[data-notice]');
  const openers = [...root.querySelectorAll('[data-notice-open]')];
  if (!dialog || typeof dialog.showModal !== 'function') return () => {};
  const removers = [];
  const listen = (target, event, handler) => {
    target.addEventListener(event, handler);
    removers.push(() => target.removeEventListener(event, handler));
  };
  const day = localDay(new Date());
  const hiddenKey = `ema-notice-hidden-${day}`, seenKey = `ema-notice-seen-${day}`;
  let notes = [];
  try { notes = JSON.parse(dialog.dataset.notes || '[]'); } catch (_) {}
  const note = pickNote(notes, day);
  if (!note) return () => {};
  const title = dialog.querySelector('[data-notice-title]');
  const date = dialog.querySelector('[data-notice-date]');
  const text = dialog.querySelector('[data-notice-text]');
  const fallback = dialog.querySelector('[data-notice-fallback]');
  const skip = dialog.querySelector('[data-notice-skip]');
  if (title && dialog.dataset.title) title.textContent = dialog.dataset.title.replace('{n}', noteNumber(note.number));
  if (date) date.textContent = formatNoteDay(note.date, doc.documentElement.lang);
  if (text) { text.textContent = note.text; text.lang = note.lang; }
  if (fallback) fallback.hidden = note.translated;

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
