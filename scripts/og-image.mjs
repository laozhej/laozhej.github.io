// Render the default link-preview images (public/og/<locale>.png, 1200×630).
// The card matches the default Arknights archive-terminal theme: dark field,
// Arataki.br + cyan BASE signal plate, index annotation, dot-matrix serial and
// two-line statement, using the same copy as src/core/i18n/messages.ts.
//
// Usage (Node 24, system Chrome):
//   PLAYWRIGHT_CORE=/path/to/node_modules/playwright-core node scripts/og-image.mjs
// Re-run after changing site.owner, ema.brand, home.kicker or home.statement*.
import { mkdir, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { messages } from "../src/core/i18n/messages.ts";
import { site } from "../src/lib/site.ts";
import { dotMatrix } from "../src/themes/arknights/lib/matrix.mjs";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_CORE || "playwright-core");
const rootDir = new URL("../", import.meta.url);
const outDir = fileURLToPath(new URL("../public/og/", import.meta.url));
const host = "neroarataki.com";

const dataUrl = async (rel, mime) => `data:${mime};base64,${(await readFile(new URL(rel, rootDir))).toString("base64")}`;
const [oswaldUrl, monoUrl, sansScUrl, sansTcUrl, sansJpUrl, latticeUrl] = await Promise.all([
  dataUrl("node_modules/@fontsource-variable/oswald/files/oswald-latin-wght-normal.woff2", "font/woff2"),
  dataUrl("node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2", "font/woff2"),
  dataUrl("public/fonts/site/noto-sans-sc.woff2", "font/woff2"),
  dataUrl("public/fonts/site/noto-sans-tc.woff2", "font/woff2"),
  dataUrl("public/fonts/site/noto-sans-jp.woff2", "font/woff2"),
  dataUrl("public/themes/arknights/lattice.svg", "image/svg+xml"),
]);

const sansFace = { "zh-CN": "OG Sans SC", "zh-TW": "OG Sans TC", ja: "OG Sans JP", en: "OG Sans SC" };
const escape = (value) => String(value).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const board = dotMatrix("001");
const matrixSvg = `<svg class="matrix" viewBox="-0.5 -0.5 ${board.width + 1} ${board.height + 1}" aria-hidden="true">${board.rows.map((row) =>
  row.off.map((x) => `<rect fill="#23282e" x="${x + 0.1}" y="${row.y + 0.1}" width="0.8" height="0.8"/>`).join("") +
  row.on.map((x) => `<rect fill="#19cff2" x="${x + 0.1}" y="${row.y + 0.1}" width="0.8" height="0.8"/>`).join("")
).join("")}</svg>`;

