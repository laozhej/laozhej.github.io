# Website requirements

- Preserve the user's Blank visual foundation unless a new theme or redesign is requested.
- Every theme must support Simplified Chinese (`zh-CN`), Japanese (`ja`), and English (`en`). These are site-wide settings, not theme-specific preferences.
- Use `src/core/i18n` for translations, locale detection, localized URLs, the language switcher, and the `site-locale` storage key. Do not introduce per-theme locale storage or independent translation dictionaries.
- A new theme must mount the shared `LanguagePreference.astro` in its head and `LanguageSwitcher.astro` in its navigation, set HTML `lang`, and build all three locale routes. Preserve the current article and theme route when switching languages.
- All user-facing strings, accessibility labels, status text and SEO descriptions must have all three translations. Article translations use the same `translationKey`. Missing article translations must show the Chinese original with the explicit fallback notice; never pretend it is translated.
- Keep the light/dark preference when switching languages or pages.
- This public repository is the source for `https://laozhej.github.io/`. Deploy to GitHub Pages through `.github/workflows/deploy.yml` on pushes to `main`. Keep the root URL configuration; do not add a repository-name `base` prefix.
- Keep hosting credentials, environment files, and Sites-specific configuration out of this repository. Preserve upstream copyright notices and licenses.
- Verify all locale routes, cross-language links and narrow-screen controls before publishing an update.
