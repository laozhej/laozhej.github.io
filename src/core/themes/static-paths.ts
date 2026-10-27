import { getPublishedPosts } from "../content/blog";
import type { Locale } from "../i18n";

export async function getThemeStaticPaths(locales: Locale[]) {
  const routes = [];
  for (const locale of locales) {
    const language = locale === "zh-CN" ? {} : { lang: locale };
    for (const page of ["", "blog", "projects", "games", "about", "credits", "404"]) {
      routes.push({ params: { ...language, page: page || undefined }, props: { kind: page || "home" } });
    }
    for (const post of await getPublishedPosts(locale)) {
      routes.push({ params: { ...language, page: `blog/${post.slug}` }, props: { kind: "article", post } });
    }
  }
  return routes;
}
