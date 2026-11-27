import { motionIsPaused } from "../preferences/motion.mjs";

// The longest a click keeps the root smooth when no scrollend arrives (already at the top, or a
// browser without the event). Measured glides end within about 1.2 s.
export const BACK_TO_TOP_HOLD_MS = 3000;

// A footer "back to top" link ([data-site-top]) stays an ordinary link to the page's <main>: the
// router and the browser still follow it, so the address gains the fragment, Back returns to the
// footer and focus moves to <main>. Only the movement changes. The root scrolls smoothly (as
// Blank's root always does) from the click until that scroll ends, then gets its own value back,
// so every other scroll in the theme stays as it was. The scroll itself may start a little later
// than the click: while a page is still loading media, browsers defer the fragment jump to the
// next layout. Reduced motion and the site's pause button keep the instant jump.
export function mountBackToTop(doc, win) {
  const root = doc.documentElement;
  let timer = 0;
  let previous = null;
  const release = () => {
    win.clearTimeout(timer);
    timer = 0;
    win.removeEventListener("scrollend", release);
    if (previous === null) return;
    if (previous) root.style.scrollBehavior = previous;
    else root.style.removeProperty("scroll-behavior");
    previous = null;
  };
  const onClick = (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (!event.target?.closest?.("a[data-site-top]") || motionIsPaused(win)) return;
    if (previous === null) previous = root.style.scrollBehavior || "";
    root.style.scrollBehavior = "smooth";
    win.clearTimeout(timer);
    win.removeEventListener("scrollend", release);
    win.addEventListener("scrollend", release);
    timer = win.setTimeout(release, BACK_TO_TOP_HOLD_MS);
  };
  // Capture: run before the router's bubbling click listener performs the jump.
  doc.addEventListener("click", onClick, true);
  return () => {
    doc.removeEventListener("click", onClick, true);
    release();
  };
}
