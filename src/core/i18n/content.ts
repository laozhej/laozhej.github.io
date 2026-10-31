import * as profile from "@/core/data/profile";
import * as projects from "@/core/data/projects";
import { games } from "@/core/data/games";
import { getFavoriteCharacters } from "@/core/data/characters";
import { animeListUrl, getFavoriteAnimes } from "@/core/data/animes";
import { checkGames, linkFavoriteGames, localizeGames } from "@/core/content/select-games.mjs";

// Theme-independent content. Stable keys and URLs are shared by every locale.
checkGames(games);
// Favorite games get their link from the shelf entry with the same key, in every language.
const linked = <T extends { favoriteGames: readonly { key: string }[] }>(content: T) => ({ ...content, favoriteGames: linkFavoriteGames(content.favoriteGames, games) });
const zh = linked({ ...profile, ...projects, gameShelf: localizeGames(games, "zh-CN"), animeFavorites: getFavoriteAnimes("zh-CN"), animeListUrl });

const zhTW = linked({
  gameShelf: localizeGames(games, "zh-TW"),
  animeFavorites: getFavoriteAnimes("zh-TW"),
  animeListUrl,
  profileIdentity: {
    displayName: "荒瀧旭",
    handle: "PROFILE / 個人檔案",
    siteName: "Blank Space",
    bio: "我是荒瀧旭，也可以叫我 Nero。喜歡收集動漫與遊戲周邊，關注 AI 和電腦技術；平時學習程式設計，鑽研動畫、建模與不同的遊戲引擎。",
  },
  profileStatus: ["使用語言：中文（華語）、日語、英語、西班牙語", "掌握多種程式語言", "正在學習如何用 AI 協助開發", "了解未來的遊戲趨勢"],
  profileTech: [
    { key: "unity", name: "Unity3D", note: "遊戲製作/互動邏輯" },
    { key: "blender", name: "Blender", note: "動畫製作/場景建模" },
    { key: "unreal", name: "UE5", note: "進階遊戲製作" },
    { key: "godot", name: "Godot", note: "小型遊戲開發" },
    { key: "rpgmaker", name: "RPG Maker MZ", note: "傳統 RPG 遊戲製作" },
    { key: "vscode", name: "Visual Studio Code", note: "程式設計工具" },
  ],
  favoriteGames: [
    { key: "rdr2", title: "碧血狂殺 2", subtitle: "Red Dead Redemption 2" },
    { key: "tsushima", title: "對馬戰鬼", subtitle: "Ghost of Tsushima" },
    { key: "yotei", title: "羊蹄山戰鬼", subtitle: "Ghost of Yōtei" },
    { key: "manosaba", title: "魔法少女的魔女審判", subtitle: "視覺小說 / 角色與視覺靈感" },
  ],
  xpFavorites: [
    { key: "emma", title: "櫻羽艾瑪", subtitle: "角色風格參考", portrait: "/themes/ema/assets/ema-avatar.webp" },
    { key: "yuki", title: "月代雪", subtitle: "現在的頭像角色", portrait: "/themes/ema/assets/yuki.webp" },
    ...getFavoriteCharacters("zh-TW"),
  ],
  currentSignals: [
    { label: "正在做", text: "開始研究各種與 AI、軟體開發和遊戲製作相關的內容" },
    { label: "接下來", text: "將會慢慢記錄我的研究進度和日常" },
    { label: "視覺方向", text: "這個網站已有多個主題，未來會慢慢打磨並增加新內容" },
  ],
  projectTechLines: [{ key: "web", label: "Web", note: "個人網站 / 頁面與互動" }],
  projectEntries: [
    {
      id: "blank-personal-site", title: "個人網站 · 多主題與多語言", type: "Personal Website", line: "web", status: "持續更新",
      summary: "從 Blank 出發，讓黑白閱讀、櫻色檔案與工業風三套介面共用內容、語言和互動。專案案例記錄設計取捨、共用架構與驗證過程。",
      details: ["三套主題與四種語言", "共用內容、偏好與頁面生命週期", "實際截圖、原始碼導覽與驗證紀錄"],
      url: projects.personalSiteShowcaseUrl,
    },
  ],
} as const);

