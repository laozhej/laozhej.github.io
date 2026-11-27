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
    assert.match(source, /<FontLinks families=\{\[[^\]]+\]\} locale=\{locale\} \/>/, theme);
  }
  const links = read("src/core/fonts/FontLinks.astro");
  assert.match(links, /media="print" onload="this\.media='all'"/, "the fallback pieces never block the first paint");
  assert.match(links, /rel="preload"[^>]+as="font"[^>]+crossorigin/);
});

test("every font the site serves has its licence file", () => {
  for (const file of ["noto-sans-cjk-OFL.txt", "noto-serif-cjk-OFL.txt", "lxgw-wenkai-OFL.txt", "lxgw-wenkai-tc-OFL.txt", "klee-one-OFL.txt", "jetbrains-mono-OFL.txt", "gloock-OFL.txt"]) {
    assert.match(read(`public/licenses/${file}`), /SIL Open Font License/, file);
  }
  const credits = read("src/themes/blank/pages/CreditsPage.astro");
  for (const name of ["Noto Sans SC / TC / JP", "Noto Serif SC / TC / JP", "LXGW WenKai / LXGW WenKai TC / Klee One", "JetBrains Mono"]) assert.ok(credits.includes(name), name);
});
