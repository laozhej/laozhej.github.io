// Keep article identity independent of language and theme routes.
export function selectPosts(entries, locale) {
  const groups = new Map();
  for (const entry of entries) {
    if (entry.data.draft) continue;
    const key = entry.data.translationKey ?? entry.id.replace(/^(zh-TW|ja|en)\//, "");
    const translations = groups.get(key) ?? [];
    if (translations.some((post) => post.data.locale === entry.data.locale)) {
      throw new Error(`Duplicate article translation: ${key} / ${entry.data.locale}`);
    }
    translations.push(entry);
    groups.set(key, translations);
  }
  const posts = [];
  for (const [slug, versions] of groups) {
    const original = versions.find((post) => post.data.locale === "zh-CN");
    if (!original) throw new Error(`Missing published Chinese source for article: ${slug}`);
    const entry = versions.find((post) => post.data.locale === locale) ?? original;
    posts.push({ ...entry, slug });
  }
  return posts.sort((a, b) => (b.data.updatedDate ?? b.data.pubDate).valueOf() - (a.data.updatedDate ?? a.data.pubDate).valueOf());
}
