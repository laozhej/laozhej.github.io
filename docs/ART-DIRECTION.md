# Art direction

This file directs the art of Ema / 樱色档案: what is drawn, painted or typeset inside the layouts that [REFERENCE.md](REFERENCE.md) maps from the reference's `fuyukawa-kagari` theme. It covers the artwork, palette, light, paper and texture, typography, Ema's five poses, sources and licensing, the material still needed, and the completed cleanup of uncleared files. Layout geometry, navigation, motion and interaction belong to REFERENCE.md.

Status: revised on 2026-11-14 on `claude/reference-redesign` for the owner-requested restoration and mobile occlusion fix (section 13), prepared for the existing PR 12. The following rounds 5 and 6 decisions describe the 2026-11-13 baseline. That day the owner confirmed composition B, approved the light direction, canvas, export size, safe regions and removal of the slate once the art arrives, and approved cleanup groups A, B and C with the credits rewording. The cleanup is complete (section 10). Round 6 was a finishing pass the owner asked for: the 月代雪 subtitle, the small-screen layout and the Japanese and English hints (sections 2.3 and 8.7). Nothing here is approved unless it is labelled **Approved**. The 2026-11-14 request supersedes the earlier placeholder-only restriction for exactly five historical images; it does not confirm their source or permission. Future commissioned-art specifications below do not require altering these restored files.

## How to read this file

Every statement carries one of four labels. Dated sections preserve earlier review history; section 13 is the current restoration scope.

| Label | Meaning |
| --- | --- |
| **Approved** | A requirement the owner has stated, in AGENTS.md or in a review round. Changing it needs the owner. |
| **Prototype** | What the uncommitted prototype does today, checked against the code and the build on 2026-11-13. A fact, not a decision. |
| **Proposed** | An art-production specification suggested here. Each one says why it is proposed and what changes if another choice is made. Not approved. |
| **Open** | A decision or licensing check that has not been made. |

## 1. Authority

- **Approved.** AGENTS.md sets the repository rules, approvals and licences. The owner’s 2026-11-14 request explicitly overrides its earlier placeholder-only restriction for the five images in section 13.
- **Approved.** The reference site (Yuimi-chaya, `fuyukawa-kagari`) is the authority for layout and interaction. REFERENCE.md records the mapping and every deviation. The reference's artwork is not ours and is not a study reference.
- **Approved.** This file controls the artwork: what is drawn inside that layout.
- **Proposed.** This file never moves, resizes or re-times anything REFERENCE.md specifies. Where it quotes geometry (the figure frame, the mask, overlaps), the numbers brief the artwork and the stylesheets stay the source. An art idea that needs a layout change goes to REFERENCE.md as a proposed deviation.
- **Open.** The desktop wheel takeover (the identity card pulled up by the wheel, and the covers between scenes) is implemented as in the reference and is pending the owner's review on a real trackpad. It does not affect this brief.

## 2. Composition

### 2.1 Settled

