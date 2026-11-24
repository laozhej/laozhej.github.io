import { defineConfig } from "astro/config";
import icon from "astro-icon";
import sitemap from "@astrojs/sitemap";
import { fluidPx } from "./src/core/styles/fluid-px.mjs";
import { isIndexedPath } from "./src/core/themes/routing.mjs";

export default defineConfig({
  site: "https://laozhej.github.io",
  output: "static",
  trailingSlash: "always",
  // src/core/navigation/prefetch.mjs prefetches under the versioned URL the router fetches.
  prefetch: false,
  integrations: [
    icon(),
    // List only the canonical theme's copy of each page (see canonicalTheme in
    // src/core/themes/routing.mjs); 404 routes are left out and marked noindex.
    sitemap({
      filter: (page) => isIndexedPath(new URL(page).pathname),
      i18n: { defaultLocale: "zh-CN", locales: { "zh-CN": "zh-CN", "zh-TW": "zh-TW", ja: "ja", en: "en" } },
    }),
  ],
  markdown: { shikiConfig: { themes: { light: "github-light", dark: "github-dark" } } },
  vite: { css: { postcss: { plugins: [fluidPx()] } } },
});
