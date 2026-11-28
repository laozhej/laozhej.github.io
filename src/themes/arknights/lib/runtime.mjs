// The Arknights theme's page enhancements. Each answers something the reader does (scrolling to another sector,
// switching the colour mode) and leaves the page exactly as it was when motion is paused or the system asks for less.
// The page is complete without it.

const CUT = "cubic-bezier(.65,0,.35,1)";

// Which sector the reader is in: the last one whose top has passed a line a little above the middle of the window.
// `tops` are the sectors' top edges relative to the window, in page order.
export function currentSector(tops, viewHeight) {
  const line = viewHeight * 0.42;
  let index = 0;
  tops.forEach((top, at) => { if (top <= line) index = at; });
  return index;
}

// The colour mode is uncovered from the top of the window down, at about 2400px a second.
export function scanDuration(viewHeight) {
  return Math.round(Math.max(320, Math.min(620, viewHeight / 2.4)));
}

export function mountArknights(doc, win) {
  const html = doc.documentElement;
  const reduced = win.matchMedia("(prefers-reduced-motion: reduce)");
  const moving = () => html.dataset.motionPaused !== "true" && !reduced.matches;
  const cleanups = [];
  const on = (target, type, handler, options) => {
    if (!target) return;
    target.addEventListener(type, handler, options);
    cleanups.push(() => target.removeEventListener(type, handler, options));
  };
  const animations = new Set();
  const play = (el, frames, options) => {
    const animation = el.animate(frames, options);
    animations.add(animation);
    const forget = () => animations.delete(animation);
    animation.finished.then(forget, forget);
    return animation;
  };

  // 1. The rail counts through the homepage's sectors as the reader scrolls. Other pages show their own section, fixed.
  const sectors = [...doc.querySelectorAll("[data-ak-sector]")];
  const number = doc.querySelector("[data-ak-counter-no]");
  const at = doc.querySelector("[data-ak-counter-at]");
  const word = doc.querySelector("[data-ak-counter-word]");
  let shown = -1;
  let frame = 0;
  const show = (index) => {
    if (index === shown || !sectors[index]) return;
    const first = shown === -1;
    shown = index;
    const sector = sectors[index];
    if (number) number.textContent = sector.dataset.akSector;
    if (at) at.textContent = sector.dataset.akSector;
    if (word) word.textContent = sector.dataset.akWord;
    if (!first && number && moving()) {
      number.classList.remove("is-turning");
      void number.offsetWidth;
      number.classList.add("is-turning");
    }
  };
  const measure = () => {
    frame = 0;
    show(currentSector(sectors.map((sector) => sector.getBoundingClientRect().top), win.innerHeight));
  };
  if (sectors.length && number) {
    measure();
    const queue = () => { if (!frame) frame = win.requestAnimationFrame(measure); };
    on(win, "scroll", queue, { passive: true });
    on(win, "resize", queue, { passive: true });
    on(number, "animationend", () => number.classList.remove("is-turning"));
  }

  // Collection: moving between the overview and its shelves (core/navigation/shelf-swap.mjs marks the new page), the new
  // shelf is scanned in from the top behind a line of signal colour while the old one fades; the head and sidebar stay.
  const shelf = doc.querySelector("[data-collection-shelf]");
  if (shelf && html.dataset.shelfSwap && moving() && typeof doc.startViewTransition === "function") {
    const line = doc.createElement("span");
    line.className = "ak-shelf-scan";
    line.setAttribute("aria-hidden", "true");
    shelf.append(line);
    const height = shelf.getBoundingClientRect().height;
    let done = false;
    const remove = () => { if (!done) { done = true; line.remove(); } };
    on(doc, "site:shelf-swap", () => {
      const duration = Math.round(Math.max(360, Math.min(560, Math.min(height, win.innerHeight) / 2.2)));
      play(html, { clipPath: ["inset(0 0 100% 0)", "inset(0 0 0 0)"] }, { duration, easing: CUT, pseudoElement: "::view-transition-new(collection-shelf)" });
      if (!("shelfJump" in html.dataset)) play(html, { opacity: [1, 0] }, { duration, easing: "linear", pseudoElement: "::view-transition-old(collection-shelf)" });
      const run = play(html, { transform: ["translateY(0)", `translateY(${Math.max(0, height - 2)}px)`] }, { duration, easing: CUT, pseudoElement: "::view-transition-new(ak-shelf-scan)" });
      run.finished.then(remove, remove);
    });
    win.setTimeout(remove, 1600);
    cleanups.push(remove);
  }

  // 2. Switching light and dark: the new mode is scanned in from the top of the window behind a line of signal colour.
  // The shared toggle does the switching; this only wraps the same click in a view transition.
  let replaying = false;
  on(doc, "click", (event) => {
    const button = event.target?.closest?.("[data-color-mode-toggle]");
    if (!button || replaying || !moving() || typeof doc.startViewTransition !== "function" || html.classList.contains("ak-moding")) return;
    event.stopImmediatePropagation();
    event.preventDefault();
    let toggled = false;
    const toggle = () => {
      if (toggled) return;
      toggled = true;
      replaying = true;
      try { button.click(); } finally { replaying = false; }
    };
    const duration = scanDuration(win.innerHeight);
    const line = doc.createElement("div");
    line.className = "ak-scanline";
    line.setAttribute("aria-hidden", "true");
    html.classList.add("ak-moding");
    let transition;
    try {
      transition = doc.startViewTransition(() => { doc.body.append(line); toggle(); });
    } catch { transition = null; }
    if (!transition) {
      // The switch must happen even where the transition cannot start.
      html.classList.remove("ak-moding");
      line.remove();
      toggle();
      return;
    }
    transition.ready.then(() => {
      play(html, { clipPath: ["inset(0 0 100% 0)", "inset(0 0 0 0)"] }, { duration, easing: CUT, pseudoElement: "::view-transition-new(root)" });
      // The line sits at the foot of the window; its picture starts at the top and runs down to it, then the line is gone
      // before the transition ends, so it is never seen at rest.
      const run = play(html, { transform: [`translateY(${2 - win.innerHeight}px)`, "translateY(0)"] }, { duration, easing: CUT, pseudoElement: "::view-transition-new(ak-scan)" });
      run.finished.then(() => line.remove(), () => line.remove());
    }).catch(() => line.remove());
    transition.finished.finally(() => { html.classList.remove("ak-moding"); line.remove(); }).catch(() => {});
  }, true);

  // 3. Motion paused: whatever is running shows its final state at once.
  on(doc, "site:motion-change", () => {
    if (moving()) return;
    number?.classList.remove("is-turning");
    for (const animation of [...animations]) animation.finish?.();
  });

  return () => {
    for (const cleanup of cleanups.reverse()) cleanup();
    win.cancelAnimationFrame(frame);
    for (const animation of [...animations]) animation.cancel();
    html.classList.remove("ak-moding");
    doc.querySelectorAll(".ak-scanline").forEach((line) => line.remove());
  };
}
