# Art direction

This file directs the art of Ema / 樱色档案: what is drawn, painted or typeset inside the layouts that [REFERENCE.md](REFERENCE.md) maps from the reference's `fuyukawa-kagari` theme. It covers the artwork, palette, light, paper and texture, typography, Ema's five poses, sources and licensing, the material still needed, and the completed cleanup of uncleared files. Layout geometry, navigation, motion and interaction belong to REFERENCE.md.

Status: revised on 2026-11-14 on `claude/ema-art-motifs` for the owner's art plan (section 14); the owner approved committing, merging and deploying it the same day. The P2 pilot (section 14.5) followed on `claude/ema-inner-pilot`; the owner kept it as final and froze it the same day, and accepted it on 2026-11-15. The article-page pilot (section 14.6) followed on 2026-11-15 on `claude/ema-article-pilot`; the owner approved its design the same day and authorised committing it, its pull request (PR 18) and the merge into `main`. The Works pilot (section 14.7) followed on 2026-11-15 on `claude/ema-works-pilot`; the owner visually accepted its layout the same day and approved committing it. PR 12 (the redesign, the restoration and the mobile occlusion fix of section 13), PR 13 (full-screen stage, hover-only theatre card) and PR 14 (next pose fetched ahead) are merged into `main` and deployed. The earlier revision for section 13 was made on `claude/reference-redesign`. The following rounds 5 and 6 decisions describe the 2026-11-13 baseline. That day the owner confirmed composition B, approved the light direction, canvas, export size, safe regions and removal of the slate once the art arrives, and approved cleanup groups A, B and C with the credits rewording. The cleanup is complete (section 10). Round 6 was a finishing pass the owner asked for: the 月代雪 subtitle, the small-screen layout and the Japanese and English hints (sections 2.3 and 8.7). Nothing here is approved unless it is labelled **Approved**. The 2026-11-14 request supersedes the earlier placeholder-only restriction for exactly five historical images; it does not confirm their source or permission. Future commissioned-art specifications below do not require altering these restored files.

## How to read this file

Every statement carries one of four labels. Dated sections preserve earlier review history; section 13 is the current restoration scope.

| Label | Meaning |
| --- | --- |
| **Approved** | A requirement the owner has stated, in AGENTS.md or in a review round. Changing it needs the owner. |
| **Prototype** | What the uncommitted prototype does today, checked against the code and the build on 2026-11-13. A fact, not a decision. |
| **Proposed** | An art-production specification suggested here. Each one says why it is proposed and what changes if another choice is made. Not approved. |
| **Open** | A decision or licensing check that has not been made. |
| **Superseded** | An earlier statement replaced by a later owner decision. Kept for the record; no longer in force. |

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
- **Prototype** (2026-11-14, section 14). The theatre card is anchored by its top edge at the position the simplified-Chinese card had, so longer hints and pose names (Japanese, English, 小小的期待) make it grow downwards instead of moving its top towards the notebook, and its top no longer shifts between poses.

### 2.3 Checked in rounds 4 and 6

- **Prototype.** In Chrome 157 on 2026-11-13, the label and the hint were rendered, inside the viewport and not covered, in all four locales at 1440×900, 1366×620, 1280×720, 1920×1080 and 2560×1440 (mouse) and at 1180×820, 820×1180, 390×844 and 360×740 (touch). The cue never overlapped the theatre card.
- **Prototype.** The cue's box touches the bottom edge of Ema's tap area by 0 to 3.4 px at most sizes and 10.6 px at 360×740. The cue is stacked above, so a tap there scrolls. A swipe on Ema scrolled the page without changing the pose; a tap, a click and Enter each advanced it; a mouse drag did not.
- **Approved** (round 6). The small-screen issues found in round 4 are resolved without shrinking Ema: where the screen cannot hold everything, the page scrolls naturally.
- **Prototype.** Round 6 fixes, recorded as deviations in REFERENCE.md:
  - Phones held sideways and other short landscape screens (500 px tall or less): Ema and the stage keep their size, so the page scrolls. The theatre card sits at the bottom of the first screen, with its label and hint in view: in the right column from 761 px wide, and under the identity text below that, where it also no longer hangs off the left edge at 667 px. The cue stays at the end of the stage, where scrolling arrives.
  - **Superseded** (2026-11-14: the slate is no longer rendered since the restoration, section 13). Phones 480 px wide or narrower: the placeholder slate shows its number and the placeholder note (the theatre card just below already names the pose) and sits right above the card, beside Ema's face rather than over it.
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
- **Prototype** (2026-11-14, section 14). The still life has no colours of its own: its lines and fills are mixed from `--blank-ink`, `--blank-muted`, the panel paper and `--ema-pink-soft` (`--sb-still-*` in `stage.css`), so dark mode follows the same rules. It adds no gold or mint. `tests/ema-storyboard.test.mjs` fails if a literal colour is added to those tokens.
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
- **Prototype** (2026-11-14, section 14). The restored images are lit almost frontally (flat cel shading), so a page light from the viewer's upper left, as approved above, does not contradict them. The window light in section 14 falls from that direction.

