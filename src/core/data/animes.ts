// Anime shown on the About page, shared by every theme and language.
// Source of truth: the owner's Notion database 动漫记录 (动漫 · 追番档案). Only rows with
// 允许网站展示 ticked belong here, in the database's A–Z 排序键 order; synced 2026-10-29.
// Cover provenance and crop records: public/animes/ASSETS.json.
// The full list stays in Notion; the About page links to it. Visitors can open it only while the page is published to the web.
export const animeListUrl = "https://www.notion.so/4055956f0cdc81ad869ec4b8472e6a85";
type Locale = "zh-CN" | "ja" | "en";
type Genre = "coming-of-age" | "music" | "sci-fi" | "fantasy" | "action" | "mystery" | "romance" | "road" | "life";

// Notion 题材 options, in all three languages.
const genreNames: Record<Genre, Record<Locale, string>> = {
  "coming-of-age": { "zh-CN": "青春与成长", ja: "青春・成長", en: "Coming of age" },
  music: { "zh-CN": "音乐与舞台", ja: "音楽・ステージ", en: "Music & stage" },
  "sci-fi": { "zh-CN": "科幻与时间", ja: "SF・時間", en: "Sci-fi & time" },
  fantasy: { "zh-CN": "奇幻与冒险", ja: "ファンタジー・冒険", en: "Fantasy & adventure" },
  action: { "zh-CN": "动作与英雄", ja: "アクション・ヒーロー", en: "Action & heroes" },
  mystery: { "zh-CN": "悬疑与心理", ja: "ミステリー・心理", en: "Mystery & psychology" },
  romance: { "zh-CN": "爱情与关系", ja: "恋愛・人間関係", en: "Romance & relationships" },
  road: { "zh-CN": "公路与自由", ja: "旅・自由", en: "Road & freedom" },
  life: { "zh-CN": "人生与社会", ja: "人生・社会", en: "Life & society" },
};

const animes: { key: string; title: Record<Locale, string>; genres: Genre[]; url: string; cover: string }[] = [
  { key: "sword-art-online", title: { "zh-CN": "刀剑神域", ja: "ソードアート・オンライン", en: "Sword Art Online" }, genres: ["sci-fi", "fantasy"], url: "http://www.swordart-online.net/", cover: "/animes/sword-art-online.webp" },
  { key: "fate-stay-night", title: { "zh-CN": "Fate/stay night", ja: "Fate/stay night", en: "Fate/stay night" }, genres: ["fantasy"], url: "http://www.staynight.com/", cover: "/animes/fate-stay-night.webp" },
  { key: "bocchi-the-rock", title: { "zh-CN": "孤独摇滚！", ja: "ぼっち・ざ・ろっく！", en: "Bocchi the Rock!" }, genres: ["coming-of-age", "music"], url: "http://bocchi.rocks/", cover: "/animes/bocchi-the-rock.webp" },
  { key: "steins-gate", title: { "zh-CN": "命运石之门", ja: "シュタインズ・ゲート", en: "Steins;Gate" }, genres: ["sci-fi", "mystery"], url: "http://www.steinsgate.tv/", cover: "/animes/steins-gate.webp" },
  { key: "k-on", title: { "zh-CN": "轻音少女", ja: "けいおん！", en: "K-On!" }, genres: ["coming-of-age", "music"], url: "http://www.tbs.co.jp/anime/k-on/k-on_tv/index-j.html", cover: "/animes/k-on.webp" },
  { key: "cyberpunk-edgerunners", title: { "zh-CN": "赛博朋克：边缘行者", ja: "サイバーパンク エッジランナーズ", en: "Cyberpunk: Edgerunners" }, genres: ["sci-fi"], url: "https://www.cyberpunk.net/ja/edgerunners", cover: "/animes/cyberpunk-edgerunners.webp" },
];

export function getFavoriteAnimes(locale: Locale) {
  return animes.map((item) => ({
    key: item.key, title: item.title[locale], subtitle: item.genres.map((genre) => genreNames[genre][locale]).join(" · "), url: item.url, cover: item.cover,
  }));
}
