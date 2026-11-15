import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { personalSiteGallery } from "../src/core/data/projects.ts";

// The Works pilot (owner's request, 2026-11-15): Ema's Works page shows each project as one numbered sheet with
// the project's own screenshots, the lead capture whole beside the text and the rest uncropped in a contact row.
// Every word and picture comes from the shared project data; the captions are the recorded label and meta, and
// the pictures are shown exactly as recorded, light captures included in dark mode. Blank's Works page, used by
// Blank and Endfield, is not touched, and every style sits under .ema-content.
const root = fileURLToPath(new URL("../", import.meta.url));
const src = join(root, "src/");
const read = (path) => readFileSync(join(src, path), "utf8");
const files = (dir) => readdirSync(dir).flatMap((name) => {
  const path = join(dir, name);
  return statSync(path).isDirectory() ? files(path) : [path];
});
const page = read("themes/ema/pages/ProjectsPage.astro");
const css = read("themes/ema/styles/works.css");
const rules = css.replace(/\/\*[\s\S]*?\*\//g, "");
const blocks = [...rules.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({ selector: match[1].trim(), body: match[2] }));

test("Ema's Works page shows the shared project data and keeps no copy of it", () => {
  assert.match(page, /const \{ projectEntries, projectTechLines \} = getSiteContent\(locale\);/);
  const code = page.split("\n").filter((line) => !line.trim().startsWith("//")).join("\n");
  assert.doesNotMatch(code, /\/projects\/gallery|\.png|个人网站|Personal Website|20\d\d-\d\d-\d\d/, "no project text, date or image path is written in the page");
  for (const field of ["project.title", "project.type", "project.status", "project.summary", "project.details", "project.url", "project.gallery", "project.image", "image?.darkSrc", "shot.label", "shot.meta", "shot.alt"]) {
    assert.ok(page.includes(field), `reads ${field}`);
  }
  // The case-study link, its label and the filter hooks are those of Blank's Works page.
  assert.match(page, /<a class="blank-text-link ema-works-link" href=\{project\.url\}>\{t\("projects\.caseStudy"\)\}/);
  assert.match(page, /const filterable = projectEntries\.length > 1 && projectTechLines\.length > 1;/);
  for (const hook of ["data-site-collection", "data-site-entries", "data-site-entry", "data-category={project.line}", "data-site-filter-form", "data-site-count", "data-site-empty"]) assert.ok(page.includes(hook), hook);
  assert.match(read("pages/themes/ema/[...page].astro"), /import ProjectsPage from "@\/themes\/ema\/pages\/ProjectsPage\.astro";/);
});

test("every screenshot caption states the mode, size and capture date recorded for its file, in all four languages", () => {
  const manifest = new Map(JSON.parse(readFileSync(join(root, "public/projects/ASSETS.json"), "utf8")).assets.map((asset) => [asset.path, asset]));
  const words = { light: ["浅色", "淺色", "ライト", "Light"], dark: ["深色", "ダーク", "Dark"] };
  const captions = ["core/data/projects.ts", "core/i18n/content.ts"].flatMap((path) => [...read(path).matchAll(/personalSiteGallery\[(\d+)\], label: "([^"]+)", meta: "([^"]+)", alt: "([^"]+)"/g)]);
  assert.equal(captions.length, personalSiteGallery.length * 4, "one caption for every capture in each of the four languages");
  for (const [, index, label, meta, alt] of captions) {
    const shot = personalSiteGallery[Number(index)];
    const asset = manifest.get(shot.src);
    assert.ok(asset, `${shot.src} is recorded in public/projects/ASSETS.json`);
    assert.ok(label.trim() && alt.trim(), `${shot.src} has a label and alternative text`);
    assert.ok(meta.includes(asset.capturedDate), `"${meta}" gives the capture date ${asset.capturedDate}`);
    assert.ok(meta.includes(`${shot.width}×${shot.height}`), `"${meta}" gives the size ${shot.width}×${shot.height}`);
    const mode = /\bdark mode\b/.test(asset.description) ? "dark" : "light";
    assert.ok(words[mode].some((word) => meta.startsWith(word)), `"${meta}" names the ${mode} mode it was captured in`);
  }
});

test("the pictures are shown whole and unaltered, and the light captures stay as they are in dark mode", () => {
  assert.doesNotMatch(rules, /(^|[;\s{])(object-fit|object-position|filter|backdrop-filter|opacity|mix-blend-mode|clip-path|mask|mask-image|aspect-ratio|transform|animation|transition)\s*:/m);
  for (const { selector, body } of blocks.filter((block) => /\bimg$/.test(block.selector))) {
    const size = Object.fromEntries([...body.matchAll(/(?:^|;)\s*(width|height)\s*:\s*([^;]+)/g)].map((match) => [match[1], match[2].trim()]));
    assert.ok(!(size.width && size.height && size.width !== "auto" && size.height !== "auto"), `${selector} keeps the picture's own proportions`);
  }
  // Dark mode swaps only the lead plate for its dark twin; nothing in the contact row is hidden or changed.
  const dark = blocks.filter((block) => block.selector.startsWith('html[data-color-mode="dark"]'));
  assert.deepEqual([...new Set(dark.map((block) => block.selector))], ['html[data-color-mode="dark"] .ema-content .ema-works-lead.is-light', 'html[data-color-mode="dark"] .ema-content .ema-works-lead.is-dark']);
  assert.match(rules, /^\.ema-content \.ema-works-lead\.is-dark \{ display: none; \}/m);
  assert.match(rules, /@media print \{\s*html\[data-color-mode="dark"\] \.ema-content \.ema-works-lead\.is-light \{ display: block; \}/);
  assert.match(page, /leads\.length > 1 && \(at === 0 \? "is-light" : "is-dark"\)/);
  assert.doesNotMatch(rules, /#[0-9a-f]{3}|\b(rgba?|hsla?|oklch|lab)\(/i, "colours come from the theme's tokens");
});

test("every Works style stays inside Ema's pages and leaves Blank's classes alone", () => {
  const selectors = blocks.map((block) => block.selector).filter((selector) => !selector.startsWith("@")).flatMap((selector) => selector.split(/,\s*/));
  assert.ok(selectors.length >= 30);
  for (const selector of selectors) assert.match(selector, /^(html\[data-color-mode="dark"\] )?\.ema-content \.ema-works/, selector);
  assert.doesNotMatch(selectors.join("\n"), /\.blank-/, "Blank's own classes keep the styles they have on every page");
  // Blank's Works page, which Blank and Endfield render, still owns its markup.
  assert.match(read("pages/projects.astro"), /import ProjectsPage from "@\/themes\/blank\/pages\/ProjectsPage\.astro";/);
});

test("the Works styles load with the layout's own stylesheets, keeping their order on every page", () => {
  const layout = read("themes/ema/layouts/EmaLayout.astro");
  assert.match(layout, /import "\.\.\/styles\/theme\.css";\nimport "\.\.\/styles\/plate\.css";\nimport "\.\.\/styles\/article\.css";\nimport "\.\.\/styles\/works\.css";\n/);
  const importers = files(src).filter((path) => /\.(astro|ts|mjs)$/.test(path) && /styles\/works\.css/.test(readFileSync(path, "utf8"))).map((path) => path.slice(src.length));
  assert.deepEqual(importers, ["themes/ema/layouts/EmaLayout.astro"]);
});
