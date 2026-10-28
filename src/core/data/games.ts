// The game shelf on the Games page (游戏 / ゲーム / Games), shared by every theme and language.
//
// To add a game, add an entry where you want it on the shelf:
//   { key: "new-game", title: "Its Own Title", genre: "action", steam: 123456 },
// - `key`: a short id in lowercase letters, numbers and hyphens.
// - `title`: the game's own title, shown in every language. `names` adds its usual Chinese or Japanese name.
// - `genre`: "story", "action", "strategy", "rhythm" or "online".
// - `steam`: the number in its Steam store address. Otherwise `url`: its official site.
// - `art`: a picture in public/games/ for its card, and the part to keep in view when the card crops it
//   ("50% 50%" is the middle, "0% 0%" the top left). Record where the picture came from in public/games/ASSETS.json.
// Optional, whenever you like:
// - `status`: "finished", "playing" or "wishlist".
// - `pick`: 1, 2 or 3 blossoms for how strongly you recommend it.
// - `note`: your one-line take, { "zh-CN": "…", ja: "…", en: "…" }. Without ja or en, those pages show the Chinese.
// `npm test` (and so the deploy) stops on an entry that breaks these rules.
export type GameGenre = "story" | "action" | "strategy" | "rhythm" | "online";
export type GameEntry = {
  key: string;
  title: string;
  names?: { "zh-CN"?: string; ja?: string; en?: string };
  genre: GameGenre;
  steam?: number;
  url?: string;
  art?: { file: string; focus?: string };
  status?: "finished" | "playing" | "wishlist";
  pick?: 1 | 2 | 3;
  note?: { "zh-CN": string; ja?: string; en?: string };
};

export const games: GameEntry[] = [
  { key: "tsushima", title: "Ghost of Tsushima", names: { "zh-CN": "对马岛之魂", ja: "ゴースト・オブ・ツシマ" }, genre: "action", steam: 2215430, art: { file: "tsushima.webp", focus: "40% 50%" } },
  { key: "steins-gate-reboot", title: "STEINS;GATE RE:BOOT", names: { "zh-CN": "命运石之门 RE:BOOT" }, genre: "story", steam: 4012810, art: { file: "steins-gate-reboot.webp", focus: "78% 40%" } },
  { key: "steins-gate", title: "STEINS;GATE", names: { "zh-CN": "命运石之门" }, genre: "story", steam: 412830, art: { file: "steins-gate.webp", focus: "55% 40%" } },
  { key: "fate-extella", title: "Fate/EXTELLA", genre: "action", steam: 511680, art: { file: "fate-extella.webp", focus: "78% 40%" } },
  { key: "fate-extella-link", title: "Fate/EXTELLA LINK", genre: "action", steam: 622220, art: { file: "fate-extella-link.webp", focus: "62% 40%" } },
  { key: "fate-hollow-ataraxia", title: "Fate/hollow ataraxia REMASTERED", genre: "story", steam: 2396990, art: { file: "fate-hollow-ataraxia.webp", focus: "12% 40%" } },
  { key: "fate-stay-night", title: "Fate/stay night REMASTERED", genre: "story", steam: 2396980, art: { file: "fate-stay-night.webp", focus: "55% 40%" } },
  { key: "witch-holy-night", title: "WITCH ON THE HOLY NIGHT", names: { "zh-CN": "魔法使之夜", ja: "魔法使いの夜" }, genre: "story", steam: 2052410, art: { file: "witch-holy-night.webp", focus: "75% 40%" } },
  { key: "arknights", title: "Arknights", names: { "zh-CN": "明日方舟", ja: "アークナイツ" }, genre: "strategy", url: "https://www.arknights.global/", art: { file: "arknights.webp", focus: "50% 35%" } },
  { key: "endfield", title: "Arknights: Endfield", names: { "zh-CN": "明日方舟：终末地", ja: "アークナイツ：エンドフィールド" }, genre: "strategy", steam: 4732690, art: { file: "endfield.webp", focus: "45% 40%" } },
  { key: "cyberpunk", title: "Cyberpunk 2077", names: { "zh-CN": "赛博朋克 2077", ja: "サイバーパンク2077" }, genre: "action", steam: 1091500, art: { file: "cyberpunk.webp", focus: "62% 50%" } },
  { key: "cs2", title: "Counter-Strike 2", names: { "zh-CN": "反恐精英 2" }, genre: "online", steam: 730, art: { file: "cs2.webp", focus: "82% 50%" } },
  { key: "stellar-blade", title: "Stellar Blade", names: { "zh-CN": "剑星" }, genre: "action", steam: 3489700, art: { file: "stellar-blade.webp", focus: "65% 50%" } },
  { key: "elden-ring", title: "ELDEN RING", names: { "zh-CN": "艾尔登法环" }, genre: "action", steam: 1245620, art: { file: "elden-ring.webp", focus: "50% 50%" } },
  { key: "blue-archive", title: "Blue Archive", names: { "zh-CN": "蔚蓝档案", ja: "ブルーアーカイブ" }, genre: "strategy", steam: 3557620, art: { file: "blue-archive.webp", focus: "75% 50%" } },
  { key: "vrchat", title: "VRChat", genre: "online", steam: 438100, art: { file: "vrchat.webp", focus: "22% 60%" } },
  { key: "death-stranding", title: "DEATH STRANDING", names: { "zh-CN": "死亡搁浅", ja: "デス・ストランディング" }, genre: "action", steam: 1850570, art: { file: "death-stranding.webp", focus: "45% 40%" } },
  { key: "ff7-remake", title: "FINAL FANTASY VII REMAKE", names: { "zh-CN": "最终幻想 VII 重制版", ja: "ファイナルファンタジーVII リメイク" }, genre: "action", steam: 1462040, art: { file: "ff7-remake.webp", focus: "62% 50%" } },
  { key: "muse-dash", title: "Muse Dash", names: { "zh-CN": "喵斯快跑" }, genre: "rhythm", steam: 774171, art: { file: "muse-dash.webp", focus: "30% 40%" } },
  { key: "arcaea", title: "Arcaea", names: { "zh-CN": "韵律源点" }, genre: "rhythm", url: "https://arcaea.lowiro.com/", art: { file: "arcaea.webp", focus: "35% 40%" } },
  { key: "rdr2", title: "Red Dead Redemption 2", names: { "zh-CN": "荒野大镖客：救赎 2", ja: "レッド・デッド・リデンプション2" }, genre: "action", steam: 1174180, art: { file: "rdr2.webp", focus: "72% 40%" } },
  { key: "yotei", title: "Ghost of Yōtei", names: { "zh-CN": "羊蹄山之魂", ja: "ゴースト・オブ・ヨウテイ" }, genre: "action", url: "https://www.playstation.com/en-us/games/ghost-of-yotei/", art: { file: "yotei.webp", focus: "50% 0%" } },
  { key: "manosaba", title: "魔法少女ノ魔女裁判", names: { "zh-CN": "魔法少女的魔女审判" }, genre: "story", steam: 3101040, art: { file: "manosaba.webp", focus: "25% 50%" } },
];
