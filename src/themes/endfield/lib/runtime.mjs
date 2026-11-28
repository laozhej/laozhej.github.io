// Endfield's page enhancements: the small motions its stylesheet cannot do alone.
// Each one answers an action (opening a page, pointing, focusing, filtering, switching the colour mode)
// and does nothing while motion is paused or the system asks for less motion. The page is complete without it.
import { createReadouts, staggerGap } from "./readout.mjs";

const MECH = "cubic-bezier(.7,0,.2,1)";
const SNAP = "cubic-bezier(.16,1,.3,1)";

// Figures that settle once when a page opens.
const OPENING = ".ef-hero-top .ef-fields>li,.ef-frame .ef-hollow-no,.ef-index b,.ef-content .blank-page-count strong,:is(.ef-content,.ef-coll) .blank-shelf-stats strong,.ef-pagehead .ef-hollow-no";
// Figures that settle when the thing holding them is pointed at or focused: [holder, figures inside it].
const HOLDERS = [
  [".ef-nav a", ".ef-nav-number"],
  [".ef-wordmark", "small"],
  [".ef-frame", ".ef-hollow-no,.ef-fields>*"],
  [".ef-index a", "b"],
  [".ef-records a", ".ef-tag,time"],
  [".ef-content .blank-post-row", ".blank-row-number,time"],
  [".ef-job", ".ef-tag,time"],
  [".ef-entry", ".ef-tag"],
  [".ef-chips button", "span"],
  [".ef-content .blank-project summary", ".blank-row-number"],
  [":is(.ef-content,.ef-coll) .blank-filters button", "span"],
  [":is(.ef-content,.ef-coll) .blank-collection-index a", ".blank-collection-count"],
  [".site-theme-dock a", ".site-theme-no"],
];
const ROWS = ":is(.ef-content,.ef-page) [data-site-entries]";
const SHUTTER_VARS = ["--ef-old-x", "--ef-old-y", "--ef-old-w", "--ef-new-x", "--ef-new-y"];
const ROW_FRAMES = [
  { opacity: 0, transform: "translateX(-14px)", clipPath: "inset(0 100% 0 0)" },
  { opacity: 1, transform: "none", clipPath: "inset(0 -2% 0 0)" },
];

// What the page being left looked like, kept across the swap: where the current section's block sat in the header,
// and where the page's main region sat in the window.
let leftNav = null;
let leftMain = null;
// The first page of a visit is mounted when the scripts arrive, which can be well after the page appeared.
let firstPage = true;

// Is the page still opening? `since` is how long ago it first appeared, in ms. Figures that start now run for up to
// 0.9s more; past this point they would be a second burst after the stylesheet's opening has finished.
export function stillOpening(since) {
  return since <= 200;
}

export function navBox(item, nav) {
  const a = item.getBoundingClientRect();
  const b = nav.getBoundingClientRect();
  return { left: a.left - b.left, top: a.top - b.top, width: a.width, height: a.height };
}

// How the block must be displaced to start where it was: [dx, dy, scaleX]. Null when it has not moved.
export function navShift(from, to) {
  if (!from || !to || !(to.width > 0) || !(from.width > 0)) return null;
  const dx = from.left - to.left;
  const dy = from.top - to.top;
  if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return null;
  return [dx, dy, from.width / to.width];
}

// The colour mode is uncovered in a circle from the button, at about 3000px a second.
export function revealCircle(x, y, width, height) {
  const radius = Math.hypot(Math.max(x, width - x), Math.max(y, height - y));
  return { radius, duration: Math.round(Math.max(240, Math.min(600, radius / 3))) };
}

