import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";

// Since 2026-11-27 (owner's request) every theme sets its text in fonts the site serves itself, so every
// system shows the same letters: no system font names in the stacks, a cut-down file for each face, and
// the Fontsource pieces of the same face as the fallback for characters added later.
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const themes = ["blank", "ema", "endfield", "arknights"];
const SYSTEM = /Arial|Helvetica|PingFang|Hiragino|apple-system|BlinkMacSystemFont|system-ui|Segoe|Microsoft|YaHei|JhengHei|SimSun|PMingLiU|Songti|Iowan|Palatino|Georgia|Mincho|Meiryo|Yu Gothic|Consolas|Cascadia|Menlo|SF Mono|SFMono|ui-monospace|Courier|Osaka|Varela/;

test("no theme names a system font in its font stacks", () => {
  for (const theme of themes) {
    const css = read(`src/themes/${theme}/styles/theme.css`).replace(/\/\*[\s\S]*?\*\//g, "");
    const stacks = [...css.matchAll(/--[a-z-]*(?:sans|serif|mono|text|ui|display|round)[a-z-]*\s*:\s*([^;]+);/g)].map((m) => m[1]);
    assert.ok(stacks.length >= 3, theme);
    for (const stack of stacks) assert.doesNotMatch(stack, SYSTEM, `${theme}: ${stack}`);
  }
  assert.doesNotMatch(read("src/themes/ema/styles/shelf.css").replace(/\/\*[\s\S]*?\*\//g, ""), SYSTEM);
});

test("each cut-down face has its file, and each stack falls back to the same face from Fontsource", () => {
  const faces = read("src/core/fonts/subsets.css");
  const files = [...faces.matchAll(/url\("\/fonts\/site\/([^"]+)"\)/g)].map((m) => m[1]);
  assert.equal(files.length, 12);
  for (const file of files) {
    const path = new URL(`../public/fonts/site/${file}`, import.meta.url);
    assert.ok(existsSync(path), file);
    assert.ok(statSync(path).size > 50_000, `${file} looks empty`);
  }
  const pairs = { "Site Sans SC": "Noto Sans SC Variable", "Site Serif SC": "Noto Serif SC Variable", "Site Kai SC": "LXGW WenKai", "Site Kai TC": "LXGW WenKai TC", "Site Klee": "Klee One" };
  for (const theme of themes) {
    const css = read(`src/themes/${theme}/styles/theme.css`);
    for (const [cut, pieces] of Object.entries(pairs)) {
      if (css.includes(`"${cut}"`)) assert.ok(css.includes(`"${cut}","${pieces}"`), `${theme}: ${cut} is followed by ${pieces}`);
    }
  }
});

test("every layout loads the cut-down faces and links its own languages' fonts", () => {
  const layouts = { blank: "BlankLayout", ema: "EmaLayout", endfield: "EndfieldLayout", arknights: "ArknightsLayout" };
  for (const [theme, name] of Object.entries(layouts)) {
    const source = read(`src/themes/${theme}/layouts/${name}.astro`);
    assert.match(source, /import "@\/core\/fonts\/subsets\.css";/, theme);
    if (theme !== "ema") assert.match(source, /<FontLinks families=\{\[[^\]]+\]\} locale=\{locale\} \/>/, theme);
  }
  const links = read("src/core/fonts/FontLinks.astro");
  assert.match(links, /<meta name="site-font-pieces" content=\{href\} data-site-font-pieces \/>/, "the fallback pieces' stylesheets stay out of <link> until idle so client navigation never fetches /null");
  assert.match(links, /requestIdleCallback\(apply/, "and get appended once the page has loaded and the browser is idle");
  assert.match(links, /astro:page-load/, "in-site navigation fetches the next page's pieces too");
  assert.match(links, /rel="preload"[^>]+as="font"[^>]+crossorigin/);
});

test("Ema declares its locale's fallback stylesheets without waiting for load or JavaScript", () => {
  const layout = read("src/themes/ema/layouts/EmaLayout.astro");
  assert.ok(layout.includes('getFontSources(["ema-text", "noto-serif"], locale)'));
  const head = layout.slice(layout.indexOf("<head>"), layout.indexOf("</head>"));
  const afterMain = layout.slice(layout.indexOf("</main>"), layout.indexOf("</body>"));
  assert.match(head, /fonts\.preload\.map\(\(name\) => <link rel="preload"/);
  assert.match(afterMain, /fonts\.pieces\.map\(\(href\) => <link rel="stylesheet" href=\{href\}/);
});

test("every font the site serves has its licence file", () => {
  for (const file of ["noto-sans-cjk-OFL.txt", "noto-serif-cjk-OFL.txt", "lxgw-wenkai-OFL.txt", "lxgw-wenkai-tc-OFL.txt", "klee-one-OFL.txt", "jetbrains-mono-OFL.txt", "gloock-OFL.txt", "nunito-OFL.txt"]) {
    assert.match(read(`public/licenses/${file}`), /SIL Open Font License/, file);
  }
  const credits = read("src/themes/blank/pages/CreditsPage.astro");
  for (const name of ["Noto Sans SC / TC / JP", "Noto Serif SC / TC / JP", "LXGW WenKai / LXGW WenKai TC / Klee One", "Nunito", "JetBrains Mono"]) assert.ok(credits.includes(name), name);
});

// 2026-11-28 (owner's pick from a four-way board): Ema's English pages set their letters in Nunito, whose
// faces only cover Latin, so Chinese on those pages falls through to WenKai. Other languages keep WenKai.
test("Ema's English text is in Nunito, preloaded on English pages only", () => {
  const css = read("src/themes/ema/styles/theme.css");
  assert.match(css, /html\[data-theme="ema"\]:lang\(en\) \{\s*--blank-sans:"Nunito Variable","Site Kai SC","LXGW WenKai",sans-serif;/);
  const layout = read("src/themes/ema/layouts/EmaLayout.astro");
  assert.match(layout, /import "@fontsource-variable\/nunito\/wght\.css";/);
  assert.match(layout, /\{locale === "en" && <link rel="preload" href=\{nunitoLatin\} as="font" type="font\/woff2" crossorigin \/>\}/);
});

test("English pages on Blank, Endfield and Arknights set curly quotes in proportional Noto Latin", () => {
  const quotesCss = read("src/core/fonts/latin-quotes.css");
  for (const file of ["noto-sans-quotes.woff2", "noto-serif-quotes.woff2"]) {
    assert.ok(quotesCss.includes(`/fonts/latin/${file}`), file);
    const path = new URL(`../public/fonts/latin/${file}`, import.meta.url);
    assert.ok(existsSync(path), file);
    assert.ok(statSync(path).size > 500 && statSync(path).size < 10_000, `${file} should stay a tiny quotes subset`);
  }
  assert.match(read("public/licenses/noto-latin-OFL.txt"), /SIL Open Font License/);
  assert.ok(read("src/themes/blank/pages/CreditsPage.astro").includes("/licenses/noto-latin-OFL.txt"));
  for (const [theme, layout] of [["blank", "BlankLayout"], ["endfield", "EndfieldLayout"], ["arknights", "ArknightsLayout"]]) {
    assert.match(read(`src/themes/${theme}/layouts/${layout}.astro`), /import "@\/core\/fonts\/latin-quotes\.css";/, theme);
    assert.match(read(`src/themes/${theme}/styles/theme.css`), new RegExp(`html\\[data-theme="${theme}"\\]:lang\\(en\\)[\\s\\S]*?"Site Sans Quotes","Site Sans SC","Noto Sans SC Variable"`), theme);
  }
});
