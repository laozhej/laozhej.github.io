// The Collection page (收藏): five shelves in a fixed order. Manga, movies and TV series come from
// src/core/data/collection.ts, anime from animes.ts and games from games.ts; getSiteContent serves them localized
// as `collection`. Every theme shows the same shelves, entries, numbers, links and filter keys.
export const collectionShelves = ["manga", "anime", "movies", "tv", "games"];
// The anime genres (animes.ts), shared by manga, movies and TV series.
export const workGenres = ["coming-of-age", "music", "sci-fi", "fantasy", "action", "mystery", "romance", "road", "life"];
const locales = ["zh-CN", "zh-TW", "ja", "en"];

// Where a shelf lives inside a theme and language (add the theme root and locale with getThemePath).
export function collectionPath(shelf) {
  return shelf ? `/collection/${shelf}/` : "/collection/";
}

export function checkWorks(works, shelf) {
  const keys = new Set();
  works.forEach((work, index) => {
    const name = `${shelf} ${index + 1} (${work?.key ?? work?.title?.["zh-CN"]})`;
    if (typeof work?.key !== "string" || !/^[a-z0-9-]+$/.test(work.key)) throw new Error(`${name}: the key must use lowercase letters, numbers and hyphens`);
    if (keys.has(work.key)) throw new Error(`${name}: the key "${work.key}" is already used on this shelf`);
    keys.add(work.key);
    if (typeof work.title?.["zh-CN"] !== "string" || !work.title["zh-CN"].trim()) throw new Error(`${name}: the title needs its "zh-CN" name`);
    for (const [locale, value] of Object.entries(work.title)) {
      if (!locales.includes(locale) || typeof value !== "string") throw new Error(`${name}: title languages are ${locales.join(", ")}`);
    }
    if (!Array.isArray(work.genres) || work.genres.length === 0 || !work.genres.every((genre) => workGenres.includes(genre))) {
      throw new Error(`${name}: genres must be one or more of ${workGenres.join(", ")}`);
    }
    if (work.url !== undefined && !/^https:\/\/\S+$/.test(work.url)) throw new Error(`${name}: the url must start with https://`);
    if (work.cover !== undefined && !/^[a-z0-9-]+\.(webp|jpe?g|png)$/.test(work.cover?.file ?? "")) throw new Error(`${name}: cover.file must be a picture file name in public/collection/`);
    if (work.cover?.focus !== undefined && !/^\d{1,3}% \d{1,3}%$/.test(work.cover.focus)) throw new Error(`${name}: cover.focus must look like "50% 40%"`);
    if (work.creator !== undefined && (typeof work.creator !== "string" || !work.creator.trim())) throw new Error(`${name}: creator must be text`);
    if (work.year !== undefined && !(Number.isInteger(work.year) && work.year >= 1800 && work.year <= 2100)) throw new Error(`${name}: year must be a year such as 2024`);
  });
  return works;
}

// Every entry has the same shape whichever shelf it is on:
// key, shelf, number (its place on the shelf), name (in this language) and lang when the name fell back to Simplified Chinese,
// original (its own title when that differs), tags (filter keys: genres), details (short lines for the card),
// cover ({ src, focus, shape: "wide" | "tall" }), link ({ href, kind: "steam" | "official" }), favorite, status, pick, note,
// and search (every name it goes by).
export function gameEntries(gameShelf, favoriteKeys = []) {
  const favorites = new Set(favoriteKeys);
  return gameShelf.map((game) => ({
    key: game.key,
    shelf: "games",
    number: game.number,
    name: game.name,
    original: game.name !== game.title ? game.title : undefined,
    tags: [game.genre],
    details: [],
    cover: game.art ? { src: game.art.src, focus: game.art.focus, shape: "wide" } : undefined,
    link: game.link ? { href: game.link.href, kind: game.link.steam ? "steam" : "official" } : undefined,
    favorite: favorites.has(game.key),
    status: game.status,
    pick: game.pick,
    note: game.note,
    search: `${game.name} ${game.title}`,
  }));
}

export function animeEntries(animes) {
  return animes.map((anime, index) => ({
    key: anime.key,
    shelf: "anime",
    number: index + 1,
    name: anime.title,
    tags: [...anime.genres],
    details: [anime.subtitle, anime.yearText].filter(Boolean),
    cover: { src: anime.cover, focus: "50% 50%", shape: "tall" },
    link: { href: anime.url, kind: "official" },
    favorite: false,
    search: [anime.title, ...(anime.titles ?? []), anime.year].filter(Boolean).join(" "),
  }));
}

export function workEntries(works, shelf, locale, genreNames) {
  return works.map((work, index) => {
    const own = work.title[locale]?.trim();
    return {
      key: work.key,
      shelf,
      number: index + 1,
      name: own || work.title["zh-CN"].trim(),
      lang: own ? undefined : "zh-CN",
      tags: [...work.genres],
      details: [work.genres.map((genre) => genreNames[genre][locale]).join(" · "), [work.creator, work.year].filter(Boolean).join(" · ")].filter(Boolean),
      cover: work.cover ? { src: `/collection/${work.cover.file}`, focus: work.cover.focus ?? "50% 50%", shape: "tall" } : undefined,
      link: work.url ? { href: work.url, kind: "official" } : undefined,
      favorite: false,
      search: [...Object.values(work.title), work.creator, work.year].filter(Boolean).join(" "),
    };
  });
}

// A shelf is grouped by genre, under a heading per genre, when every entry has exactly one genre and there are at
// least two genres. Otherwise (anime, where a work has several genres) it is one group without a heading.
export function groupEntries(entries, genres) {
  if (genres.length < 2 || !entries.every((entry) => entry.tags.length === 1)) return [{ key: "", entries }];
  return genres.map((key) => ({ key, entries: entries.filter((entry) => entry.tags[0] === key) })).filter((group) => group.entries.length);
}

// The overview shows a few entries per shelf: favorites first, in the owner's order, then the shelf's own order.
export function previewEntries(entries, count, favoriteKeys = []) {
  const favorites = favoriteKeys.map((key) => entries.find((entry) => entry.key === key)).filter(Boolean);
  return [...favorites, ...entries.filter((entry) => !favorites.includes(entry))].slice(0, count);
}

export function buildCollection({ locale, gameShelf, favoriteKeys, animes, works, gameGenres, genreNames }) {
  const shelves = collectionShelves.map((key) => {
    const entries = key === "games" ? gameEntries(gameShelf, favoriteKeys)
      : key === "anime" ? animeEntries(animes)
        : workEntries(works[key] ?? [], key, locale, genreNames);
    const order = key === "games" ? gameGenres : workGenres;
    const genres = order.filter((genre) => entries.some((entry) => entry.tags.includes(genre)));
    // Game genre names are UI copy (messages.ts, games.genre.*); the other shelves name theirs from animes.ts.
    const labels = key === "games" ? undefined : Object.fromEntries(genres.map((genre) => [genre, genreNames[genre][locale]]));
    return { key, entries, genres, labels, groups: groupEntries(entries, genres) };
  });
  return { shelves, total: shelves.reduce((sum, shelf) => sum + shelf.entries.length, 0), favoriteKeys: [...favoriteKeys] };
}
