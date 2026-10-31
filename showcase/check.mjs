import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const showcase = path.join(root, "showcase");
const locales = ["zh-CN", "zh-TW", "ja", "en"];
const themes = ["blank", "ema", "endfield"];
const sections = ["", "blog", "projects", "games", "about", "credits", "404"];
const showcaseUrl = "https://github.com/laozhej/laozhej.github.io/tree/main/showcase";
const caseLabels = {
  "zh-CN": "查看项目案例（中文）",
  "zh-TW": "查看專案案例（簡體中文）",
  ja: "制作事例を読む（中国語簡体字）",
  en: "Read the case study (Simplified Chinese)",
};
const route = (locale, theme, section) => {
  if (locale === "zh-CN" && theme === "blank" && section === "404") return "/404.html";
  return "/" + [locale === "zh-CN" ? "" : locale, theme === "blank" ? "" : `themes/${theme}`, section].filter(Boolean).join("/") + (locale === "zh-CN" && theme === "blank" && !section ? "" : "/");
};
let pages = 0;
let projects = 0;
for (const locale of locales) {
  for (const theme of themes) {
    for (const section of sections) {
      const url = route(locale, theme, section);
      const file = path.join(root, "dist", url.endsWith(".html") ? url.slice(1) : `${url.slice(1)}index.html`);
      const html = await readFile(file, "utf8");
      assert(html.includes(`lang="${locale}"`), `${url}: wrong HTML language`);
      assert(html.includes(`data-theme="${theme}"`), `${url}: wrong theme`);
      assert(html.includes(`rel="canonical" href="https://laozhej.github.io${url}"`), `${url}: wrong canonical`);
      for (const other of locales) {
        const target = route(other, theme, section);
        assert(html.includes(`hreflang="${other}" href="https://laozhej.github.io${target}"`), `${url}: wrong ${other} alternate`);
      }
      if (section === "projects") {
        assert(html.includes(`href="${showcaseUrl}"`), `${url}: missing case-study link`);
        assert(html.includes(caseLabels[locale]), `${url}: missing localized label`);
        projects++;
      }
      pages++;
    }
  }
}

// Check the actual files referenced by the case study, including gallery assets.
let links = 0;
async function checkMarkdown(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) await checkMarkdown(file);
    else if (entry.name.endsWith(".md")) {
      const text = await readFile(file, "utf8");
      for (const [, target] of text.matchAll(/\]\(([^\s)]+)\)/g)) {
        if (/^(https?:|mailto:|#)/.test(target)) continue;
        const local = decodeURIComponent(target.split("#")[0]);
        await stat(path.resolve(directory, local)).catch(() => assert.fail(`${path.relative(root, file)}: missing ${target}`));
        links++;
      }
    }
  }
}
await checkMarkdown(showcase);
console.log(`Showcase checks passed: ${pages} locale/theme pages, ${projects} localized project links, ${links} local documentation links.`);
