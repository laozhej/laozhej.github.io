// The game shelf on the Games page (游戏 / ゲーム / Games), shared by every theme and language.
//
// To add a game, add an entry where you want it on the shelf:
//   { key: "new-game", title: "Its Own Title", genre: "action", steam: 123456 },
// - `key`: a short id in lowercase letters, numbers and hyphens.
// - `title`: the game's own title, shown in every language. `names` adds its usual Chinese or Japanese name.
// - `genre`: "story", "action", "strategy", "rhythm" or "online".
// - `steam`: the number in its Steam store address. Otherwise `url`: its official site.
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
  status?: "finished" | "playing" | "wishlist";
  pick?: 1 | 2 | 3;
  note?: { "zh-CN": string; ja?: string; en?: string };
};

export const games: GameEntry[] = [
  { key: "tsushima", title: "Ghost of Tsushima", names: { "zh-CN": "对马岛之魂", ja: "ゴースト・オブ・ツシマ" }, genre: "action", steam: 2215430 },
  { key: "steins-gate-reboot", title: "STEINS;GATE RE:BOOT", names: { "zh-CN": "命运石之门 RE:BOOT" }, genre: "story", steam: 4012810 },
  { key: "steins-gate", title: "STEINS;GATE", names: { "zh-CN": "命运石之门" }, genre: "story", steam: 412830 },
  { key: "fate-extella", title: "Fate/EXTELLA", genre: "action", steam: 511680 },
  { key: "fate-extella-link", title: "Fate/EXTELLA LINK", genre: "action", steam: 622220 },
  { key: "fate-hollow-ataraxia", title: "Fate/hollow ataraxia REMASTERED", genre: "story", steam: 2396990 },
  { key: "fate-stay-night", title: "Fate/stay night REMASTERED", genre: "story", steam: 2396980 },
  { key: "witch-holy-night", title: "WITCH ON THE HOLY NIGHT", names: { "zh-CN": "魔法使之夜", ja: "魔法使いの夜" }, genre: "story", steam: 2052410 },
  { key: "arknights", title: "Arknights", names: { "zh-CN": "明日方舟", ja: "アークナイツ" }, genre: "strategy", url: "https://www.arknights.global/" },
  { key: "endfield", title: "Arknights: Endfield", names: { "zh-CN": "明日方舟：终末地", ja: "アークナイツ：エンドフィールド" }, genre: "strategy", steam: 4732690 },
  { key: "cyberpunk", title: "Cyberpunk 2077", names: { "zh-CN": "赛博朋克 2077", ja: "サイバーパンク2077" }, genre: "action", steam: 1091500 },
  { key: "cs2", title: "Counter-Strike 2", names: { "zh-CN": "反恐精英 2" }, genre: "online", steam: 730 },
  { key: "stellar-blade", title: "Stellar Blade", names: { "zh-CN": "剑星" }, genre: "action", steam: 3489700 },
  { key: "elden-ring", title: "ELDEN RING", names: { "zh-CN": "艾尔登法环" }, genre: "action", steam: 1245620 },
  { key: "blue-archive", title: "Blue Archive", names: { "zh-CN": "蔚蓝档案", ja: "ブルーアーカイブ" }, genre: "strategy", steam: 3557620 },
  { key: "vrchat", title: "VRChat", genre: "online", steam: 438100 },
  { key: "death-stranding", title: "DEATH STRANDING", names: { "zh-CN": "死亡搁浅", ja: "デス・ストランディング" }, genre: "action", steam: 1850570 },
  { key: "ff7-remake", title: "FINAL FANTASY VII REMAKE", names: { "zh-CN": "最终幻想 VII 重制版", ja: "ファイナルファンタジーVII リメイク" }, genre: "action", steam: 1462040 },
  { key: "muse-dash", title: "Muse Dash", names: { "zh-CN": "喵斯快跑" }, genre: "rhythm", steam: 774171 },
  { key: "arcaea", title: "Arcaea", names: { "zh-CN": "韵律源点" }, genre: "rhythm", url: "https://arcaea.lowiro.com/" },
  { key: "rdr2", title: "Red Dead Redemption 2", names: { "zh-CN": "荒野大镖客：救赎 2", ja: "レッド・デッド・リデンプション2" }, genre: "action", steam: 1174180 },
  { key: "yotei", title: "Ghost of Yōtei", names: { "zh-CN": "羊蹄山之魂", ja: "ゴースト・オブ・ヨウテイ" }, genre: "action", url: "https://www.playstation.com/en-us/games/ghost-of-yotei/" },
  { key: "manosaba", title: "魔法少女ノ魔女裁判", names: { "zh-CN": "魔法少女的魔女审判" }, genre: "story", url: "https://manosaba.com/" },
];
