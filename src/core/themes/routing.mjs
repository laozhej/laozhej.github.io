import { getLocale, localizePath, stripLocale } from "../i18n/routing.mjs";

export const themePreferenceKey = "site-theme";
export const themes = [
  { id: "blank", root: "/themes/blank", labelKey: "theme.blank" },
  { id: "ema", root: "/themes/ema", labelKey: "theme.ema" },
  { id: "endfield", root: "/themes/endfield", labelKey: "theme.endfield" },
  { id: "arknights", root: "", labelKey: "theme.arknights" },
];

export const defaultTheme = themes.find(({ root }) => root === "").id;

// The theme whose copy of each page search engines index. Every page names this
// theme's route as its canonical URL and in its hreflang links, and only its routes
// go in the sitemap. Changing it does not change which theme the root URL serves.
export const canonicalTheme = "arknights";

// Former prefixed theme routes kept as noindex redirects to the root theme.
const legacyThemeRoots = ["/themes/arknights"];

export function isTheme(value) {
  return themes.some(({ id }) => id === value);
}

function localPath(path) {
  const value = String(path || "/");
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    throw new Error("Expected a local absolute path");
  }
  return value;
}

export function getTheme(path) {
  const canonical = stripLocale(localPath(path));
  return themes.find(({ root }) => root && (
    canonical === root || canonical.startsWith(`${root}/`) ||
    canonical.startsWith(`${root}?`) || canonical.startsWith(`${root}#`)
  ))?.id ?? defaultTheme;
}

// Return the shared content path, with query/hash intact and without locale/theme.
export function stripTheme(path) {
  const canonical = stripLocale(localPath(path));
  const root = themes.find(({ id }) => id === getTheme(path)).root;
  const content = root ? canonical.slice(root.length) : canonical;
  if (!content || content.startsWith("?") || content.startsWith("#")) return `/${content}`;
  return content;
}

export function getThemePath(theme, path = "/", locale = getLocale(path)) {
  const entry = themes.find(({ id }) => id === theme);
  if (!entry) throw new Error(`Unknown theme: ${theme}`);
  let content = stripTheme(path);
  // The root theme uses GitHub Pages' root 404.html; prefixed themes have ordinary 404 routes.
  if (entry.root) content = content.replace(/^\/404(?:\.html|\/?)($|[?#])/, "/404/$1");
  return localizePath(`${entry.root}${content}`, locale);
}

// Routes listed in the sitemap: the canonical theme's pages, without 404 pages or legacy redirects.
export function isIndexedPath(path) {
  const canonical = stripLocale(localPath(path));
  if (legacyThemeRoots.some((root) => canonical === root || canonical.startsWith(`${root}/`))) return false;
  return getTheme(path) === canonicalTheme && !/^\/404(?:\.html|\/)?$/.test(stripTheme(path));
}
