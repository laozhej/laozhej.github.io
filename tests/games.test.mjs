import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { games } from "../src/core/data/games.ts";
import { checkGames, localizeGames, gameGenres } from "../src/core/content/select-games.mjs";

const game = (extra = {}) => ({ key: "sample", title: "Sample", genre: "action", ...extra });

test("the game shelf is valid and keeps the order it was written in", () => {
  assert.doesNotThrow(() => checkGames(games));
  assert.equal(games[0].key, "tsushima");
  assert.equal(games.length, new Set(games.map((item) => item.key)).size);
  for (const item of games) assert.ok(gameGenres.includes(item.genre), item.key);
  assert.ok(games.every((item) => item.steam || item.url), "every game links somewhere");
});

test("every game's art is in public/games and listed in its source manifest", async () => {
  const { assets } = JSON.parse(await import("node:fs/promises").then((fs) => fs.readFile(new URL("../public/games/ASSETS.json", import.meta.url), "utf8")));
  const listed = new Set(assets.map((asset) => asset.file));
  for (const item of games.filter((entry) => entry.art)) {
    assert.ok(existsSync(new URL(`../public/games/${item.art.file}`, import.meta.url)), `${item.key}: missing ${item.art.file}`);
    assert.ok(listed.has(item.art.file), `${item.key}: ${item.art.file} has no source record`);
  }
});

test("a broken game entry stops the build and names it", () => {
  assert.throws(() => checkGames([game(), game()]), /Game 2 \(sample\).*already used/);
  assert.throws(() => checkGames([game({ key: "Bad Key" })]), /lowercase/);
  assert.throws(() => checkGames([game({ genre: "puzzle" })]), /genre must be one of/);
  assert.throws(() => checkGames([game({ steam: "730" })]), /steam must be the number/);
  assert.throws(() => checkGames([game({ url: "http://example.com" })]), /https/);
  assert.throws(() => checkGames([game({ status: "done" })]), /status/);
  assert.throws(() => checkGames([game({ pick: 5 })]), /pick must be 1, 2 or 3/);
  assert.throws(() => checkGames([game({ note: { en: "Great" } })]), /"zh-CN" text/);
  assert.throws(() => checkGames([game({ art: { file: "../secret.png" } })]), /art.file/);
  assert.throws(() => checkGames([game({ art: { file: "a.webp", focus: "left" } })]), /art.focus/);
});

test("each language shows its usual name, with the game's own title as the fallback", () => {
  const entries = [game({ key: "a", title: "ELDEN RING", names: { "zh-CN": "艾尔登法环" }, steam: 1245620 }), game({ key: "b", title: "Arcaea", genre: "rhythm", url: "https://arcaea.lowiro.com/" })];
  const [zh] = localizeGames(entries, "zh-CN");
  const [ja, other] = localizeGames(entries, "ja");
  assert.equal(zh.name, "艾尔登法环");
  assert.equal(ja.name, "ELDEN RING");
  assert.deepEqual(zh.link, { href: "https://store.steampowered.com/app/1245620/", steam: true });
  assert.deepEqual(other.link, { href: "https://arcaea.lowiro.com/", steam: false });
  assert.equal(other.number, 2);
  assert.equal(other.art, undefined);
  assert.deepEqual(localizeGames([game({ art: { file: "a.webp" } })], "en")[0].art, { src: "/games/a.webp", focus: "50% 50%" });
});

test("a note without a translation shows the Chinese original and says so", () => {
  const entries = [game({ note: { "zh-CN": "很好玩", en: "So much fun" }, status: "finished", pick: 3 })];
  assert.deepEqual(localizeGames(entries, "en")[0].note, { text: "So much fun", lang: "en", translated: true });
  assert.deepEqual(localizeGames(entries, "ja")[0].note, { text: "很好玩", lang: "zh-CN", translated: false });
  assert.equal(localizeGames(entries, "ja")[0].pick, 3);
  assert.equal(localizeGames([game()], "en")[0].note, undefined);
});
