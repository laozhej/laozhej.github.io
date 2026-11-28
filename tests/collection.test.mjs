// The Collection page (收藏, 2026-11-28): the Games section became a collection of five shelves with a category
// sidebar, after the structure of soki.moe's 品鉴 page, in all four themes.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { games } from "../src/core/data/games.ts";
import { favoriteGames } from "../src/core/data/profile.ts";
import { genreNames, getFavoriteAnimes } from "../src/core/data/animes.ts";
import { manga, movies, tv } from "../src/core/data/collection.ts";
import { gameGenres, localizeGames } from "../src/core/content/select-games.mjs";
import {
  animeEntries, buildCollection, checkWorks, collectionPath, collectionShelves, gameEntries, groupEntries, previewEntries, workEntries, workGenres,
} from "../src/core/content/select-collection.mjs";
import { matchesEntry } from "../src/core/features/collection.mjs";
import { landing, shelfPlace, shelfSwap } from "../src/core/navigation/shelf-swap.mjs";
import { canonicalTheme, getThemePath, isIndexedPath, movedPaths } from "../src/core/themes/routing.mjs";
import { localizePath } from "../src/core/i18n/routing.mjs";
import { messages } from "../src/core/i18n/messages.ts";
import { site } from "../src/lib/site.ts";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const work = (extra = {}) => ({ key: "sample", title: { "zh-CN": "样例" }, genres: ["life"], ...extra });
const build = (locale) => buildCollection({
  locale, gameShelf: localizeGames(games, locale), favoriteKeys: favoriteGames.map((game) => game.key),
  animes: getFavoriteAnimes(locale), works: { manga, movies, tv }, gameGenres, genreNames,
});

test("five shelves in the owner's order, the old Games link replaced by the Collection in the navigation", () => {
  assert.deepEqual(collectionShelves, ["manga", "anime", "movies", "tv", "games"]);
  assert.deepEqual(site.nav.map((item) => item.key), ["home", "blog", "projects", "collection", "about"]);
  assert.equal(site.nav[3].href, "/collection/");
  assert.equal(collectionPath(), "/collection/");
  assert.equal(collectionPath("games"), "/collection/games/");
  // Manga, movies and TV series share the anime genres, so every language already names them.
  assert.deepEqual(workGenres, Object.keys(genreNames));
});

test("the manga, movie and TV shelves are valid, and a broken entry stops the build and names it", () => {
  for (const [shelf, works] of Object.entries({ manga, movies, tv })) assert.doesNotThrow(() => checkWorks(works, shelf));
  assert.throws(() => checkWorks([work(), work()], "manga"), /manga 2 \(sample\).*already used/);
  assert.throws(() => checkWorks([work({ key: "Bad Key" })], "manga"), /lowercase/);
  assert.throws(() => checkWorks([work({ title: { en: "Only English" } })], "tv"), /"zh-CN" name/);
  assert.throws(() => checkWorks([work({ title: { "zh-CN": "名", fr: "Nom" } })], "tv"), /title languages/);
  assert.throws(() => checkWorks([work({ genres: [] })], "movies"), /genres must be/);
  assert.throws(() => checkWorks([work({ genres: ["horror"] })], "movies"), /genres must be/);
  assert.throws(() => checkWorks([work({ url: "http://example.com" })], "manga"), /https/);
  assert.throws(() => checkWorks([work({ cover: { file: "../secret.png" } })], "manga"), /cover.file/);
  assert.throws(() => checkWorks([work({ cover: { file: "a.webp", focus: "top" } })], "manga"), /cover.focus/);
  assert.throws(() => checkWorks([work({ year: "2024" })], "manga"), /year/);
});

