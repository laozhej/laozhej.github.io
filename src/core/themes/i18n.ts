import { getI18n } from "@/core/i18n";
import { getTheme, getThemePath } from "./registry";

// Shared content pages keep their route when presented by another theme.
export function getThemedI18n(pathname: string) {
  const i18n = getI18n(pathname);
  const theme = getTheme(pathname);
  return { ...i18n, href: (path: string) => getThemePath(theme, path, i18n.locale) };
}
