import * as profile from "@/core/data/profile";
import * as projects from "@/core/data/projects";
import { games } from "@/core/data/games";
import { getFavoriteCharacters } from "@/core/data/characters";
import { animeListUrl, genreNames, getFavoriteAnimes } from "@/core/data/animes";
import { manga, movies, tv } from "@/core/data/collection";
import { checkGames, gameGenres, linkFavoriteGames, localizeGames } from "@/core/content/select-games.mjs";
import { buildCollection, checkWorks } from "@/core/content/select-collection.mjs";

// Theme-independent content. Stable keys and URLs are shared by every locale.
checkGames(games);
checkWorks(manga, "manga");
checkWorks(movies, "movies");
checkWorks(tv, "tv");
// Favorite games get their link from the shelf entry with the same key, in every language.
const linked = <T extends { favoriteGames: readonly { key: string }[] }>(content: T) => ({ ...content, favoriteGames: linkFavoriteGames(content.favoriteGames, games) });
const zh = linked({ ...profile, ...projects, gameShelf: localizeGames(games, "zh-CN"), animeFavorites: getFavoriteAnimes("zh-CN"), animeListUrl });

const zhTW = linked({
  gameShelf: localizeGames(games, "zh-TW"),
  animeFavorites: getFavoriteAnimes("zh-TW"),
  animeListUrl,
  profileIdentity: {
    displayName: "荒瀧旭",
    alias: profile.profileIdentity.alias,
    handle: "PROFILE / 個人檔案",
    siteName: "Blank Space",
    bio: "我是荒瀧旭，也可以叫我 Nero。喜歡收集動漫與遊戲周邊，關注 AI 和電腦技術；平時學習程式設計，鑽研動畫、建模與不同的遊戲引擎。",
    intro: "喜歡收集動漫與遊戲周邊，關注 AI 和電腦技術；平時學習程式設計，鑽研動畫、建模與不同的遊戲引擎。",
  },
  profileStatus: ["使用語言：中文（國語）、日語、英語、西班牙語", "掌握多種程式語言", "正在學習如何用 AI 協助開發", "關注遊戲產業的新趨勢"],
  profileTech: [
    { key: "unity", name: "Unity3D", note: "遊戲製作 / 互動邏輯" },
    { key: "blender", name: "Blender", note: "動畫製作 / 場景建模" },
    { key: "unreal", name: "UE5", note: "進階遊戲開發" },
    { key: "godot", name: "Godot", note: "小型遊戲開發" },
    { key: "rpgmaker", name: "RPG Maker MZ", note: "傳統 RPG 遊戲製作" },
    { key: "vscode", name: "Visual Studio Code", note: "日常程式碼編輯器" },
  ],
  favoriteGames: [
    { key: "rdr2", title: "碧血狂殺 2", subtitle: "Red Dead Redemption 2" },
    { key: "tsushima", title: "對馬戰鬼", subtitle: "Ghost of Tsushima" },
    { key: "yotei", title: "羊蹄山戰鬼", subtitle: "Ghost of Yōtei" },
    { key: "manosaba", title: "魔法少女的魔女審判", subtitle: "視覺小說 / 角色與視覺靈感" },
  ],
  xpFavorites: getFavoriteCharacters("zh-TW"),
  currentSignals: [
    { label: "正在做", text: "邊學邊研究 AI、軟體開發和遊戲製作" },
    { label: "接下來", text: "把學習筆記、專案進度和日常陸續寫進網站" },
    { label: "網站規劃", text: "在現有四套主題的基礎上持續精進細節，補充文章與收藏" },
  ],
  projectTechLines: [{ key: "web", label: "Web", note: "個人網站 / 頁面與互動" }],
  projectEntries: [
    {
      id: "blank-personal-site", title: "個人網站 · 多主題與多語言", type: "個人網站", line: "web", status: "持續更新",
      summary: "從 Blank 出發，讓黑白閱讀、櫻色檔案、工業風與明日方舟四套介面共用內容、語言和互動。專案案例記錄設計取捨、共用架構與驗證過程。",
      details: ["四套主題與四種語言", "共用內容、偏好與頁面生命週期", "實際截圖、原始碼導覽與驗證紀錄"],
      url: projects.personalSiteShowcaseUrl,
      image: { ...projects.personalSitePreview, alt: "Blank 主題首頁截圖：白底黑字的大標題 Blank Space、簡介與文章入口" },
      gallery: [
        { ...projects.personalSiteGallery[0], label: "Blank 主題 · 首頁", meta: "淺色 · 1440×960 · 2026-10-31 截圖", alt: "Blank 主題首頁截圖：白底黑字的大標題 Blank Space、簡介與文章入口" },
        { ...projects.personalSiteGallery[1], label: "Blank 主題 · 首頁（深色）", meta: "深色 · 1440×960 · 2026-10-31 截圖", alt: "Blank 主題首頁的深色模式截圖：黑底白字的大標題 Blank Space" },
        { ...projects.personalSiteGallery[2], label: "Blank 主題 · 作品頁", meta: "淺色 · 1440×960 · 2026-10-31 截圖", alt: "Blank 主題作品頁截圖：標題 Works 與個人網站專案條目" },
        { ...projects.personalSiteGallery[3], label: "終末地工業風主題 · 首頁", meta: "淺色 · 1440×960 · 2026-10-31 截圖", alt: "終末地工業風主題首頁截圖：ARATAKI.BR 標題、黃色醒目標語與統計數字" },
        { ...projects.personalSiteGallery[4], label: "Blank 主題 · 手機寬度", meta: "淺色 · 390×844 · 2026-10-31 截圖", alt: "Blank 主題首頁在手機寬度下的截圖" },
        { ...projects.personalSiteGallery[5], label: "終末地工業風主題 · 手機寬度", meta: "淺色 · 390×844 · 2026-10-31 截圖", alt: "終末地工業風主題首頁在手機寬度下的截圖" },
      ],
    },
  ],
} as const);

