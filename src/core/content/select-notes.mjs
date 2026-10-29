// Sakura notes are numbered by their place in src/core/data/notes.ts, from No.001.
const dayPattern = /^\d{4}-\d{2}-\d{2}$/;
const translations = ["zh-TW", "ja", "en"];

const pad = (value, length = 2) => String(value).padStart(length, "0");
const parseDay = (day) => {
  const [year, month, date] = day.split("-").map(Number);
  return new Date(year, month - 1, date);
};

export const noteNumber = (number) => pad(number, 3);
export const localDay = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
export const utcDay = (date) => date.toISOString().slice(0, 10);

export function checkNotes(notes) {
  notes.forEach((note, index) => {
    const name = `Sakura note No.${noteNumber(index + 1)} (${note?.date})`;
    if (typeof note?.date !== "string" || !dayPattern.test(note.date) || localDay(parseDay(note.date)) !== note.date) {
      throw new Error(`${name}: the date must be a real day written as YYYY-MM-DD`);
    }
    if (index && note.date <= notes[index - 1].date) {
      throw new Error(`${name}: notes must be one per day, in date order (the one before is ${notes[index - 1].date})`);
    }
    if (typeof note["zh-CN"] !== "string" || !note["zh-CN"].trim()) throw new Error(`${name}: the "zh-CN" text is required`);
    for (const locale of translations) {
      if (note[locale] !== undefined && typeof note[locale] !== "string") throw new Error(`${name}: the "${locale}" text must be a string`);
    }
  });
  return notes;
}

// Missing translations fall back to the Chinese original, marked as such.
export function localizeNotes(notes, locale) {
  return notes.map((note, index) => {
    const text = note[locale]?.trim();
    return { number: index + 1, date: note.date, text: text || note["zh-CN"].trim(), lang: text ? locale : "zh-CN", translated: Boolean(text) };
  });
}

// The note a visitor sees: the latest one dated on or before their own day.
// Before the first note's day (a time zone behind), they see the first one.
export function pickNote(notes, day) {
  let picked = notes[0];
  for (const note of notes) if (note.date <= day) picked = note;
  return picked;
}

// A visitor's day is within one day of the build's UTC day and only moves on after it,
// so no note older than the last one dated before that window can ever be picked.
export function notesToShip(notes, buildDay) {
  const before = new Date(`${buildDay}T00:00:00Z`);
  before.setUTCDate(before.getUTCDate() - 1);
  const earliest = utcDay(before);
  let start = 0;
  notes.forEach((note, index) => { if (note.date <= earliest) start = index; });
  return notes.slice(start);
}

export function formatNoteDay(day, locale) {
  try {
    return new Intl.DateTimeFormat(locale || undefined, { year: "numeric", month: "2-digit", day: "2-digit", weekday: "long" }).format(parseDay(day));
  } catch (_) {
    return day;
  }
}
