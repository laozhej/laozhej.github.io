// Fixed English classification words for the five site sections, paired in the header with each section's name in the
// page's language. They are labels, not translations, so they stay the same in every locale.
export const sectionWords = { home: "Index", blog: "Journal", projects: "Works", games: "Games", about: "About" };

// The homepage's own sectors, in page order. The rail counts through them as the reader scrolls (lib/runtime.mjs).
export const homeSectors = [
  { id: "ak-index", word: "Index" },
  { id: "ak-records", word: "Records" },
  { id: "ak-practice", word: "Practice" },
  { id: "ak-play", word: "Play" },
  { id: "ak-status", word: "Status" },
];

export const pad = (value, length = 2) => String(value).padStart(length, "0");
