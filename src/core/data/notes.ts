// Sakura notes (樱色便笺): the daily note that opens on the Ema homepage.
//
// To post a note, add an entry at the end of the list:
//   { date: "2026-10-29", "zh-CN": "中文", ja: "日本語", en: "English" },
// - Notes are numbered by their place in this list: the first is No.001, the next No.002.
// - One note per day, in date order. `npm test` (and so the deploy) stops on a note that breaks this.
// - A note shows from its date until the next note's date, so notes can be written ahead.
// - "zh-CN" is required. Without "ja" or "en", those pages show the Chinese text and say it isn't translated yet.
// - Use \n for a line break.
export type SakuraNote = {
  date: string;
  "zh-CN": string;
  ja?: string;
  en?: string;
};

export const notes: SakuraNote[] = [
  {
    date: "2026-10-28",
    "zh-CN": "今天适合把一件小事写下来，哪怕只有一句。",
    ja: "今日は、小さなことをひとつ書き留めるのにぴったりの日。一行だけでも。",
    en: "A good day to write down one small thing, even a single line.",
  },
];
