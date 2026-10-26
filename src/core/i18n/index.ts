import { messages } from "./messages";
import { getLocale as localeFromPath, localizePath, stripLocale, locales } from "./routing.mjs";

export type Locale = "zh-CN" | "ja" | "en";
export { localizePath, stripLocale, locales };
export const getLocale = (path: string): Locale => localeFromPath(path) as Locale;
export const localeNames: Record<Locale, string> = { "zh-CN": "简体中文", ja: "日本語", en: "English" };
export const localeCodes: Record<Locale, string> = { "zh-CN": "中文", ja: "日本語", en: "EN" };

export function getI18n(path: string) {
  const locale = getLocale(path);
  const t = (key: string): string => {
    const value = (messages[locale] as Record<string, string>)[key];
    if (typeof value !== "string") throw new Error(`Missing ${locale} translation: ${key}`);
    return value;
  };
  return {
    locale,
    t,
    unit: (key: string, count: number) => t(count === 1 ? `${key}One` : key),
    href: (path: string) => localizePath(path, locale),
    categoryLabel: { tech: t("category.tech"), anime: t("category.anime"), life: t("category.life") },
    formatDate: (date: Date) => new Intl.DateTimeFormat(locale, { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "UTC" }).format(date),
  };
}
