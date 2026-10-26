import { localePreferenceKey, locales } from "./routing.mjs";

export function mountLanguagePreference(doc, win) {
  const menu = doc.querySelector("[data-site-language-menu]");
  if (!menu) return;
  for (const link of menu.querySelectorAll("[data-site-locale]")) {
    link.addEventListener("click", () => {
      const locale = link.dataset.siteLocale;
      if (!locales.includes(locale)) return;
      try { win.localStorage.setItem(localePreferenceKey, locale); } catch {}
      const target = new URL(link.href, win.location.href);
      target.search = win.location.search;
      // Heading IDs differ between translations; keep the article, not an obsolete anchor.
      target.hash = "";
      link.href = target.href;
      menu.open = false;
    });
  }
  doc.addEventListener("click", (event) => {
    if (!menu.contains(event.target)) menu.open = false;
  });
  doc.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.open) {
      menu.open = false;
      menu.querySelector("summary")?.focus();
    }
  });
}
