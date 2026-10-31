# Blank / Ema / Endfield Personal Website

[简体中文](README.md) | [日本語](README.ja.md) | **English**

An Astro static site adapted into a standalone project from [Yuimi-chaya’s Blank theme](https://yuimi-chaya.github.io/themes/blank/). It keeps Blank’s monochrome reading interface and adds Ema’s “Sakura Archive” and “Endfield Industrial” themes. All three themes share articles, profile data, projects, collections, and common features.

Website: **[laozhej.github.io](https://laozhej.github.io/)** · Supports Simplified Chinese, Taiwanese Traditional Chinese, Japanese, and English, with light and dark modes.

**[Project showcase: three interfaces, shared content →](showcase/README.md)** · Real screenshots, design decisions, architecture, source tour, and validation records. Detailed case study in Simplified Chinese.

## Run locally

Requires Node.js 22.12.0 or later. Node.js 24 is recommended.

```sh
npm ci
npm run dev
```

Open the local URL shown in the terminal. To build and preview the output:

```sh
npm run build
npm run preview
```

The build output is `dist/`, which can be deployed to a static hosting service.

## Edit content

| What to change | File |
| --- | --- |
| Site name and navigation paths | `src/lib/site.ts` |
| UI text, navigation labels, and category names in every language | `src/core/i18n/messages.ts` |
| Traditional Chinese, Japanese, and English profile and collection data | `src/core/i18n/content.ts` |
| Biography, updates, and interests | `src/core/data/profile.ts` |
| Project list | `src/core/data/projects.ts` |
| Game shelf (every language's names in each entry) | `src/core/data/games.ts` |
| Game card images and their source manifest | `public/games/`, `public/games/ASSETS.json` |
| Favorite anime (synced from Notion rows ticked 允许网站展示) | `src/core/data/animes.ts`, `public/animes/ASSETS.json` |
| Daily notes on the Sakura Archive homepage | `src/core/data/notes.ts` |
| GitHub / Steam profile links shared across languages and themes | `src/core/data/social.ts` |
| Shared search, filtering, sorting, and reading progress | `src/core/features/` |
| Shared page transitions and page script lifecycle | `src/core/navigation/` |
| Shared light/dark preferences and initial rendering | `src/core/preferences/` |
| Articles | `src/content/blog/*.md` |
| Blank homepage structure and opening copy | `src/themes/blank/pages/HomePage.astro` |
| Monochrome theme, fonts, spacing, and responsive styles | `src/themes/blank/styles/theme.css` |
| Page layout, navigation, and footer | `src/themes/blank/layouts/BlankLayout.astro` |
| Ema pages, styles, and interactions | `src/themes/ema/` |
| Endfield Industrial pages and styles | `src/themes/endfield/` |
| Theme registration, switching, and preferences | `src/core/themes/` |
| Ema images and source records | `public/themes/ema/assets/`, `public/themes/ema/ASSETS.json` |
| Frieren Live2D model and rendering core | `public/themes/ema/live2d/frieren/`, `src/core/live2d/` |
| Site icons shared by every theme | `src/core/components/SiteIcons.astro`, `assets/branding/` |
| Production URL | `site` in `astro.config.mjs` |

`Blank Space` is a temporary site name. The sample articles have been removed, and `src/content/blog/` is currently empty. Pages show an empty state until the first real article is published. GitHub and Steam profile links are configured; the remaining profile details can be filled in later. The site does not present a fabricated personal history.

To add a Chinese original article, create a Markdown file in `src/content/blog/`. Its filename determines the article URL (for example, `first-post.md` → `/blog/first-post/`). Add this frontmatter at the top:

```yaml
---
title: 文章标题
description: 一句话摘要
pubDate: 2026-10-29
category: life   # tech, anime, or life
tags: [标签一, 标签二]
---
```

Articles with `draft: true` are not published.

## Features

- Homepage, article archive, article pages, projects, games, about, and 404 pages.
- Search by title, description, and tags; filter by category; sort by date; restore filter state from the URL.
- Article table of contents, active heading highlighting, reading progress, and back-to-top links.
- A moon / sun button in the top right switches between light and dark modes. Until a manual choice is made, the site follows system changes. A manual choice is saved in the current browser and shared across pages, languages, and themes using the common modules.
- Simplified Chinese / Traditional Chinese (Taiwan) / Japanese / English switching. Article translations live in the `zh-TW/`, `ja/`, and `en/` subdirectories. Language and color mode are independent preferences.
- Blank / Ema / Endfield Industrial switching preserves the current language, section, article, query parameters, and anchor. Theme and color mode are independent preferences. Blank keeps its switcher in the top navigation; the other themes use a palette button in the bottom right.
- GitHub / Steam links on the about page and in the footer, plus a credits and licenses page in every language (`/credits/`).
- Internal navigation updates the content without reloading the whole page. The header stays in place while the content fades out and in. Language, theme, and color mode are preserved; browser back / forward navigation restores the scroll position.
- Sakura Archive (the Ema theme) uses “Arataki.br’s Base” as its name and Gloock for its headings. Its homepage takes inspiration from Yuimi-chaya’s Fuyukawa Kagari theme: a manga-style wall built from four existing assets, focus lines, Ema Sakuraba character art, terminal typing, daily notices, a profile card revealed on scroll, and a second scene with the visitor’s local time and falling tags. The chapter cards use three black-and-white manga excerpts from *Frieren: Beyond Journey’s End*.
- Ema includes falling cherry blossom petals, a side scroll marker on wide screens, and a Frieren Live2D mascot in the bottom left. The mascot appears at viewport widths of at least 1000px, follows the mouse with its gaze, and responds when clicked or recalled. Its hidden state is saved in the current browser, and a static poster is shown if loading fails.
- “Sakura Radio” in Ema’s left console offers three original music-box pieces synthesized in real time in the browser. It loads no audio files, keeps playing between Ema pages, and stops when another theme is opened.
- Endfield Industrial uses paper and ink colors, yellow accents, controls with cut corners, contour-line backgrounds, and the self-hosted Saira font. It draws on the game’s interface structure and uses no official game assets.
- Every Ema page has an animation pause / play button. Pausing skips page transitions across all themes. The system’s reduced-motion preference also skips transitions and disables the button.
- Desktop and mobile layouts, keyboard focus indicators, a skip-to-content link, and reduced-motion support.

## Site-wide languages and themes

Simplified Chinese uses `/`, Taiwanese Traditional Chinese `/zh-TW/`, Japanese `/ja/`, and English `/en/`. The language switcher in the top right preserves the current section or article and saves the shared `site-locale` preference. Entry URLs without a language prefix use that preference; explicit `/zh-TW/`, `/ja/`, and `/en/` links take priority. Language links also work without JavaScript.

Chinese originals live in `src/content/blog/`; translations go in the `zh-TW/`, `ja/`, and `en/` subdirectories. Set `locale` and a `translationKey` matching the Chinese filename. Do not hard-code language prefixes in article links. If a translation is missing, the Chinese original is shown with an explicit notice. Translations are not generated automatically or presented as available when they are missing.

The language layer lives in `src/core/i18n/` and is independent of Blank. Future themes must reuse `getI18n()`, `getSiteContent()`, `LanguagePreference.astro`, and `LanguageSwitcher.astro`, and generate pages for all four languages. Theme paths follow the language prefix, as in `/ja/themes/new/blog/`, and theme switching preserves the current language. This requirement is also recorded in the project’s `AGENTS.md`.

Profiles, projects, collections, and social links come from the same shared data, and articles use one shared set of Markdown sources. After an edit and redeployment, every theme using those sources reflects the update. Content is shared within each language; changes to Chinese content do not automatically translate into Japanese or English. Translations must be maintained separately.

Search, category filtering, date sorting, reading progress, and color mode logic live in the shared core. Blank uses the root path, Ema uses `/themes/ema/`, and Endfield Industrial uses `/themes/endfield/`. Traditional Chinese, Japanese, and English add `/zh-TW/`, `/ja/`, and `/en/` before the theme path, for example `/ja/themes/endfield/`. The theme menu preserves the current section, article, language, and applicable query parameters and anchors. The choice is saved under the shared `site-theme` preference, while the URL determines the actual page theme. Saved preferences do not force changes to direct links or browser history.

Themes control layout, colors, and interaction presentation, connecting to the same features through shared hooks. When adding a theme, follow the [theme integration guide](docs/THEMES.md) for data, features, languages, and routing. Keep business logic in the shared core.

Check the shared language, preference, and feature interfaces with `npm test` (uses Node.js 24’s TypeScript support).

## Deploy to GitHub Pages

The public repository is `laozhej/laozhej.github.io`. GitHub Actions builds and deploys the site. Every push to `main` uses Node.js 24 to install locked dependencies, run the shared module tests, build the static pages, and publish `dist/`. You can also run **Deploy to GitHub Pages** manually from Actions.

Set the repository’s **Settings → Pages → Build and deployment → Source** to **GitHub Actions**. Deployment status and logs are available on the repository’s Actions page.

This is a user site served from the domain root, so `astro.config.mjs` sets only `site: "https://laozhej.github.io"`, without a repository-name `base`. Future updates can edit this repository’s articles, data, and theme source directly. ChatGPT Sites is not required.

## Contributors

- [Asahi Arataki (@laozhej)](https://github.com/laozhej): site maintenance and content.
- [Codex (@codex)](https://github.com/codex): assistance with site development and maintenance.
- [Claude (@claude)](https://github.com/claude): assistance with frontend design, development, and maintenance.

## Sources and licenses

Blank’s CSS, components, and interactions are based on [Yuimi-chaya/Yuimi-chaya.github.io](https://github.com/Yuimi-chaya/Yuimi-chaya.github.io), reused under the MIT license. The original copyright notice is preserved in [LICENSE](LICENSE). The source revision is `4007a9498600c137b3912483ccee2b78b489b1bd`. Adaptations include standalone routing, site metadata, replacement content, and removal of the upstream cross-theme menu.

The upstream site owner’s articles, manga, character art, music, and profile were not copied. UI icons come from `@iconify-json/tabler` / Tabler Icons under the MIT license. Every theme shares a `B.` site icon generated through deterministic typesetting. Current pages do not load the former AI-generated cherry blossom icon, AI homepage mockups, or AI-generated character images.

Ema’s four character / manga images and three *Frieren: Beyond Journey’s End* chapter excerpts come from their individually recorded external sources and are served locally. They have not been redrawn with generative AI. Original sources, credits, checksums, and per-file processing records, including resizing, cropping, and format conversion, are listed in the [asset manifest](public/themes/ema/ASSETS.json). Game card images have a separate [game asset manifest](public/games/ASSETS.json). Traceable sources and attribution do not grant permission for public use. The images are excluded from the software’s MIT license, and permission for public use on a decorative website has not been established.

The Frieren Live2D model was released by kyokiStudio and is used for personal display under the release page’s stated prohibition on commercial use and monetization. The model, textures, and poster are excluded from the software’s MIT license. Cubism Core and Framework are subject to their respective Live2D licenses. See the [third-party asset notice](THIRD_PARTY_ASSETS.md) for full sources, license files, and usage boundaries.

See the [content license notice](CONTENT_LICENSE.md) for the scope of licensing for articles and their translations. Fonts are not loaded from external servers. Sakura Archive’s Gloock heading font and Endfield Industrial’s Saira Latin font are self-hosted under SIL OFL 1.1; other text uses system fonts.
