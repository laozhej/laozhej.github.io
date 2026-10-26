import { defineConfig } from "astro/config";
import icon from "astro-icon";

export default defineConfig({
  site: "https://laozhej.github.io",
  output: "static",
  trailingSlash: "always",
  integrations: [icon()],
  markdown: { shikiConfig: { themes: { light: "github-light", dark: "github-dark" } } },
});
