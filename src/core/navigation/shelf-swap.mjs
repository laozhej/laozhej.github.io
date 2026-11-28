// Moving between two pages of the Collection (the overview or one of its shelves) in the same theme.
// The page head and the category sidebar stay where they are and only the shelf changes:
// - while the view transition runs, html carries data-shelf-swap="next" or "prev" (by the sidebar's order), which gives
//   the head, the sidebar and the shelf their own view-transition names (SiteNavigation.astro); each theme's stylesheet
//   animates the shelf its own way and leaves the head and the sidebar still;
// - the sidebar's marker (the element with data-collection-marker) travels from the category just left to the new one,
//   with the theme's duration and curve (--shelf-marker-duration, --shelf-marker-ease on the marker);
// - a reader who had scrolled into the old shelf lands at the top of the new one, under the sticky sidebar, instead of
//   being thrown back to the top of the page.
// If the shelf starts at another place in the window than before (the reader had scrolled into it), html also carries
// data-shelf-jump and the old shelf is not shown at all, so nothing slides across the window.
// When the transition is ready, document receives "site:shelf-swap" ({ direction }) for themes that animate it from script.
// Nothing moves while motion is paused or reduced; the attribute is only set for this one kind of navigation.
import { collectionShelves } from "../content/select-collection.mjs";
import { getTheme, stripTheme } from "../themes/routing.mjs";
import { motionIsPaused } from "../preferences/motion.mjs";

// The page's place in the sidebar: 0 for the overview, 1–5 for the shelves, -1 outside the Collection.
export function shelfPlace(pathname) {
  const match = stripTheme(pathname).match(/^\/collection\/(?:([a-z]+)\/)?$/);
  if (!match) return -1;
  if (!match[1]) return 0;
  const index = collectionShelves.indexOf(match[1]);
  return index < 0 ? -1 : index + 1;
}

// "next" or "prev" for a move between two different Collection pages of one theme, otherwise "".
export function shelfSwap(from, to) {
  if (!from || !to || getTheme(from.pathname) !== getTheme(to.pathname)) return "";
  const a = shelfPlace(from.pathname);
  const b = shelfPlace(to.pathname);
  if (a < 0 || b < 0 || a === b) return "";
  return b > a ? "next" : "prev";
}

// Where the shelf should start in the window after the move: unchanged if the reader had not reached the old shelf,
// otherwise just under the sidebar's sticky offset.
export function landing(scrollY, oldShelfTop, newShelfTop, offset) {
  return scrollY > oldShelfTop - offset ? Math.max(0, newShelfTop - offset) : scrollY;
}

export function installShelfSwap(doc, win) {
  const html = () => doc.documentElement;
  let pending = "";
  let traverse = false;
  let before = null;
  const clear = () => { delete html().dataset.shelfSwap; delete html().dataset.shelfJump; };
  const moving = () => !motionIsPaused(win) && !win.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Where a shelf should start in the window: under the sticky sidebar, or (where the sidebar does not stick, on phones)
  // below the fixed header, as far down as the theme's own scroll padding.
  const offsetOf = (side) => {
    const style = win.getComputedStyle(side);
    const top = style.position === "sticky" ? Number.parseFloat(style.top) : Number.parseFloat(win.getComputedStyle(doc.documentElement).scrollPaddingTop);
    return Number.isFinite(top) ? top : 0;
  };

  const prepare = (event) => {
    clear();
    pending = shelfSwap(event.from, event.to);
    traverse = event.navigationType === "traverse";
    before = null;
  };
  // Right before the old page is captured.
  const prepared = () => {
    if (!pending) return;
    html().dataset.shelfSwap = pending;
    const marker = doc.querySelector("[data-collection-marker]");
    const shelf = doc.querySelector("[data-collection-shelf]");
    const side = doc.querySelector("[data-collection-side]");
    before = {
      marker: marker?.getBoundingClientRect(),
      scrollY: win.scrollY,
      shelfTop: shelf ? shelf.getBoundingClientRect().top + win.scrollY : 0,
      offset: side ? offsetOf(side) : 0,
    };
  };
  const swap = (event) => {
    if (!pending) return;
    const direction = pending;
    event.newDocument.documentElement.dataset.shelfSwap = direction;
    pending = "";
    // Themes that animate the transition's pseudo-elements from script (Arknights) start once they exist.
    event.viewTransition?.ready?.then(() => doc.dispatchEvent(new win.CustomEvent("site:shelf-swap", { detail: { direction } })), () => {});
    const done = () => clear();
    const finished = event.viewTransition?.finished;
    if (finished?.then) finished.then(done, done);
    else win.setTimeout(done, 1200);
  };
  const swapped = () => {
    const from = before;
    before = null;
    if (!from) return;
    const shelf = doc.querySelector("[data-collection-shelf]");
    if (shelf && !traverse && !win.location.hash) {
      const top = shelf.getBoundingClientRect().top + win.scrollY;
      const y = landing(from.scrollY, from.shelfTop, top, from.offset);
      if (y !== win.scrollY) win.scrollTo({ top: y, left: 0, behavior: "instant" });
    }
    // If the shelf now starts somewhere else in the window, the old one would be shown out of place: it goes at once.
    if (shelf && Math.abs((shelf.getBoundingClientRect().top) - (from.shelfTop - from.scrollY)) > 2) html().dataset.shelfJump = "";
    const marker = doc.querySelector("[data-collection-marker]");
    if (!marker || !from.marker || !moving() || typeof marker.animate !== "function") return;
    const to = marker.getBoundingClientRect();
    if (!(to.width > 0 && to.height > 0)) return;
    const dx = from.marker.left - to.left;
    const dy = from.marker.top - to.top;
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
    const style = win.getComputedStyle(marker);
    const duration = Number.parseFloat(style.getPropertyValue("--shelf-marker-duration")) || 360;
    const easing = style.getPropertyValue("--shelf-marker-ease").trim() || "cubic-bezier(.23,1,.32,1)";
    marker.animate(
      [{ translate: `${dx}px ${dy}px`, scale: `${from.marker.width / to.width} ${from.marker.height / to.height}` }, { translate: "0 0", scale: "1 1" }],
      { duration, easing },
    );
  };

  doc.addEventListener("astro:before-preparation", prepare);
  doc.addEventListener("astro:after-preparation", prepared);
  doc.addEventListener("astro:before-swap", swap);
  doc.addEventListener("astro:after-swap", swapped);
  return () => {
    doc.removeEventListener("astro:before-preparation", prepare);
    doc.removeEventListener("astro:after-preparation", prepared);
    doc.removeEventListener("astro:before-swap", swap);
    doc.removeEventListener("astro:after-swap", swapped);
  };
}
