// Keeps a short tail on the same line as the text before it, in every language and browser:
// a closing number stays with its title ("救赎 2"), and a line never starts with the last
// character of a Chinese or Japanese sentence ("交" / "互。").
// Use it on text shown on the page, not on search text, labels or data attributes.
const NO_BREAK_SPACE = "\u00A0";
const WORD_JOINER = "\u2060";
// Kana and Han, written as escapes so the ranges stay visible in the source.
const CJK = "\\u3040-\\u30ff\\u3400-\\u9fff\\uf900-\\ufaff";
const closingNumber = /[ \t](\d{1,4}|[IVX]{1,4})$/;
const sentenceTail = new RegExp(`([${CJK}])([${CJK}])(?=[。！？]|[」』）”…]*$)`, "g");

export function keepTails(text) {
  return String(text).replace(closingNumber, `${NO_BREAK_SPACE}$1`).replace(sentenceTail, `$1${WORD_JOINER}$2`);
}
