// The game shelf lives in src/core/data/games.ts; getSiteContent serves it localized.
export const gameGenres = ["story", "action", "strategy", "rhythm", "online"];
export const gameStatuses = ["finished", "playing", "wishlist"];

export function checkGames(games) {
  const keys = new Set();
  games.forEach((game, index) => {
    const name = `Game ${index + 1} (${game?.key ?? game?.title})`;
    if (typeof game?.key !== "string" || !/^[a-z0-9-]+$/.test(game.key)) throw new Error(`${name}: the key must use lowercase letters, numbers and hyphens`);
    if (keys.has(game.key)) throw new Error(`${name}: the key "${game.key}" is already used`);
    keys.add(game.key);
    if (typeof game.title !== "string" || !game.title.trim()) throw new Error(`${name}: the title is required`);
    if (!gameGenres.includes(game.genre)) throw new Error(`${name}: the genre must be one of ${gameGenres.join(", ")}`);
    if (game.steam !== undefined && !(Number.isInteger(game.steam) && game.steam > 0)) throw new Error(`${name}: steam must be the number in its store address`);
    if (game.url !== undefined && !/^https:\/\/\S+$/.test(game.url)) throw new Error(`${name}: the url must start with https://`);
    if (game.status !== undefined && !gameStatuses.includes(game.status)) throw new Error(`${name}: the status must be one of ${gameStatuses.join(", ")}`);
    if (game.pick !== undefined && ![1, 2, 3].includes(game.pick)) throw new Error(`${name}: pick must be 1, 2 or 3`);
    if (game.note !== undefined && (typeof game.note?.["zh-CN"] !== "string" || !game.note["zh-CN"].trim())) throw new Error(`${name}: a note needs its "zh-CN" text`);
  });
  return games;
}

// Local names fall back to the game's own title; notes fall back to the Chinese original, marked as such.
export function localizeGames(games, locale) {
  return games.map((game, index) => {
    const own = game.note?.[locale]?.trim();
    return {
      key: game.key,
      number: index + 1,
      title: game.title,
      name: game.names?.[locale]?.trim() || game.title,
      genre: game.genre,
      link: game.steam ? { href: `https://store.steampowered.com/app/${game.steam}/`, steam: true } : game.url ? { href: game.url, steam: false } : undefined,
      status: game.status,
      pick: game.pick,
      note: game.note ? { text: own || game.note["zh-CN"].trim(), lang: own ? locale : "zh-CN", translated: Boolean(own) } : undefined,
    };
  });
}
