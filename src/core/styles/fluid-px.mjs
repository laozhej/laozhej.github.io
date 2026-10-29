// Every theme is drawn in px for a laptop-sized window. On wider screens those px
// grow with the window instead of leaving the page floating in the middle:
// the build rewrites `24px` to `calc(24 * var(--site-px, 1px))`, and
// `scale.css` keeps `--site-px` at exactly 1px up to 1600px wide.
const length = /(?<![\w.#-])(-?(?:\d+\.?\d*|\.\d+))px\b/g;
// url() and quoted strings are left alone.
const protectedParts = /(url\([^)]*\)|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g;
// A comment containing `px:fixed` just before a declaration keeps its px as written,
// for values that scripts parse or that measure scrolling rather than size.
const fixedMarker = /\bpx:fixed\b/;

const scale = (match, amount) => Math.abs(Number(amount)) <= 1 ? match : `calc(${amount} * var(--site-px, 1px))`;

/** Rewrites the px lengths in one CSS value. Hairlines (1px and below) stay crisp. */
export function scalePx(value) {
  if (!value.includes("px")) return value;
  return value.split(protectedParts).map((part, index) => index % 2 ? part : part.replace(length, scale)).join("");
}

/** PostCSS plugin applied to the site's own stylesheets (files under `include`). */
export function fluidPx({ include = /[\\/]src[\\/]/ } = {}) {
  return {
    postcssPlugin: "site-fluid-px",
    Declaration(decl) {
      if (!include.test(decl.source?.input.file ?? "")) return;
      const previous = decl.prev();
      if (previous?.type === "comment" && fixedMarker.test(previous.text)) return;
      const value = scalePx(decl.value);
      if (value !== decl.value) decl.value = value;
    },
  };
}
fluidPx.postcss = true;
