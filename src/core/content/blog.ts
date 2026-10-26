import { getCollection, type CollectionEntry } from "astro:content";
import { selectPosts } from "./select-posts.mjs";
import type { Locale } from "@/core/i18n";

export type BlogPost = CollectionEntry<"blog"> & { slug: string };

export async function getPublishedPosts(locale: Locale = "zh-CN"): Promise<BlogPost[]> {
  const entries = await getCollection("blog", ({ data }) => !data.draft);
  return selectPosts(entries, locale);
}

export async function getPublishedPostPaths(locale: Locale = "zh-CN") {
  return (await getPublishedPosts(locale)).map((post) => ({ params: { slug: post.slug }, props: { post } }));
}
