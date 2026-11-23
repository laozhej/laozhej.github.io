import { defineConfig } from "astro/config";
import icon from "astro-icon";
import sitemap from "@astrojs/sitemap";
import { fluidPx } from "./src/core/styles/fluid-px.mjs";

export default defineConfig({
  site: "https://laozhej.github.io",
  output: "static",
  trailingSlash: "always",
  integrations: [
    icon(),
    // List only the Blank (root) copy of each page: theme routes repeat the same
    // content in another look. 404 routes are excluded and marked noindex.
    sitemap({
      filter: (page) => !/\/themes\/|\/404(?:\.html|\/)$/.test(new URL(page).pathname),
      i18n: { defaultLocale: "zh-CN", locales: { "zh-CN": "zh-CN", "zh-TW": "zh-TW", ja: "ja", en: "en" } },
    }),
  ],
  markdown: { shikiConfig: { themes: { light: "github-light", dark: "github-dark" } } },
  vite: { css: { postcss: { plugins: [fluidPx()] } } },
});