test("every shelf gives the same entry shape: names fall back to Simplified Chinese and say so", () => {
  const [zh] = workEntries([work({ creator: "某作者", year: 2024, url: "https://example.com/" })], "manga", "zh-CN", genreNames);
  const [en] = workEntries([work({ title: { "zh-CN": "样例", en: "Sample" } })], "manga", "en", genreNames);
  const [ja] = workEntries([work()], "manga", "ja", genreNames);
  assert.equal(zh.name, "样例");
  assert.equal(zh.lang, undefined);
  assert.deepEqual(zh.details, ["人生与社会", "某作者 · 2024"]);
  assert.deepEqual(zh.link, { href: "https://example.com/", kind: "official" });
  assert.equal(en.name, "Sample");
  assert.equal(ja.name, "样例");
  assert.equal(ja.lang, "zh-CN", "a Chinese name on a Japanese page is marked as Chinese");
  const shelf = gameEntries(localizeGames(games, "zh-CN"), ["rdr2"]);
  const rdr2 = shelf.find((entry) => entry.key === "rdr2");
  assert.equal(rdr2.favorite, true);
  assert.equal(rdr2.original, "Red Dead Redemption 2");
  assert.deepEqual(rdr2.tags, ["action"]);
  assert.equal(rdr2.cover.shape, "wide");
  assert.equal(shelf.find((entry) => entry.key === "vrchat").original, undefined, "no second name when the title is the same");
  const anime = animeEntries(getFavoriteAnimes("ja"));
  assert.equal(anime[0].cover.shape, "tall");
  assert.ok(anime.every((entry) => entry.link.kind === "official"));
  assert.match(anime.find((entry) => entry.key === "bocchi-the-rock").search, /孤独摇滚！.*Bocchi the Rock!/, "every language's title is searchable");
});

