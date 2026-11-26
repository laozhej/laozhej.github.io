import { motionIsPaused } from "../preferences/motion.mjs";

// A footer "back to top" link ([data-site-top]) stays an ordinary link to the page's <main>: the
// router and the browser still follow it, so the address gains the fragment, Back returns to the
// footer and focus moves to <main>. Only the movement changes. The router follows a same-page
// fragment during the click itself, so the root scrolls smoothly for just that one jump (as
// Blank's root always does) and is handed back in the next frame, leaving every other scroll in
// the theme as it was. Reduced motion and the site's pause button keep the instant jump.
export function mountBackToTop(doc, win) {
  const root = doc.documentElement;
  let frame = 0;
  let previous = null;
  const release = () => {
    frame = 0;
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
    win.cancelAnimationFrame(frame);
    frame = win.requestAnimationFrame(release);
  };
  // Capture: run before the router's bubbling click listener performs the jump.
  doc.addEventListener("click", onClick, true);
  return () => {
    doc.removeEventListener("click", onClick, true);
    win.cancelAnimationFrame(frame);
    release();
  };
}
