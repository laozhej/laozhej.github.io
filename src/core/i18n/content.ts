import * as profile from "@/core/data/profile";
import * as projects from "@/core/data/projects";
import * as games from "@/core/data/games";

// Theme-independent content. Stable keys and URLs are shared by every locale.
const zh = { ...profile, ...projects, ...games };

const ja = {
  profileIdentity: {
    displayName: "名前はこれから",
    handle: "PROFILE / プロフィール",
    siteName: "Blank Space",
    bio: "自己紹介や好きなこと、いま取り組んでいることを、ここに少しずつ。まだ少し余白を残して、ゆっくり知ってもらえたら。",
  },
  profileStatus: ["個人サイトを制作中", "まずは Blank の基本テーマから"],
  profileTech: [
    { key: "website", name: "個人サイト", note: "土台を整え、少しずつ育てる" },
    { key: "journal", name: "文章の記録", note: "考えを残せる場所をつくる" },
    { key: "visual", name: "デザインの方向性", note: "好きなキャラクターから着想を得る" },
  ],
  favoriteGames: [
    { key: "manosaba", title: "魔法少女ノ魔女裁判", subtitle: "ビジュアルノベル / キャラクターとデザインの着想", url: "https://manosaba.com/" },
  ],
  xpFavorites: [{ key: "emma", title: "桜羽エマ", subtitle: "キャラクターデザインの参考" }],
  currentSignals: [
    { label: "いま", text: "個人サイトを制作中。まずはホーム、記事、それぞれのページを整えています。" },
    { label: "次に", text: "自己紹介を加えたら、記事や制作の記録を少しずつ書いていく予定です。" },
    { label: "デザイン", text: "桜羽エマの雰囲気が好きで、今後のサイトテーマの着想にしたいと思っています。" },
  ],
  projectTechLines: [{ key: "web", label: "Web", note: "個人サイト / ページとインタラクション" }],
  projectEntries: [
    {
      id: "blank-personal-site", title: "個人サイト · 基本版", type: "Personal Website", line: "web", status: "制作中",
      summary: "Blank テーマを出発点に、文章や制作物、好きな作品を置ける自分の場所をつくっています。",
      details: ["ホームと各ページへのナビゲーション", "記事一覧と記事ページ", "制作、好きなもの、プロフィールのページ"],
    },
  ],
  gamePicks: [
    {
      id: "manosaba", name: "魔法少女ノ魔女裁判", vibe: "VISUAL NOVEL / ビジュアルノベル", type: "ビジュアルノベル", character: "桜羽エマ", officialUrl: "https://manosaba.com/",
      summary: "桜羽エマのキャラクターデザインが好き。その気持ちをここに残して、今後の個人サイトのテーマを考えるきっかけにもしたいです。",
      note: "まずは作品とキャラクターの記録から。プレイの感想は、また後で。",
    },
  ],
} as const;

const en = {
  profileIdentity: {
    displayName: "Name to come",
    handle: "PERSONAL PROFILE",
    siteName: "Blank Space",
    bio: "A little about me, the things I like, and what I am working on will find their way here. For now, there is room to get acquainted slowly.",
  },
  profileStatus: ["Building a personal website", "Starting with the basic Blank theme"],
  profileTech: [
    { key: "website", name: "Personal website", note: "Building the foundation, one step at a time" },
    { key: "journal", name: "Writing", note: "Making room for thoughts" },
    { key: "visual", name: "Visual direction", note: "Finding inspiration in a favorite character" },
  ],
  favoriteGames: [
    { key: "manosaba", title: "魔法少女ノ魔女裁判", subtitle: "Visual novel / Character and visual inspiration", url: "https://manosaba.com/" },
  ],
  xpFavorites: [{ key: "emma", title: "Ema Sakuraba", subtitle: "Character design reference" }],
  currentSignals: [
    { label: "Now", text: "Building a personal website, starting with the home page, articles, and the main sections." },
    { label: "Next", text: "Adding an introduction, then gradually filling in articles and project notes." },
    { label: "Visual direction", text: "I like Ema Sakuraba's style and would like to draw on it for a future website theme." },
  ],
  projectTechLines: [{ key: "web", label: "Web", note: "Personal website / Pages and interactions" }],
  projectEntries: [
    {
      id: "blank-personal-site", title: "Personal website · First version", type: "Personal Website", line: "web", status: "In progress",
      summary: "Starting with the Blank theme to build a place for writing, projects, and favorite works.",
      details: ["Home page and section navigation", "Article index and reading pages", "Projects, interests, and about pages"],
    },
  ],
  gamePicks: [
    {
      id: "manosaba", name: "魔法少女ノ魔女裁判", vibe: "VISUAL NOVEL", type: "Visual novel", character: "Ema Sakuraba", officialUrl: "https://manosaba.com/",
      summary: "I like Ema Sakuraba's character design. This is a place to keep that interest and a source of inspiration for a future website theme.",
      note: "For now, this is a note about the work and the character. Thoughts on playing it can come later.",
    },
  ],
} as const;

export function getSiteContent(locale: "zh-CN" | "ja" | "en") {
  return locale === "ja" ? ja : locale === "en" ? en : zh;
}
