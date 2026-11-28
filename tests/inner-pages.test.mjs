import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// The inner pages of Endfield and Arknights (redrawn 2026-11-28 at the owner's request): Journal, Works, articles, Collection
// and Friends used to be Blank's pages inside each theme's frame; each theme now has its own page components and stylesheet,
// built on the same shared data and data-site-* hooks. Credits and 404 still use Blank's pages.
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const themes = ["endfield", "arknights"];
const pages = ["BlogIndexPage", "ArticlePage", "ProjectsPage", "CollectionPage", "FriendsPage"];

test("every Endfield and Arknights route renders the theme's own inner pages; credits and 404 stay shared", () => {
  const routes = {
    endfield: ["src/pages/themes/endfield/[...page].astro", "src/pages/[lang]/themes/endfield/[...page].astro"],
    arknights: ["src/pages/[lang]/[...page].astro"],
  };
  for (const theme of themes) {
    for (const route of routes[theme]) {
      const source = read(route);
      for (const page of pages) assert.match(source, new RegExp(`import ${page} from "@/themes/${theme}/pages/${page}\\.astro";`), `${route} ${page}`);
      assert.match(source, /import CreditsPage from "@\/themes\/blank\/pages\/CreditsPage\.astro";/, route);
      assert.match(source, /import NotFoundPage from "@\/themes\/blank\/pages\/NotFoundPage\.astro";/, route);
    }
  }
  // Arknights is the default theme: its Simplified Chinese pages live at the root.
  assert.match(read("src/pages/blog/index.astro"), /@\/themes\/arknights\/pages\/BlogIndexPage\.astro/);
  assert.match(read("src/pages/blog/[...slug].astro"), /@\/themes\/arknights\/pages\/ArticlePage\.astro/);
  assert.match(read("src/pages/projects.astro"), /@\/themes\/arknights\/pages\/ProjectsPage\.astro/);
  assert.match(read("src/pages/collection/index.astro"), /@\/themes\/arknights\/pages\/CollectionPage\.astro/);
  assert.match(read("src/pages/collection/[shelf].astro"), /@\/themes\/arknights\/pages\/CollectionPage\.astro/);
  assert.match(read("src/pages/friends.astro"), /@\/themes\/arknights\/pages\/FriendsPage\.astro/);
});

test("the new pages keep the shared search, filters, order, feed, reading tools and copy hooks", () => {
  for (const theme of themes) {
    const blog = read(`src/themes/${theme}/pages/BlogIndexPage.astro`);
    for (const hook of ["data-site-collection", "data-site-filter-form", "data-site-query", "data-site-clear", "data-site-sort", 'data-site-category="all"', "data-site-entries", "data-site-entry", "data-site-count", "data-site-empty", "data-site-reset", 'id="blank-search"']) assert.ok(blog.includes(hook), `${theme} journal ${hook}`);
    assert.match(blog, /getPublishedPosts\(locale\)/);
    assert.match(blog, /localizePath\("\/rss\.xml", locale\)/, `${theme}: the feed`);
    const article = read(`src/themes/${theme}/pages/ArticlePage.astro`);
    for (const hook of ["data-site-prose", "data-site-toc", "data-site-reading-pct", "data-copy-code", "data-lightbox-open", "data-code-expand", "<ProjectJournalLinks />", "site-colophon", "isArticlePage"]) assert.ok(article.includes(hook), `${theme} article ${hook}`);
    const works = read(`src/themes/${theme}/pages/ProjectsPage.astro`);
    // Each work keeps its anchor (the articles link to /projects/#id) and lists its journal entries from the shared data.
    assert.match(works, /id=\{project\.id\}/);
    assert.match(works, /projectJournals\.find\(\(group\) => group\.projectId === project\.id\)/);
    assert.match(works, /href=\{project\.url\}/);
    assert.match(works, /data-site-lightbox/);
    const friends = read(`src/themes/${theme}/pages/FriendsPage.astro`);
    for (const hook of ["data-site-friends", "data-site-friends-copy", "getFriendsPage(", 'id="friends-exchange"']) assert.ok(friends.includes(hook), `${theme} friends ${hook}`);
    const collection = read(`src/themes/${theme}/pages/CollectionPage.astro`);
    for (const hook of ["data-collection-head", "data-collection-side", "data-collection-shelf", "data-collection-marker", "<SerendipityPicker", "data-site-group"]) assert.ok(collection.includes(hook), `${theme} collection ${hook}`);
  }
});

test("the inner pages take the full width; only Blank-framed pages keep the old main area", () => {
  for (const [theme, layout] of [["endfield", "EndfieldLayout"], ["arknights", "ArknightsLayout"]]) {
    const source = read(`src/themes/${theme}/layouts/${layout}.astro`);
    assert.match(source, /import "\.\.\/styles\/about\.css";\nimport "\.\.\/styles\/pages\.css";\n/);
    assert.match(source, /"blank-main--article": isArticlePage && !bleed/);
    for (const page of pages) assert.match(read(`src/themes/${theme}/pages/${page}.astro`), /<PageLayout [^>]*\bbleed>/, `${theme} ${page}`);
  }
});

test("the inner-page stylesheets reach no other page: every rule is scoped to the theme's own classes or attributes", () => {
  for (const [file, prefix] of [
    ["src/themes/endfield/styles/pages.css", /^(\.ef-|\[data-endfield\]|html\[data-|html:not|@|\}|to |from )/],
    ["src/themes/arknights/styles/pages.css", /^(\.ak-|\[data-arknights\]|html\[data-|html:not|@|\}|to |from )/],
  ]) {
    const css = read(file).replace(/\/\*[\s\S]*?\*\//g, "");
    for (const line of css.split("\n").map((l) => l.trim()).filter((l) => l && /\{/.test(l))) assert.match(line, prefix, `${file}: ${line.slice(0, 80)}`);
  }
});

test("Endfield keeps its fixed rules on the inner pages: the accent only fills, red is never used, nothing is rounded", () => {
  const css = read("src/themes/endfield/styles/pages.css").replace(/\/\*[\s\S]*?\*\//g, "");
  assert.doesNotMatch(css, /[^-]color:var\(--ef-signal\)|border[^;]*var\(--ef-signal\)/, "the accent is never a line or a text colour");
  assert.doesNotMatch(css, /\bred\b|#f00|#e64532/i);
  assert.doesNotMatch(css, /border-radius:(?!0)/);
});

test("the new pages add no wording of their own: every string comes from the shared messages, besides fixed English labels", () => {
  for (const theme of themes) {
    for (const page of pages) {
      // Comments may name things in their own words (the reference's page name); the markup and the code may not.
      const source = read(`src/themes/${theme}/pages/${page}.astro`).split("\n").filter((line) => !line.trim().startsWith("//")).join("\n");
      assert.doesNotMatch(source, /[一-鿿぀-ヿ]/, `${theme} ${page}: no Chinese or Japanese text written into the page`);
    }
  }
});