function card(locale) {
  const t = messages[locale];
  const brand = t["ema.brand"];
  const [brandHead, ...brandTail] = brand.split(" ");
  const brandName = brandHead.replace(/[’']s$/i, "");
  const role = brandTail.join(" ");
  return `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><style>
    @font-face { font-family: "OG Oswald"; src: url("${oswaldUrl}") format("woff2"); font-weight: 200 700; }
    @font-face { font-family: "OG Mono"; src: url("${monoUrl}") format("woff2"); font-weight: 100 800; }
    @font-face { font-family: "OG Sans SC"; src: url("${sansScUrl}") format("woff2"); font-weight: 100 900; }
    @font-face { font-family: "OG Sans TC"; src: url("${sansTcUrl}") format("woff2"); font-weight: 100 900; }
    @font-face { font-family: "OG Sans JP"; src: url("${sansJpUrl}") format("woff2"); font-weight: 100 900; }
    * { box-sizing: border-box; margin: 0; }
    html, body { width: 1200px; height: 630px; background: #0d0f11; color: #e9eae6; overflow: hidden; }
    body {
      position: relative;
      display: grid;
      grid-template-rows: auto 1fr auto;
      padding: 52px 72px 48px;
      font-family: "${sansFace[locale]}", sans-serif;
    }
    .lattice {
      position: absolute; inset: 0; pointer-events: none;
      background: rgba(233, 234, 230, 0.08);
      -webkit-mask: url("${latticeUrl}") 0 0 / 160px 277.128px, linear-gradient(100deg, transparent 22%, #000 72%);
      -webkit-mask-composite: source-in;
      mask: url("${latticeUrl}") 0 0 / 160px 277.128px, linear-gradient(100deg, transparent 22%, #000 72%);
      mask-composite: intersect;
    }
    .accent-bar { position: absolute; top: 0; left: 0; right: 0; height: 4px; background: #19cff2; }
    .top, .bottom, .mid { position: relative; z-index: 1; }
    .top {
      display: flex; justify-content: space-between; align-items: center;
      padding-bottom: 22px; border-bottom: 1px solid #2a2e32;
    }
    .mark { display: flex; align-items: center; gap: 14px; }
    .glyph { position: relative; width: 32px; height: 32px; background: #e9eae6; }
    .glyph::before { content: ""; position: absolute; inset: 8px; border: 2px solid #0d0f11; transform: rotate(45deg); }
    .glyph::after { content: ""; position: absolute; right: 0; bottom: 0; width: 8px; height: 8px; background: #19cff2; }
    .mono { font: 500 15px/1 "OG Mono", monospace; letter-spacing: .08em; color: #a0a6ab; text-transform: uppercase; }
    .mono strong { color: #19cff2; font-weight: 600; }
    .mid { display: flex; justify-content: space-between; align-items: center; gap: 40px; }
    .title-wrap { display: flex; flex-direction: column; gap: 18px; }
    .annot { display: flex; align-items: center; gap: 16px; }
    .annot .dot { width: 5px; height: 5px; background: #2a2e32; display: inline-block; }
    h1 { display: flex; align-items: flex-end; gap: 22px; line-height: .96; }
    .name {
      font: 700 124px/.92 "OG Oswald", sans-serif;
      letter-spacing: -.01em; text-transform: uppercase; color: #e9eae6; white-space: nowrap;
    }
    .plate {
      display: inline-flex; align-items: center; padding: 14px 22px 11px; margin-bottom: 6px;
      background: #19cff2; color: #0b0d0e;
      font: 700 32px/1 "OG Oswald", sans-serif; letter-spacing: .24em; text-transform: uppercase;
    }
    .panel {
      width: 248px; flex-shrink: 0; padding: 20px 22px 18px;
      background: #15181b; border: 1px solid #2a2e32; border-top: 3px solid #19cff2;
      display: flex; flex-direction: column; gap: 14px;
    }
    .panel-head { display: flex; justify-content: space-between; font: 500 12px/1 "OG Mono", monospace; color: #a0a6ab; letter-spacing: .08em; text-transform: uppercase; }
    .matrix { width: 100%; height: auto; display: block; }
    .panel-foot { font: 500 11.5px/1 "OG Mono", monospace; color: #19cff2; letter-spacing: .12em; text-transform: uppercase; }
    .bottom {
      display: flex; justify-content: space-between; align-items: flex-end; gap: 24px;
      padding-top: 24px; border-top: 1px solid #2a2e32;
    }
    .statement { font: 400 30px/1.55 "${sansFace[locale]}", sans-serif; color: #e9eae6; }
    .host { font: 500 16px/1 "OG Mono", monospace; letter-spacing: .08em; color: #19cff2; text-transform: uppercase; white-space: nowrap; }
  </style></head><body>
    <div class="accent-bar"></div>
    <div class="lattice"></div>
    <div class="top">
      <div class="mark"><span class="glyph"></span><span class="mono"><strong>// 00 INDEX</strong> &nbsp;·&nbsp; ${escape(t["home.kicker"])}</span></div>
      <span class="mono">BY ${escape(site.owner.toUpperCase())} &nbsp;//&nbsp; AK / 04</span>
    </div>
    <div class="mid">
      <div class="title-wrap">
        <div class="annot"><span class="mono">ARCHIVE TERMINAL</span><span class="dot"></span><span class="mono">${escape(locale.toUpperCase())}</span></div>
        <h1><span class="name">${escape(brandName)}</span><span class="plate">${escape(role)}</span></h1>
      </div>
      <div class="panel">
        <div class="panel-head"><span>TERMINAL</span><span>AK / 04</span></div>
        ${matrixSvg}
        <div class="panel-foot">// ONLINE</div>
      </div>
    </div>
    <div class="bottom">
      <p class="statement">${escape(t["home.statement1"])}<br>${escape(t["home.statement2"])}</p>
      <span class="host">${host}</span>
    </div>
  </body></html>`;
}

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  for (const locale of Object.keys(messages)) {
    await page.setContent(card(locale), { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `${outDir}${locale}.png`, type: "png" });
    console.log(`og/${locale}.png`);
  }
} finally {
  await browser.close();
}
