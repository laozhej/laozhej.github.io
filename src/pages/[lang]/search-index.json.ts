import type { APIRoute, GetStaticPaths } from "astro";
import { buildSearchIndex } from "@/core/content/search-index";
import type { Locale } from "@/core/i18n";

export const getStaticPaths: GetStaticPaths = () =>
  (["zh-TW", "ja", "en"] as const).map((lang) => ({ params: { lang } }));

export const GET: APIRoute = async ({ params }) => {
  const locale = (params.lang ?? "zh-CN") as Locale;
  const items = await buildSearchIndex(locale);
  return new Response(JSON.stringify({ locale, items }), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
};
