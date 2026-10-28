import { notes } from "@/core/data/notes";
import type { Locale } from "@/core/i18n";
import { checkNotes, localizeNotes, notesToShip, utcDay } from "./select-notes.mjs";

export type LocalizedNote = { number: number; date: string; text: string; lang: Locale; translated: boolean };

// The notes a page ships: the one showing today plus any written ahead.
export function getNotes(locale: Locale = "zh-CN", buildDay = utcDay(new Date())): LocalizedNote[] {
  return notesToShip(localizeNotes(checkNotes(notes), locale), buildDay);
}
