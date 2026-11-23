import type { APIRoute } from "astro";
import { renderFeed } from "@/core/content/feed";

export const GET: APIRoute = ({ site }) => renderFeed("zh-CN", site!);
