// Ema's still life (owner's art plan, 2026-11-14): original line drawings in code, with no text on them.
// The homepage storyboard drew them in two panels until 2026-11-27, when the owner chose Codex's earlier
// draft for the homepage instead (components/Storyboard.astro, roadmap question 15). The Journal page header
// still shows the notebook as a pilot (art plan P2). Their colours come from the .sb-still-* classes in
// stage.css and plate.css.
// Article pages (pilot, 2026-11-15) take the ribbon, the petal and the screentone below for their
// decorations (components/ArticleArt.astro, coloured in article.css).
// A five-petal blossom's petal, notched at the tip, centred on 0,0 at radius 1.
export const petal = "M0 0 C-0.42 -0.36 -0.5 -0.86 -0.2 -1 L0 -0.86 L0.2 -1 C0.5 -0.86 0.42 -0.36 0 0 Z";
// The notebook's ribbon hanging straight: 12 units wide, its tail cut in a fishtail half as deep as the
// ribbon is wide, like the one under the notebook. It is drawn 160 units long and shown through a viewport
// aligned to its tail (preserveAspectRatio "xMidYMax slice"), so a page can show as much of it as it needs
// without stretching the cut.
export const ribbon = "M0 0 H12 V160 L6 154 L0 160 Z";
// Screentone: round dots on a 9-unit grid turned 30 degrees, the storyboard's tone, as an SVG pattern.
export const screentone = (id, dotClass) => `<pattern id="${id}" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="4.5" cy="4.5" r="1.7" class="${dotClass}"></circle></pattern>`;
// The still life is drawn in its own small coordinates and placed with a scale; strokes scale with it.
// Notebook: about 162 x 68 units, lying a little askew, its page block and ribbon at the front edge.
export const notebook = `<g class="sb-still sb-notebook">
  <path class="sb-still-paper" d="M16 70 L144 58 L144 64.5 L16 76.5 Z"/>
  <path class="sb-still-rule" d="M16 72.2 L144 60.2 M16 74.4 L144 62.4"/>
  <path class="sb-still-cover" d="M10 22 L138 10 L144 58 L16 70 Z"/>
  <path class="sb-still-deep" d="M10 22 L20 21.1 L26 69.1 L16 70 Z"/>
  <path class="sb-still-band" d="M114 12.3 L120 60.3 L120.8 66.6"/>
  <path class="sb-still-pink" d="M60 66.4 L65 65.9 L65.4 78 L62.8 75.8 L60.5 78.4 Z"/>
  <g transform="translate(76 39) rotate(15.5)">
    <rect class="sb-still-paper" x="16" y="-2.6" width="70" height="5.2" rx="2.6"/>
    <rect class="sb-still-deep" x="0" y="-2.9" width="27" height="5.8" rx="2.9"/>
    <path class="sb-still-band" d="M7 -4.4 H23"/>
    <path class="sb-still-deep" d="M86 -2.3 L96 0 L86 2.3 Z"/>
  </g>
</g>`;
// Teacup: about 112 x 76 units, seen a little from above; a petal on the tea and its ripples.
export const teacup = `<g class="sb-still sb-teacup">
  <ellipse class="sb-still-paper" cx="70" cy="100" rx="56" ry="13"/>
  <path class="sb-still-rule" d="M14 100 Q70 121 126 100"/>
  <ellipse class="sb-still-rule" cx="70" cy="99" rx="31" ry="6.5"/>
  <path class="sb-still-line" d="M103 56 C122 51 125 76 99 80 M102.5 62 C114 60 115 71 100.5 73.5"/>
  <path class="sb-still-paper" d="M34 46 C34 72 48 93 70 93 C92 93 106 72 106 46 Z"/>
  <ellipse class="sb-still-paper" cx="70" cy="46" rx="36" ry="10"/>
  <ellipse class="sb-still-tea" cx="70" cy="47.6" rx="31" ry="7.4"/>
  <g class="sb-still-rule"><ellipse cx="80" cy="47.6" rx="6" ry="1.5"/><ellipse cx="80" cy="47.6" rx="11.5" ry="2.8"/><ellipse cx="80" cy="47.6" rx="17" ry="4.1"/></g>
  <path class="sb-still-pink" d="M0 0 C-0.42 -0.36 -0.5 -0.86 -0.2 -1 L0 -0.86 L0.2 -1 C0.5 -0.86 0.42 -0.36 0 0 Z" transform="translate(80 49.5) rotate(-24) scale(5.2)"/>
</g>`;
export const place = (art, x, y, scale) => `<g transform="translate(${x} ${y}) scale(${scale})">${art}</g>`;
