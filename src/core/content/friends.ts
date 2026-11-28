// What every theme's Friends page shows, in one place: the friends listed and those filed under 暂时失联 (after the
// owner's override and the daily check), the special links, and this site's own card for exchanging links.
import { friends, lostAfterFailures, specialLinks, type Friend, type FriendCheck } from "@/core/data/friends";
import checks from "@/core/data/friends-status.json";
import { displayAddress, groupFriends, siteCardText } from "./select-friends.mjs";
import { localeNames, type Locale } from "@/core/i18n";
import { site } from "@/lib/site";

export interface FriendEntry extends Friend {
  address: string;
  // The language of the friend's own words, named when it is not the page's language.
  languageName?: string;
}

function languageName(lang: string, locale: Locale) {
  if (lang === locale) return undefined;
  if (lang in localeNames) return localeNames[lang as Locale];
  try {
    return new Intl.DisplayNames([locale], { type: "language" }).of(lang) ?? lang;
  } catch {
    return lang;
  }
}

export function getFriendsPage(locale: Locale, t: (key: string) => string, siteUrl: URL | string) {
  const { listed, lost } = groupFriends(friends, (checks as { sites: Record<string, FriendCheck> }).sites, lostAfterFailures);
  const entry = (friend: Friend): FriendEntry => ({ ...friend, address: displayAddress(friend.url), languageName: languageName(friend.lang, locale) });
  const days = String(lostAfterFailures);
  const card = {
    name: site.name,
    link: new URL("/", siteUrl).href,
    avatar: new URL("/apple-touch-icon.png", siteUrl).href,
    description: t("site.description"),
  };
  return {
    listed: listed.map(entry),
    lost: lost.map(entry),
    special: specialLinks.map((link) => ({ ...link, address: displayAddress(link.url), note: t(`friends.special.${link.key}`) })),
    card,
    cardText: siteCardText(card),
    lostNote: t("friends.lostNote").replace("{days}", days),
    notes: [t("friends.note1"), t("friends.note2"), t("friends.note3").replace("{days}", days)],
    rules: [1, 2, 3, 4].map((n) => t(`friends.rule${n}`)),
  };
}
