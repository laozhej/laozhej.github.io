// Count CJK characters and Latin words in a Markdown body and estimate reading minutes.
// CJK reading speed ~380 chars/min, Latin ~210 words/min (minimum 1 minute for non-empty posts).
const CJK_RE = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/g;
const LATIN_RE = /[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g;

export function readingStats(markdown = "") {
  const plain = String(markdown || "")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/```[\s\S]*?```/g, (block) => block.replace(/```[^\n]*/g, " "))
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, " $1 ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, " $1 ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[`*_~>#|]/g, " ");

  const cjk = (plain.match(CJK_RE) ?? []).length;
  const latin = (plain.replace(CJK_RE, " ").match(LATIN_RE) ?? []).length;
  const count = cjk + latin;
  const minutes = count === 0 ? 0 : Math.max(1, Math.ceil(cjk / 380 + latin / 210));
  return { count, cjk, latin, minutes };
}
