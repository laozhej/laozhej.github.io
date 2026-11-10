import test from "node:test";
import assert from "node:assert/strict";
import { keepTails } from "../src/core/i18n/wrap.mjs";
import { games } from "../src/core/data/games.ts";
import { currentSignals } from "../src/core/data/profile.ts";
import { projectEntries } from "../src/core/data/projects.ts";

const NBSP = "\u00A0";
const JOINER = "\u2060";
const plain = (text) => text.replaceAll(NBSP, " ").replaceAll(JOINER, "");

test("a closing number stays with the title before it", () => {
  assert.equal(keepTails("荒野大镖客：救赎 2"), `荒野大镖客：救赎${NBSP}2`);
  assert.equal(keepTails("Red Dead Redemption 2"), `Red Dead Redemption${NBSP}2`);
  assert.equal(keepTails("赛博朋克 2077"), `赛博朋克${NBSP}2077`);
  assert.equal(keepTails("Final Fantasy VII"), `Final Fantasy${NBSP}VII`);
});

test("titles that do not end in a number are left alone", () => {
  for (const title of ["Ghost of Tsushima", "FINAL FANTASY VII REMAKE", "Fate/EXTELLA LINK", "VRChat"]) assert.equal(keepTails(title), title);
});

test("a line cannot start with the last character of a Chinese or Japanese sentence", () => {
  assert.equal(keepTails("语言和交互。项目案例记录设计取舍。"), `语言和交${JOINER}互。项目案例记录设计取${JOINER}舍。`);
  assert.equal(keepTails("相关的内容"), `相关的内${JOINER}容`);
  assert.equal(keepTails("少しずつ記録していきます"), `少しずつ記録していきま${JOINER}す`);
  assert.equal(keepTails("（简体中文）"), `（简体中${JOINER}文）`);
});

test("only invisible joins are added, so the words themselves never change", () => {
  const shown = [...games.flatMap((game) => [game.title, ...Object.values(game.names ?? {})]), ...currentSignals.map((item) => item.text), ...projectEntries.map((item) => item.summary)];
  for (const text of shown) assert.equal(plain(keepTails(text)), text);
  assert.equal(keepTails(""), "");
  assert.equal(keepTails(2077), "2077");
});

test("the reported awkward wraps are joined", () => {
  assert.ok(keepTails(games.find((game) => game.key === "rdr2").names["zh-CN"]).endsWith(`${NBSP}2`));
  assert.ok(keepTails(projectEntries[0].summary).includes(`交${JOINER}互。`));
  assert.ok(keepTails(currentSignals[0].text).endsWith(`内${JOINER}容`));
});
