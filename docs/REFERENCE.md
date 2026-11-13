# Reference mapping

Design reference: [Yuimi-chaya/Yuimi-chaya.github.io](https://github.com/Yuimi-chaya/Yuimi-chaya.github.io), commit `0056030` (2026-11-06), and its running site [yuimi-chaya.github.io](https://yuimi-chaya.github.io/). It has three themes: Kisara (its root), Fuyukawa Kagari (`/themes/fuyukawa-kagari/`) and Blank (`/themes/blank/`). This file maps the two we follow and lists every deliberate deviation; it covers layout and interaction only. Our own art (artwork, palette, light, paper, typography, Ema's five poses, asset sources and licensing) is in [ART-DIRECTION.md](ART-DIRECTION.md), which works inside this mapping and never overrides it. Status of each item: **follow**, **adapt** (same pattern, our content or art) or **deviate** (pattern changed, reason given).

## Licence

- Code, styles, scripts, tests, configuration and technical docs: MIT, Copyright (c) 2026 Yuimi-chaya, only where Yuimi-chaya holds the rights. Our `LICENSE` and `public/licenses/yuimi-chaya-MIT.txt` already carry the notice. Files that adapt reference code say so in their header: `src/themes/ema/lib/stage.mjs`, `rail.mjs`, `tag-rain.mjs`, `src/themes/ema/styles/stage.css`, `src/themes/blank/pages/HomePage.astro`, `src/themes/blank/styles/journal.css`.
- Excluded from the MIT grant and never used here: images, illustrations, manga panels, title lettering, stickers and chibis, the Live2D model and its third-party runtime, music, fonts, screenshots. Their articles are CC BY-NC-SA 4.0 and are not used either.

## Ema / 樱色档案 ← `fuyukawa-kagari`

### Homepage composition

| Reference | Ours | Status |
| --- | --- | --- |
| Stage `calc(100svh - 82px)`, min 600px; content inset `max(48px, (100% - 1240px) / 2)` | Same values | follow |
| Back layer: manga-panel collage, `cover`, bottom fade to the page colour | A storyboard spread drawn in code (`components/Storyboard.astro`): panel frames, screentones, hatching, speed lines, blossoms; no figures or lettering. The column behind Ema holds only frames and quiet tones, and the layer fades to about a third of its strength around her; the one remaining speech bubble is small, faint and empty | adapt (own art; calmer behind Ema at the owner's request) |
| Front layer: character cutout, full stage height, centred, bottom-anchored, lower 24% masked | Same B frame, scale and anchor; five original images restored from `76c9da5` at the owner’s request on 2026-11-14. Each uses its own aspect ratio (`object-fit: contain`, bottom-centred) and the existing bottom fade; no placeholder slate. Original bytes, dimensions and alpha are unchanged | adapt (historical images; source and permission unconfirmed) |
| Identity block left (39%, max 440px): kicker with a pink square, handwritten title with pink offset shadow and white glow, one diary line, typing terminal line | Same block: `home.kicker`, the title 荒泷旭 / Nero (the owner's name in the CJK serif, the alias in Gloock; confirmed by the owner on 2026-11-13, when the wordmark variant and its review switch were removed), `ema.home.diary`, the terminal types the shared current signals; same shadow treatment | adapt (own type and copy) |
| No interaction on the character | Ema is a button: click, tap or Enter shows the next pose; a theatre card on her right gives 艾玛的小剧场, 01 / 05 · pose, previous/next and 点击艾玛，翻开下一幕 | deviate (our five-pose requirement) |
| Daily notice button top right; opens by itself once a day | 樱色便笺 button in the same place; opens only when pressed | deviate (earlier decision: never auto-open) |
| Scroll cue bottom centre, "翻开下一页" with three blinking arrows | Same place and motion, labelled 向下浏览 / 向下瀏覽 / 下へスクロール / Scroll down with the arrows turned downward, so it cannot be mistaken for Ema's 翻开下一幕 | deviate (owner's request: clearer wording) |

### Character and stage interactions

| Reference | Ours | Status |
| --- | --- | --- |
| Wheel at the top pulls an identity card up (260px pull, docks at 56%, 900ms release); copy and cue fade; reverse wheel ≥36px returns; ArrowDown/PageDown/Space dock, End skips | Same mechanics and timings (`lib/stage.mjs`). **Status: implemented, pending real trackpad usability acceptance by the owner; not an immutable requirement.** If trackpads feel wrong it can be softened or replaced by native scrolling without changing the composition | follow (pending) |
| Card: avatar with a flower that sways and can be flicked, terminal window with typed name, caption, social links | The owner's avatar: the monogram 旭 in every locale, exposed as an image named after the owner; a blossom that sways and flicks; typed 荒泷旭 / Nero, the shared intro, GitHub, Steam, 关于我 | adapt |
| Loading the page scrolls to the top (`scrollRestoration = manual`) | The stage engages only when the page is already at the top; history and anchors keep their position | deviate (the reference's own notes record trapped-scroll bugs) |
| Touch screens never see the identity card (no wheel) | Touch, the pause button and reduced motion get the static page: the card sits in the flow under the stage. Pose switching is a tap or click only: a swipe across Ema scrolls the page (`touch-action: pan-y`), and a mouse drag that starts on her does not count as a tap | deviate (identity must be reachable; poses and scrolling kept apart) |
| Focus moving into the card | Docks the card, so keyboard users see it | deviate (accessibility) |
| Pointer spring parallax (back −4/−3px, front +9/+6px, scroll depth) | Same constants | follow |
| Full-screen cover between scenes: fade 240ms (stage ↔ rail), wipe 300ms (rail ↔ next scene), staggered entrances, reverse on an opposite wheel | Same (`lib/rail.mjs`), wide fine pointers with motion on only | follow |

### Sections and pages

| Reference | Ours | Status |
| --- | --- | --- |
| Chapter rail: sticky 100svh stage, four leaves (clamp 340–680px), vertical scroll walks them sideways, 01 / 04 counter and progress line, active leaf enlarges its picture (1.09) and sticker (1.3); native swipe on touch and reduced motion | Same mechanics; leaves are 文字, 作品, 游戏, 关于 with shared-data previews (post count or empty line, project card, game count and favourites, name and tools) instead of manga strips; a blossom stamp instead of a chibi sticker; plate scale 1.04 because the plates hold text | adapt |
| Signal scene: illustrated background, art word, clock with IP geolocation and weather, a welcome speech bubble, canvas tag rain with mascot pigs that fades out | Sakura wash; art word; local clock only (no location or weather requests); the bubble shows today's 樱色便笺 from shared notes; shared tags fall with small blossoms and stay as a pile; plain list on phones and with motion off | adapt (privacy, no invented dialogue) |
| Journal: three recent posts with 7:10 covers | Recent posts; with none, the existing empty state | adapt |
| Inner pages: archive with category spine, workshop sheets, playroom, colour-plate album, article colophon | Not yet rebuilt; next phase after the homepage is approved | pending |

### Navigation and controls

| Reference | Ours | Status |
| --- | --- | --- |
| Transparent header, equal side tracks; brand left; centred glass pill; items pair an icon with a label and a small hint; current item tinted with an inset underline | Same; labels from `nav.*`, Latin hints (front page, notes, works, playroom, profile) hidden from screen readers | follow |
| No header controls | Language, colour mode and the motion switch on the right. The motion switch shows its pause/play icon with a short visible label (动效 / 動態效果 / 動き / Motion) and fills in when paused; hovering or focusing shows the action. Windows up to 1100px fold the controls behind one settings button | deviate (four locales, dark mode and pause are site requirements) |
| Palette floats bottom-right on every width | Floats bottom-right from 1260px; docked with the header controls below that | deviate (earlier approved exception: a fixed button covered content) |
| Left-edge utility drawer (Live2D controls, music player) | Left-edge 控制台 (Sakura Radio, cursor ring) from 1260px, footer button below | adapt (no Live2D) |
| Pig scrollbar on the right edge | Blossom scroll track | adapt |
| Live2D chibi bottom-left | None | deviate (third-party model; character art not settled) |

### Responsive, colour and motion

| Reference | Ours | Status |
| --- | --- | --- |
| ≤1100px: smaller title, brand text hidden | Same; hints hidden from 1180px | follow |
| ≤760px: brand hidden, nav items stack icon over label, title centred above the character, terminal hidden, character `min(100% − 64px, 142vw)` tall | Same; also used for portrait tablets up to 1100px, where the desktop layout crowded the character. On phones the theatre card under Ema keeps 艾玛的小剧场, the pose number and name, ‹ › and 点击艾玛，翻开下一幕; the scroll cue sits separately below it. The former placeholder slate is removed on every viewport following the owner’s 2026-11-14 restoration request; the theatre card alone names the pose. In the stacked layout the whole figure layer fades out behind the card, with its endpoint tied to the card bottom and 16px parallax allowance, so legs cannot reappear below it; image scale, side-by-side layouts and no-JS rendering are unchanged | follow / adapt |
| Phone: notice button overlaps the kicker | Button moved above the kicker | deviate (bug) |
| Short landscape phones: text left, character right | Same. On any landscape screen 500px tall or less (phones held sideways, including those wider than 760px that get the desktop arrangement), Ema and the stage keep their size and the page scrolls naturally; the theatre card sits at the bottom of the first screen with its label and hint in view (beside the text below 761px wide, in the right column above that), and the cue stays at the end of the stage (round 6) | follow / deviate (the theatre card is our five-pose requirement) |
| Light only | Light and dark from the same tokens | deviate (site requirement) |
| Reduced motion: transitions off, rail native, petals hidden | Same, and the site's pause button counts as reduced motion | follow |

### Open review items (not approved)

- Desktop wheel takeover (stage pull and scene covers): implemented as in the reference, awaiting the owner's test on a real trackpad. Keyboard, scroll bar, anchors, touch, pause and reduced motion already scroll natively.
- Ema sources and permission remain unconfirmed. The owner approved restoring only the five historical images unchanged on 2026-11-14, superseding the placeholder-only restriction; this is not a rights-holder licence. The former slate is removed because the theatre card already names the pose. See [ART-DIRECTION.md](ART-DIRECTION.md#13-owner-requested-restoration-2026-11-14).

## Blank ← reference `blank`

The reference's Blank is an achromatic, typography-led journal: white paper, black ink, grey; no gradients, shadows, rounded cards or decorative images; numbered navigation and sections; one inverted band. Our Blank descends from an earlier version of the same theme and shares its class vocabulary.

| Reference | Ours | Status |
| --- | --- | --- |
| Header: wordmark with edition label, centred numbered navigation with a 2px underline on the current item, one square outlined palette button opening a numbered theme menu | Same; the palette button is the shared theme switcher in icon form; language and colour mode join it as square outlined buttons; the search icon is gone | follow + deviate (four locales, dark mode) |
| Home hero: kickers left and right, giant wordmark with a square dot, two-line serif statement, introduction with 关于我, square ↓ button, three-cell index strip | Same; `home.kicker`, "BY ASAHI ARATAKI", "Blank Space.", `home.statement1/2`, the shared bio, counts for writing, projects and games | follow |
| 01 / WRITING: black band for the latest post, then numbered rows; with no posts, one empty line | Same; we have no posts yet, so the empty line (`blog.empty`) shows | follow |
| 02 / IN PRACTICE: serif statement and numbered tool list | `home.practice1/2` and the shared six tools | follow |
| CURRENTLY / 近况: one signal and a link | Same | follow |
| Black footer: wordmark, outward links, one quiet bottom line | Same; the bottom line keeps the required attribution (`SiteAttribution`), the credits link and back to top | follow + required attribution |
| Navigation labels 11px uppercase Latin | 13px, because ours are CJK labels | adapt |
| Light only | Dark mode inverts paper and ink; the band uses the panel tokens | deviate (site requirement) |
| Inner pages: Journal., Works., Play., About. headings with counts | Not yet rebuilt; next phase | pending |

## Endfield / 终末地

No reference counterpart. It keeps its own industrial design; its appearance is compared before and after every shared change.