export function mountEndfield(doc, win) {
  const html = doc.documentElement;
  const reduced = win.matchMedia("(prefers-reduced-motion: reduce)");
  const fine = win.matchMedia("(hover: hover) and (pointer: fine)");
  const moving = () => html.dataset.motionPaused !== "true" && !reduced.matches;
  const cleanups = [];
  const on = (target, type, handler, options) => {
    if (!target) return;
    target.addEventListener(type, handler, options);
    cleanups.push(() => target.removeEventListener(type, handler, options));
  };
  const timers = new Set();
  const later = (run, ms) => {
    const id = win.setTimeout(() => { timers.delete(id); run(); }, ms);
    timers.add(id);
  };
  const animations = new Set();
  const play = (el, frames, options) => {
    const animation = el.animate(frames, options);
    animations.add(animation);
    const forget = () => animations.delete(animation);
    animation.finished.then(forget, forget);
    return animation;
  };
  const readouts = createReadouts(win);

  // 1. Opening a page: its figures settle one after another, the whole run under a second.
  const settleOpening = () => {
    const figures = [...doc.querySelectorAll(OPENING)];
    const gap = staggerGap(figures.length, 40, 180);
    figures.forEach((figure, index) => later(() => {
      // After a keyboard jump the page's main region holds focus and a screen reader starts reading it: leave the text alone.
      if (moving() && doc.activeElement?.id !== "endfield-main") readouts.settle(figure, 600);
    }, 120 + index * gap));
  };
  // The first rows of a list light up once when the page opens (in the stylesheet); mark the lists once that is over,
  // so rows shown again by a filter are handled here instead.
  const markOpened = () => later(() => doc.querySelectorAll(ROWS).forEach((list) => { list.dataset.efOpened = ""; }), 1100);
  // Coming from another page of the theme the mount is immediate. On the first page of a visit it depends on the network:
  // if the page has been showing for a while, its figures are simply left as they are.
  const appeared = win.performance.getEntriesByName?.("first-contentful-paint")[0]?.startTime ?? 0;
  const opening = !firstPage || stillOpening(win.performance.now() - appeared);
  firstPage = false;
  if (moving() && opening) settleOpening();
  markOpened();

  // 2. Pointing at or focusing something that holds a figure settles it. Focus only moves figures hidden from
  // assistive technology, so a link's spoken name is never read mid-spin.
  const settleInside = (target, from, spoken) => {
    if (!moving() || !target?.closest) return;
    for (const [holder, figures] of HOLDERS) {
      const host = target.closest(holder);
      if (!host || (from && host.contains(from))) continue;
      for (const figure of host.querySelectorAll(figures)) {
        if (spoken || figure.closest('[aria-hidden="true"]')) readouts.settle(figure);
      }
    }
  };
  on(doc, "pointerover", (event) => { if (event.pointerType !== "touch") settleInside(event.target, event.relatedTarget, true); });
  on(doc, "focusin", (event) => { if (event.target?.matches?.(":focus-visible")) settleInside(event.target, event.relatedTarget, false); });

  // 3. The first screen has depth: the framed entry, its hatched shadow and the big number shift a few pixels
  // against each other as the pointer crosses it. The stylesheet does the moving from two numbers set here.
  const hero = doc.querySelector(".ef-hero");
  let heroFrame = 0;
  let pointer = null;
  const rest = () => {
    win.cancelAnimationFrame(heroFrame);
    heroFrame = 0;
    pointer = null;
    if (!hero) return;
    hero.removeAttribute("data-ef-live");
    hero.style.removeProperty("--ef-mx");
    hero.style.removeProperty("--ef-my");
  };
  const follow = () => {
    heroFrame = 0;
    if (!pointer || !moving()) return rest();
    const box = hero.getBoundingClientRect();
    if (!(box.width > 0 && box.height > 0)) return;
    const part = (value) => Math.max(-0.5, Math.min(0.5, value)).toFixed(3);
    hero.style.setProperty("--ef-mx", part((pointer.x - box.left) / box.width - 0.5));
    hero.style.setProperty("--ef-my", part((pointer.y - box.top) / box.height - 0.5));
    hero.setAttribute("data-ef-live", "");
  };
  on(hero, "pointermove", (event) => {
    if (event.pointerType === "touch" || !fine.matches || !moving()) return;
    pointer = { x: event.clientX, y: event.clientY };
    if (!heroFrame) heroFrame = win.requestAnimationFrame(follow);
  });
  on(hero, "pointerleave", rest);

  // 4. Changing page: the accent block in the header travels from the section just left to the current one.
  const nav = doc.querySelector(".ef-nav");
  const currentItem = () => nav?.querySelector('a[aria-current="page"]');
  const slide = () => {
    const from = leftNav;
    leftNav = null;
    const item = currentItem();
    if (!from || !item || !moving() || win.performance.now() - from.at > 2000) return;
    const to = navBox(item, nav);
    const shift = from.box ? navShift(from.box, to) : [0, 0, 1];
    if (!shift) return;
    const block = doc.createElement("span");
    block.className = "ef-nav-block";
    block.setAttribute("aria-hidden", "true");
    Object.assign(block.style, { left: `${to.left}px`, top: `${to.top}px`, width: `${to.width}px`, height: `${to.height}px` });
    nav.dataset.efSliding = "go";
    nav.append(block);
    // From a page outside the five sections there is nowhere to travel from: the block wipes in where it belongs.
    const frames = from.box
      ? [{ transform: `translate(${shift[0]}px,${shift[1]}px) scaleX(${shift[2]})` }, { transform: "none" }]
      : [{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0)" }];
    const run = play(block, frames, { duration: from.box ? 360 : 280, easing: MECH });
    // In dark mode the label turns to ink only once the block is nearly under it.
    later(() => { if (nav.dataset.efSliding) nav.dataset.efSliding = "land"; }, 250);
    const land = () => { block.remove(); delete nav.dataset.efSliding; };
    run.finished.then(land, land);
  };
  slide();
  // The shutter between pages is drawn by the stylesheet. It needs to know where each page's main region sits in the window:
  // the two regions differ in width and scroll offset, the page being left must stay exactly where it was, and both pages
  // are cut along one edge that crosses the window itself. The new page is measured after the navigation has put it at its
  // scroll position, which happens right after this mount.
  const main = doc.getElementById("endfield-main");
  const place = () => {
    const box = main.getBoundingClientRect();
    return { x: box.left, y: -box.top, w: box.width };
  };
  if (leftMain && main && moving()) {
    const from = leftMain;
    win.queueMicrotask(() => {
      const to = place();
      const set = (name, value) => html.style.setProperty(name, `${value.toFixed(1)}px`);
      set("--ef-old-x", from.x); set("--ef-old-y", from.y); set("--ef-old-w", from.w);
      set("--ef-new-x", to.x); set("--ef-new-y", to.y);
    });
    later(() => { for (const name of SHUTTER_VARS) html.style.removeProperty(name); }, 1000);
  }
  leftMain = null;
  cleanups.push(() => {
    const item = currentItem();
    leftNav = nav ? { at: win.performance.now(), box: item ? navBox(item, nav) : null } : null;
    leftMain = main ? place() : null;
  });

  // 5. Switching light and dark: the new mode is uncovered in a circle growing from the button.
  // The shared toggle does the switching; this only wraps the same click in a view transition.
  let replaying = false;
  on(doc, "click", (event) => {
    const button = event.target?.closest?.("[data-color-mode-toggle]");
    if (!button || replaying || !moving() || typeof doc.startViewTransition !== "function" || html.classList.contains("ef-moding")) return;
    event.stopImmediatePropagation();
    event.preventDefault();
    let toggled = false;
    const toggle = () => {
      if (toggled) return;
      toggled = true;
      replaying = true;
      try { button.click(); } finally { replaying = false; }
    };
    const box = button.getBoundingClientRect();
    const keyboard = event.detail === 0 || (!event.clientX && !event.clientY);
    const x = keyboard ? box.left + box.width / 2 : event.clientX;
    const y = keyboard ? box.top + box.height / 2 : event.clientY;
    const { radius, duration } = revealCircle(x, y, win.innerWidth, win.innerHeight);
    html.classList.add("ef-moding");
    let transition;
    try { transition = doc.startViewTransition(toggle); } catch { transition = null; }
    if (!transition) {
      // The switch must happen even where the transition cannot start.
      html.classList.remove("ef-moding");
      toggle();
      return;
    }
    transition.ready.then(() => {
      play(html, { clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration, easing: MECH, pseudoElement: "::view-transition-new(root)" });
    }).catch(() => {});
    transition.finished.finally(() => html.classList.remove("ef-moding")).catch(() => {});
  }, true);

  // 6. Filtering or sorting a list: the result changes at once, then the rows in view light up one by one.
  const lightRows = (list) => {
    if (!moving() || !list) return;
    list.dataset.efOpened = "";
    // A list grouped under headings (the Collection's genres) lights up its works, not the groups.
    const items = list.querySelector("[data-site-group]") ? [...list.querySelectorAll("[data-site-entry]")] : [...list.children];
    const rows = items.filter((row) => {
      if (row.hidden) return false;
      const box = row.getBoundingClientRect();
      return box.bottom > 0 && box.top < win.innerHeight;
    });
    const gap = staggerGap(rows.length, 38, 228);
    rows.forEach((row, index) => play(row, ROW_FRAMES, { duration: 320, delay: index * gap, easing: SNAP, fill: "backwards" }));
  };
  const listOf = (target) => target?.closest?.("[data-site-collection]")?.querySelector("[data-site-entries]");
  on(doc, "click", (event) => {
    const control = event.target?.closest?.(":is(.ef-content,.ef-page) :is([data-site-category],[data-site-reset],[data-site-clear])");
    if (control) lightRows(listOf(control));
  });
  on(doc, "change", (event) => { if (event.target?.matches?.(":is(.ef-content,.ef-page) [data-site-sort]")) lightRows(listOf(event.target)); });

  // 7. Motion switched back on: the page runs its opening once more. Paused: everything shows its final state at once.
  let wasMoving = moving();
  on(doc, "site:motion-change", () => {
    const now = moving();
    if (now === wasMoving) return;
    wasMoving = now;
    if (!now) {
      readouts.stop();
      rest();
      for (const animation of [...animations]) animation.finish?.();
      return;
    }
    doc.querySelectorAll(ROWS).forEach((list) => list.removeAttribute("data-ef-opened"));
    settleOpening();
    markOpened();
  });

  return () => {
    for (const cleanup of cleanups.reverse()) cleanup();
    for (const id of timers) win.clearTimeout(id);
    timers.clear();
    readouts.stop();
    rest();
    for (const animation of [...animations]) animation.cancel();
    html.classList.remove("ef-moding");
  };
}
