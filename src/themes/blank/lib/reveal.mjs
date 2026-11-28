// Blank: sections, rows and cards rise into place the first time the reader scrolls them into view.
// Content is visible in CSS at all times. Only what starts below the first screen animates: what the
// page opens with is introduced by the page transition (or the homepage's first-visit entrance), and
// nothing animates while motion is paused or reduced. Same pattern as Ema's inner pages (presentation.mjs).

export const BLANK_REVEAL_TARGETS = [
  ".bj-featured", ".bj-rows > li", ".bj-section-intro", ".bj-tech-list > div", ".bj-now",
  ".blank-section-heading", ".blank-post-list > li", ".blank-project", ".blank-game-row", ".blank-profile > div",
  ".blank-about-section > div", ".blank-about-section > dl", ".blank-toolkit > div", ".blank-endnote",
  ".blank-article-end",
  // Collection: each shelf preview on the overview, and on a shelf its genre headings and works.
  ".blank-shelf-preview", ".blank-shelf-group-title", ".blank-work", ".blank-shelf-empty", ".blank-collection-note",
].join(",");

export const BLANK_REVEAL_FRAMES = [
  { opacity: 0, translate: "0 18px" },
  { opacity: 1, translate: "0 0" },
];

/** Delay for the n-th element revealed in one batch: 60ms apart, never more than 240ms. */
export function revealDelay(order, step = 60, max = 240) {
  return Math.min(order * step, max);
}

export function mountBlankReveal(doc, win) {
  const main = doc.querySelector("#blank-main, main");
  if (!main || !("IntersectionObserver" in win)) return () => {};
  const html = doc.documentElement;
  const reduced = win.matchMedia("(prefers-reduced-motion: reduce)");
  const still = () => reduced.matches || html.dataset.motionPaused === "true";
  const running = new Set();
  const observer = new win.IntersectionObserver((entries) => {
    let order = 0;
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      // Arriving deep in the page (history, hash): whatever is already above stays as it is.
      if (still() || doc.hidden || entry.boundingClientRect.bottom <= 0 || !entry.target.animate) continue;
      const animation = entry.target.animate(BLANK_REVEAL_FRAMES, {
        duration: 520, easing: "cubic-bezier(0.23, 1, 0.32, 1)", delay: revealDelay(order++), fill: "backwards",
      });
      running.add(animation);
      animation.finished.catch(() => {}).finally(() => running.delete(animation));
    }
  }, { threshold: 0, rootMargin: "0px 0px -32px 0px" });
  for (const target of main.querySelectorAll(BLANK_REVEAL_TARGETS)) {
    // A target inside another target rises with it, not on its own.
    if (target.parentElement?.closest(BLANK_REVEAL_TARGETS)) continue;
    const box = target.getBoundingClientRect();
    if (box.top < win.innerHeight && box.bottom > 0) continue;
    observer.observe(target);
  }
  // Pausing motion stops anything still rising; the element is then simply where it belongs.
  const stop = () => { if (still()) { running.forEach((animation) => animation.cancel()); running.clear(); } };
  doc.addEventListener("site:motion-change", stop);
  reduced.addEventListener?.("change", stop);
  return () => {
    observer.disconnect();
    running.forEach((animation) => animation.cancel());
    running.clear();
    doc.removeEventListener("site:motion-change", stop);
    reduced.removeEventListener?.("change", stop);
  };
}
