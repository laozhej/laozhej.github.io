// The public anime shelf and the smaller selection shown on About use the same records.
import { collectionMessages } from "../i18n/collection-messages.ts";
import { animeList } from "./anime-list.ts";

export const animeListUrl = "https://www.notion.so/4055956f0cdc81ad869ec4b8472e6a85";
type Locale = "zh-CN" | "zh-TW" | "ja" | "en";
export type Genre = "coming-of-age" | "music" | "sci-fi" | "fantasy" | "action" | "mystery" | "romance" | "road" | "life";

// Notion 题材 options, in every language. The Collection page's manga, movies and TV series use the same genres (collection.ts).
export const genreNames: Record<Genre, Record<Locale, string>> = {
  "coming-of-age": { "zh-CN": "青春与成长", "zh-TW": "青春與成長", ja: "青春・成長", en: "Coming of age" },
  music: { "zh-CN": "音乐与舞台", "zh-TW": "音樂與舞台", ja: "音楽・ステージ", en: "Music & stage" },
  "sci-fi": { "zh-CN": "科幻与时间", "zh-TW": "科幻與時間", ja: "SF・時間", en: "Sci-fi & time" },
  fantasy: { "zh-CN": "奇幻与冒险", "zh-TW": "奇幻與冒險", ja: "ファンタジー・冒険", en: "Fantasy & adventure" },
  action: { "zh-CN": "动作与英雄", "zh-TW": "動作與英雄", ja: "アクション・ヒーロー", en: "Action & heroes" },
  mystery: { "zh-CN": "悬疑与心理", "zh-TW": "懸疑與心理", ja: "ミステリー・心理", en: "Mystery & psychology" },
  romance: { "zh-CN": "爱情与关系", "zh-TW": "愛情與關係", ja: "恋愛・人間関係", en: "Romance & relationships" },
  road: { "zh-CN": "公路与自由", "zh-TW": "公路與自由", ja: "旅・自由", en: "Road & freedom" },
  life: { "zh-CN": "人生与社会", "zh-TW": "人生與社會", ja: "人生・社会", en: "Life & society" },
};

export type AnimeStatus = "watching" | "watched" | "dropped";
export type AnimeEntry = {
  key: string;
  title: Record<Locale, string>;
  genres: Genre[];
  year: number;
  favorite?: boolean;
  representativeCover?: boolean;
  url: string;
  cover: string;
  // Optional personal fields (filled in by the owner whenever desired; omitted when unset):
  status?: AnimeStatus;
  note?: { "zh-CN": string; "zh-TW"?: string; ja?: string; en?: string };
};

function localizeAnimes(entries: AnimeEntry[], locale: Locale) {
  return entries.map((item) => {
    const localizedNote = item.note ? (item.note[locale] ?? item.note["zh-CN"]) : undefined;
    return {
      key: item.key,
      title: item.title[locale],
      subtitle: item.genres.map((genre) => genreNames[genre][locale]).join(" · "),
      url: item.url,
      cover: item.cover,
      year: item.year,
      yearText: item.representativeCover
        ? collectionMessages[locale]["collection.coverEditionYear"].replace("{year}", String(item.year))
        : String(item.year),
      // The Collection page files each anime under its genres and searches every language's title.
      genres: item.genres,
      titles: Object.values(item.title),
      status: item.status,
      note: localizedNote ? { text: localizedNote, lang: item.note?.[locale] ? locale : "zh-CN", translated: Boolean(item.note?.[locale]) } : undefined,
    };
  });
}

export function getFavoriteAnimes(locale: Locale) {
  return localizeAnimes(animeList.filter((item) => item.favorite), locale);
}

export function getCollectionAnimes(locale: Locale) {
  return localizeAnimes(animeList, locale);
}
