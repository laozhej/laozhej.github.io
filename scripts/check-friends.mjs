// The daily friend-link check (.github/workflows/friends-check.yml; run by hand with `node scripts/check-friends.mjs`).
// Opens every friend's site whose `status` the owner has not set, and records in src/core/data/friends-status.json the
// sites that failed, how many runs in a row and since when. The Friends page files a site under 暂时失联 once it failed
// `lostAfterFailures` runs in a row, and moves it back after one success; nothing is ever removed. A site is checked
// twice before it counts as failed, a few seconds apart, so a brief hiccup does not count.
// Writes `changed` (the file changed) and `lost-changed` (a site moved in or out of 暂时失联) to $GITHUB_OUTPUT.
import { readFile, writeFile, appendFile } from "node:fs/promises";
import { friends, lostAfterFailures } from "../src/core/data/friends.ts";
import { groupFriends, isReachable, nextChecks } from "../src/core/content/select-friends.mjs";

const statusFile = new URL("../src/core/data/friends-status.json", import.meta.url);
const timeout = Number(process.env.FRIENDS_CHECK_TIMEOUT ?? 20_000);
const pause = Number(process.env.FRIENDS_CHECK_PAUSE ?? 5_000);
const userAgent = "Mozilla/5.0 (compatible; FriendLinkCheck/1.0)";

async function answers(url) {
  try {
    const response = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(timeout), headers: { "user-agent": userAgent, accept: "text/html,*/*" } });
    await response.body?.cancel();
    return { ok: isReachable(response.status, response.headers), detail: String(response.status) };
  } catch (error) {
    return { ok: false, detail: error?.cause?.code ?? error?.name ?? "error" };
  }
}

async function check(url) {
  const first = await answers(url);
  if (first.ok) return first;
  await new Promise((resolve) => setTimeout(resolve, pause));
  return answers(url);
}

const previousText = await readFile(statusFile, "utf8");
const previous = JSON.parse(previousText).sites ?? {};
const checked = friends.filter((friend) => !friend.status);
const results = {};
for (const friend of checked) {
  const { ok, detail } = await check(friend.url);
  results[friend.id] = ok;
  console.log(`${ok ? "ok  " : "FAIL"} ${friend.url} (${detail})`);
}
// Records of friends the owner now decides by hand, or who left the list, are dropped.
const today = new Date().toISOString().slice(0, 10);
const sites = nextChecks(previous, results, today, lostAfterFailures);
const nextText = `${JSON.stringify({ sites }, null, 2)}\n`;
const lostBefore = groupFriends(friends, previous, lostAfterFailures).lost.map(({ id }) => id).join();
const lostAfter = groupFriends(friends, sites, lostAfterFailures).lost.map(({ id }) => id).join();
const changed = nextText !== previousText;
if (changed) await writeFile(statusFile, nextText);
console.log(checked.length ? `${checked.length} checked, ${Object.keys(sites).length} failing, lost: ${lostAfter || "none"}` : "No friends to check.");
if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `changed=${changed}\nlost-changed=${lostBefore !== lostAfter}\n`);
