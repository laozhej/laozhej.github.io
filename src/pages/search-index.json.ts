import type { APIRoute } from "astro";
import { buildSearchIndex } from "@/core/content/search-index";

export const GET: APIRoute = async () => {
  const items = await buildSearchIndex("zh-CN");
  return new Response(JSON.stringify({ locale: "zh-CN", items }), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
};
