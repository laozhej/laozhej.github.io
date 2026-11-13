# Working guide for laozhej.github.io

This public repository is the source of <https://laozhej.github.io/>, a personal site with three themes (Blank, Ema / 樱色档案, Endfield / 终末地) in four languages. This guide replaced all earlier repository instructions on 2026-11-13, when the owner authorised a full rewrite. Change it only with the owner's explicit approval.

## Roles and approvals

- Claude Code is the primary designer and implementer. Do the design and code work yourself; do not hand the primary work to another coding agent. Subagents may run narrow lookups or independent reviews only.
- A request authorises only what it names. Commit, push, open or update a pull request, merge, or deploy only after the owner explicitly approves that step for the current piece of work. Earlier approvals (for example, merging PR #11) do not carry over.
- Visual direction belongs to the owner. Passing tests, a clean build, or resemblance to an earlier prototype is not visual acceptance. Show desktop and phone captures, then wait for confirmation before expanding a design beyond what was approved.
- Treat changes to shared data or user-visible wording as proposals until the owner approves them.

## Worktree safety

- Start new work from the current `origin/main` in a new branch and worktree under the workspace's `worktrees/` folder. Inspect the real repository state first; do not assume an earlier pull request is still open.
- Preserve existing work: the original checkout `website/` and its uncommitted files, every other worktree, backups and frozen prototypes. Do not stash, reset, clean, check out over, or delete them. Never force-push or rewrite published history.
- Keep reference clones, screenshots, review boards and experiments outside tracked source (the workspace's `outputs/` folder) unless they are an intended deliverable.
- Back up an instruction or source file outside the repository before replacing it wholesale.

## Design direction

The design reference is <https://github.com/Yuimi-chaya/Yuimi-chaya.github.io> and its running site <https://yuimi-chaya.github.io/>, studied at commit `0056030` (2026-11-06). Its layouts and interactions are a strict specification for Ema and Blank; its artwork is not ours to use. `docs/REFERENCE.md` holds the element-by-element mapping and the list of deliberate deviations. When a reference pattern cannot hold our content, record the deviation there instead of quietly redesigning it. [`docs/ART-DIRECTION.md`](docs/ART-DIRECTION.md) holds our own art direction: artwork, composition, palette, textures, typography, Ema's five poses, asset sources and licensing status, and the art still needed. It works inside the reference mapping and never overrides it.

| Our theme | Reference counterpart | Rule |
| --- | --- | --- |
| Ema / 樱色档案 (`src/themes/ema`) | `src/themes/fuyukawa-kagari` | Rebuild its layout and interactions; keep our cream and sakura palette, typography and Ema-led art direction. |
| Blank (`src/themes/blank`) | `src/themes/blank` | Rebuild its typographic journal layout, navigation, spacing and interactions; keep our content and Blank's minimal identity. |
| Endfield / 终末地 (`src/themes/endfield`) | none | Keep its independent industrial design. Do not apply the reference's visual language to it. |

Ema:

- The homepage is character-led. Ema is the dominant visual: a full-height front layer in a viewport-high stage, with the introduction, navigation and supporting content composed around her. A small portrait card, a reduced character slot or a wall of cards is not acceptable. The r3 card layout deployed with PR #11 is not the target and is not a baseline to preserve.
- Keep the five-pose switching structure and the labels 艾玛的小剧场 and 点击艾玛，翻开下一幕 (translated in each locale).
- On phones Ema keeps a deliberate, prominent place in the first screen; she is never pushed below cards.

Blank follows the reference's redesigned Blank: achromatic, typography-led, numbered navigation and sections, rules and whitespace, no decorative imagery.

Endfield: shared infrastructure changes must not change its appearance or behaviour. Compare its built output before and after any shared change.

## Artwork, licences and content

- Never copy, hotlink, trace or repackage the reference's media: characters, backgrounds, manga panels, title lettering, logos, stickers, Live2D models, music, fonts or screenshots. Its MIT licence covers only code, styles, scripts, tests, configuration and documentation that Yuimi-chaya can license, and excludes all media. Third-party code bundled there (for example Live2D runtimes) keeps its own licence.
- Reused reference code stays under MIT with Yuimi-chaya's notice, which is kept in `LICENSE` and `public/licenses/yuimi-chaya-MIT.txt`, and is noted at the top of the reusing file. Every theme footer keeps `SiteAttribution.astro`.
- No generative-AI images. Before using any illustration, record its original source, creator and licence in `THIRD_PARTY_ASSETS.md` and the relevant `ASSETS.json`; never judge from style alone whether a picture is AI-made.
- Owner-approved exception (2026-11-14): restore only the five Ema homepage images from commit `76c9da5`, byte-for-byte, as `public/themes/ema/assets/ema-pose-01.webp` through `ema-pose-05.webp`. This overrides the earlier placeholder-only restriction for these five images. Keep composition B, the background, four-locale theatre copy and interactions; source and permission status remain unconfirmed. Other removed media stay removed. Do not generate, redraw, upscale or re-encode these images.
- Do not invent character dialogue, game reviews, personal status, project information or other content. Show only what the shared sources contain. Do not add Neon Drift or ECHO to shared project data.

## Languages

- Every theme supports `zh-CN`, `zh-TW`, `ja` and `en` on every page, with all four locale routes built. These are site-wide settings.
- Use `src/core/i18n` for translations, locale detection, localized URLs, the language switcher and the `site-locale` key. No per-theme locale storage or separate dictionaries.
- Every user-facing string, accessibility label, status text and SEO description exists in all four languages. `zh-TW` uses Taiwanese vocabulary and official Taiwanese titles, not character conversion. Article translations share a `translationKey`; a missing translation shows the Simplified Chinese original with the explicit fallback notice.
- Switching language keeps the current theme, page and article.

## Shared data and architecture

- Personal data, social links, projects, collections, notes and articles live in `src/core/data`, `src/core/i18n/content.ts` and `src/content/blog`. Themes read them through `getSiteContent(locale)`, `socialLinks`, `getNotes(locale)` and `getPublishedPosts(locale)` and never keep copies.
- Every theme layout mounts `SiteIcons.astro`, `ColorModePreference.astro`, `LanguagePreference.astro`, `ThemePreference.astro` and `SiteNavigation.astro` in its head, renders `LanguageSwitcher.astro`, a colour-mode button and the theme switcher, and sets the HTML `lang`. `SiteNavigation` mounts `mountSiteFeatures` once per page; theme scripts register through `registerThemeRuntime()`.
- Shared code in `src/core` never imports from `src/themes`, except `src/core/themes/PageLayout.astro`. Because that file imports all three layouts, every layout's CSS reaches every page that uses it, Endfield's inner pages included: scope theme CSS under `html[data-theme="…"]` or theme-only classes. Endfield's inner pages and several Ema pages render Blank's page components, so Blank changes need an Endfield and Ema check.
- Light and dark mode use the shared `blank-color-mode` key, follow the system until the visitor chooses, have no Auto option, and persist across themes, languages and pages. Motion uses the shared pause preference (`html[data-motion-paused]`, `site:motion-change`).
- Reusable features and service clients go in `src/core`; each theme renders its own controls. The search, filter, sort, table-of-contents and reading-progress hooks are the shared `data-site-*` attributes. `docs/THEMES.md` is the technical contract.

## Accessibility and responsive behaviour

- Everything works with a keyboard, with visible focus and sensible focus order; dialogs and menus trap and return focus; touch targets are at least 44px.
- Body text meets WCAG AA contrast in both colour modes, including text over artwork.
- Respect `prefers-reduced-motion` and the site's pause button: no scroll hijacking, no autoplaying motion, content static and complete. Content stays readable without JavaScript.
- Design and check desktop (1440×900), short desktop windows (about 1366×620), tablets and phones (390×844 and 360px wide). Fixed controls never cover content.

## Verification

- Run `npm test` and `npm run build` with Node 24, the deploy's version: `PATH=/usr/local/bin:/usr/bin:/bin npm test` (the default PATH gives Node 22). Results on another Node version do not count.
- Check all four locales, light and dark, reduced motion, keyboard and touch, at the sizes above. Fingerprint Endfield's built pages before and after shared changes.
- Report exactly which engine, version and sizes were checked. Automated Chromium or WebKit runs are not real Safari or physical-phone tests; never report those as done unless they were.
- Deployment: GitHub Pages through `.github/workflows/deploy.yml` on pushes to `main`, root URL, no repository `base` prefix. Keep credentials, environment files and host-specific configuration out of the repository, and keep upstream copyright notices and licences.