- **Approved.** Ema is the dominant visual of the homepage: a full-height front layer in a viewport-high stage, with the identity text and controls arranged around her. Never a small portrait card, a reduced slot or a wall of cards. On phones she keeps a prominent place in the first screen.
- **Approved.** The five poses switch in place. The theatre card carries the label 艾玛的小剧场 and hint 点击艾玛，翻开下一幕, with equivalent text in all four locales. On touch screens and in the stacked layout it stays visible.
- **Approved** (owner's request, 2026-11-14; supersedes "always visible on desktop"). With a mouse in the side-by-side layout, the card appears only while the pointer is over Ema or over the card's place, or while keyboard focus is on Ema or in the card.
- **Approved.** The scroll cue 向下浏览 is a control separate from pose switching. A tap or click on Ema switches the pose, a swipe across her scrolls the page, and a mouse drag that starts on her is not a tap. The motion control stays recognisable: a pause or play icon, a short label, and the action shown on hover and focus.
- **Approved.** The storyboard backdrop stays as quiet behind Ema as round 2 made it. No other visual style is introduced.

### 2.2 Final composition: B

- **Approved** (2026-11-13). Composition B: 荒泷旭 / Nero is the hero title (the owner's name in the CJK serif, the alias in Gloock), with Ema's hero scale and the quieter storyboard backdrop.
- **Prototype.** The review switch and the wordmark title (variant A) were removed in round 5; the page has one hero title, also without JavaScript. At 1101 px and wider the header shows the "Arataki.br’s Base" wordmark beside the name; at 1100 px and narrower it hides the wordmark's text (and at 760 px and narrower the whole wordmark), so on tablets and phones the wordmark appears only in the browser tab title.
- **Prototype.** Visual weight runs in this order: Ema, the identity title, the theatre card, the storyboard.
- **Prototype** (2026-11-14, owner asked for a better balance against the reference). The stage fills the whole first screen. Ema stands at 53.5 % of the width, the cue centred under her; the identity text and the theatre card share one centre about 6svh above the middle, level with her shoulders.

### 2.3 Checked in rounds 4 and 6

- **Prototype.** In Chrome 157 on 2026-11-13, the label and the hint were rendered, inside the viewport and not covered, in all four locales at 1440×900, 1366×620, 1280×720, 1920×1080 and 2560×1440 (mouse) and at 1180×820, 820×1180, 390×844 and 360×740 (touch). The cue never overlapped the theatre card.
- **Prototype.** The cue's box touches the bottom edge of Ema's tap area by 0 to 3.4 px at most sizes and 10.6 px at 360×740. The cue is stacked above, so a tap there scrolls. A swipe on Ema scrolled the page without changing the pose; a tap, a click and Enter each advanced it; a mouse drag did not.
- **Approved** (round 6). The small-screen issues found in round 4 are resolved without shrinking Ema: where the screen cannot hold everything, the page scrolls naturally.
- **Prototype.** Round 6 fixes, recorded as deviations in REFERENCE.md:
  - Phones held sideways and other short landscape screens (500 px tall or less): Ema and the stage keep their size, so the page scrolls. The theatre card sits at the bottom of the first screen, with its label and hint in view: in the right column from 761 px wide, and under the identity text below that, where it also no longer hangs off the left edge at 667 px. The cue stays at the end of the stage, where scrolling arrives.
  - Phones 480 px wide or narrower: the placeholder slate shows its number and the placeholder note (the theatre card just below already names the pose) and sits right above the card, beside Ema's face rather than over it.
  - Measured in Chrome 157 at 667×375, 740×360, 844×390, 896×414, 932×430, 360×740, 375×667, 390×844, 412×915, 430×932, 1366×620 and 1440×900, all four locales: the label and hint are in the first screen, and the slate is uncovered, clear of the face and on screen. At 1366×620, 1440×900 and 390×844 and wider phones, the theatre card, cue and figure did not move.
- **Approved** (round 6). The Japanese and English hints work for touch and mouse alike, with their meaning kept.
- **Prototype.** The wording: ja エマをタップ・クリックして次のカットへ (was エマをクリックして次のカットへ), en "Tap or click Ema for the next scene" (was "Click Ema for the next scene"). zh-CN 点击艾玛，翻开下一幕 and zh-TW 點一下艾瑪，翻開下一幕 already fit both and are unchanged. The hint is also the accessible name of the tap target on Ema until the first switch, so the two stay identical.

## 3. Visual study references (never deployed)

- **Approved.** K-On!, Violet Evergarden, and the K-On!, Bocchi the Rock! and Frieren manga are references for composition, lighting, typography and panel rhythm only. They are not a licence to embed any official artwork.
- **Approved.** No generative-AI imagery, in any role.
- **Approved.** The reference site's media is never copied, traced or hotlinked, and it is not a study reference.

| Work | Study for | Official pages |
| --- | --- | --- |
| K-On! (TV anime, Kyoto Animation) | Lighting and composition: after-school window light, soft colour, relaxed standing poses, a character close to the camera carrying the frame | TBS: [けいおん！](https://www.tbs.co.jp/anime/k-on/), [けいおん！！](https://www.tbs.co.jp/anime/k-on/k-on_tv/) |
| Violet Evergarden (Kyoto Animation) | Typography and light: cream stock, letter-like hierarchy, gentle light on hair and fabric, restraint | [TV series](https://tv.violet-evergarden.jp/), [film](https://violet-evergarden.jp/) |
| K-On! (manga by かきふらい, Houbunsha) | Panel rhythm: four-panel pacing, gutters, white space, sparing screentone | Houbunsha: [まんがタイムきらら](https://houbunsha.co.jp/magazine/detail.php?p=114089) |
| Bocchi the Rock! (manga by はまじあき, Houbunsha) | Panel rhythm: pacing and graphic emphasis marks, used sparingly | Houbunsha: [まんがタイムきららMAX](https://houbunsha.co.jp/magazine/detail.php?p=115780) |
| Frieren (manga by 山田鐘人 and アベツカサ, Shogakukan) | Panel rhythm and composition: quiet pacing, wide margins, restrained tone | [Shōnen Sunday work page](https://websunday.net/work/708/) |

- **Proposed.** Study these works on their official pages. Their images never enter the repository or `public/`; any study captures stay outside the repository.
- **Proposed.** Learn qualities (light, colour temperature, framing, line economy, panel rhythm), not pictures. Never trace, copy or paint over a frame, key visual, panel, character design, logo or piece of lettering. Characters from these works never appear in the theme's art.
- **Prototype.** Separately from this file, the collection pages show official covers and avatars from some of these works (content with its own records). The Frieren panel that Ema's inner pages used as a faint side backdrop was removed in round 5 (section 10, group B).

## 4. Palette

- **Approved.** The palette is cream and sakura. Text, including text over artwork, meets WCAG AA in both colour modes.
- **Prototype.** The tokens below are in `src/themes/ema/styles/theme.css` and `stage.css`. If this table falls out of date, those files are right.

| Role | Token | Light | Dark |
| --- | --- | --- | --- |
| Page paper | `--blank-paper` | `#fbf7ef` | `#201f28` |
| Card and panel paper | `--ema-card`, `--sb-paper` | `#fffdf9` | `#292832`, `#2a2833` |
| Ink | `--blank-ink` | `#434861` | `#ece9f1` |
| Muted text | `--blank-muted` | `#62667e` | `#b6b3c7` |
| Rules | `--blank-line` | `#e7dece` | `#3e3c4b` |
| Sakura accent (text-size marks, icons, focus) | `--ema-pink` | `#9c4872` | `#f2aec8` |
| Blush fill | `--ema-blush` | `#fbe9ee` | `#3b2c38` |
| Soft pink (underlines, tape, title shadow) | `--ema-pink-soft` | `#efc5d3` | `#7a4c63` |
| Lavender, the second accent | `--ema-lav` | `#62589a` | `#c3b9ec` |
| Lavender wash | `--ema-lav-wash` | `#efebf8` | `#302d45` |

- **Prototype.** Ink is plum-grey, never pure black. Deep rose marks text-size details; pale pinks are fills only. Gold and mint appear only as pale plate tints in the chapter rail. Dark mode uses the same palette in an evening light.
- **Proposed.** The artwork files are the same in both colour modes. The palette reaches Ema through light and line colour (warm plum-brown lines rather than black), never by recolouring her design. Check text contrast again when the final art lands.

## 5. Light

- **Prototype.** On the page, light is drawn in code: a pale glow centred behind the figure (`--ef-glow`), a paper veil behind the identity text on the viewer's left, and sakura and lavender washes.
- **Proposed.** The light in the artwork is warm and everyday, like an afternoon indoors rather than a stage or a sunset. Shadows lean plum or lavender, the shadow side gets a cream bounce, and highlights on hair and fabric stay gentle. No hard rim lights, lens flares, bloom, god rays or cinematic contrast.
- **Approved** (2026-11-13). One soft key light from the viewer's left and slightly above, identical in all five poses. The reasoning and the alternatives considered are kept for the artist:
  - Why: on desktop the identity text and its bright paper veil sit on the viewer's left, so the lit side of Ema and the brightest paper agree. One fixed direction keeps the light from jumping when the poses switch.
  - From the viewer's right instead: Ema's lit side faces the theatre card and her shadow side meets the bright veil. To reconcile them, we would add a warm glow on her right in code (`stage.css`); the veil stays where it is because it keeps the text legible.
  - Frontal or ambient light instead: no conflict with the page at all, but flatter modelling. This is the safest choice if the artist's style is flat.
  - Whatever is chosen, all five poses share it.
- **Proposed.** The artwork has a transparent background and brings no painted background. Its alpha edges are clean on both paper colours (`#fbf7ef` and `#201f28`), with no white matte or halo.
- **Prototype** (2026-11-14). The former placeholder’s soft glow is now a CSS radial gradient behind the images (`.k-frames::before`). The storyboard and paper veil are unchanged; no pixels in the restored files are altered.

## 6. Paper and texture

- **Prototype.** The paper is colour: the cream page and the brighter panel paper. Every Ema page adds a sakura wash, a lavender wash and a faint 22 px dot grid (`theme.css`). `Storyboard.astro` draws the screentone dots, hatching and panel frames. No bitmap texture is loaded.
- **Proposed.** Keep the texture drawn in code. If review asks for a fine grain, draw that in code too (procedural SVG noise).
- **Proposed.** No aged, stained, torn or crumpled paper, no washi fibres and no scanned book pages.
- **Open, resolved as unused.** The one bitmap candidate so far is ambientCG Paper 001:
  - Source: <https://ambientcg.com/view?id=Paper001>, released 2018-01-20, "Technique: Approximation".
  - Licence: <https://docs.ambientcg.com/license/> says all ambientCG assets are under CC0 1.0 Universal, which "applies to the downloadable asset files and the material preview renders".
  - Method: <https://docs.ambientcg.com/creation-methods/> defines "Approximated" as "The material has been approximated from just a color map."
  - Not stated on those three pages: how the colour map itself was made. Compliance with the no-generative-AI rule cannot be established from the source, so the texture stays unused and the code-drawn treatment stays. Reconsider it only if ambientCG documents how Paper 001's colour map was captured.

## 7. Typography

- **Prototype.** Current faces, from `theme.css`, `EmaLayout.astro` and the credits page:

| Use | Face | Notes |
| --- | --- | --- |
| Wordmark, Latin titles, pose numbers, the alias in title B (all of title B in English) | Gloock 400 | SIL OFL 1.1, self-hosted through `@fontsource/gloock`, Latin subset; licence in `public/licenses/gloock-OFL.txt` |
| Headings, navigation labels, pose names, the name in title B (zh-CN, zh-TW, ja), the 旭 monogram | System serif: Songti SC or SimSun (zh-CN and en), Songti TC or PMingLiU (zh-TW), Hiragino Mincho ProN or Yu Mincho (ja); Iowan Old Style first for Latin where installed | |
| Body text and controls | System sans for each locale, 14 px base on Ema pages | |
| Terminal line, small labels | `ui-monospace` | |

- **Approved.** Chinese navigation uses the site's Song (宋体) serif, consistent with the rest of the site.
- **Proposed.** A letter-like hierarchy, as studied in Violet Evergarden: serif headings, generous leading, quiet small labels, numerals such as 01 / 05 in Gloock. No lettering copied from, or imitating, an anime or manga logo.
- **Open.** An optional CJK web serif is not approved and is not added without the owner's go-ahead. If review finds the system serifs too uneven across devices, each locale needs its own coverage:

| Locale | Candidate | Coverage | Licence |
| --- | --- | --- | --- |
| zh-CN | Noto Serif SC | `chinese-simplified` subset (google/fonts `ofl/notoserifsc/METADATA.pb`) | SIL OFL 1.1 |
| zh-CN | Source Han Serif, CN subset (`SourceHanSerifCN`) | Simplified Chinese region subset (adobe-fonts/source-han-serif README) | SIL OFL 1.1; "Source" is a Reserved Font Name |
| zh-TW | Noto Serif TC | `chinese-traditional` subset (`ofl/notoseriftc/METADATA.pb`) | SIL OFL 1.1 |
| zh-TW | Source Han Serif, TW subset (`SourceHanSerifTW`) | 繁體中文—臺灣 region subset (README) | SIL OFL 1.1; "Source" reserved |
| ja | Noto Serif JP, or Source Han Serif JP subset | `japanese` subset | SIL OFL 1.1 |

  - Japanese-only families are not candidates for zh-CN or zh-TW. The google/fonts metadata of Shippori Mincho, Zen Old Mincho and Kiwi Maru lists `japanese`, `latin` and `latin-ext` subsets (plus `cyrillic` for the last two and `greek` for Zen Old Mincho) and no Chinese subset. Simplified characters would fall back to another face, and traditional text would take Japanese glyph shapes.
  - A modified Source Han Serif build cannot keep the name "Source" (its `LICENSE.txt`).
  - If one is adopted: a Song or Ming design, to match the approved preference; self-hosted and subset to the characters the built pages use; licence in `public/licenses/` and an entry on the credits page; nothing loaded from an external font server.

## 8. Ema's five poses: production plan

### 8.1 The poses and their files

- **Approved.** Five poses, switched in place, as one structure with the theatre labels.
- **Prototype.** The keys and labels below were copied from `src/core/i18n/ema-messages.ts` on 2026-11-13 and follow the order in `HomePage.astro` (`smile`, `wave`, `together`, `talk`, `refute`). If they differ, the code is right.
- **Approved** (2026-11-14). Runtime filenames `ema-pose-01.webp` to `ema-pose-05.webp` under `public/themes/ema/assets/`. The pose names and order remain in the i18n keys.

| Runtime file | Key | zh-CN | zh-TW | ja | en |
| --- | --- | --- | --- | --- | --- |
| `ema-pose-01.webp` | `ema.frames.smile` | 微笑 | 微笑 | 微笑み | A smile |
| `ema-pose-02.webp` | `ema.frames.wave` | 挥手 | 揮手 | 手を振って | A little wave |
| `ema-pose-03.webp` | `ema.frames.together` | 小小的期待 | 小小的期待 | 小さな期待 | A little hope |
| `ema-pose-04.webp` | `ema.frames.talk` | 交谈 | 交談 | おしゃべり | A chat |
| `ema-pose-05.webp` | `ema.frames.refute` | 论破！ | 論破！ | 論破！ | Objection! |

### 8.2 What each pose must show

The gestures are those the placeholder blocks out (**Prototype**, `EmaFigure.astro`); carrying them into the final art, and the expressions, are **Proposed**. Positions are in percent of the canvas (section 8.4).

| Pose | Gesture | Expression | Where the defining gesture sits |
| --- | --- | --- | --- |
| 01 微笑 | Relaxed stance; both hands loosely together in front at the waist | Gentle closed-mouth smile, eyes to the viewer | The face defines it; the hands may sit lower, in the body zone |
| 02 挥手 | One arm raised to about head height, open palm waving; the other arm relaxed | Bright open smile, eyes to the viewer | Waving hand inside the critical zone (the placeholder's is near x 25 %, y 12 %) |
| 03 小小的期待 | Hands clasped at the chest | Hopeful and a little shy, eyes bright, perhaps a slight head tilt | Clasped hands near the centre (placeholder x 50 %, y 51 %) |
| 04 交谈 | One forearm raised to the side, open hand at chest height as if explaining; the other arm down | Friendly, mid-sentence | Explaining hand inside the critical zone (x ≤ 85 %); the placeholder's sits at x 85 %, y 48 %, where the slate covers it |
| 05 论破！ | One arm thrust out, pointing up and towards the viewer's right; the other hand on the hip | Confident and determined, as if declaring | Pointing hand inside x ≤ 85 %, foreshortened towards the viewer; the placeholder's arm leaves the canvas at the right |

- **Proposed.** One character, outfit, scale and canvas across all five, so switching changes only the pose. Her design (hair, eyes, outfit) stays as designed. No speech, lettering, sound effects or props in the art: the pose names are page text, and the site never invents dialogue (AGENTS.md). No late-story outfits, states or props (section 9.2, §1).
- **Proposed.** Pose 05 is an original composition. It does not recreate the game's refutation cut-in or any official sprite's pose (section 9.2, §7).

### 8.3 Current status

**Approved** (2026-11-14): restore exactly the five historical images from `76c9da5`, replacing the rendered wireframes and placeholder slates. Source and permission status remain unconfirmed; the owner’s request is not a rights-holder licence.

| Pose | Restored runtime file | Historical file | Dimensions | Source / permission |
| --- | --- | --- | --- | --- |
| 01 | `ema-pose-01.webp` | `ema.webp` | 905 × 2400 | Unconfirmed |
| 02 | `ema-pose-02.webp` | `ema-frame-wave.webp` | 1030 × 2400 | Unconfirmed |
| 03 | `ema-pose-03.webp` | `ema-frame-together.webp` | 1030 × 2400 | Unconfirmed |
| 04 | `ema-pose-04.webp` | `ema-frame-talk.webp` | 1030 × 2400 | Unconfirmed |
| 05 | `ema-pose-05.webp` | `ema-frame-refute.webp` | 1472 × 2048 | Unconfirmed |

All five preserve their historical bytes and alpha. Original source URLs, attribution and import processing are retained as historical records in the manifest, alongside the restoration commit, old path and SHA-256. The remaining production plan concerns possible future artwork, not reprocessing these five files.

### 8.4 Common canvas, scale and safe regions

The 2026-11-14 restoration preserves the existing `520 : 760` stage frame but displays each historical image at its own aspect ratio with `object-fit: contain`, bottom-centred and with the existing bottom fade. It does not resize files to the proposed 1642 × 2400 export, crop, redraw or upscale them. The measurements below are the earlier commissioned-art brief.

**Approved** (2026-11-13): the canvas, export size and safe regions in this section, and removing the placeholder slate once the art arrives. The acceptance checks at the end remain **Proposed**. The measurements were taken in Chrome 157 on 2026-11-13 on the round-4 build; the "If another choice is made" column records what a later change would involve.

| Item | Specification | Why | If another choice is made |
| --- | --- | --- | --- |
| Ratio | 520 : 760 (portrait, about 0.684) | The prototype's figure frame (`stage.css`, `.k-ema`, `aspect-ratio: 520 / 760`) and the placeholder's viewBox use it, so the art fills the frame with no letterboxing or cropping | The frame's `aspect-ratio` changes, which is a layout change for REFERENCE.md, and the safe regions are measured again. Wider (3 : 4) gives an outstretched arm room, but on a 390 px phone the frame grows from 354 to about 388 px, nearly edge to edge. Narrower (1 : 2) cramps the gestures. Art in another ratio inside the current frame either shrinks her (letterboxed) or crops her gestures |
| Size | 1642 × 2400 px | The frame measured 744 CSS px tall at 1440×900, 893 at 1920×1080, 1206 at 2560×1440, 664 at 1180×820, 768 at 820×1180, 518 at 390×844 and 414 at 360×740. At typical pixel densities that is 1488 (2×), 1786 (2×), 2412 (2×), 1328 (2×), 1536 (2×), 1554 (3×) and 1242 (3×) device pixels. 2400 px is the smallest height that is not visibly enlarged on any of them | 1800 px: still sharp on phones, tablets and 2× laptops, enlarged up to 1.34× on 2560×1440-class 2× screens, about 56 % of the pixels. 3200 px: no visible gain on any measured screen, about 1.8× the pixels, and about 28 MB of memory per decoded pose instead of about 16 MB |
| Background | Transparent, sRGB | The figure sits on both paper colours and the code-drawn glow | A painted background would hide the storyboard and need separate light and dark versions |
| Delivery format | WebP with alpha; PNG with alpha is fine and we convert | Current browsers display WebP with alpha, and the earlier sprite exports used it. Converting from PNG is a plain encode, recorded in the manifest | Other formats with alpha need conversion. JPEG has no alpha and cannot be used |
| Framing | Head to mid-thigh: the canvas bottom crosses both thighs | The placeholder is framed this way, and it keeps her face large enough to carry five expressions: roughly a fifth of the frame height, about 100 px on a 390 px phone | A full-length figure in the same frame makes her face roughly a third smaller (about 65 to 70 px on that phone), and her feet would fall in the faded bottom quarter |
| Scale and baseline | The crown of the head at 6 % from the top in all five; the same head height (within 1 %) and the same thigh crop line; the body's centre line at x 50 % (within 2 %) | Switching changes only the pose, never her size or position. 6 % clears the identity text, which reaches 4.5 % into the frame at 360 px wide in English | Landmarks that differ per pose make her jump or resize at every switch |

Safe regions, in percent of the canvas (x from the left, y from the top):

| Zone | Region | What goes there | Why (measured) |
| --- | --- | --- | --- |
| Critical | x 20–85 %, y 6–60 % | The face and the hand that defines each pose (section 8.2) | Clear of the identity text on the left (it reaches 8 % of the frame at 1440×900, 11 % at 2560×1440 and 19 % at 1180×820), the title above it on narrow phones (4.5 %), and the theatre card on phones (from 61 % at 360×740 and 69 % at 390×844) |
| Body | x 0–100 %, y 0–76 % | Torso, sleeves, skirt, hair ends, the resting hands of poses 01 and 05 | Fully visible on desktop; on phones the band y 61–88 % is under the theatre card |
| Fade | y 76–100 % | The figure continues to the bottom edge; nothing that matters | The prototype's mask is opaque to 76 %, 80 % at 86 % and transparent at 100 %. A hard crop line above 76 % would show |
| Outside the canvas | none | Nothing | An image cannot draw outside its box. The placeholder's pose 05 arm (SVG) reaches past the right edge; the final art keeps it inside |

How the two layouts use the canvas:

| | Desktop and landscape tablet | Phone and portrait tablet |
| --- | --- | --- |
| Frame on screen | Whole frame | Whole frame; 60 % on a phone held sideways (844×390) |
| What overlaps it | The identity text at the left edge | The title and diary line at the top (up to 4.5 %); the theatre card across the full width at y 61–88 % (portrait tablet: x 16–84 %, y 78–90 %) |
| Placeholder slate, while it exists | x 62–100 %, y 45–76 % (on short landscape screens since round 6: from x 44 %, at most 170 px wide) | x 59–100 %, y 39–73 % (round 4); since round 6, on phones 480 px wide or narrower, just above the theatre card and right of the face |

- **Approved** (2026-11-13). The placeholder slate goes when the art lands: the theatre card already shows the pose number and name, and the slate's region overlaps pose 04's hand. REFERENCE.md records it.
- **Proposed.** Acceptance checks for the set: stack all five exports at 50 % opacity (crown, chin, shoulders and the thigh line align); view each on both paper colours at 1440×900, 1366×620, 390×844 and 360 px wide, next to the identity text and the theatre card; check the alpha edges for halos; check text contrast over the art.

### 8.5 Runtime exports and editable sources

- **Proposed.** Runtime exports (required): the five files in section 8.1, at the approved canvas (1642 × 2400 px, transparent, WebP or PNG with alpha; section 8.4). This is all the site needs. We may derive smaller copies (for example 1200 and 1800 px tall) for phones by plain resampling, recorded in the manifest; no generative step.
- **Proposed.** Editable sources (optional): layered originals (PSD, CLIP, KRA or similar) at the artist's working size, possibly drawn past the thighs. Useful for later re-exports, for example if the frame ratio changes. Not needed to deploy. If supplied and the licence allows it, they stay outside `public/`, and outside the repository if they are heavy or the licence covers only the exports.

### 8.6 What the owner needs to supply

**Proposed** checklist:

1. **The five final pose exports** (section 8.5).
2. **Source and attribution:** the artist's name or handle exactly as it should be credited, an optional link, the completion date, the tools used, and the artist's statement that the drawings are original (not traced from, or painted over, official art or a study reference).
3. **Permission terms**, two separate things (section 9.1):
   - from the artist, in writing: display on laozhej.github.io; distribution in the public GitHub repository, where files stay in the Git history even after removal; resizing, format conversion and cropping; the credit line; and a declaration that no generative AI was used at any step;
   - for the character: the owner's confirmation that the art keeps to Acacia's fan-work guidelines (section 9.2). The guidelines govern fan works without an individual licence, and Acacia generally does not pre-check works; a formal licence is for uses beyond the guidelines. The open questions in section 9.2, commissions in particular, still apply.
4. **Optional:** the layered originals.

Not needed:

- **Approved.** A new personal portrait or a full-background illustration, as long as the 旭 monogram and the code-drawn storyboard suffice, which they do in the current prototype.
- **Proposed.** A paper texture (section 6) or a web font (section 7).

### 8.7 Earlier placeholder plan and retained avatars

- **Approved, superseded for the five restored files on 2026-11-14.** The earlier requirement for labelled full-scale placeholders no longer applies to the five homepage images in section 13. The composition must still retain Ema’s prominent scale.
- **Historical prototype (2026-11-13; no longer rendered).** `src/themes/ema/components/EmaFigure.astro` draws five blocking figures in code, at the final scale and anchor, each with its pose's gesture. They are marked as stand-ins in the code and are not drawings of the character. Each pose shows a slate with its number, 艾玛 · the pose name and `ema.frames.placeholder` (临时占位 · 立绘待定 / 臨時佔位 · 立繪待定 / 仮置き · 立ち絵は未定 / Temporary placeholder · artwork pending). On phones 480 px wide or narrower the slate keeps its number and the note, since the theatre card just below names the pose (round 6). The figure caption gives screen readers the same note.
- **Prototype.** The owner's avatar is the monogram 旭 in all four locales: on the homepage identity card, on the Profile leaf of the chapter rail (round 4 fixed the English page, which showed "i", the last letter of "Arataki Asahi") and, since round 5, on the About page, where it replaced the 月代ユキ crop. It is exposed as an image named after the owner in each locale (荒泷旭, 荒瀧旭, 荒滝 旭, Arataki Asahi). Round 5 dropped the homepage tooltip 头像占位 · 素材待定, because the monogram is now the avatar rather than a stand-in. `tests/ema-avatar.test.mjs` covers all four locales.
- **Prototype.** On the About pages of all three themes, the favourite characters 樱羽艾玛 and 月代雪 keep their entries but have no portrait; each theme draws an empty frame in its own style (Ema: the blossom on the card's tone; Blank: a hairline circle; Endfield: its hatching). 月代雪's frame stays empty: 旭 is the owner's avatar monogram, not a portrait of her.
- **Approved** (round 6). 月代雪's subtitle no longer calls her the current avatar character. It now reads 以前的头像角色 / 以前的頭像角色 / 以前のアイコンのキャラクター / Former avatar character (it was 现在的头像角色 / 現在的頭像角色 / いまのアイコンのキャラクター / The character on my avatar). Only Ema's About page shows these subtitles; Blank's and Endfield's About pages list the names alone.
- **Approved** (2026-11-14). All five historical images are restored together; no other removed media is included. This does not establish a cleared set for publication.

## 9. Sources and licensing

### 9.1 Two separate permissions

- **Proposed.** A fan illustration of Ema involves two sets of rights, and neither covers the other:
  1. **The artist's copyright in the drawing.** Only the artist can license it, and the site needs that licence in writing (section 8.6).
  2. **The rights in the character** (Ema Sakuraba, © Acacia). Acacia's published fan-work guidelines set conditions for fan works; they are not a licence (section 9.2).
- **Proposed.** A licence from the artist does not clear the character, and following Acacia's guidelines grants no rights in the artist's drawing. The site needs both.

### 9.2 Acacia's fan-work guidelines

Source: <https://manosaba.com/guidelines>, 「魔法少女ノ魔女裁判」配信・二次創作ガイドライン, by Acacia and 合同会社Re,AER, "最終更新日：2026年10月21日". The page renders with JavaScript; it was read in Chrome on 2026-11-13, and a dated copy of its text is kept with the review records outside the repository. The excerpts below are verbatim; the English notes are ours, not an official translation.

| § | Wording (excerpt) | What it means here |
| --- | --- | --- |
| 1 | 「特に、重大な真相、犯人、物語の結末、キャラクターの生死等を、サムネイル・タイトル・投稿の冒頭など、ユーザーが回避しにくい場所へ直接掲載することは禁止します。」 | The homepage hero is a place visitors cannot avoid: no late-story outfits, states or props (**Proposed**, a conservative reading) |
| 6 | 「本作の公式イラスト、キャラクターデザイン、ゲーム内画像・映像・音声・楽曲・シナリオ・テキスト等を、生成AI・機械学習モデルの学習データとして使用または提供することは禁止します。」「生成AIを利用して制作した作品を投稿する場合は、「AI利用」と明記してください。」 | The guidelines ask for AI-made works to be labelled. Our rule is stricter: no generative AI at all (**Approved**) |
| 7 | 「ゲーム内の元データ（画像・音声・テキスト等）をデータ解析などにより抽出し、再利用・再配布する行為は禁止します。」「本作の公式イラスト、立ち絵、背景、ロゴ、UI、映像、音声、楽曲、シナリオ等を、そのまま二次創作物の素材として使用したり、転載・再公開したりすることは禁止します。」「トレース、加工・加筆、色変更等を行った場合でも、公式素材を複製したもの、または実質的に公式素材の代替となるものの利用は禁止します。」 | Official standing sprites, cut-ins and UI are not used, edited or recoloured. The fan art must not be a copy of an official sprite, nor a substitute for one |
| 8 | 「本ガイドラインのうち、二次創作物の頒布・販売に関するルールは、個人規模のファン活動・同人活動を対象としています。」 | The rules for distributing and selling fan works address individual-scale fan activity |
| 10 | 「本ガイドラインの範囲内で制作・公開された作品であっても、Acaciaおよび合同会社Re,AERによる公認・監修・推奨を意味するものではありません。」「個別の作品について、ガイドラインに抵触するか、公開してよいか、公認できるか等の事前確認には、原則として対応しておりません。」「正式な商業ライセンスをご希望の場合は、末尾の「お問い合わせ窓口」をご確認のうえご連絡ください。お問い合わせいただいた場合でも、許諾をお約束するものではありません。」 | Fan works within the guidelines are not endorsed; Acacia generally does not pre-check individual works; a formal licence is by enquiry, with no promise of approval. Our response (**Proposed**): credit the art as unofficial fan art and never present it as official |
| 11 | 「本ガイドラインは、公式または各権利者が保有する著作権その他の権利を放棄するものではありません。」「本ガイドラインの内容にかかわらず、公式との誤認、第三者の権利侵害、作品または運営への著しい不利益等が確認された場合には、投稿・販売・公開内容の削除、修正、公開停止等をお願いする場合があります。」「本ガイドラインは予告なく変更される場合があります。変更後は最新のガイドラインが適用されます。」 | The guidelines are not a licence and waive no rights. Removal can be requested, and the text can change without notice. Our response (**Proposed**): re-read it before deploying and after any update |

**Open.** What remains uncertain:

- **Commissions.** The guidelines do not mention commissioning a fan illustration (有償依頼) for display on a personal site. Section 8 speaks of distributing and selling fan works at individual scale; section 9 covers fan games and apps. Whether a paid commission counts as individual-scale fan activity is not stated. The page directs questions about paid distribution to its contact desk, and section 10 says individual works are generally not pre-checked.
- **Substitution.** Section 7 forbids anything that "substantially substitutes" for official material but sets no threshold. A five-pose standing-sprite set of Ema in her official outfit could be read that way even if drawn from scratch. Mitigations (**Proposed**): her design stays recognisable, but the composition, poses and rendering are the artist's own, not those of the official sprites; no game UI framing such as text boxes or cut-in layouts; credited as unofficial fan art. These reduce the risk; they do not settle it.
- **The hero as an unavoidable place.** Section 1 names thumbnails, titles and the start of a post. Treating the homepage hero the same way is our reading, not the text.
- **Change and removal.** The text can change without notice, and the rights holders can ask for removal (section 11). Any deployment depends on the version read at that time.
- **Context.** As checked on 2026-11-13, the site's source and build carry no advertising or donation links. Whether that matters for the guidelines is not stated.

### 9.3 Other third-party material

"Unconfirmed" below means no licence has been established. It is not a finding that use is prohibited; each item needs a licence check or the owner's decision.

| Material | Status | Basis |
| --- | --- | --- |
| Five historical Ema images (recorded as sprites and a cut-in) | Restored unchanged under new names on 2026-11-14 | **Approved restoration only.** The owner explicitly overrode the placeholder-only restriction for these five files. Historical attribution is retained; source and permission remain unconfirmed |
| `ema-avatar.webp`, `yuki.webp` (crops of 桜羽エマ and 月代ユキ) | Removed in round 5 (group C) | Their source was never recorded ("unverified, supplied by the owner"). Had they been crops of official art, §7 would apply; had they been fan art, the artist's permission would be needed |
| Frieren panels (`manga-memory.webp`, `manga-writing.webp`, `manga-about.webp`) | Removed in round 5 (groups A and B) | The manifest recorded the 2020 official public sample as the source, and no permission for decorative republication |
| `shiroha.webp` (Summer Pockets key visual), the theme's copy of `alice.webp` (久遠寺有珠, TYPE-MOON) | Removed in round 5 (groups B and A) | Recorded with sources; no permission recorded |
| Collection covers and avatars (`public/characters/`, `public/games/`, `public/animes/`) | Unconfirmed; content with their own `ASSETS.json` | Outside this file. Never reused as theme art, backdrop or texture (**Proposed**) |
| The reference site's media | Never used | **Approved** (excluded from its MIT grant) |
| Generative-AI images | Never used, in any role | **Approved** |

### 9.4 In use and cleared

| Asset | Licence | Status |
| --- | --- | --- |
| Art drawn in code in this repository: the storyboard, header blossom, stamps, scroll track, washes, the 旭 monogram | Ours; part of the site's code | In use |
| Gloock | SIL OFL 1.1 | In use |
| Tabler Icons | MIT | In use |

### 9.5 Proposed conditions for future commissioned artwork

**Proposed.** All of the following hold, each recorded in writing:

1. The artist's written licence (section 8.6), or the owner drew the art.
2. The artist's declaration that no generative AI was used at any step (sketch, colour, upscaling, fill, background), and nothing was traced from or painted over official art or a study reference.
3. The art keeps to Acacia's guidelines as read at that time (section 9.2): no official material, not presented as official, no spoilers in the hero, not a substitute for official sprites.
4. Credits as unofficial fan art with the artist's name: in the manifest, in `THIRD_PARTY_ASSETS.md` when the artist is not the owner, and on the credits page.
5. The owner approves the set.

### 9.6 Intake and records

- **Proposed.** Before an image enters `public/`, record it in `public/themes/ema/ASSETS.json` with the fields that file already uses, plus `pose_key`:

  ```json
  {
    "id": "ema-pose-01",
    "title": "Ema Sakuraba, pose 01 (smile), unofficial fan art",
    "file": "art/ema-pose-01.webp",
    "placement": "home-stage-pose",
    "pose_key": "ema.frames.smile",
    "source_page": null,
    "attribution": "<artist>, commissioned by the site owner",
    "rights_notice": "Character © Acacia; artwork © <artist>",
    "rights_reference": "https://manosaba.com/guidelines",
    "original_dimensions": [0, 0],
    "dimensions": [1642, 2400],
    "has_alpha": true,
    "format": "image/webp",
    "processing": "<exact steps>",
    "generative_ai_used": false,
    "permission_status": "<artist's written licence: date and scope>",
    "original_sha256": "<sha256 of the delivered file>",
    "sha256": "<sha256>",
    "bytes": 0,
    "verified_on": "<date>"
  }
  ```

- **Proposed.** A folder `public/themes/ema/art/` holds only cleared files, so cleared and uncleared art never share a folder. It does not exist yet.
- **Prototype.** `npm run image:import` is the general importer: it creates `public/images/imported/` on first use and records imports in `src/core/data/imported-images.json` ([IMAGE_IMPORT.md](IMAGE_IMPORT.md)). Theme art stays in the theme folder and its manifest.
- **Prototype** (2026-11-14). `THIRD_PARTY_ASSETS.md` and `public/themes/ema/ASSETS.json` now record exactly the five restored images, preserving historical attribution and explicitly unconfirmed source/permission status. The other retired placements remain absent.
- **Prototype** (2026-11-14). `tests/assets.test.mjs` also checks the exact five filenames, fixed SHA-256 values from `76c9da5`, original dimensions, alpha, restoration paths and unconfirmed source/permission records. It continues to fail if any raster image in `public/` lacks a manifest entry or if an entry/source path points at a missing file. The three `B.` site icons are the only exception (typeset, documented in `assets/branding/README.md`).

## 10. Cleanup (approved and done in round 5)

This section records the 2026-11-13 cleanup. Only its five Ema pose removals and placeholder credit wording are superseded by the 2026-11-14 restoration (section 13); every other removal remains in effect.

- **Approved** (2026-11-13). Cleanup groups A, B and C as proposed in round 4, and the credits rewording. Git history is never purged or force-pushed: the removed files stop deploying but stay in the public history.
- **Prototype.** At the round-5 review on `claude/reference-redesign`, 17 files were removed, 14 from `public/` and 3 from `showcase/`, 10.5 MB in all. Before removal each file was confirmed byte-identical to `HEAD` and unreferenced by the source, so any of them can be restored from Git. At that point `public/themes/ema/assets/` no longer existed; section 13 restores only its five pose files.

### A. Unreferenced public files (no page changed)

| Removed | Contents |
| --- | --- |
| `public/themes/ema/assets/ema.webp`, `ema-frame-wave.webp`, `ema-frame-together.webp`, `ema-frame-talk.webp`, `ema-frame-refute.webp` | Official sprites (poses 01–04) and the refutation cut-in (pose 05), © Acacia |
| `public/themes/ema/assets/manga-writing.webp`, `manga-about.webp` | Frieren panels |
| `public/themes/ema/assets/alice.webp` | 久遠寺有珠 (TYPE-MOON); the character list uses a different file, `public/characters/alice.webp` |

- Their manifest entries went with them.
- At round 5, credits (12 pages, in all three themes): `media.sources` said the Ema theme uses no official sprites, manga panels or other third-party character images, that Ema on the homepage is a labelled placeholder drawn in code until her artwork is settled, and that the avatar is the monogram 旭. `media.alice` was deleted.

### B. Ema-only inner-page artwork and showcase screenshots

| Removed | Replacement |
| --- | --- |
| `public/themes/ema/assets/manga-memory.webp` (Frieren panel, the side backdrop of Ema's inner pages at 1240 px and wider) | None: the `.ema-backdrop` element and its rules are gone; the code-drawn washes and dot grid stay. `media.manga` and the Shogakukan sample link left the credits |
| `public/themes/ema/assets/shiroha.webp` (Summer Pockets key visual on the About letter card) | A text-only letter card in one column |
| `showcase/gallery/ema-desktop.png`, `ema-dark.png`, `ema-mobile.png` (the old Ema homepage) | Taken out of the READMEs and the gallery manifest; the case study's top image is now the Blank capture. The gallery says the Ema shots are retaken once the redesign's art is settled |

- These were done as small removals now, not as part of the inner-page rebuild, which has not started.

### C. Shared avatars and project screenshots (also Blank and Endfield)

| Removed | Replacement |
| --- | --- |
| `public/themes/ema/assets/yuki.webp` (crop of 月代ユキ: the owner's avatar on Ema's About page, and a favourite's portrait) | The owner's avatar is the 旭 monogram in Ema's style. The unused `profileIdentity.avatar` field went. The favourite 月代雪 keeps its entry, with an empty frame |
| `public/themes/ema/assets/ema-avatar.webp` (crop of 桜羽エマ, a favourite's portrait) | The favourite 樱羽艾玛 keeps its entry, with an empty frame (`portrait: null`) |
| `public/projects/personal-site-preview.jpg`, `personal-site-preview-dark.jpg` (the old Ema homepage with the official sprite and Frieren panels) | `public/projects/gallery/blank-desktop.png` and `blank-dark.png`; the alt text reuses those captures' existing descriptions in each locale |

- Pages changed: the About pages (two empty frames instead of portraits) and Projects pages (the thumbnail) of all three themes, four locales each.
- Credits: `media.rights` now names the remaining favourite-character portraits and anime covers and sits before their manifest links. The link to the Ema manifest was removed at round 5, when that manifest had no entries.
- **Open.** Recapture the project screenshot and the showcase's Ema shots from the redesign once the art is settled.

## 11. Blank and Endfield

- **Approved.** Blank stays minimal: achromatic and typography-led, with no illustration, texture, sakura colour or manga motif. Its layout is in REFERENCE.md; nothing else in this file applies to it.
- **Approved.** Endfield keeps its independent industrial art and takes nothing from this file. Its built pages are compared before and after any shared change.
- **Prototype.** Ema's art and tokens are scoped to Ema (`html[data-theme="ema"]`, `#ema-stage`). Round 5 changed Blank and Endfield only where the approved cleanup required: their About pages (two empty frames instead of portraits; Endfield draws its hatching in them), Projects pages (the thumbnail) and Credits pages (the 06 / EMA wording). Their other pages differ only in the renamed shared stylesheet; in Chrome 157 their computed styles were identical on every element and pseudo-element in 128 of 128 page and mode combinations (32 pages; light and dark; 1440 × 900 and 390 × 844).
- **Prototype.** Round 6 changed one sentence on the English Credits page of all three themes (`/en/credits/`, `/en/themes/ema/credits/`, `/en/themes/endfield/credits/`): `media.sources` now ends "and the avatar is the monogram 旭" instead of "the single character 旭", so 旭 cannot be read as a fictional character. The zh-CN, zh-TW and ja credits were unchanged, and every other Blank and Endfield page was byte-identical to round 5, including their About pages, which list favourite characters without subtitles.

## 12. Decision register

**Approved** (owner requirements this file builds on):

- Ema is the dominant homepage hero; never a card, slot or card wall; prominent on phones.
- Five poses with 艾玛的小剧场 and 点击艾玛，翻开下一幕, visible on desktop and phone in all four locales.
- 向下浏览 separate from pose switching; tap versus drag; a recognisable motion control; the quieter storyboard; no new visual style.
- The reference site governs layout and interaction; this file governs the artwork.
- Cream and sakura palette; WCAG AA in both modes; Chinese navigation in the site's Song serif.
- No generative-AI images or reference media; sources and licences recorded before any illustration is used.
- Approved on 2026-11-14: restore only the five Ema images from `76c9da5` unchanged, overriding the earlier official-sprite and placeholder-only restrictions for this set. Sources and permissions remain unconfirmed. Preserve B composition, background, four-locale theatre copy and interactions.
- The 旭 monogram is the owner's avatar in every locale, and the avatar's accessible name identifies the owner. No new portrait or background illustration is required while the monogram and the code-drawn backdrop suffice.
- Study references for composition, lighting, typography and panel rhythm only.
- Optional fonts must cover zh-CN and zh-TW; textures without established no-AI provenance stay unused.
- Private links and personal records stay out of this public repository.
- Cleanup only with explicit approval; no history purge or force-push.
- Blank stays minimal; Endfield stays independent, changed only where an approved step requires it.
- Approved on 2026-11-13: composition B (section 2.2); light from the viewer's left (section 5); the canvas (520 : 760, 1642 × 2400 px, transparent, head-to-thigh framing, the landmarks) and the safe regions (section 8.4); removing the slate when the art lands (section 8.4); cleanup groups A, B and C and the credits rewording (section 10, complete).
- Asked for in round 6 (done): 月代雪's subtitle as former avatar character, her frame left empty (section 8.7); the small-screen fixes, with natural scrolling instead of shrinking (section 2.3); Japanese and English hints that suit touch and mouse (section 2.3).

**Proposed** (awaiting the owner's review):

- Derived sizes and optional sources for future commissioned artwork (section 8.5); no derived files are made for this restoration.
- The brief for each pose (section 8.2), the acceptance checks (section 8.4) and the supply checklist (section 8.6).
- Texture drawn in code; the conditions for a CJK web serif (sections 6 and 7).
- The `art/` folder and the manifest template (section 9.6).

**Open:**

- The desktop wheel takeover, pending a real-trackpad review.
- The artist, the five drawings and the artist's licence.
- The uncertainties in Acacia's guidelines (section 9.2).
- Recapturing the project screenshot and the showcase's Ema shots once the art is settled (section 10).

## 13. Owner-requested restoration (2026-11-14)

- **Approved.** Use the existing `worktrees/reference-redesign` checkout, restoring only the five blobs from `76c9da5690e89a7816bb4b44eefacbcc87521446` listed in section 8.3. The initial restoration was kept uncommitted. The subsequent owner request authorises committing this restoration and its mobile occlusion fix, normal pushing to `claude/reference-redesign`, and updating existing PR 12; no new PR, merge or deployment. The original `website/` checkout and its 15 uncommitted files remain untouched.
- **Approved.** The original bytes, dimensions and alpha remain unchanged. No re-encoding, redrawing, upscaling or generative AI. This overrides the earlier placeholder-only constraints for exactly these files; source and permission remain unconfirmed, and no permission is inferred from the owner’s request or matching hashes.
- **Prototype.** The homepage reads each image’s path and intrinsic dimensions from the manifest. The existing B frame and background remain; each image is contained at its own aspect ratio, bottom-centred, with the existing bottom fade. The wireframes and placeholder slates are no longer rendered. The first pose loads immediately; other poses load on request and switch only after decoding. The existing generation guard, failed-load retry, tap/drag distinction, keyboard controls, reduced motion and pause behaviour are retained.
- **Prototype.** Shared `media.sources` corrects only the Ema provenance paragraph in all four languages. Because credits are shared, that factual paragraph also changes on Blank and Endfield credits pages; their theme components, layouts and interactions are not modified. The theatre’s four-language wording is unchanged.
- **Approved.** The removed manga, key visual, other character art, avatar crops, old project previews and old showcase captures stay removed. New review screenshots are taken from the local production build outside tracked source; they are not the removed gallery files.
- **Verification.** Compare every restored file directly with its historical Git blob and the fixed hash in the manifest; check dimensions and alpha; run Node 24 tests, build and `showcase:check`; exercise all five images across desktop/phone, four languages, light/dark, reduced motion, keyboard and touch. Hash the original checkout’s 15 modified files before and after. Save actual browser captures and detailed results in the workspace review output.

### Mobile occlusion follow-up

- **Approved** (2026-11-14). Fix the legs reappearing below the theatre card in the stacked mobile layout, checking all five poses in light and dark mode before the authorised commit and push to PR 12.
- **Prototype.** The image box, scale, intrinsic dimensions and original bytes remain unchanged. When the visible theatre crosses Ema, a mask on `.k-frames` fades the entire figure layer behind the card and a clip excludes the invisible tap area. Its endpoint shares the theatre’s bottom offset (64px on phones, 76px on portrait tablets), with 16px reserved for parallax. The storyboard is not painted over. Short layouts with the card beside Ema, desktop composition and no-JavaScript rendering retain their existing appearance.