const ja = linked({
  gameShelf: localizeGames(games, "ja"),
  animeFavorites: getFavoriteAnimes("ja"),
  animeListUrl,
  profileIdentity: {
    displayName: "荒滝旭",
    alias: profile.profileIdentity.alias,
    handle: "PROFILE / プロフィール",
    siteName: "Blank Space",
    bio: "荒滝旭です。Nero とも呼ばれています。アニメやゲームのグッズ集めが好きで、AI やパソコンの技術にも関心があります。プログラミングを学びながら、アニメーション、モデリング、さまざまなゲームエンジンを探究しています。",
    intro: "アニメやゲームのグッズ集めが好きで、AI やパソコンの技術にも関心があります。プログラミングを学びながら、アニメーション、モデリング、さまざまなゲームエンジンを探究しています。",
  },
  profileStatus: ["使用言語：中国語（普通話）、日本語、英語、スペイン語", "複数のプログラミング言語を習得", "AI を開発に活用する方法を学習中", "これからのゲーム業界の動向を追っている"],
  profileTech: [
    { key: "unity", name: "Unity3D", note: "ゲーム制作 / インタラクションのロジック" },
    { key: "blender", name: "Blender", note: "アニメーション制作 / シーンのモデリング" },
    { key: "unreal", name: "UE5", note: "本格的なゲーム開発" },
    { key: "godot", name: "Godot", note: "小規模ゲーム開発" },
    { key: "rpgmaker", name: "RPG Maker MZ", note: "王道 RPG 制作" },
    { key: "vscode", name: "Visual Studio Code", note: "普段使いのコードエディタ" },
  ],
  favoriteGames: [
    { key: "rdr2", title: "レッド・デッド・リデンプション2", subtitle: "Red Dead Redemption 2" },
    { key: "tsushima", title: "Ghost of Tsushima", subtitle: "ゴースト・オブ・ツシマ" },
    { key: "yotei", title: "Ghost of Yōtei", subtitle: "ゴースト・オブ・ヨウテイ" },
    { key: "manosaba", title: "魔法少女ノ魔女裁判", subtitle: "ビジュアルノベル / キャラクターとデザインの着想" },
  ],
  xpFavorites: getFavoriteCharacters("ja"),
  currentSignals: [
    { label: "いま", text: "AI、ソフトウェア開発、ゲーム制作を学びながら試しています" },
    { label: "これから", text: "学習ノートや制作の進捗、日々の記録をサイトに足していきます" },
    { label: "サイトについて", text: "4つのテーマをベースに細部を磨きつつ、記事やコレクションを増やしていきます" },
  ],
  projectTechLines: [{ key: "web", label: "Web", note: "個人サイト / ページとインタラクション" }],
  projectEntries: [
    {
      id: "blank-personal-site", title: "個人サイト · テーマと言語の切り替え", type: "個人サイト", line: "web", status: "継続更新中",
      summary: "Blank を出発点に、モノクロ、桜色の記録、工業風、アークナイツの4つのテーマでコンテンツ、言語、操作を共有。設計上の判断、共通アーキテクチャ、検証の過程を事例としてまとめています。",
      details: ["4つのテーマと4つの言語", "コンテンツ・設定・ページのライフサイクルを共有", "実際の画面、ソースコード案内、検証記録"],
      url: projects.personalSiteShowcaseUrl,
      image: { ...projects.personalSitePreview, alt: "Blank テーマのホーム画面：白地に黒の大きな見出し Blank Space、紹介文と記事への入口" },
      gallery: [
        { ...projects.personalSiteGallery[0], label: "Blank テーマ · ホーム", meta: "ライト · 1440×960 · 2026-10-31 撮影", alt: "Blank テーマのホーム画面：白地に黒の大きな見出し Blank Space、紹介文と記事への入口" },
        { ...projects.personalSiteGallery[1], label: "Blank テーマ · ホーム（ダーク）", meta: "ダーク · 1440×960 · 2026-10-31 撮影", alt: "Blank テーマのホーム画面（ダークモード）：黒地に白の大きな見出し Blank Space" },
        { ...projects.personalSiteGallery[2], label: "Blank テーマ · 制作ページ", meta: "ライト · 1440×960 · 2026-10-31 撮影", alt: "Blank テーマの制作ページ：見出し Works と個人サイトのプロジェクト項目" },
        { ...projects.personalSiteGallery[3], label: "エンドフィールド・インダストリアル · ホーム", meta: "ライト · 1440×960 · 2026-10-31 撮影", alt: "エンドフィールド・インダストリアルテーマのホーム画面：ARATAKI.BR の見出し、黄色で強調したキャッチコピーと数字" },
        { ...projects.personalSiteGallery[4], label: "Blank テーマ · スマートフォン幅", meta: "ライト · 390×844 · 2026-10-31 撮影", alt: "スマートフォン幅で表示した Blank テーマのホーム画面" },
        { ...projects.personalSiteGallery[5], label: "エンドフィールド・インダストリアル · スマートフォン幅", meta: "ライト · 390×844 · 2026-10-31 撮影", alt: "スマートフォン幅で表示したエンドフィールド・インダストリアルテーマのホーム画面" },
      ],
    },
  ],
} as const);

