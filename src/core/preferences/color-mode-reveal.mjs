// Light and dark: the new mode is uncovered in a circle growing from the button that was pressed.
// color-mode.mjs still does the switching; this only wraps the same click in a same-document view
// transition. Blank and Ema mount it from their runtimes and style the transition under
// `html.site-mode-reveal`; Endfield keeps its own version, and Arknights its own sweep. Without view
// transitions, or while motion is paused or reduced, the click goes straight through and the mode
// changes at once.

/** The radius that reaches the farthest corner of the viewport from (x, y). */
export function revealRadius(x, y, width, height) {
  return Math.ceil(Math.hypot(Math.max(x, width - x), Math.max(y, height - y)));
}

export function mountColorModeReveal(doc, win, { duration = 480, easing = "cubic-bezier(0.23, 1, 0.32, 1)" } = {}) {
  const html = doc.documentElement;
  const reduced = win.matchMedia?.("(prefers-reduced-motion: reduce)");
  const still = () => html.dataset.motionPaused === "true" || Boolean(reduced?.matches);
  let replaying = false;
  const onClick = (event) => {
    const button = event.target?.closest?.("[data-color-mode-toggle]");
    if (!button || replaying || still() || typeof doc.startViewTransition !== "function" || html.classList.contains("site-mode-reveal")) return;
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
    // Enter and Space press the button without a pointer position: grow from its centre.
    const keyboard = event.detail === 0;
    const x = keyboard ? box.left + box.width / 2 : event.clientX;
    const y = keyboard ? box.top + box.height / 2 : event.clientY;
    const radius = revealRadius(x, y, win.innerWidth, win.innerHeight);
    html.classList.add("site-mode-reveal");
    let transition;
    try { transition = doc.startViewTransition(toggle); } catch { transition = null; }
    if (!transition) {
      // The switch must happen even where the transition cannot start.
      html.classList.remove("site-mode-reveal");
      toggle();
      return;
    }
    transition.ready.then(() => {
      html.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration, easing, pseudoElement: "::view-transition-new(root)" },
      );
    }).catch(() => {});
    transition.finished.catch(() => {}).finally(() => html.classList.remove("site-mode-reveal"));
  };
  doc.addEventListener("click", onClick, true);
  return () => doc.removeEventListener("click", onClick, true);
}