test("each imported film has a release year, localized titles and a local poster with provenance", () => {
  const { assets } = JSON.parse(read("public/collection/ASSETS.json"));
  const posters = new Map(assets.map((asset) => [asset.path, asset]));
  assert.ok(movies.length > 0);
  for (const film of movies) {
    assert.ok(Number.isInteger(film.year), film.key);
    for (const locale of ["zh-CN", "zh-TW", "ja", "en"]) assert.ok(film.title[locale]?.trim(), film.key);
    const path = `/collection/${film.cover.file}`;
    assert.ok(existsSync(new URL(`../public${path}`, import.meta.url)), path);
    assert.match(posters.get(path)?.sourcePage ?? "", /^https:\/\//, path);
  }
});

test("games are grouped under their genres in the filter order; anime with several genres stay one group", () => {
  const collection = build("zh-CN");
  const gamesShelf = collection.shelves.find((shelf) => shelf.key === "games");
  assert.deepEqual(gamesShelf.groups.map((group) => group.key), gamesShelf.genres);
  assert.deepEqual(gamesShelf.genres, gameGenres.filter((genre) => games.some((game) => game.genre === genre)));
  assert.equal(gamesShelf.groups.reduce((sum, group) => sum + group.entries.length, 0), games.length);
  const anime = collection.shelves.find((shelf) => shelf.key === "anime");
  assert.deepEqual(anime.groups.map((group) => group.key), [""]);
  assert.equal(anime.labels["sci-fi"], "科幻与时间");
  assert.equal(collection.total, collection.shelves.reduce((sum, shelf) => sum + shelf.entries.length, 0));
  assert.equal(collection.total, games.length + getFavoriteAnimes("zh-CN").length + manga.length + movies.length + tv.length);
  // The overview leads with the About page's favorite games, in the owner's order.
  assert.deepEqual(previewEntries(gamesShelf.entries, 4, collection.favoriteKeys).map((entry) => entry.key), favoriteGames.map((game) => game.key).slice(0, 4));
  assert.deepEqual(groupEntries([{ tags: ["a"] }], ["a"]).map((group) => group.key), [""], "one genre needs no heading");
});

test("a work filed under several genres matches each of them", () => {
  const entry = { category: "sci-fi fantasy", search: "刀剑神域 Sword Art Online" };
  assert.equal(matchesEntry(entry, "", "fantasy"), true);
  assert.equal(matchesEntry(entry, "", "sci-fi"), true);
  assert.equal(matchesEntry(entry, "", "music"), false);
  assert.equal(matchesEntry(entry, "sword", "all"), true);
  assert.equal(matchesEntry({ category: "story", search: "x" }, "", "story"), true, "single keys behave as before");
});

test("the old Games address sends visitors on in every theme and language, and is never indexed", () => {
  assert.deepEqual(movedPaths, { "/games/": "/collection/games/" });
  for (const locale of ["zh-CN", "zh-TW", "ja", "en"]) {
    for (const theme of ["blank", "ema", "endfield", "arknights"]) {
      assert.equal(isIndexedPath(getThemePath(theme, localizePath("/games/", locale))), false);
      assert.equal(isIndexedPath(getThemePath(theme, localizePath("/collection/games/", locale))), theme === canonicalTheme);
    }
  }
  const moved = read("src/core/components/MovedPage.astro");
  assert.match(moved, /<meta name="robots" content="noindex" \/>/);
  assert.match(moved, /<link rel="canonical" href=\{canonical\} \/>/);
  assert.match(moved, /location\.replace\(target \+ location\.search \+ location\.hash\)/, "a genre filter and a game's anchor survive the move");
  assert.ok(moved.indexOf("location.replace") < moved.indexOf('http-equiv="refresh"'), "the script runs before the refresh");
  assert.match(read("src/pages/games.astro"), /<MovedPage to=\{movedPages\.games\} \/>/);
  const paths = read("src/core/themes/static-paths.ts");
  assert.match(paths, /collection\/\$\{shelf\}/);
  assert.match(paths, /kind: "moved", to/);
  assert.ok(existsSync(new URL("../src/pages/collection/[shelf].astro", import.meta.url)));
  for (const file of ["src/pages/[lang]/[...page].astro", "src/pages/themes/ema/[...page].astro", "src/pages/themes/blank/[...page].astro", "src/pages/[lang]/themes/blank/[...page].astro", "src/pages/[lang]/themes/endfield/[...page].astro"]) {
    assert.match(read(file), /collection: CollectionPage/, file);
    assert.match(read(file), /moved: MovedPage/, file);
  }
});

test("no page links to the old address any more", () => {
  for (const file of ["src/themes/blank/pages/HomePage.astro", "src/themes/endfield/pages/HomePage.astro", "src/themes/arknights/pages/HomePage.astro", "src/themes/ema/pages/HomePage.astro", "src/themes/blank/pages/AboutPage.astro", "src/themes/ema/pages/AboutPage.astro"]) {
    assert.doesNotMatch(read(file), /["`]\/games\//, file);
  }
  assert.doesNotMatch(read("src/lib/site.ts"), /\/games\//);
});

test("the profile's “more games” opens the games shelf, in every theme", () => {
  assert.match(read("src/themes/blank/pages/AboutPage.astro"), /<a class="blank-text-link blank-games-more" href=\{href\("\/collection\/games\/"\)\}>\{t\("about\.gamesMore"\)\}/);
  assert.match(read("src/themes/ema/pages/AboutPage.astro"), /<a class="about-more" href=\{href\("\/collection\/games\/"\)\}>\{t\("about\.gamesMore"\)\}/);
  assert.deepEqual(["zh-CN", "zh-TW", "ja", "en"].map((locale) => messages[locale]["about.gamesMore"]), ["更多游戏", "更多遊戲", "ゲームをもっと見る", "More games"]);
});

test("shelf names follow each language's own usage", () => {
  const names = (locale) => collectionShelves.map((key) => messages[locale][`collection.shelf.${key}`]);
  assert.deepEqual(names("zh-CN"), ["漫画", "动漫", "电影", "电视剧", "游戏"]);
  assert.deepEqual(names("zh-TW"), ["漫畫", "動畫", "電影", "影集", "遊戲"]);
  assert.deepEqual(names("ja"), ["マンガ", "アニメ", "映画", "ドラマ", "ゲーム"]);
  assert.deepEqual(names("en"), ["Manga", "Anime", "Movies", "TV series", "Games"]);
  assert.deepEqual(["zh-CN", "zh-TW", "ja", "en"].map((locale) => messages[locale]["nav.collection"]), ["收藏", "收藏", "コレクション", "Collection"]);
  for (const locale of ["zh-CN", "zh-TW", "ja", "en"]) {
    for (const key of collectionShelves) {
      assert.ok(messages[locale][`collection.search.${key}`].endsWith("…"), `${locale} ${key}`);
      assert.ok(messages[locale][`collection.unit.${key}`] && messages[locale][`collection.unit.${key}One`], `${locale} ${key} units`);
    }
    // A card's link reads its visible title, then this hidden suffix (WCAG 2.5.3: the name starts with what is seen).
    assert.match(messages[locale]["collection.linkSuffix"], /^[，、,] ?\{site\}/, locale);
    assert.match(messages[locale]["collection.emptyShelves"], /\{list\}/);
  }
});

test("between Collection pages the head and sidebar stay still and the shelf moves in from the side the reader goes", () => {
  assert.equal(shelfPlace("/collection/"), 0);
  assert.equal(shelfPlace("/ja/themes/ema/collection/games/"), 5);
  assert.equal(shelfPlace("/collection/manga/"), 1);
  assert.equal(shelfPlace("/games/"), -1);
  assert.equal(shelfPlace("/collection/unknown/"), -1);
  const url = (path) => new URL(`https://example.com${path}`);
  assert.equal(shelfSwap(url("/collection/"), url("/collection/anime/")), "next");
  assert.equal(shelfSwap(url("/themes/ema/collection/games/"), url("/themes/ema/collection/manga/")), "prev");
  assert.equal(shelfSwap(url("/collection/games/"), url("/collection/games/?category=story")), "", "same page");
  assert.equal(shelfSwap(url("/collection/games/"), url("/themes/ema/collection/anime/")), "", "theme changes load a new document");
  assert.equal(shelfSwap(url("/blog/"), url("/collection/")), "");
  assert.equal(landing(0, 600, 600, 100), 0, "not scrolled into the shelf: stay at the top");
  assert.equal(landing(1400, 600, 620, 100), 520, "deep in the old shelf: the new one starts under the sidebar");
  const nav = read("src/core/navigation/SiteNavigation.astro");
  for (const name of ["head", "side", "shelf"]) assert.match(nav, new RegExp(`html\\[data-shelf-swap\\] \\[data-collection-${name}\\] \\{ view-transition-name: collection-${name}; \\}`));
  assert.match(nav, /installShelfSwap\(document, window\)/);
});

test("Blank, Endfield and Arknights share one Collection component with the shared hooks", () => {
  const page = read("src/themes/blank/pages/CollectionPage.astro");
  const card = read("src/themes/blank/components/WorkCard.astro");
  for (const hook of ["data-collection-head", "data-collection-side", "data-collection-shelf", "data-collection-marker", "data-site-collection", "data-site-filter-form", "data-site-entries", "data-site-group", "data-site-group-count", "data-site-query", "data-site-empty", "data-site-count"]) {
    assert.ok(page.includes(hook), hook);
  }
  assert.match(page, /aria-current=\{current === shelf \? "page" : undefined\}/);
  assert.match(card, /<article class="blank-work-card">/);
  assert.match(card, /\{keepTails\(entry\.name\)\}<\/span><span class="blank-sr-only">\{t\("collection\.linkSuffix"\)/);
  assert.doesNotMatch(card, /aria-label/, "the name comes from the visible title, word joiners included");
  assert.match(card, /target="_blank" rel="noopener noreferrer"/);
  const css = read("src/themes/blank/styles/theme.css");
  assert.match(css, /\.blank-work-link::after \{ content: ""; position: absolute; inset: 0; z-index: 1; \}/, "the whole card opens the work");
  assert.match(css, /\.blank-shelf-group\[hidden\], \.blank-work\[hidden\] \{ display: none; \}/);
  assert.match(css, /\.blank-collection-index a \{[^}]*min-height: 48px;/);
});

test("Ema keeps the owner's game cabinets on the games shelf and adds poster cards in the same family", () => {
  const page = read("src/themes/ema/pages/CollectionPage.astro");
  const css = read("src/themes/ema/styles/collection.css");
  assert.match(page, /<h1>\{t\("nav\.collection"\)\}\{locale !== "en" && <span class="collection-sub" lang="en">Collection<\/span>\}<\/h1>/);
  for (const part of ['class="game-label"', '"game-screen"', 'class="game-copy"', 'class="game-play"', 'class="ema-work-cover"', 'class="ema-work-link"']) assert.ok(page.includes(part), part);
  assert.match(page, /aria-label=\{opens\(entry\)\}/);
  assert.match(page, /import "\.\.\/styles\/collection\.css";/);
  assert.match(css, /\.collection-filters button \{[^}]*min-height:44px/);
  assert.match(css, /\.ema-collection \.game-play \{[^}]*min-height:44px/);
  assert.match(css, /\.collection-index a \{[^}]*min-height:48px/);
  const phone = css.slice(css.indexOf("@media(max-width:760px)"), css.indexOf("@media(max-width:559px)"));
  assert.match(phone, /\.game-cabinet \{display:grid;grid-template-columns:104px minmax\(0,1fr\);/, "compact cabinets on phones, as approved");
  assert.doesNotMatch(phone, /\.game-[\w-]+[^{}]*\{[^}]*(display:none|min-height:[1-3]\d?px)/, "no part of a cabinet is hidden and no target shrinks");
  for (const line of css.split("\n").filter((line) => line.includes("::view-transition"))) assert.ok(line.trim().startsWith('html[data-theme="ema"]'), line.trim().slice(0, 80));
  assert.match(css, /html\[data-motion-paused="true"\] :is\(\.ema-collection,\.collection-opening\)/);
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);
});
