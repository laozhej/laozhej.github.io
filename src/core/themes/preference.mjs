import { getTheme, getThemePath, isTheme, stripTheme, themePreferenceKey } from "./routing.mjs";
import { getLocale } from "../i18n/routing.mjs";

const mounted = new WeakMap();

export function readThemePreference(storage, fallback = "blank") {
  try {
    const saved = storage.getItem(themePreferenceKey);
    if (isTheme(saved)) return saved;
  } catch {}
  return fallback;
}

// The URL determines the rendered theme. Remembering a choice never redirects a
// shared link, a direct Blank visit, or browser history to a different theme.
export function mountThemePreference(doc, win) {
  mounted.get(doc)?.();
  const removers = [];
  const on = (target, type, listener) => {
    target.addEventListener(type, listener);
    removers.push(() => target.removeEventListener(type, listener));
  };
  const menus = [...doc.querySelectorAll("[data-site-theme-menu]")];
  // GitHub Pages serves the root Blank 404 document for arbitrary missing URLs.
  // Keep its actual rendered theme instead of styling it as a different layout.
  const renderedTheme = doc.documentElement.dataset.theme;
  const current = isTheme(renderedTheme) ? renderedTheme : getTheme(win.location.pathname);
  const linkPath = (menu, theme) => {
    const renderedPath = menu.dataset?.siteThemePath;
    const isNotFound = renderedPath && /^\/404(?:\.html|\/?)$/.test(stripTheme(renderedPath));
    const pathname = isNotFound ? renderedPath : win.location.pathname;
    return getThemePath(theme, `${pathname}${win.location.search}${win.location.hash}`, getLocale(win.location.pathname));
  };
  const update = () => {
    doc.documentElement.dataset.theme = current;
    let preferred = current;
    try { preferred = readThemePreference(win.localStorage, current); } catch {}
    doc.documentElement.dataset.preferredTheme = preferred;
    for (const menu of menus) {
      for (const link of menu.querySelectorAll("[data-site-theme-target]")) {
        const theme = link.dataset.siteThemeTarget;
        if (isTheme(theme)) link.href = linkPath(menu, theme);
      }
    }
  };
  for (const menu of menus) {
    for (const link of menu.querySelectorAll("[data-site-theme-target]")) {
      on(link, "click", () => {
        const theme = link.dataset.siteThemeTarget;
        if (!isTheme(theme)) return;
        // Filters may have changed since mount without a full navigation.
        link.href = linkPath(menu, theme);
        try { win.localStorage.setItem(themePreferenceKey, theme); } catch {}
        doc.documentElement.dataset.preferredTheme = theme;
        menu.open = false;
      });
    }
  }
  on(doc, "click", (event) => {
    for (const menu of menus) if (!menu.contains(event.target)) menu.open = false;
  });
  on(doc, "keydown", (event) => {
    if (event.key !== "Escape") return;
    for (const menu of menus) if (menu.open) {
      menu.open = false;
      menu.querySelector("summary")?.focus();
    }
  });
  on(win, "pageshow", update);
  on(win, "storage", (event) => {
    if (event.key === themePreferenceKey || event.key === null) update();
  });
  on(win, "pagehide", (event) => { if (!event.persisted) cleanup(); });
  const cleanup = () => {
    for (const remove of removers) remove();
    mounted.delete(doc);
  };
  update();
  mounted.set(doc, cleanup);
  return cleanup;
}