const en = linked({
  gameShelf: localizeGames(games, "en"),
  animeFavorites: getFavoriteAnimes("en"),
  animeListUrl,
  profileIdentity: {
    displayName: "Asahi Arataki",
    alias: profile.profileIdentity.alias,
    handle: "PERSONAL PROFILE",
    siteName: "Blank Space",
    bio: "I'm Asahi Arataki, also known as Nero. I collect anime and game merchandise and enjoy learning about AI and computer technology. I'm studying programming and exploring animation, modeling, and different game engines.",
    intro: "I collect anime and game merchandise and enjoy learning about AI and computer technology. I'm studying programming and exploring animation, modeling, and different game engines.",
  },
  profileStatus: ["Languages: Mandarin Chinese, Japanese, English, and Spanish", "Proficient in multiple programming languages", "Learning how to use AI to assist development", "Exploring future trends in gaming"],
  profileTech: [
    { key: "unity", name: "Unity3D", note: "Game creation / Interaction logic" },
    { key: "blender", name: "Blender", note: "Animation / Scene modeling" },
    { key: "unreal", name: "UE5", note: "Advanced game development" },
    { key: "godot", name: "Godot", note: "Small-scale game development" },
    { key: "rpgmaker", name: "RPG Maker MZ", note: "Traditional RPG creation" },
    { key: "vscode", name: "Visual Studio Code", note: "Daily code editor" },
  ],
  favoriteGames: [
    { key: "rdr2", title: "Red Dead Redemption 2", subtitle: "Action & RPG" },
    { key: "tsushima", title: "Ghost of Tsushima", subtitle: "Action & RPG" },
    { key: "yotei", title: "Ghost of Yōtei", subtitle: "Action & RPG" },
    { key: "manosaba", title: "Magical Girl Witch Trials", subtitle: "Visual novel / Character and visual inspiration" },
  ],
  xpFavorites: getFavoriteCharacters("en"),
  currentSignals: [
    { label: "Now", text: "Learning and experimenting with AI, software development, and game making" },
    { label: "Next", text: "Sharing study notes, project progress, and everyday entries on the site" },
    { label: "Site plans", text: "Refining the four themes and adding more articles and collection entries" },
  ],
  projectTechLines: [{ key: "web", label: "Web", note: "Personal website / Pages and interactions" }],
  projectEntries: [
    {
      id: "blank-personal-site", title: "Personal website · Themes and languages", type: "Personal Website", line: "web", status: "Ongoing",
      summary: "Built from Blank, with monochrome, Sakura Archive, industrial, and Arknights interfaces sharing content, languages, and behavior. The case study documents design decisions, the shared architecture, and validation.",
      details: ["Four themes and four languages", "Shared content, preferences, and page lifecycle", "Real screenshots, source tour, and validation records"],
      url: projects.personalSiteShowcaseUrl,
      image: { ...projects.personalSitePreview, alt: "Blank theme home page: the large black-on-white title Blank Space, a short intro and the way into the journal" },
      gallery: [
        { ...projects.personalSiteGallery[0], label: "Blank theme · Home", meta: "Light · 1440×960 · captured 2026-10-31", alt: "Blank theme home page: the large black-on-white title Blank Space, a short intro and the way into the journal" },
        { ...projects.personalSiteGallery[1], label: "Blank theme · Home (dark)", meta: "Dark · 1440×960 · captured 2026-10-31", alt: "Blank theme home page in dark mode: the large white-on-black title Blank Space" },
        { ...projects.personalSiteGallery[2], label: "Blank theme · Works page", meta: "Light · 1440×960 · captured 2026-10-31", alt: "Blank theme Works page: the title Works and the personal website project entry" },
        { ...projects.personalSiteGallery[3], label: "Endfield Industrial theme · Home", meta: "Light · 1440×960 · captured 2026-10-31", alt: "Endfield Industrial theme home page: the ARATAKI.BR title, a yellow-highlighted tagline and figures" },
        { ...projects.personalSiteGallery[4], label: "Blank theme · Phone width", meta: "Light · 390×844 · captured 2026-10-31", alt: "Blank theme home page at phone width" },
        { ...projects.personalSiteGallery[5], label: "Endfield Industrial theme · Phone width", meta: "Light · 390×844 · captured 2026-10-31", alt: "Endfield Industrial theme home page at phone width" },
      ],
    },
  ],
} as const);

type Locale = "zh-CN" | "zh-TW" | "ja" | "en";
type Content = typeof zh | typeof zhTW | typeof ja | typeof en;
// The Collection page's five shelves (select-collection.mjs), built once per language from the content above.
const shelved = <T extends Content>(locale: Locale, content: T) => ({
  ...content,
  collection: buildCollection({
    locale, gameShelf: content.gameShelf, favoriteKeys: content.favoriteGames.map((game) => game.key),
    animes: content.animeFavorites, works: { manga, movies, tv }, gameGenres, genreNames,
  }),
});
const byLocale = { "zh-CN": shelved("zh-CN", zh), "zh-TW": shelved("zh-TW", zhTW), ja: shelved("ja", ja), en: shelved("en", en) };

export function getSiteContent(locale: Locale) {
  return byLocale[locale] ?? byLocale["zh-CN"];
}
