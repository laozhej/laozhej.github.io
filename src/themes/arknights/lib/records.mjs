// Shared bits of the Arknights inner pages (2026-11-28): how an entry is numbered and how a date reads.

// Entries are numbered oldest first, so a number never changes once given; the list is the shared one, newest first
// (core/content/select-posts.mjs), as on the homepage.
export const serialOf = (posts, slug) => {
  const index = posts.findIndex((post) => post.slug === slug);
  return index < 0 ? "" : String(posts.length - index).padStart(3, "0");
};

// Dates read as a log stamp (2026 // 11 / 15), as on the homepage; screen readers get the usual local date instead.
export const stamp = (date) => {
  const [year, month, day] = date.toISOString().slice(0, 10).split("-");
  return `${year} // ${month} / ${day}`;
};
