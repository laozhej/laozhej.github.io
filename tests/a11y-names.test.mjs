import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { messages } from "../src/core/i18n/messages.ts";

// What assistive technology reads, across all four themes (roadmap §4.6; the owner's go-ahead on question 14, 2026-11-27).
// A control's name contains the words it shows, starting with them, so someone using speech input can say what they see;
// and no two navigation regions on a page share a name, so a screen reader's list of regions can tell them apart.
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const locales = ["zh-CN", "zh-TW", "ja", "en"];
const layouts = {
  blank: "src/themes/blank/layouts/BlankLayout.astro",
  ema: "src/themes/ema/layouts/EmaLayout.astro",
  endfield: "src/themes/endfield/layouts/EndfieldLayout.astro",
  arknights: "src/themes/arknights/layouts/ArknightsLayout.astro",
};

test("store links and the motion button are named starting with the words they show", () => {
  for (const locale of locales) {
    const m = messages[locale];
    // "Steam" or the official-site word is what the link shows; the game and the new tab follow.
    assert.ok(m["games.opens"].startsWith("{site}"), `${locale} games.opens: ${m["games.opens"]}`);
    assert.ok(m["games.opens"].includes("{name}"), locale);
    assert.doesNotMatch(m["games.opens"], /[（(]/, `${locale}: no part in brackets, which some checkers drop when comparing`);
    // Ema's motion button shows its short label; every one of its names starts with or contains it.
    const short = m["ema.motion.short"].toLowerCase();
    assert.ok(m["ema.motion.reduced"].toLowerCase().startsWith(short), `${locale} ema.motion.reduced: ${m["ema.motion.reduced"]}`);
    for (const key of ["ema.motion.pause", "ema.motion.resume"]) assert.ok(m[key].toLowerCase().includes(short), `${locale} ${key}`);
  }
});

test("each theme's site-name link is named by what it shows, then where it goes", () => {
  const cases = [
    [layouts.blank, 'const edition = "BLANK / 01";', 'aria-label={`${site.wordmark} ${edition} ${t("a11y.home")}`}', '<span class="blank-edition">{edition}</span>'],
    [layouts.ema, 'const edition = "EMA / 02";', 'aria-label={`${brand} ${edition} ${t("a11y.home")}`}', "</strong> <small>{edition}</small>"],
    [layouts.endfield, 'const edition = "EF / 03";', 'aria-label={`${brandName} ${brandTail.join(" ")} ${edition} ${t("a11y.home")}`}', '<strong>{brandName}</strong> <span class="ef-wordmark-tag" aria-hidden="true">{brandTail.join(" ")}</span> <small>{edition}</small>'],
    [layouts.arknights, "const edition = `AK / ${themeNumber}`;", 'aria-label={`${brandName} ${brandTail.join(" ")} ${edition} ${t("a11y.home")}`}', '<small aria-hidden="true">{edition}</small>'],
  ];
  for (const [file, constant, label, shown] of cases) {
    const source = read(file);
    assert.ok(source.includes(constant), `${file}: the stamp is one constant, shown and spoken`);
    assert.ok(source.includes(label), `${file}: the name repeats the visible words in order`);
    assert.ok(source.includes(shown), `${file}: the stamp on screen comes from the same constant`);
  }
  // The footers' name links: the name and its tag, as shown. The pieces are separated by a space, which a flex row does not
  // draw but which keeps the words apart when the visible text is read as one string.
  for (const [file, cls] of [[layouts.endfield, "ef-footer-brand"], [layouts.arknights, "ak-footer-brand"]]) {
    const source = read(file);
    assert.ok(source.includes(`<a class="${cls}" href={href("/")} aria-label={\`\${brandName} \${brandTail.join(" ")}\`}><strong>{brandName}</strong> <span`), `${file}: footer name link`);
  }
});

test("no two navigation regions on a page share a name", () => {
  for (const [theme, file] of Object.entries(layouts)) {
    const source = read(file);
    assert.equal(source.split('aria-label={t("a11y.navigation")}').length - 1, 1, `${theme}: one main navigation`);
    assert.match(source, /<SocialLinks class="[^"]+" label=\{t\("social\.footerHeading"\)\} \/>/, `${theme}: the footer's social links have their own name`);
  }
  for (const theme of ["endfield", "arknights"]) {
    assert.match(read(layouts[theme]), /footer-sections" aria-label=\{t\("a11y\.footerNavigation"\)\}>/, `${theme}: the footer's section links`);
  }
  assert.match(read("src/themes/blank/pages/HomePage.astro"), /<nav class="bj-index" aria-label=\{t\("home\.index"\)\}>/, "Blank home: the index strip");
  assert.match(read("src/core/components/SocialLinks.astro"), /aria-label=\{label \?\? t\("social\.heading"\)\}/, "the About page keeps the plain name");
  for (const locale of locales) {
    const m = messages[locale];
    const names = [m["a11y.navigation"], m["a11y.footerNavigation"], m["social.heading"], m["social.footerHeading"], m["home.index"], m["a11y.language"], m["theme.switch"], m["article.toc"]];
    assert.equal(new Set(names).size, names.length, `${locale}: ${names.join(" / ")}`);
  }
});

// Text that axe could not judge was measured on the rendered pages (2026-11-27): 10,742 elements in Chrome, light and dark,
// 1440×900 and 390×844. These are the fixes for the ones under WCAG AA; decorative watermarks (Ema's games "03", the
// background words) have no contrast requirement and were left alone.
test("text that measured under AA keeps its fix", () => {
  const ema = read("src/themes/ema/styles/theme.css");
  assert.ok(ema.includes('.ema-nav a[aria-current="page"] .ema-nav-hint {opacity:1;}'), "Ema: the current section's hint at full colour (was 3.4:1)");
  assert.ok(ema.includes(".ema-content .blank-search input::placeholder {color:var(--blank-muted);opacity:1;}"), "Ema: the search placeholder in the muted ink (was 4.3:1)");
  const arknights = read("src/themes/arknights/styles/theme.css");
  assert.match(arknights, /\.ak-panel-no \{[^}]*color:#eef0ec; text-shadow:0 0 1px #08090a,0 0 2px #08090a,0 0 3px #08090a,0 0 5px #08090a,0 0 8px #08090a,0 0 12px #08090a;/, "Arknights: a dark halo behind the panel numbers (were 1.8–2.5:1)");
  assert.match(arknights, /\.ak-panel-go \{[^}]*filter:drop-shadow\(0 0 2px #08090a\) drop-shadow\(0 0 5px #08090a\);/, "Arknights: and behind the link mark");
});
