import type { APIRoute } from "astro";
import { renderFeed } from "@/core/content/feed";
import type { Locale } from "@/core/i18n";

export function getStaticPaths() {
  return (["zh-TW", "ja", "en"] as const).map((lang) => ({ params: { lang } }));
}

export const GET: APIRoute = ({ params, site }) => renderFeed(params.lang as Locale, site!);
