// Build-time word count and reading-time estimator for Markdown articles.
// Strips Markdown syntax and counts CJK characters plus Latin/numeric words.
const CJK_RE = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uac00-\ud7af]/g;
const LATIN_WORD_RE = /[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g;

export function stripMarkdown(source = "") {
  return String(source)
    .replace(/^---[\s\S]*?---\s*/m, "")
    .replace(/```[\s\S]*?```/g, (block) => block.replace(/```[^\n]*\n?|\n?```/g, " "))
    .replace(/`([^`]*)`/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/^\s{0,3}(?:#{1,6}\s+|>\s*|[-*+]\s+|\d+\.\s+)/gm, "")
    .replace(/[*_~]+/g, "")
    .trim();
}

export function readingStats(body = "", locale = "zh-CN") {
  const plain = stripMarkdown(body);
  const cjk = (plain.match(CJK_RE) ?? []).length;
  const withoutCjk = plain.replace(CJK_RE, " ");
  const latin = (withoutCjk.match(LATIN_WORD_RE) ?? []).length;
  const count = cjk + latin;
  const minutes = locale === "en"
    ? Math.max(1, Math.round(latin / 220 + cjk / 400))
    : Math.max(1, Math.round(cjk / 400 + latin / 220));
  return { count, cjk, latin, minutes };
}
