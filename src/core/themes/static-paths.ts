import { getPublishedPosts } from "../content/blog";
import { collectionShelves } from "../content/select-collection.mjs";
import { movedPaths } from "./routing.mjs";
import type { Locale } from "../i18n";

// The sections every theme builds in every language, in navigation order (plus credits and 404).
export const sectionPages = ["", "blog", "projects", "collection", "about", "credits", "404"];
// Old addresses that now send visitors on (routing.mjs `movedPaths`), by route parameter: { games: "/collection/games/" }.
export const movedPages = Object.fromEntries(Object.entries(movedPaths).map(([from, to]) => [from.replace(/^\/|\/$/g, ""), to])) as Record<string, string>;

export async function getThemeStaticPaths(locales: Locale[]) {
  const routes = [];
  for (const locale of locales) {
    const language = locale === "zh-CN" ? {} : { lang: locale };
    for (const page of sectionPages) {
      routes.push({ params: { ...language, page: page || undefined }, props: { kind: page || "home" } });
    }
    for (const shelf of collectionShelves) {
      routes.push({ params: { ...language, page: `collection/${shelf}` }, props: { kind: "collection", shelf } });
    }
    for (const [page, to] of Object.entries(movedPages)) {
      routes.push({ params: { ...language, page }, props: { kind: "moved", to } });
    }
    for (const post of await getPublishedPosts(locale)) {
      routes.push({ params: { ...language, page: `blog/${post.slug}` }, props: { kind: "article", post } });
    }
  }
  return routes;
}
