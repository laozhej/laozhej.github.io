// The Collection page (收藏 / 收藏 / コレクション / Collection), shared by every theme and language.
// It has five shelves, shown in this order in each theme's sidebar: manga, anime, movies, TV series and games.
// Games come from games.ts, anime from animes.ts and movies from movies.ts. Manga and TV series are listed here.
//
// To add a work, add an entry to its shelf below, where you want it on the shelf:
//   { key: "new-work", title: { "zh-CN": "简体中文名", "zh-TW": "台灣常用名", ja: "日本語のタイトル", en: "English title" },
//     genres: ["life"], url: "https://example.com/", cover: { file: "new-work.webp" } },
// - `key`: a short id in lowercase letters, numbers and hyphens, used once per shelf.
// - `title`: the work's usual name in each language. A missing language shows the Simplified Chinese name.
// - `genres`: one or more of the anime genres in animes.ts ("coming-of-age", "music", "sci-fi", "fantasy", "action",
//   "mystery", "romance", "road", "life"), so every language already has their names. The first one comes first on the card.
// - `url`: optional, the work's official page (https://…). The card opens it in a new tab.
// - `cover`: optional, a portrait picture (2:3) in public/collection/, and the part to keep in view when the card crops it
//   ("50% 50%" is the middle). Record where it came from in public/collection/ASSETS.json. No generative-AI images.
// - `creator`: optional, the author, studio or director, written as the work credits them.
// - `year`: optional, the year it came out.
// `npm test` (and so the deploy) stops on an entry that breaks these rules.
import type { Genre } from "./animes.ts";

export type WorkTitle = { "zh-CN": string; "zh-TW"?: string; ja?: string; en?: string };
export type CollectionWork = {
  key: string;
  title: WorkTitle;
  genres: Genre[];
  url?: string;
  cover?: { file: string; focus?: string };
  creator?: string;
  year?: number;
};

export const manga: CollectionWork[] = [];

export { movies } from "./movies.ts";

export const tv: CollectionWork[] = [];
