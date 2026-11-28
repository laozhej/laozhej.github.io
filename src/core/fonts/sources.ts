// Each locale preloads the site's small subsets. The matching full faces are self-hosted
// stylesheets split by unicode-range, so missing characters can use the same design.
// See public/licenses/ for the OFL notices and docs/THEMES.md for the subset sources.
import notoSansSc from "@fontsource-variable/noto-sans-sc/wght.css?url";
import notoSansTc from "@fontsource-variable/noto-sans-tc/wght.css?url";
import notoSansJp from "@fontsource-variable/noto-sans-jp/wght.css?url";
import notoSerifSc from "@fontsource-variable/noto-serif-sc/wght.css?url";
import notoSerifTc from "@fontsource-variable/noto-serif-tc/wght.css?url";
import notoSerifJp from "@fontsource-variable/noto-serif-jp/wght.css?url";
import wenkai from "lxgw-wenkai-webfont/lxgwwenkai-regular.css?url";
import wenkaiBold from "lxgw-wenkai-webfont/lxgwwenkai-bold.css?url";
import wenkaiTc from "@fontsource/lxgw-wenkai-tc/400.css?url";
import wenkaiTcBold from "@fontsource/lxgw-wenkai-tc/700.css?url";
import kleeOne from "@fontsource/klee-one/400.css?url";
import kleeOneBold from "@fontsource/klee-one/600.css?url";

const FONTS = {
  "noto-sans": {
    "zh-CN": { preload: ["noto-sans-sc"], pieces: [notoSansSc] },
    "zh-TW": { preload: ["noto-sans-tc"], pieces: [notoSansTc] },
    ja: { preload: ["noto-sans-jp"], pieces: [notoSansJp] },
  },
  "noto-serif": {
    "zh-CN": { preload: ["noto-serif-sc"], pieces: [notoSerifSc] },
    "zh-TW": { preload: ["noto-serif-tc"], pieces: [notoSerifTc] },
    ja: { preload: ["noto-serif-jp"], pieces: [notoSerifJp] },
  },
  // Ema's text face: LXGW WenKai (Simplified), LXGW WenKai TC (Taiwanese standard), Klee One (Japanese).
  "ema-text": {
    "zh-CN": { preload: ["lxgw-wenkai-regular"], pieces: [wenkai, wenkaiBold] },
    "zh-TW": { preload: ["lxgw-wenkai-tc-regular"], pieces: [wenkaiTc, wenkaiTcBold] },
    ja: { preload: ["klee-one-regular"], pieces: [kleeOne, kleeOneBold] },
  },
};
export type FontFamily = keyof typeof FONTS;

export function getFontSources(families: FontFamily[], locale: string) {
  // English pages include Simplified Chinese names and terms.
  const key = locale === "zh-TW" || locale === "ja" ? locale : "zh-CN";
  const picked = families.map((family) => FONTS[family][key]);
  return {
    preload: picked.flatMap((family) => family.preload),
    pieces: picked.flatMap((family) => family.pieces),
  };
}
