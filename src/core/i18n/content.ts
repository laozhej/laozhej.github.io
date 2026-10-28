import * as profile from "@/core/data/profile";
import * as projects from "@/core/data/projects";
import { games } from "@/core/data/games";
import { checkGames, localizeGames } from "@/core/content/select-games.mjs";

// Theme-independent content. Stable keys and URLs are shared by every locale.
checkGames(games);
const zh = { ...profile, ...projects, gameShelf: localizeGames(games, "zh-CN") };

const ja = {
  gameShelf: localizeGames(games, "ja"),
  profileIdentity: {
    displayName: "荒滝 旭",
    handle: "PROFILE / プロフィール",
    siteName: "Blank Space",
    bio: "荒滝旭です。Nero とも呼ばれています。アニメやゲームのグッズ集めが好きで、AI やパソコンの技術にも関心があります。プログラミングを学びながら、アニメーション、モデリング、さまざまなゲームエンジンを探究しています。",
  },
  profileStatus: ["使用言語：中国語（普通話）、日本語、英語、スペイン語", "AI エージェントの時代に向けて準備中"],
  profileTech: [
    { key: "ai", name: "AI とプログラミング", note: "AI やパソコンの技術に関心を持ち、さまざまなプログラミング言語を学んでいます。" },
    { key: "animation", name: "アニメーションとモデリング", note: "Blender や Live2D などを使い、アニメーションとモデリングを探究しています。" },
    { key: "engines", name: "ゲームエンジン", note: "Godot、Unreal Engine、Unity を学んでいます。" },
  ],
  favoriteGames: [
    { key: "rdr2", title: "レッド・デッド・リデンプション2", subtitle: "Red Dead Redemption 2" },
    { key: "tsushima", title: "Ghost of Tsushima", subtitle: "ゴースト・オブ・ツシマ" },
    { key: "yotei", title: "Ghost of Yōtei", subtitle: "ゴースト・オブ・ヨウテイ" },
    { key: "manosaba", title: "魔法少女ノ魔女裁判", subtitle: "ビジュアルノベル / キャラクターとデザインの着想", url: "https://manosaba.com/" },
  ],
  xpFavorites: [
    { key: "emma", title: "桜羽エマ", subtitle: "キャラクターデザインの参考" },
    { key: "yuki", title: "月代ユキ", subtitle: "いまのアイコンのキャラクター" },
  ],
  currentSignals: [
    { label: "いま", text: "AI エージェントの時代に向けて準備しながら、個人サイトも少しずつ整えています。" },
    { label: "次に", text: "記事や制作の記録を少しずつ書いていく予定です。" },
    { label: "デザイン", text: "桜羽エマから着想を得たテーマ「桜色の記録」が完成しました。これからも少しずつ磨いていきます。" },
  ],
  projectTechLines: [{ key: "web", label: "Web", note: "個人サイト / ページとインタラクション" }],
  projectEntries: [
    {
      id: "blank-personal-site", title: "個人サイト · 基本版", type: "Personal Website", line: "web", status: "制作中",
      summary: "Blank テーマを出発点に、文章や制作物、好きな作品を置ける自分の場所をつくっています。",
      details: ["ホームと各ページへのナビゲーション", "記事一覧と記事ページ", "制作、好きなもの、プロフィールのページ"],
    },
  ],
} as const;

const en = {
  gameShelf: localizeGames(games, "en"),
  profileIdentity: {
    displayName: "Arataki Asahi",
    handle: "PERSONAL PROFILE",
    siteName: "Blank Space",
    bio: "I'm Arataki Asahi, also known as Nero. I collect anime and game merchandise and enjoy learning about AI and computer technology. I'm studying programming and exploring animation, modeling, and different game engines.",
  },
  profileStatus: ["Languages: Mandarin Chinese, Japanese, English, and Spanish", "Getting ready for the age of AI agents"],
  profileTech: [
    { key: "ai", name: "AI and programming", note: "Following AI and computer technology, and learning different programming languages." },
    { key: "animation", name: "Animation and modeling", note: "Exploring animation and modeling with tools including Blender and Live2D." },
    { key: "engines", name: "Game engines", note: "Exploring Godot, Unreal Engine, and Unity." },
  ],
  favoriteGames: [
    { key: "rdr2", title: "Red Dead Redemption 2", subtitle: "A favorite game" },
    { key: "tsushima", title: "Ghost of Tsushima", subtitle: "A favorite game" },
    { key: "yotei", title: "Ghost of Yōtei", subtitle: "A favorite game" },
    { key: "manosaba", title: "魔法少女ノ魔女裁判", subtitle: "Visual novel / Character and visual inspiration", url: "https://manosaba.com/" },
  ],
  xpFavorites: [
    { key: "emma", title: "Ema Sakuraba", subtitle: "Character design reference" },
    { key: "yuki", title: "Yuki Tsukishiro", subtitle: "The character on my avatar" },
  ],
  currentSignals: [
    { label: "Now", text: "Getting ready for the age of AI agents while gradually building my personal website." },
    { label: "Next", text: "Gradually adding articles and project notes." },
    { label: "Visual direction", text: "The Sakura Archive theme, inspired by Ema Sakuraba, is now live. I'll keep polishing it little by little." },
  ],
  projectTechLines: [{ key: "web", label: "Web", note: "Personal website / Pages and interactions" }],
  projectEntries: [
    {
      id: "blank-personal-site", title: "Personal website · First version", type: "Personal Website", line: "web", status: "In progress",
      summary: "Starting with the Blank theme to build a place for writing, projects, and favorite works.",
      details: ["Home page and section navigation", "Article index and reading pages", "Projects, interests, and about pages"],
    },
  ],
} as const;

export function getSiteContent(locale: "zh-CN" | "ja" | "en") {
  return locale === "ja" ? ja : locale === "en" ? en : zh;
}