const ja = linked({
  gameShelf: localizeGames(games, "ja"),
  animeFavorites: getFavoriteAnimes("ja"),
  animeListUrl,
  profileIdentity: {
    displayName: "荒滝 旭",
    handle: "PROFILE / プロフィール",
    siteName: "Blank Space",
    bio: "荒滝旭です。Nero とも呼ばれています。アニメやゲームのグッズ集めが好きで、AI やパソコンの技術にも関心があります。プログラミングを学びながら、アニメーション、モデリング、さまざまなゲームエンジンを探究しています。",
  },
  profileStatus: ["使用言語：中国語（普通話）、日本語、英語、スペイン語", "複数のプログラミング言語を習得", "AI を開発に活用する方法を学習中", "これからのゲームの動向を探る"],
  profileTech: [
    { key: "unity", name: "Unity3D", note: "ゲーム制作 / インタラクションのロジック" },
    { key: "blender", name: "Blender", note: "アニメーション制作 / シーンのモデリング" },
    { key: "unreal", name: "UE5", note: "高度なゲーム制作" },
    { key: "godot", name: "Godot", note: "小規模ゲーム開発" },
    { key: "rpgmaker", name: "RPG Maker MZ", note: "王道 RPG 制作" },
    { key: "vscode", name: "Visual Studio Code", note: "プログラミングツール" },
  ],
  favoriteGames: [
    { key: "rdr2", title: "レッド・デッド・リデンプション2", subtitle: "Red Dead Redemption 2" },
    { key: "tsushima", title: "Ghost of Tsushima", subtitle: "ゴースト・オブ・ツシマ" },
    { key: "yotei", title: "Ghost of Yōtei", subtitle: "ゴースト・オブ・ヨウテイ" },
    { key: "manosaba", title: "魔法少女ノ魔女裁判", subtitle: "ビジュアルノベル / キャラクターとデザインの着想" },
  ],
  xpFavorites: [
    { key: "emma", title: "桜羽エマ", subtitle: "キャラクターデザインの参考", portrait: "/themes/ema/assets/ema-avatar.webp" },
    { key: "yuki", title: "月代ユキ", subtitle: "いまのアイコンのキャラクター", portrait: "/themes/ema/assets/yuki.webp" },
    ...getFavoriteCharacters("ja"),
  ],
  currentSignals: [
    { label: "いま", text: "AI、ソフトウェア開発、ゲーム制作に関するさまざまなことを研究し始めています" },
    { label: "次に", text: "研究の過程や日常を少しずつ記録していきます" },
    { label: "デザイン", text: "複数のテーマを用意しました。これから少しずつ磨きながら、新しいコンテンツを増やしていきます" },
  ],
  projectTechLines: [{ key: "web", label: "Web", note: "個人サイト / ページとインタラクション" }],
  projectEntries: [
    {
      id: "blank-personal-site", title: "個人サイト · テーマと言語の切り替え", type: "Personal Website", line: "web", status: "継続更新中",
      summary: "Blank を出発点に、モノクロ、桜色アーカイブ、工業風の3つのテーマでコンテンツ、言語、操作を共有。設計上の判断、共通アーキテクチャ、検証の過程を事例としてまとめています。",
      details: ["3つのテーマと4つの言語", "コンテンツ・設定・ページのライフサイクルを共有", "実際の画面、ソースコード案内、検証記録"],
      url: projects.personalSiteShowcaseUrl,
    },
  ],
} as const);

const en = linked({
  gameShelf: localizeGames(games, "en"),
  animeFavorites: getFavoriteAnimes("en"),
  animeListUrl,
  profileIdentity: {
    displayName: "Arataki Asahi",
    handle: "PERSONAL PROFILE",
    siteName: "Blank Space",
    bio: "I'm Arataki Asahi, also known as Nero. I collect anime and game merchandise and enjoy learning about AI and computer technology. I'm studying programming and exploring animation, modeling, and different game engines.",
  },
  profileStatus: ["Languages: Mandarin Chinese, Japanese, English, and Spanish", "Proficient in multiple programming languages", "Learning how to use AI to assist development", "Exploring future trends in gaming"],
  profileTech: [
    { key: "unity", name: "Unity3D", note: "Game creation / Interaction logic" },
    { key: "blender", name: "Blender", note: "Animation / Scene modeling" },
    { key: "unreal", name: "UE5", note: "Advanced game creation" },
    { key: "godot", name: "Godot", note: "Small-scale game development" },
    { key: "rpgmaker", name: "RPG Maker MZ", note: "Traditional RPG creation" },
    { key: "vscode", name: "Visual Studio Code", note: "Programming tool" },
  ],
  favoriteGames: [
    { key: "rdr2", title: "Red Dead Redemption 2", subtitle: "A favorite game" },
    { key: "tsushima", title: "Ghost of Tsushima", subtitle: "A favorite game" },
    { key: "yotei", title: "Ghost of Yōtei", subtitle: "A favorite game" },
    { key: "manosaba", title: "魔法少女ノ魔女裁判", subtitle: "Visual novel / Character and visual inspiration" },
  ],
  xpFavorites: [
    { key: "emma", title: "Ema Sakuraba", subtitle: "Character design reference", portrait: "/themes/ema/assets/ema-avatar.webp" },
    { key: "yuki", title: "Yuki Tsukishiro", subtitle: "The character on my avatar", portrait: "/themes/ema/assets/yuki.webp" },
    ...getFavoriteCharacters("en"),
  ],
  currentSignals: [
    { label: "Now", text: "Starting to research topics related to AI, software development, and game creation" },
    { label: "Next", text: "I'll gradually document my research progress and everyday life" },
    { label: "Visual direction", text: "The site now has multiple themes. I'll keep refining them and adding new content over time" },
  ],
  projectTechLines: [{ key: "web", label: "Web", note: "Personal website / Pages and interactions" }],
  projectEntries: [
    {
      id: "blank-personal-site", title: "Personal website · Themes and languages", type: "Personal Website", line: "web", status: "Ongoing",
      summary: "Built from Blank, with monochrome, Sakura Archive, and industrial interfaces sharing content, languages, and behavior. The case study documents design decisions, the shared architecture, and validation.",
      details: ["Three themes and four languages", "Shared content, preferences, and page lifecycle", "Real screenshots, source tour, and validation records"],
      url: projects.personalSiteShowcaseUrl,
    },
  ],
} as const);

export function getSiteContent(locale: "zh-CN" | "zh-TW" | "ja" | "en") {
  return locale === "zh-TW" ? zhTW : locale === "ja" ? ja : locale === "en" ? en : zh;
}
