// The Friends page's rules, shared by every theme's page, the search index, the tests and the daily link check
// (scripts/check-friends.mjs). Data and the rules for adding a friend: src/core/data/friends.ts.

// Friends the page lists, and those filed under 暂时失联. The owner's `status` wins over the check; a site moves to
// 暂时失联 only after `threshold` failed checks in a row, and is never dropped from the page.
export function groupFriends(friends, checks = {}, threshold = 7) {
  const listed = [];
  const lost = [];
  for (const friend of friends) {
    const failures = checks[friend.id]?.failures ?? 0;
    const isLost = friend.status === "lost" || (friend.status !== "active" && failures >= threshold);
    (isLost ? lost : listed).push(friend);
  }
  return { listed, lost };
}

// The address as the page prints it under a name: no scheme, no "www.", no trailing slash; paths stay, since several
// projects share one host (github.com/…).
export function displayAddress(url) {
  const { host, pathname } = new URL(url);
  const path = pathname.replace(/\/+$/, "");
  return `${host.replace(/^www\./, "")}${path}`;
}

// The letter shown when a site has no avatar or its avatar fails to load: the name's first character as a reader
// sees it (one grapheme, so an emoji or a letter with a combining mark stays whole), capitalised for Latin names.
export function initialOf(name) {
  const text = String(name ?? "").trim();
  if (!text) return "?";
  const segmenter = typeof Intl.Segmenter === "function" ? new Intl.Segmenter(undefined, { granularity: "grapheme" }) : null;
  const first = segmenter ? segmenter.segment(text)[Symbol.iterator]().next().value.segment : Array.from(text)[0];
  return first.toLocaleUpperCase("en");
}

// Whether a check's answer means the site is there. A server that answers, even to refuse an automated visitor
// (401, 403, 405, 429, or a Cloudflare challenge), is up; a missing page, a server error, a timeout or a failed
// connection is not.
export function isReachable(status, headers = {}) {
  if (status >= 200 && status < 400) return true;
  if ([401, 403, 405, 429].includes(status)) return true;
  const get = (name) => (typeof headers.get === "function" ? headers.get(name) : headers[name]) ?? "";
  return status === 503 && get("cf-mitigated") === "challenge";
}

// The next record after one day's check. Only sites that are failing are kept, so the file stays empty while every
// site answers. The count stops at `threshold`: once a site is filed under 暂时失联 the record no longer changes
// day by day, and the first failed date says since when.
export function nextChecks(previous = {}, results = {}, today, threshold = 7) {
  const next = {};
  for (const [id, ok] of Object.entries(results)) {
    if (ok) continue;
    const before = previous[id];
    next[id] = { failures: Math.min((before?.failures ?? 0) + 1, threshold), since: before?.since ?? today };
  }
  return next;
}

// The text the copy button puts on the clipboard: the fields most friend-link pages ask for, in the plain
// `key: value` form their config files use.
export function siteCardText({ name, link, avatar, description }) {
  return [`name: ${name}`, `link: ${link}`, `avatar: ${avatar}`, `descr: ${description}`].join("\n");
}
