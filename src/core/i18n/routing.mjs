// Shared by every theme. Locale prefixes always precede theme routes.
export const locales = ["zh-CN", "zh-TW", "ja", "en"];
export const localePreferenceKey = "site-locale";

export function getLocale(pathname) {
  const prefix = String(pathname).split(/[/?#]/)[1];
  return prefix === "zh-TW" || prefix === "ja" || prefix === "en" ? prefix : "zh-CN";
}

export function stripLocale(path) {
  const value = String(path || "/");
  const stripped = value.replace(/^\/(?:zh-TW|ja|en)(?=\/|[?#]|$)/, "");
  if (!stripped || stripped.startsWith("?") || stripped.startsWith("#")) return `/${stripped}`;
  return stripped;
}

export function localizePath(path, locale) {
  if (!locales.includes(locale)) throw new Error(`Unsupported locale: ${locale}`);
  if (!String(path).startsWith("/") || String(path).startsWith("//")) throw new Error("Expected a local absolute path");
  const canonical = stripLocale(path);
  const notFound = canonical.match(/^\/404(?:\.html|\/?)($|[?#].*)/);
  if (notFound) return (locale === "zh-CN" ? "/404.html" : `/${locale}/404/`) + notFound[1];
  return locale === "zh-CN" ? canonical : `/${locale}${canonical}`;
}
