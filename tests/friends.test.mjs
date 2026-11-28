import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { friends, lostAfterFailures, specialLinks } from "../src/core/data/friends.ts";
import { messages } from "../src/core/i18n/messages.ts";
import { displayAddress, groupFriends, initialOf, isReachable, nextChecks, siteCardText } from "../src/core/content/select-friends.mjs";
import { mountFriends } from "../src/core/features/friends.mjs";

// The Friends page (友链, owner's request 2026-11-28): one shared list in src/core/data/friends.ts, a page in every
// theme and language, friends' own words untranslated, avatars hosted here, and a daily check that files unreachable
// sites under 暂时失联 without ever removing them.
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const locales = ["zh-CN", "zh-TW", "ja", "en"];

test("friends are recorded the way the page and the check expect", () => {
  const ids = new Set();
  const manifest = JSON.parse(read("public/friends/ASSETS.json")).assets.map((entry) => entry.path);
  for (const friend of friends) {
    assert.match(friend.id, /^[a-z0-9-]+$/, friend.id);
    assert.ok(!ids.has(friend.id), `duplicate id ${friend.id}`);
    ids.add(friend.id);
    assert.match(friend.url, /^https:\/\//, `${friend.id}: https only`);
    assert.ok(friend.name.trim() && friend.description.trim(), `${friend.id}: their own name and introduction`);
    assert.match(friend.lang, /^[a-z]{2,3}(-[A-Za-z0-9]+)*$/, `${friend.id}: the language of their words`);
    if (friend.status) assert.ok(["active", "lost"].includes(friend.status), friend.id);
    if (friend.avatar) {
      assert.match(friend.avatar, /^\/friends\/[\w.-]+\.(webp|png|jpe?g|avif)$/, `${friend.id}: avatars are hosted here, never hotlinked`);
      assert.ok(manifest.includes(friend.avatar), `${friend.id}: avatar recorded in public/friends/ASSETS.json`);
    }
  }
  const status = JSON.parse(read("src/core/data/friends-status.json"));
  assert.deepEqual(Object.keys(status), ["sites"]);
  for (const [id, record] of Object.entries(status.sites)) {
    assert.ok(ids.has(id), `status for unknown friend ${id}`);
    assert.ok(record.failures >= 1 && record.failures <= lostAfterFailures && /^\d{4}-\d{2}-\d{2}$/.test(record.since), id);
  }
});

test("no friend is invented: the list stays empty until the owner names a site", () => {
  // Added 2026-11-28 with no friends given. When the owner adds sites, change this test with them.
  assert.equal(friends.length, 0);
  assert.match(read("THIRD_PARTY_ASSETS.md"), /## 友链头像/);
});

test("special links are projects the Credits page already credits, each described in all four languages", () => {
  const credits = read("src/themes/blank/pages/CreditsPage.astro") + read("src/core/i18n/messages.ts");
  for (const link of specialLinks) {
    assert.ok(credits.includes(link.name.replace(/\.js$/, "")) || credits.includes(link.url), link.name);
    for (const locale of locales) assert.ok(messages[locale][`friends.special.${link.key}`], `${locale}: ${link.key}`);
  }
});

test("a site is filed under 暂时失联 only after the set number of failed checks, and the owner's status wins", () => {
  const list = [{ id: "a" }, { id: "b" }, { id: "c", status: "active" }, { id: "d", status: "lost" }];
  const checks = { a: { failures: lostAfterFailures - 1 }, b: { failures: lostAfterFailures }, c: { failures: lostAfterFailures } };
  const { listed, lost } = groupFriends(list, checks, lostAfterFailures);
  assert.deepEqual(listed.map(({ id }) => id), ["a", "c"]);
  assert.deepEqual(lost.map(({ id }) => id), ["b", "d"]);
});

test("the daily record counts failures in a row, keeps the first date, stops at the threshold and forgets a success", () => {
  let record = {};
  record = nextChecks(record, { a: false, b: true }, "2026-12-01", 3);
  assert.deepEqual(record, { a: { failures: 1, since: "2026-12-01" } });
  record = nextChecks(record, { a: false }, "2026-12-02", 3);
  record = nextChecks(record, { a: false }, "2026-12-03", 3);
  record = nextChecks(record, { a: false }, "2026-12-04", 3);
  assert.deepEqual(record, { a: { failures: 3, since: "2026-12-01" } }, "the file stops changing once the site is filed");
  assert.deepEqual(nextChecks(record, { a: true }, "2026-12-05", 3), {});
  assert.deepEqual(nextChecks(record, {}, "2026-12-05", 3), {}, "a friend no longer checked loses its record");
});

test("a server that answers counts as reachable, even when it turns automated visitors away", () => {
  for (const status of [200, 204, 301, 304, 401, 403, 405, 429]) assert.equal(isReachable(status), true, status);
  for (const status of [404, 410, 500, 502, 503]) assert.equal(isReachable(status), false, status);
  assert.equal(isReachable(503, new Headers({ "cf-mitigated": "challenge" })), true);
});

test("addresses, first letters and the copied card read as intended", () => {
  assert.equal(displayAddress("https://www.example.com/"), "example.com");
  assert.equal(displayAddress("https://github.com/tabler/tabler-icons"), "github.com/tabler/tabler-icons");
  assert.equal(initialOf("sample notes"), "S");
  assert.equal(initialOf("見本のサイト"), "見");
  assert.equal(initialOf("👩‍💻 Desk"), "👩‍💻");
  assert.equal(initialOf(""), "?");
  assert.equal(siteCardText({ name: "N", link: "https://x/", avatar: "https://x/a.png", description: "D" }), "name: N\nlink: https://x/\navatar: https://x/a.png\ndescr: D");
});

test("every theme builds the page in every language and links to it from its footer and About page", () => {
  assert.match(read("src/core/themes/static-paths.ts"), /export const sectionPages = \[[^\]]*"friends"[^\]]*\];/);
  for (const route of ["src/pages/[lang]/[...page].astro", ...["blank", "ema", "endfield"].flatMap((theme) => [`src/pages/themes/${theme}/[...page].astro`, `src/pages/[lang]/themes/${theme}/[...page].astro`])]) {
    assert.match(read(route), /friends: FriendsPage/, route);
  }
  assert.match(read("src/pages/friends.astro"), /FriendsPage/);
  for (const layout of ["blank/layouts/BlankLayout", "ema/layouts/EmaLayout", "endfield/layouts/EndfieldLayout", "arknights/layouts/ArknightsLayout"]) {
    assert.match(read(`src/themes/${layout}.astro`), /href=\{href\("\/friends\/"\)\}>\{t\("footer\.friends"\)\}/, layout);
  }
  // The owner's pick (2026-11-28): Endfield's and Arknights' footer sections gain the Collection too.
  for (const layout of ["endfield/layouts/EndfieldLayout", "arknights/layouts/ArknightsLayout"]) {
    assert.match(read(`src/themes/${layout}.astro`), /href=\{href\("\/collection\/"\)\}>\{t\("footer\.collection"\)\}/, layout);
  }
  for (const about of ["blank/pages/AboutPage", "ema/pages/AboutPage"]) assert.match(read(`src/themes/${about}.astro`), /href=\{href\("\/friends\/"\)\}/, about);
  assert.match(read("src/core/content/search-index.ts"), /\["\/friends\/", t\("friends\.title"\)/);
  for (const locale of locales) {
    for (const key of ["friends.title", "friends.description", "friends.empty", "friends.closed", "friends.copy", "footer.friends", "footer.collection"]) {
      assert.ok(messages[locale][key], `${locale}: ${key}`);
    }
  }
});

test("friends' own words keep their language and are never translated", () => {
  for (const page of ["src/themes/blank/pages/FriendsPage.astro", "src/themes/ema/pages/FriendsPage.astro"]) {
    const source = read(page);
    assert.match(source, /<strong lang=\{friend\.lang\}>\{friend\.name\}<\/strong>/, page);
    assert.match(source, /lang=\{friend\.lang\}>\{keepTails\(friend\.description\)\}/, page);
    assert.doesNotMatch(source, /t\(`friends\.friend\./, `${page}: no per-friend translations`);
  }
});

test("the daily check runs from GitHub Actions, commits only its record and never removes a site", () => {
  const workflow = read(".github/workflows/friends-check.yml");
  assert.match(workflow, /schedule:\n\s+- cron: "\d+ \d+ \* \* \*"/);
  assert.match(workflow, /node scripts\/check-friends\.mjs/);
  assert.match(workflow, /git add src\/core\/data\/friends-status\.json\n/);
  assert.match(workflow, /gh workflow run deploy\.yml/);
  const script = read("scripts/check-friends.mjs");
  assert.doesNotMatch(script, /friends\.ts["'],\s*\{?\s*flag|writeFile\([^)]*friends\.ts/, "the script never edits the friends list");
  assert.ok(existsSync(new URL("../scripts/check-friends.mjs", import.meta.url)));
});

function fakeRoot({ avatars = [] } = {}) {
  const tip = { textContent: "" };
  const attrs = new Map();
  const listeners = {};
  const button = {
    hidden: true, dataset: { copyText: "name: N" }, nextElementSibling: tip, offsetWidth: 1,
    setAttribute: (name, value) => attrs.set(name, value), removeAttribute: (name) => attrs.delete(name),
    addEventListener: (type, fn) => { listeners[type] = fn; }, removeEventListener: () => {},
  };
  const root = {
    dataset: { copied: "已复制", copyFailed: "复制失败" },
    ownerDocument: {},
    querySelector: (selector) => (selector === "[data-site-friends-copy]" ? button : null),
    querySelectorAll: () => avatars,
  };
  return { root, button, tip, attrs, listeners };
}

test("the copy button appears with JavaScript, copies the card and says so", async () => {
  const { root, button, tip, attrs, listeners } = fakeRoot();
  let copied = "";
  const win = {
    navigator: { clipboard: { writeText: async (text) => { copied = text; } } },
    setTimeout: () => 1, clearTimeout: () => {}, requestAnimationFrame: (fn) => fn(),
  };
  mountFriends(root, win);
  assert.equal(button.hidden, false);
  await listeners.click();
  assert.equal(copied, "name: N");
  assert.ok(attrs.has("data-copied"));
  assert.equal(tip.textContent, "已复制");
});

test("an avatar that failed to load is hidden so the first letter shows", () => {
  const broken = { complete: true, naturalWidth: 0, hidden: false, addEventListener() {} };
  const loading = { complete: false, naturalWidth: 0, hidden: false, addEventListener(type, fn) { this.fire = fn; }, removeEventListener() {} };
  const { root } = fakeRoot({ avatars: [broken, loading] });
  mountFriends(root, { setTimeout: () => 1, clearTimeout: () => {}, requestAnimationFrame: () => {}, navigator: {} });
  assert.equal(broken.hidden, true);
  assert.equal(loading.hidden, false);
  loading.fire();
  assert.equal(loading.hidden, true);
});