## 6. Paper and texture

- **Prototype.** The paper is colour: the cream page and the brighter panel paper. Every Ema page adds a sakura wash, a lavender wash and a faint 22 px dot grid (`theme.css`). `Storyboard.astro` draws the screentone dots, hatching and panel frames. No bitmap texture is loaded.
- **Proposed.** Keep the texture drawn in code. If review asks for a fine grain, draw that in code too (procedural SVG noise).
- **Proposed.** No aged, stained, torn or crumpled paper, no washi fibres and no scanned book pages.
- **Prototype** (2026-11-14, section 14). No paper grain was added. The owner's plan makes it optional ("没有纸纹也不算缺项"); if it is wanted later, procedural noise in code is the route, since the one bitmap candidate below has no established no-AI provenance.
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

**Superseded** (owner's art plan, 2026-11-14): no new pose art is planned; the five restored images are the main art (section 14). The briefs below are kept for the record. The gestures are those the placeholder blocked out (`EmaFigure.astro`, no longer rendered); positions are in percent of the canvas (section 8.4).

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

**Approved** (2026-11-13): the canvas, export size and safe regions in this section, and removing the placeholder slate once the art arrives. The acceptance checks at the end remain **Proposed**.

**Superseded** (owner's art plan, 2026-11-14): the 1642 × 2400 canvas, the export size, the framing and landmark rules and the acceptance checks for a new set are no longer requirements. The restored images keep their own sizes (905 × 2400, 1030 × 2400 and 1472 × 2048) inside the 520 : 760 frame with `object-fit: contain`, and are never resampled. Any future commission would need the owner's fresh approval. The slate removal is done (section 13). The measurements were taken in Chrome 157 on 2026-11-13 on the round-4 build; the "If another choice is made" column records what a later change would involve.

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

**Superseded** (owner's art plan, 2026-11-14: "主视觉：零件新图", no new main art). Kept for the record.

- **Proposed.** Runtime exports (required): the five files in section 8.1, at the approved canvas (1642 × 2400 px, transparent, WebP or PNG with alpha; section 8.4). This is all the site needs. We may derive smaller copies (for example 1200 and 1800 px tall) for phones by plain resampling, recorded in the manifest; no generative step.
- **Proposed.** Editable sources (optional): layered originals (PSD, CLIP, KRA or similar) at the artist's working size, possibly drawn past the thighs. Useful for later re-exports, for example if the frame ratio changes. Not needed to deploy. If supplied and the licence allows it, they stay outside `public/`, and outside the repository if they are heavy or the licence covers only the exports.

### 8.6 What the owner needs to supply

**Superseded** (owner's art plan, 2026-11-14): nothing needs to be supplied for the main art; the still life is drawn in code (section 14). The earlier **Proposed** checklist:

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
| Art drawn in code in this repository: the storyboard (including the notebook and teacup still life since 2026-11-14), the window light, header blossom, stamps, scroll track, washes, the 旭 monogram | Ours; part of the site's code | In use |
| Gloock | SIL OFL 1.1 | In use |
| Tabler Icons | MIT | In use |

### 9.5 Proposed conditions for future commissioned artwork

No commission is planned (owner's art plan, 2026-11-14, section 14). These conditions would matter only if one were ever made.

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

- **Proposed.** A folder `public/themes/ema/art/` holds only cleared files, so cleared and uncleared art never share a folder. It does not exist yet. The still life of section 14 is inline SVG in `Storyboard.astro`, not a file, so it needs neither the folder nor a manifest entry.
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
- Five poses with 艾玛的小剧场 and 点击艾玛，翻开下一幕 in all four locales: always visible on touch screens and in the stacked layout; with a mouse on the side-by-side stage, shown while the pointer is over Ema or the card's place, or while keyboard focus is there (owner's request, 2026-11-14).
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
- Approved on 2026-11-14 (section 14): the homepage still life (notebook, teacup) and the window light as built, none in the stacked layout; no filter on Ema's images in any state; still-life lines at ink 26 %; committing, merging and deploying them.
- Approved on 2026-11-14 (section 14.5): the Journal header strip exactly as in the P2 review boards 01–04, its style frozen (no further size or tone changes); it is not extended to About, Works or Games.
- Approved on 2026-11-15 (section 14.6): the restrained decorative pilot on Ema's article pages only (a bookmark ribbon beside the title, a fine rule with two or three petals after the body, a low-contrast screentone corner in the outer margin on desktop) as built, its style frozen (no further size, colour or spacing changes); phones keep the ribbon and the petals, the corner stays desktop-only; the homepage storyboard's own screentone copy is not merged in this round. Committing, the pull request (PR 18) and merging it into `main` were authorised the same day.
- Approved on 2026-11-15 (section 14.7): for the Works pilot, Works only with Games unchanged; the six existing captures with their actual capture date, no capture recaptured, edited or added; the contact row visible and unchanged in dark mode; 项目方向 folded into the project entry and the duplicate index count removed; captions from recorded metadata only; no Ema capture in this round. The owner visually accepted the layout as built the same day and approved committing it.
- Blank stays minimal; Endfield stays independent, changed only where an approved step requires it.
- Approved on 2026-11-13: composition B (section 2.2); light from the viewer's left (section 5); the canvas (520 : 760, 1642 × 2400 px, transparent, head-to-thigh framing, the landmarks) and the safe regions (section 8.4), **superseded** on 2026-11-14 by the owner's art plan (section 14); removing the slate when the art lands (section 8.4, done); cleanup groups A, B and C and the credits rewording (section 10, complete).
- Asked for in round 6 (done): 月代雪's subtitle as former avatar character, her frame left empty (section 8.7); the small-screen fixes, with natural scrolling instead of shrinking (section 2.3); Japanese and English hints that suit touch and mouse (section 2.3).

**Proposed** (awaiting the owner's review):

- The rest of the owner's art plan of 2026-11-14: final captures (P3), not started.
- **Superseded** on 2026-11-14 (section 14): derived sizes and optional sources for future commissioned artwork (section 8.5); the brief for each pose (section 8.2), the acceptance checks (section 8.4) and the supply checklist (section 8.6).
- Texture drawn in code; the conditions for a CJK web serif (sections 6 and 7).
- The `art/` folder and the manifest template (section 9.6).

**Open:**

- The desktop wheel takeover, pending a real-trackpad review.
- **Superseded** on 2026-11-14 (section 14): the artist, the five drawings and the artist's licence. No new main art is planned.
- The uncertainties in Acacia's guidelines (section 9.2).
- Recapturing the project screenshot and the showcase's Ema shots once the art is settled (section 10).
## 13. Owner-requested restoration (2026-11-14)

- **Approved.** Use the existing `worktrees/reference-redesign` checkout, restoring only the five blobs from `76c9da5690e89a7816bb4b44eefacbcc87521446` listed in section 8.3. The initial restoration was kept uncommitted. The subsequent owner request authorises committing this restoration and its mobile occlusion fix, normal pushing to `claude/reference-redesign`, and updating existing PR 12; no new PR, merge or deployment. The original `website/` checkout and its 15 uncommitted files remain untouched.
- **Approved.** The original bytes, dimensions and alpha remain unchanged. No re-encoding, redrawing, upscaling or generative AI. This overrides the earlier placeholder-only constraints for exactly these files; source and permission remain unconfirmed, and no permission is inferred from the owner’s request or matching hashes.
- **Prototype.** The homepage reads each image’s path and intrinsic dimensions from the manifest. The existing B frame and background remain; each image is contained at its own aspect ratio, bottom-centred, with the existing bottom fade. The wireframes and placeholder slates are no longer rendered. The first pose loads immediately and the others switch only after decoding. Since PR 14 (2026-11-14) the pose a click would show next is fetched ahead once the page is idle and after every change; with Save-Data or a 2G connection only when the pointer or keyboard focus reaches Ema or the theatre card. The existing generation guard, failed-load retry, tap/drag distinction, keyboard controls, reduced motion and pause behaviour are retained.
- **Prototype.** Shared `media.sources` corrects only the Ema provenance paragraph in all four languages. Because credits are shared, that factual paragraph also changes on Blank and Endfield credits pages; their theme components, layouts and interactions are not modified. The theatre’s four-language wording is unchanged.
- **Approved.** The removed manga, key visual, other character art, avatar crops, old project previews and old showcase captures stay removed. New review screenshots are taken from the local production build outside tracked source; they are not the removed gallery files.
- **Verification.** Compare every restored file directly with its historical Git blob and the fixed hash in the manifest; check dimensions and alpha; run Node 24 tests, build and `showcase:check`; exercise all five images across desktop/phone, four languages, light/dark, reduced motion, keyboard and touch. Hash the original checkout’s 15 modified files before and after. Save actual browser captures and detailed results in the workspace review output.

### Mobile occlusion follow-up

- **Approved** (2026-11-14). Fix the legs reappearing below the theatre card in the stacked mobile layout, checking all five poses in light and dark mode before the authorised commit and push to PR 12.
- **Prototype.** The image box, scale, intrinsic dimensions and original bytes remain unchanged. When the visible theatre crosses Ema, a mask on `.k-frames` fades the entire figure layer behind the card and a clip excludes the invisible tap area. Its endpoint shares the theatre’s bottom offset (64px on phones, 76px on portrait tablets), with 16px reserved for parallax. The storyboard is not painted over. Short layouts with the card beside Ema, desktop composition and no-JavaScript rendering retain their existing appearance.

## 14. Owner's art plan: homepage still life (2026-11-14)

The owner's plan (`EMA-ART-PLAN.md`, kept outside the repository) is labelled by the owner a proposal: not a final approval, and not authority to commit, open or update a pull request, merge or deploy. It names P0 (keep the five images and audit) and P1 (homepage decor) as this round's work.

- **Approved** (2026-11-14). After reviewing the captures, the owner approved the P1 prototype in section 14.3 for commit, pull request, merge and deployment, with both filters on Ema's images removed and the still-life lines kept at ink 26 % (section 14.4).

### 14.1 What the plan asks

- **Proposed** (owner). Keep the reference-led stage and the five restored images; do not rebuild the layout. Make the empty storyboard panels look finished with a small, restrained, original still life on the theme "everyday things put away", matching the diary line 把喜欢的日常，慢慢收进这里: a closed notebook with a ribbon and a pen, a cup of tea with ripples, and a window light on the paper. At most two or three pieces, at the edges, low contrast; leaving space empty is fine and there is no fourth piece.
- **Proposed** (owner). Visual weight stays Ema, then 荒泷旭 / Nero and the diary line, then the theatre card, then the paper and decor. Nothing on Ema, under the identity text or inside the theatre card. Phones get none or one piece, preferably only light or paper colour.
- **Proposed** (owner). No room background, manga wall, scenery, visual-novel set, fake handwriting, invented dialogue or quotes, copied icons or emblems, filters or recolouring on the main art, new gold or mint, or new CJK web font. Light in the paper only; poses change the image only, never the decor.
- **Proposed** (owner). Scope: the homepage stage only. About, Notes, Works, Games and Credits unchanged; Blank stays typographic; Endfield unchanged. Inner-page pilots (P2) need a later explicit approval; final recaptures (P3) wait until the art settles. Those approvals came separately: the Journal header on 2026-11-14 (section 14.5) and the article pages on 2026-11-15 (section 14.6). The limits in this section (at most three pieces, none or one on phones) describe the homepage stage.
- **Superseded** (owner, 2026-11-14). Any requirement for placeholders, commissioned main art, a 1642 × 2400 canvas or removing the five images (sections 8.2 and 8.4 to 8.6 above).

### 14.2 P0 audit (2026-11-14, `claude/ema-art-motifs` from `main` `cbf4fb1`)

- **Prototype.** The five images are present, named `ema-pose-01.webp` to `ema-pose-05.webp`, and their Git blobs are identical to `76c9da5`'s `ema.webp`, `ema-frame-wave.webp`, `ema-frame-together.webp`, `ema-frame-talk.webp` and `ema-frame-refute.webp`. Their SHA-256 values match the manifest. Sizes: 905 × 2400, 1030 × 2400 (three) and 1472 × 2048; all have alpha. They are referenced only through `ASSETS.json` by the homepage, and by tests.
- **Prototype.** The labels in section 8.1 match `ema-messages.ts`.
- **Prototype.** The stacked-layout crop holds: at 390 × 844 and 360 × 740 (Chrome 157, touch), in all five poses and both modes, nothing of the figure shows below the theatre card.
- **Prototype.** Dark mode applied no filter to the images, but two existing filters touched them in other states: pulling up or docking the identity card dimmed the figure with `saturate(.9) brightness(.98)` (stage mode only), and hovering Ema added a pink `drop-shadow` glow around her outline. The reference applies neither. Both were removed at the owner's request (section 14.4).
- **Prototype.** AGENTS.md holds no outdated placeholder clause. The outdated statements in this file are marked **Superseded** above, and the stale notes on the theatre card and on loading (sections 12 and 13) are corrected.

### 14.3 P1 prototype

- **Prototype.** The empty speech bubble in the right-hand panel above the theatre card is gone. That panel holds the closed notebook with its ribbon and pen in its upper part, where the card, when it appears, does not reach it: at least 9 px apart at 1280 × 720 and more at every other size measured. The three sparkles in the panel below gave way to the teacup on its saucer, with one fallen petal and three ripples. Both are line drawings in `Storyboard.astro`, without text. Every other panel is unchanged.
- **Prototype.** The window light is one element in the paper layer (`.k-light`): two pane-shaped areas slanting from the viewer's upper left above the identity text and behind Ema's head, split by a cross of straight bars. On cream paper the panes are a 50 % paper wash that takes the screentone and hatching off where they fall, and the bars a 6 % ink shadow; on dark paper the panes are a 10 % light lift and the bars stay unlit. It is static and does not change with the poses. On windows 720 px tall or less it is shorter, so it stays above the identity text.
- **Prototype.** Phones and portrait tablets (the stacked layout) show none of the three; the paper, screentone and blossoms are unchanged there.
- **Prototype.** The theatre card is anchored by its top edge (section 2.2), so it keeps clear of the notebook in all four locales.
- **Prototype.** Checked in Chrome 157 on the production build: five poses × light and dark at 1440 × 900, 1366 × 620, 1280 × 720 and 1920 × 1080 (mouse, at rest and with the pointer on Ema) and 390 × 844 and 360 × 740 (touch). A geometry sweep over 1440 × 900, 1366 × 620, 1280 × 720, 1920 × 1080, 2560 × 1440, 1024 × 768, 1180 × 820 and 1101 × 760, in all four locales (all five poses in zh-CN), found no overlap between the notebook or teacup and the identity text, the theatre card (shown or not), the 樱色便笺 button, the cue, the navigation, the console tab, the palette button or Ema's visible figure, and both stay inside the first screen. With the window light switched on and off, no pixel inside the identity text changed. Built Blank and Endfield pages are byte-identical to `main`; Ema's inner pages differ only in the name of the shared stylesheet. Not checked: Safari, physical phones, real trackpads. The owner reports Safari scrolling works.

### 14.4 Decisions

- **Approved** (2026-11-14). No filter on Ema's images in any state or colour mode: the docked dimming and the hover glow are removed. Hover feedback remains the pointer cursor and the theatre card that appears; keyboard focus keeps its dashed outline. `tests/ema-storyboard.test.mjs` fails if a filter is added to the figure again.
- **Approved** (2026-11-14). The still life's lines stay at `--blank-ink` 26 %. The plan aims at about 12–22 % in a blue-grey like `#6a7084`, close to `--blank-muted`, but at `--blank-muted` 22 % the teacup's outline almost disappears into its dotted panel on cream paper; 26 % ink is darker than the screentone and far lighter than text. The window light stays within the plan's 4–12 % (bars 6 %, panes a 50 % paper wash over print only).
- **Open.** P3 final captures, as the plan says; it needs the owner's separate approval. P2 started on 2026-11-14 (section 14.5).

### 14.5 P2 pilot: the Journal header (2026-11-14)

- **Approved** (2026-11-14). The owner asked to start the P2 inner-page pilot. The plan leaves its content open, so this pilot is one page and one element: the Journal page's header. Extending it to other pages needs the owner's review of this pilot first.
- **Prototype.** Between the title "Journal." and the entry count, the header carries a small storyboard strip in the homepage's paper language: a plain panel holding the closed notebook with its ribbon and pen, and a screentone panel with four loose petals, split by a slanted gutter. It is the homepage drawing itself (`lib/still-life.mjs`, now shared by `Storyboard.astro` and `PagePlate.astro`), with no text. Frames are ink at 28 %, the panel paper is half see-through so the page's dot grid shows, and the dots and petals use the soft pink at 42 % and 75 %; all colours are mixed from theme tokens, so dark mode follows.
- **Prototype.** The strip stands on the bottom of the title row and rises from it, so the introduction below never runs into it in any language; it shows from 1101 px wide (the side-by-side layout) and is hidden on narrower windows, tablets and phones, which keep the current header. Title, count, introduction and the rest of the page are unchanged.
- **Prototype.** Blank's shared `PageHead` gained an empty `art` slot in the title row, which `BlogIndexPage` forwards as `head-art`; only Ema's Journal page fills it. The plate's styles (`styles/plate.css`) load with the Ema layout's inner-page styles, and every rule sits under `.ema-content`. `tests/ema-plate.test.mjs` guards both.
- **Prototype.** Checked in Chrome 157 on the production build, all four locales: geometry at 1101 × 760, 1180 × 820, 1280 × 720, 1366 × 620, 1440 × 900, 1920 × 1080 and 2560 × 1440 (shown; no overlap with the kicker, title, count, introduction or site header; at least 30 px above the introduction and 58 px from the count) and 1100 × 800, 1024 × 768, 820 × 1180 and 390 × 844 (hidden). Of the 84 built pages, only the four Journal pages changed in content; the other 80, Blank and Endfield included, differ from `main` only in the name of the shared layout stylesheet, which gained only the plate's `.ema-content` rules, and the stylesheet order is unchanged.
- **Approved** (2026-11-14). After reviewing the captures, the owner kept the strip exactly as in review boards 01–04 as the final Journal header and froze its style: no further changes to its size or tone. It is not extended to About, Works or Games.
- **Approved** (2026-11-15). The owner accepted the pilot and authorised committing, pushing and the pull request (PR 16); no further style changes and no other pages.
- **Open, resolved** (2026-11-15). Merging and deploying needed the owner's separate approval, which the owner then gave. PR 16 was merged into `main` as `0b44aec` (GitHub records 2026-11-14 17:26 UTC, 01:26 on 2026-11-15 in UTC+8), and the Pages workflow deployed that commit (run 43621161655: build and deploy jobs succeeded).


### 14.6 Article-page pilot (2026-11-15)

- **Approved** (owner's request, 2026-11-15). A restrained decorative pilot on Ema's article pages, reviewed on the first published article: a small bookmark ribbon beside the title in the homepage notebook's shape language and theme colours, not a badge or card; after the body, a fine rule with two or three petals, clearly apart from the article's navigation and the footer; and a low-contrast screentone corner in the outer margin beside the desktop article, hidden on narrow screens, never behind body text or over controls. Only Ema's article pages change: the homepage, Journal, About, Works and Games pages, Blank and Endfield stay as they are, and so do the article's content, measure, type size, line height, contents list, navigation and reading layout. No character art, no change to the five images, no generative-AI or third-party art, no animation; existing drawings and theme tokens, with reused art kept in one source; light and dark each adapted, with no filter on the content. Everything is decorative: hidden from assistive technology, no effect on selection, links or the keyboard, no horizontal scrolling. Local preview only.
- **Prototype.** The ribbon is the notebook's ribbon hanging straight: a flat strip in the still life's pink (`--ema-pink-soft` 90 % over the card paper, the `--sb-still-pink` formula), its tail cut in a fishtail half as deep as it is wide, with no outline, shadow or text. It hangs in the margin left of the column, from 12 px above the category line to the middle of the title's first line: 11 × 88 px with a 20 px gap to the title on desktop, 9 px wide with a 15 px gap up to 1100 px, 7 px wide with an 8 px gap on phones. From 1260 px, where the console's tab sits on the left edge, it moves in towards the title just enough to keep 12 px from the tab.
- **Prototype.** After the body and before the end note, a 280 px rule (240 px on phones) in `--ema-line-strong` carries three petals of different sizes in the still life's pink, centred under the text. It adds 56 px above it (44 px on phones) and its own 36 px (31 px on phones); the end note keeps its 64 px above, so the navigation link and the footer move down by that much and nothing else moves.
- **Prototype.** The corner is the storyboard's screentone (round dots on a 9-unit grid turned 30°) in `--ema-pink-soft` at 62 %, densest at the paper's right edge level with the top of the article header and fading towards the title. It is at most 150 px wide (40 px of it may reach into the column, where the title never goes because its measure stops at 25ch) and shows only on the side-by-side layout, from 1101 px; it stays near the top of the page, so the palette button at the bottom of the window never meets it, and the header's menus open over it.
- **Prototype.** Blank's shared `ArticlePage` has two empty slots, `header-art` at the end of the article header and `end-art` between the body (`data-site-prose`) and the end note; only Ema's `ArticlePage` fills them, with `components/ArticleArt.astro`, so Blank and Endfield render exactly what they did. `lib/still-life.mjs` now also holds the straight ribbon and the screentone pattern; the Journal plate draws its screentone from there too, with byte-identical markup. The styles are in `styles/article.css`, loaded with the Ema layout's stylesheets, every rule under `.ema-content`; print and forced-colour modes leave the decorations out. `tests/ema-article-art.test.mjs` guards the slots, the shared drawings, the scoping and the corner's breakpoint.
- **Prototype.** Checked on the production build in Chrome 157 (all four locales, light and dark; 2560 × 1440 down to 1101 × 760 with a mouse, 1100 × 800 to 768 × 1024, phones from 430 × 932 to 320 × 568): no overlap with any text or control, no horizontal scrolling, the reading layout's boxes and styles unchanged, the same focus order, and the pointer passes through all three. Titles of up to six lines (eight at 320 px) were also tried in the browser. Of the 96 built pages only the four Ema article pages changed in content; the others differ only in the shared layout stylesheet's name, and the stylesheet order is unchanged. In WebKit 27.2 (Playwright's build) the three pieces render at the same places, and the title's lines and the body's box match `main`. Not checked: Safari itself, physical phones.
- **Approved** (2026-11-15). After reviewing the captures, the owner approved the design as built and froze it: no further changes to the decorations' size, colour or spacing. Phones keep the ribbon and the petals; the screentone corner stays on the desktop layout only (1101 px and wider).
- **Approved** (2026-11-15). The homepage storyboard keeps its own copy of the screentone pattern in this round. The shared drawings stay as they are (used by the Journal plate and the article corner); the duplicate is merged only when maintenance actually needs it.
- **Approved** (2026-11-15). The owner authorised committing and pushing the pilot, its pull request (PR 18) and merging it into `main`, which the Pages workflow deploys.
- **Open.** Extending the decorations to other pages needs a new request.

### 14.7 Works page pilot (2026-11-15)

- **Approved** (owner's request and decisions, 2026-11-15). After a read-only audit of Works and Games, the owner chose Works for the pilot and left Games unchanged. The pilot uses the six existing captures in `public/projects/gallery/`, labelled with their actual capture date; none is recaptured, edited or added, and `public/` and `showcase/` stay unchanged in this round. The contact row stays visible in dark mode and shows the light captures unchanged and accurately labelled: never darkened, filtered or hidden. 项目方向 becomes a compact line inside the project entry, and the redundant PROJECT INDEX heading and count go. The page has a large uncropped lead image and a supporting contact row, keeps the existing descriptions and links in all four locales and captions only with recorded metadata; missing metadata is reported before the data is extended. The change is Ema-only: the other themes, Ema's other pages and the stylesheet order stay as they were, with no gallery viewer, carousel, new dependency or unrelated refactoring. An Ema capture is deferred, not a requirement of this pilot. Current captures can be taken later with the development tools; they do not have to come from the owner.
- **Prototype.** Ema's `pages/ProjectsPage.astro` is Ema's own page instead of a wrapper around Blank's. Each project is one numbered sheet: type, title and status; the lead plate; the summary, the details, the direction line (`projects.directions` with the project's tech line) and the case-study link; then the contact row under 截图 (`ema.gallery.title`). The lead plate is the gallery capture named by `project.image` and, in dark mode, the one named by `image.darkSrc`; the contact row holds the rest of `project.gallery` in its recorded order. Numbers follow the gallery order, so light mode shows 01 and 03–06 and dark mode 02 and 03–06. Each caption is the capture's `label` and `meta` (mode, size, capture date), and the alternative text is its `alt`. Joiners and a no-break space keep a date, a size or a middle dot from breaking across lines; the recorded text is unchanged.
- **Prototype.** From 1101 px the plate stands beside the text, its paper mat 600 px wide at 1440 px (the picture 576 × 384); up to 1100 px it sits above the text, at most 640 px wide; on phones it takes the full width. The contact row shows every capture uncropped at one height, 180 px from 1280 px and 150 px below, with captions at least 168 px wide; tablets set it two to a line, and phones use a two-column grid in which each capture fills its column at its own proportions. Mats are the card paper with a hairline border (10 px padding on the plate, 8 px on phones, 6 px in the row) and a hairline on the picture itself; there is no shadow, filter or rounded corner. The sheet number follows the Journal's rows: a 72 px column, 28 px on phones, hidden below 481 px. Printing shows the light capture, as Blank does.
- **Prototype.** Blank's `ProjectsPage`, which Blank and Endfield render, is unchanged. The styles are in `styles/works.css`, loaded with the Ema layout's stylesheets after `article.css`, every rule under `.ema-content` and every colour from the theme's tokens. `tests/ema-works.test.mjs` checks that the page reads only shared data; that every caption's mode, size and date match `public/projects/ASSETS.json` in all four locales; that no style crops, filters or hides a picture, dark mode swapping only the lead plate; the scoping; and the stylesheet order.
- **Prototype.** Checked on 2026-11-15 on the production build in Chrome 157: all four locales, light and dark, at 2560 × 1440, 1920 × 1080, 1440 × 900, 1366 × 620, 1280 × 720 and 1101 × 800 with a mouse and at 1100 × 800, 1024 × 768, 768 × 1024, 430 × 932, 390 × 844, 360 × 740 and 320 × 568 with touch. No run scrolled sideways; each mode showed its own lead capture; every picture loaded whole at its own proportions, with no filter, opacity or blend; every caption showed its date unclipped; headings ran h1, h2, h3; text contrast was at least 5.28 : 1; the case-study link was 44 px tall and the only keyboard stop in the page's content, with a visible focus ring; and the palette and console never covered the sheet. Without JavaScript the page shows the light capture and the whole contact row, and printing from dark mode shows the light capture. Of the 96 built pages only the four Ema Works pages changed. The other pages differ only in the shared layout stylesheet's name, which gained the Works rules as one block after the article rules, and computed styles and boxes on 17 other pages (Blank, Endfield and Ema, desktop and phone, light and dark) match the earlier build. Not checked in real Safari or on a physical phone.
- **Approved** (2026-11-15). The owner visually accepted the layout as built and approved committing the pilot on `claude/ema-works-pilot`.
- **Open.** Recapturing the screenshots (section 10) and an Ema capture are deferred. Games and the other inner pages are unchanged; extending this design needs a new request.

### 14.8 About page pilot (2026-11-24)

- **Approved** (owner's request, 2026-11-24). After the reference comparison in `outputs/art-next/`, the owner agreed to the order About → Games → page-head art → recaptures and asked to start with Ema's About page.
- **Prototype.** Ema's `pages/AboutPage.astro` follows the reference About page's sequence: an opening with the owner (旭 monogram, name, brand, bio, outward links, status pins) on the left and the existing text-only letter as the page beside them, where the reference shows manga art; one ruled bookmark row; 01 tech line as ruled entries in two columns with 近况 (`currentSignals`) as the side note; 02 anime as one shelf of the six 2:3 covers, numbered underneath; 03 characters (square portraits, three to a row, six shown before 显示更多) beside 04 favourite games (each with the art of the game-shelf entry that has the same key). Rules and whitespace replace the earlier tinted heading chips and per-item paper cards. No new artwork, wording or data: every string already existed, and pictures are the recorded covers, portraits and game art. 樱羽艾玛 and 月代雪 keep their empty blossom frames (section 8.7), so the first row of characters opens with two frames.
- **Prototype.** Styles are in `styles/about.css` (loaded only on Ema pages, after `shelf.css`); Ema's reveal list in `lib/presentation.mjs` names the new groups. `tests/ema-about.test.mjs` checks the section order, that the page uses no card classes, reads only shared data and keeps 44 px targets and the motion switches.
- **Prototype.** Checked on 2026-11-24 on the production build in Chrome (Playwright, reduced motion; the version was not recorded at the time): zh-CN light at 1440 × 900, 1366 × 620, 820 × 1180, 390 × 844 and 360 × 780; zh-CN dark at 1440 × 900 and 390 × 844; en at 1440 × 900 and 390 × 844; ja at 1440 × 900; zh-TW at 390 × 844. No run scrolled sideways. Correction (2026-11-24): the target check skipped links inside headings; the four favourite-game title links were 18 px tall. Fixed on 2026-11-25: each link now stretches over its whole row, so the target is 67 to 97 px tall with the appearance unchanged (measured by hit-testing in Chrome 158 and WebKit 27.2 at 1440, 390 and 360 px wide); keyboard order runs links, bookmarks, stories, 显示更多, games, each with a visible outline. Not checked: Safari, a real phone.
- **Approved** (2026-11-24). The owner agreed to replace the Latin "About." heading with the reference's kind of title. As on the reference About page, the opening is now the page head: an eyebrow (`04 / 关于我` and `ema.about.kicker`), the owner's name as the page's only h1, and an italic Latin *About* before the brand as the subtitle. `about.intro` stays the meta description only. Blank's `PageHead`, which Blank, Endfield and Ema's other inner pages use, is unchanged.
- **Approved** (2026-11-24). The owner visually accepted the About pilot as built, including the new opening head, and authorised committing it, opening a pull request and merging it into `main`, which the Pages workflow deploys.
- **Open.** Games and the other inner pages keep the Latin heading; giving them CJK titles needs new four-locale wording (a proposal) and is part of the page-head step.

### 14.9 Games page pilot (2026-11-24, reverted 2026-11-25)

- **Superseded** (owner's decision, 2026-11-25). The pilot of 2026-11-24: Ema's Games page followed the reference's playroom, with a CJK page head and an italic Latin subtitle, the genre filters on a dashed ticket line, and one cabinet per game (label strip, art screen, copy, one filled action). The owner accepted it the same day and it was merged as PR 26. Before accepting it the owner had been told that the phone page had become shorter; it had become longer (zh-CN: 5917 px against 4112 px on a 390 px touch screen, and 4388 px against 2863 px at 1440 px wide). The pilot's full description and checks are in this section as of commit `34268e6`. The cabinet design is not a current specification and is not frozen.
- **Approved** (owner's decision, 2026-11-25). After seeing the page from before the pilot, the live page and a compact phone variant side by side, the owner chose the earlier page (改版前的那些界面和文字挺不错的，新的就不好看) and asked for it to be restored with Git. PR 29's description records the reason as the cabinet layout's uneven alignment. Ema's Games page is again Blank's `PageHead` (the Latin "Games." heading, index 03 and the count) over the card grid in genre tones. Do not re-apply the playroom layout without a new request from the owner.
- **Prototype.** PR 29 restores `pages/GamesPage.astro`, `styles/games.css`, `styles/shelf.css` and `lib/presentation.mjs` byte for byte from `bccc077`, the commit before PR 26, and removes the pilot's `tests/ema-games.test.mjs`; the changes of PR 27 and PR 28 stay. Of the 96 built pages, only the four Ema Games pages differ in content from a build of `af481e8`, and their `<main>` is byte-identical to a build of `bccc077`. Ema's other 28 pages differ only in the file names of Ema's own stylesheet and script; every Blank and Endfield page and the shared stylesheet are byte-identical.
- **Prototype.** Checked on 2026-11-25 on the production build (Node 24.19.0) against a build of `bccc077`. In Chrome 158 (Playwright, reduced motion): all four locales, light and dark, at 1440 × 900, 1366 × 620, 820 × 1180, 390 × 844 and 360 × 780. The page is as tall as before the pilot in all 40 runs (zh-CN: 2863 px at 1440 px wide, 4112 px on a 390 px touch screen). Its pixels match except for a few inside cover pictures, which also differ between two captures of one build; in every run where pixels differed, each element's box and computed style were compared as well and matched, apart from the computed margin of `<main>`, which also changes between two captures of one build while its box stays the same. In WebKit 27.2 (Playwright's build): eight runs (zh-CN light and dark, zh-TW, ja and en light, at 1440 × 900 or 390 × 844), all pixel-identical. In both engines the six filters show the right games and counts, with no console error, failed request, sideways scrolling or broken picture. With motion on (Chrome), the cards end fully visible, the heading's aura animates and the filter bar sticks at 86 px, as on the earlier build. Ema's other 28 pages match a build of `af481e8` in every box, computed style and pixel at 1440 × 900 and 390 × 844 (About also in dark mode, Chrome), and a crawl of all 96 pages at both sizes in both engines found nothing. Not checked: Safari, a real phone. Keyboard order was not rechecked; the markup is the one from before the pilot.
- **Superseded** (2026-11-25). The uncommitted phone-compact variant of the cabinet layout (`claude/ema-games-compact`) is not to be merged.
- **Open.** As before the pilot, the page has targets under 44 px: each card's Steam or official-site link is 27.9 px tall, and the filter buttons are 38 px tall from 761 px wide (44 px on phones). Enlarging the hit areas without changing the look, as PR 27 did on the About page, is a proposal awaiting the owner.
- **Open.** Page-head art (step 3 of the approved order) is postponed: on 2026-11-24 the owner chose to look into illustrations over the following days.
