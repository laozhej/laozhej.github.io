// Render the default link-preview images (public/og/<locale>.png, 1200×630).
// The card repeats Blank's home hero: kicker, byline, "Blank Space." and the
// two-line statement, using the same copy as src/core/i18n/messages.ts.
//
// Usage (Node 24, system Chrome):
//   PLAYWRIGHT_CORE=/path/to/node_modules/playwright-core node scripts/og-image.mjs
// Re-run after changing site.name, site.owner, home.kicker or home.statement*.
import { mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { messages } from "../src/core/i18n/messages.ts";
import { site } from "../src/lib/site.ts";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_CORE || "playwright-core");
const outDir = fileURLToPath(new URL("../public/og/", import.meta.url));
const host = "neroarataki.com";

const serif = {
  "zh-CN": '"Iowan Old Style", "Palatino Linotype", "Songti SC", serif',
  "zh-TW": '"Iowan Old Style", "Palatino Linotype", "Songti TC", serif',
  ja: '"Iowan Old Style", "Palatino Linotype", "Hiragino Mincho ProN", serif',
  en: '"Iowan Old Style", "Palatino Linotype", serif',
};

const escape = (value) => String(value).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const [word, ...rest] = site.name.split(" ");

function card(locale) {
  const t = messages[locale];
  return `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><style>
    * { box-sizing: border-box; margin: 0; }
    html, body { width: 1200px; height: 630px; background: #fff; color: #000; }
    body { display: grid; grid-template-rows: auto 1fr auto; padding: 56px 72px 52px; font-family: Arial, "Helvetica Neue", sans-serif; }
    .top, .bottom { display: flex; justify-content: space-between; align-items: baseline; }
    .mono { font: 400 15px/1 "Cascadia Code", Consolas, ui-monospace, monospace; letter-spacing: .04em; color: #666; }
    h1 { align-self: center; font-size: 168px; line-height: 1; font-weight: 700; letter-spacing: 0; white-space: nowrap; }
    h1 span { font-family: ${serif[locale]}; font-weight: 400; }
    .bottom { padding-top: 26px; border-top: 1px solid #000; align-items: end; }
    .statement { font: 400 34px/1.55 ${serif[locale]}; }
  </style></head><body>
    <div class="top"><span class="mono">${escape(t["home.kicker"])}</span><span class="mono">BY ${escape(site.owner.toUpperCase())}</span></div>
    <h1>${escape(word)} ${escape(rest.join(" "))}<span>.</span></h1>
    <div class="bottom"><p class="statement">${escape(t["home.statement1"])}<br>${escape(t["home.statement2"])}</p><span class="mono">${host}</span></div>
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
