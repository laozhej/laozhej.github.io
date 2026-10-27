import { getLocale, localizePath, stripLocale } from "../i18n/routing.mjs";

export const themePreferenceKey = "site-theme";
export const themes = [
  { id: "blank", root: "", labelKey: "theme.blank" },
  { id: "ema", root: "/themes/ema", labelKey: "theme.ema" },
];

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
  ))?.id ?? "blank";
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
  // Blank uses GitHub Pages' root 404.html; named themes have ordinary 404 routes.
  if (theme !== "blank") content = content.replace(/^\/404(?:\.html|\/?)($|[?#])/, "/404/$1");
  return localizePath(`${entry.root}${content}`, locale);
}
