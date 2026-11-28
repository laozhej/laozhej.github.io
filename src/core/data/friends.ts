// The Friends page (友链, owner's request 2026-11-28), shared by every theme and language.
//
// Adding a friend:
// - Add a site only when the owner names it. Never invent sites, introductions or how the owner knows them.
// - `name` and `description` are the friend's own words, copied as they wrote them (their site's title and the
//   one-line introduction they gave). They are not translated: every language shows the original, marked with
//   `lang` (a BCP 47 tag such as "zh-CN", "zh-TW", "ja" or "en").
// - `avatar` is a copy hosted here, never a hotlink: put the file in public/friends/ (for example
//   public/friends/example.webp, about 128 × 128) and record its source in public/friends/ASSETS.json and
//   THIRD_PARTY_ASSETS.md. Without an avatar, or when it fails to load, the page shows the name's first letter.
// - `status` is the manual override for the daily check (scripts/check-friends.mjs, .github/workflows/friends-check.yml).
//   Leave it out to let the check decide; "lost" files the site under 暂时失联 by hand; "active" keeps it among the
//   friends whatever the check says, for sites the check cannot reach from its servers abroad.
//
// Example (not a real entry):
//   { id: "example", name: "Example Notes", url: "https://example.com/", description: "写字和拍照的地方。", lang: "zh-CN", avatar: "/friends/<id>.webp" }
export interface Friend {
  id: string;
  name: string;
  url: string;
  description: string;
  lang: string;
  avatar?: string;
  status?: "active" | "lost";
}

export const friends: Friend[] = [];

// Projects this site is built from, each credited on the Credits page. Their names stay as written; what this site
// took from each is said in the page's own language (`friends.special.<key>` in friends-messages.ts).
export const specialLinks = [
  { key: "yuimi", name: "Yuimi-chaya", url: "https://yuimi-chaya.github.io/" },
  { key: "astro", name: "Astro", url: "https://astro.build/" },
  { key: "tabler", name: "Tabler Icons", url: "https://github.com/tabler/tabler-icons" },
  { key: "sakura", name: "sakura.js", url: "https://github.com/jhammann/sakura" },
] as const;

// A site the daily check could not open on this many runs in a row moves to 暂时失联. It is never removed.
export const lostAfterFailures = 7;

// What the daily check records, by friend id: how many runs in a row failed (0 after a success) and the date of the
// first of them. Written by scripts/check-friends.mjs; edit `status` above rather than this file.
export interface FriendCheck {
  failures: number;
  since?: string;
}
