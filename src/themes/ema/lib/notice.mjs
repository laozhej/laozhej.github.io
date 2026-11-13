import { formatNoteDay, localDay, noteNumber, pickNote } from '../../../core/content/select-notes.mjs';

// Sakura note (樱色便笺): a native modal dialog that opens only when a visitor asks for it,
// from the hero link or the journal's empty state. It never opens by itself and stores nothing.
// The notes come from src/core/data/notes.ts; each visitor sees the latest one dated on or before their own day.
export function mountNotice(root, doc) {
  const dialog = root.querySelector('[data-notice]');
  const openers = [...root.querySelectorAll('[data-notice-open]')];
  if (!dialog || typeof dialog.showModal !== 'function') return () => {};
  const removers = [];
  const listen = (target, event, handler) => {
    target.addEventListener(event, handler);
    removers.push(() => target.removeEventListener(event, handler));
  };
  let notes = [];
  try { notes = JSON.parse(dialog.dataset.notes || '[]'); } catch (_) {}
  const note = pickNote(notes, localDay(new Date()));
  if (!note) return () => {};
  const title = dialog.querySelector('[data-notice-title]');
  const date = dialog.querySelector('[data-notice-date]');
  const text = dialog.querySelector('[data-notice-text]');
  const fallback = dialog.querySelector('[data-notice-fallback]');
  if (title && dialog.dataset.title) title.textContent = dialog.dataset.title.replace('{n}', noteNumber(note.number));
  if (date) date.textContent = formatNoteDay(note.date, doc.documentElement.lang);
  if (text) { text.textContent = note.text; text.lang = note.lang; }
  if (fallback) fallback.hidden = note.translated;

  const open = () => { if (!dialog.open) dialog.showModal(); };
  openers.forEach((button) => { button.hidden = false; listen(button, 'click', open); });
  // Clicks on the dimmed backdrop land on the dialog element itself.
  listen(dialog, 'click', (event) => { if (event.target === dialog) dialog.close(); });

  return () => {
    if (dialog.open) dialog.close();
    removers.forEach((remove) => remove());
  };
}
