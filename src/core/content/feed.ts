// RSS 2.0 feed of published articles for one locale. Untranslated articles keep
// their Simplified Chinese original, matching the blog index of that locale.
import { getPublishedPosts } from "./blog";
import { getI18n, localizePath, type Locale } from "@/core/i18n";
import { site } from "@/lib/site";

const escape = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]!);

export async function renderFeed(locale: Locale, origin: URL): Promise<Response> {
  const { t } = getI18n(localizePath("/", locale));
  const url = (path: string) => new URL(localizePath(path, locale), origin).href;
  const posts = await getPublishedPosts(locale);
  const items = posts.map((post) => {
    const link = url(`/blog/${post.slug}/`);
    return [
      "<item>",
      `<title>${escape(post.data.title)}</title>`,
      `<link>${link}</link>`,
      `<guid isPermaLink="true">${link}</guid>`,
      `<pubDate>${post.data.pubDate.toUTCString()}</pubDate>`,
      `<description>${escape(post.data.description)}</description>`,
      ...post.data.tags.map((tag) => `<category>${escape(tag)}</category>`),
      "</item>",
    ].join("");
  });
  const latest = posts.map((post) => post.data.updatedDate ?? post.data.pubDate).sort((a, b) => b.valueOf() - a.valueOf())[0];
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>',
    `<title>${escape(`${site.name} · ${t("nav.blog")}`)}</title>`,
    `<link>${url("/blog/")}</link>`,
    `<atom:link href="${url("/rss.xml")}" rel="self" type="application/rss+xml"/>`,
    `<description>${escape(t("site.description"))}</description>`,
    `<language>${locale}</language>`,
    latest ? `<lastBuildDate>${latest.toUTCString()}</lastBuildDate>` : "",
    ...items,
    "</channel></rss>",
  ].join("\n");
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}

