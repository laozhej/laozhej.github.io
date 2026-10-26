import { localizePath, type Locale } from "@/core/i18n";

// Add future theme roots here. The locale prefix always sits outside the theme root.
const themeRoots: Record<string, string> = { blank: "" };
export function getThemePath(theme: string, path: string, locale: Locale = "zh-CN"): string {
  if (!(theme in themeRoots)) throw new Error(`Unknown theme: ${theme}`);
  return localizePath(`${themeRoots[theme]}${path}`, locale);
}
