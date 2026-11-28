// Build-time static search index per locale for the site-wide ⌘K command palette.
// Paths are stored theme- and locale-agnostic (e.g. "/collection/movies/#movies-oppenheimer") so one
// compact JSON file per locale serves all four themes; the client prefixes the active theme root + locale.
import { getPublishedPosts } from "./blog";
import { collectionPath } from "./select-collection.mjs";
import { getSiteContent } from "@/core/i18n/content";
import { getI18n, type Locale } from "@/core/i18n";

export interface SearchRecord {
  group: "pages" | "articles" | "projects" | "collection";
  kind: string;
  title: string;
  sub: string;
  path: string;
  q: string;
}

const clean = (value: unknown) =>
  String(value ?? "").normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();

export async function buildSearchIndex(locale: Locale): Promise<SearchRecord[]> {
  const { t, categoryLabel, formatDate } = getI18n(locale === "zh-CN" ? "/" : `/${locale}/`);
  const content = getSiteContent(locale);
  const posts = await getPublishedPosts(locale);
  const records: SearchRecord[] = [];

  // 1. Primary sections & shelves
  const sections: Array<[string, string, string, string]> = [
    ["/", t("nav.home"), t("home.title"), "home index 首页 首頁 ホーム"],
    ["/blog/", t("nav.blog"), t("blog.label"), "blog journal articles 文字 日記"],
    ["/projects/", t("nav.projects"), t("projects.label"), "projects works 作品 制作 專案 项目"],
    ["/collection/", t("nav.collection"), t("collection.overview"), "collection shelves 收藏 コレクション 品鉴"],
    ["/about/", t("nav.about"), t("common.about"), "about profile 关于 關於 紹介"],
    ["/credits/", t("credits.title"), "Credits & licenses", "credits licenses 致谢 致謝 クレジット 许可 演化 evolution git"],
  ];
  for (const [path, title, sub, extra] of sections) {
    records.push({ group: "pages", kind: "page", title, sub, path, q: clean(`${title} ${sub} ${extra}`) });
  }
  for (const shelf of content.collection.shelves) {
    if (shelf.entries.length === 0) continue;
    const shelfTitle = t(`collection.shelf.${shelf.key}`);
    const unit = t(`collection.unit.${shelf.key}${shelf.entries.length === 1 ? "One" : ""}`);
    const sub = `${t("nav.collection")} · ${shelf.entries.length} ${unit}`;
    records.push({
      group: "pages",
      kind: shelf.key,
      title: shelfTitle,
      sub,
      path: collectionPath(shelf.key),
      q: clean(`${shelfTitle} ${shelf.key} ${t("nav.collection")} ${sub}`),
    });
  }

  // 2. Published articles
  for (const post of posts) {
    const date = post.data.updatedDate ?? post.data.pubDate;
    const cat = categoryLabel[post.data.category] ?? post.data.category;
    const sub = `${cat} · ${formatDate(date)}`;
    records.push({
      group: "articles",
      kind: "article",
      title: post.data.title,
      sub,
      path: `/blog/${post.slug}/`,
      q: clean([post.data.title, post.data.description, cat, ...post.data.tags, post.slug].join(" ")),
    });
  }

  // 3. Projects
  for (const project of content.projectEntries) {
    records.push({
      group: "projects",
      kind: "project",
      title: project.title,
      sub: `${project.type} · ${project.status}`,
      path: `/projects/#${project.id}`,
      q: clean([project.title, project.type, project.status, project.summary, ...project.details].join(" ")),
    });
  }

  // 4. Collection works (movies, games, anime, manga, tv)
  for (const shelf of content.collection.shelves) {
    const shelfName = t(`collection.shelf.${shelf.key}`);
    for (const entry of shelf.entries) {
      const anchor = `${entry.shelf === "games" ? "game" : entry.shelf}-${entry.key}`;
      const genreLabels = entry.shelf === "games"
        ? entry.tags.map((g: string) => t(`games.genre.${g}`))
        : entry.details.slice(0, 2);
      const subParts = [shelfName, ...genreLabels].filter(Boolean);
      const sub = subParts.slice(0, 3).join(" · ");
      records.push({
        group: "collection",
        kind: entry.shelf,
        title: entry.name,
        sub,
        path: `${collectionPath(entry.shelf)}#${anchor}`,
        q: clean([entry.name, entry.original, entry.search, shelfName, ...genreLabels].filter(Boolean).join(" ")),
      });
    }
  }

  return records;
}
