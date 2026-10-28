import test from "node:test";
import assert from "node:assert/strict";
import { notes } from "../src/core/data/notes.ts";
import { checkNotes, localizeNotes, notesToShip, pickNote, noteNumber } from "../src/core/content/select-notes.mjs";
import { mountNotice } from "../src/themes/ema/lib/notice.mjs";

const note = (date, zh = `note ${date}`, extra = {}) => ({ date, "zh-CN": zh, ...extra });

test("the posted sakura notes are valid and start at No.001", () => {
  assert.doesNotThrow(() => checkNotes(notes));
  assert.ok(notes.length > 0);
  assert.equal(localizeNotes(notes, "en")[0].number, 1);
  assert.equal(noteNumber(1), "001");
  assert.equal(noteNumber(42), "042");
});

test("a broken note stops the build with the note's number", () => {
  assert.throws(() => checkNotes([note("2026-10-28"), note("2026-02-30")]), /No\.002 .*YYYY-MM-DD/);
  assert.throws(() => checkNotes([note("2026/10/28")]), /No\.001/);
  assert.throws(() => checkNotes([note("2026-10-28"), note("2026-10-28")]), /one per day/);
  assert.throws(() => checkNotes([note("2026-10-29"), note("2026-10-28")]), /date order/);
  assert.throws(() => checkNotes([note("2026-10-28", "  ")]), /"zh-CN" text is required/);
  assert.throws(() => checkNotes([note("2026-10-28", "好", { en: 3 })]), /"en" text must be a string/);
});

test("a missing translation shows the Chinese original and says so", () => {
  const [first, second] = localizeNotes([note("2026-10-28", "早安", { en: "Morning" }), note("2026-10-29", "晚安", { en: " " })], "en");
  assert.deepEqual(first, { number: 1, date: "2026-10-28", text: "Morning", lang: "en", translated: true });
  assert.deepEqual(second, { number: 2, date: "2026-10-29", text: "晚安", lang: "zh-CN", translated: false });
  assert.equal(localizeNotes([note("2026-10-28", "早安")], "zh-CN")[0].translated, true);
});

test("each visitor sees the latest note dated on or before their own day", () => {
  const list = localizeNotes([note("2026-10-28"), note("2026-10-30"), note("2026-11-02")], "zh-CN");
  assert.equal(pickNote(list, "2026-10-28").number, 1);
  assert.equal(pickNote(list, "2026-10-29").number, 1);
  assert.equal(pickNote(list, "2026-11-01").number, 2);
  assert.equal(pickNote(list, "2027-01-01").number, 3);
  assert.equal(pickNote(list, "2026-10-27").number, 1);
  assert.equal(pickNote([], "2026-10-28"), undefined);
});

test("a page ships only the notes a visitor could still be shown", () => {
  const list = localizeNotes(["2026-10-20", "2026-10-25", "2026-10-27", "2026-10-28", "2026-10-31"].map((date) => note(date)), "zh-CN");
  // Built on the 28th (UTC): a visitor a day behind still needs the 27th.
  assert.deepEqual(notesToShip(list, "2026-10-28").map((item) => item.number), [3, 4, 5]);
  assert.deepEqual(notesToShip(list, "2026-10-26").map((item) => item.number), [2, 3, 4, 5]);
  assert.deepEqual(notesToShip(list, "2026-10-01").map((item) => item.number), [1, 2, 3, 4, 5]);
  for (const day of ["2026-10-27", "2026-10-28", "2026-10-29", "2026-12-01"]) {
    assert.equal(pickNote(notesToShip(list, "2026-10-28"), day), pickNote(list, day));
  }
});

test("the dialog shows today's note with its number, date and fallback line", () => {
  const field = () => ({ textContent: "", lang: "", hidden: false });
  const parts = { "[data-notice-title]": field(), "[data-notice-date]": field(), "[data-notice-text]": field(), "[data-notice-fallback]": field(), "[data-notice-skip]": { checked: false } };
  const shipped = localizeNotes([note("2020-01-01", "一"), note("2020-01-02", "二"), note("2999-01-01", "未来", { en: "Later" })], "en");
  const dialog = Object.assign(new EventTarget(), {
    open: false,
    dataset: { title: "Sakura note No.{n}", notes: JSON.stringify(shipped) },
    showModal() { this.open = true; },
    close() { this.open = false; },
    querySelector: (selector) => parts[selector] ?? null,
  });
  const opener = Object.assign(new EventTarget(), { hidden: true });
  const root = { querySelector: () => dialog, querySelectorAll: () => [opener] };
  const storage = { getItem: () => "1", setItem() {} };
  const win = { location: { hash: "" }, scrollY: 0, localStorage: storage, sessionStorage: storage, setTimeout: () => 0, clearTimeout() {} };
  const cleanup = mountNotice(root, { documentElement: { lang: "en" }, hidden: false }, win);
  assert.equal(parts["[data-notice-title]"].textContent, "Sakura note No.002");
  assert.match(parts["[data-notice-date]"].textContent, /2020/);
  assert.equal(parts["[data-notice-text]"].textContent, "二");
  assert.equal(parts["[data-notice-text]"].lang, "zh-CN");
  assert.equal(parts["[data-notice-fallback]"].hidden, false);
  assert.equal(opener.hidden, false);
  opener.dispatchEvent(new Event("click"));
  assert.equal(dialog.open, true);
  cleanup();
  assert.equal(dialog.open, false);
});
