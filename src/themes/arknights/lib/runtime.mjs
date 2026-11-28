// The Arknights theme's page enhancements. Each answers something the reader does (opening a page, scrolling to another
// sector, pointing at the board, changing page, switching the colour mode) and leaves the page exactly as it was when
// motion is paused or the system asks for less. The page is complete without it.

const CUT = "cubic-bezier(.65,0,.35,1)";
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Which sector the reader is in: the last one whose top has passed a line a little above the middle of the window.
// `tops` are the sectors' top edges relative to the window, in page order.
export const SECTOR_LINE = 0.42;
export function currentSector(tops, viewHeight) {
  const line = viewHeight * SECTOR_LINE;
  let index = 0;
  tops.forEach((top, at) => { if (top <= line) index = at; });
  return index;
}

// The colour mode is uncovered from the top of the window down, at about 2400px a second.
export function scanDuration(viewHeight) {
  return Math.round(Math.max(320, Math.min(620, viewHeight / 2.4)));
}

// A new page is uncovered across the window at about 3200px a second.
export function pageScanDuration(viewWidth) {
  return Math.round(Math.max(320, Math.min(560, viewWidth / 3.2)));
}

// Where a sector's mark sits on the rail's progress line, from 0 (top) to 1 (bottom): the point the line's fill reaches
// when that sector becomes the current one. `top` is the sector's top in the page, `scrollable` how far the page scrolls.
export function tickPlace(top, viewHeight, scrollable) {
  if (!(scrollable > 0)) return 0;
  return Math.max(0, Math.min(1, (top - viewHeight * SECTOR_LINE) / scrollable));
}

// The rail's word while it changes: letters already reached are final, the rest are stand-in capitals. Spaces stay.
export function decodeFrame(final, progress, random = Math.random) {
  const chars = [...final];
  const locked = Math.floor(Math.min(1, Math.max(0, progress)) * chars.length);
  return chars.map((ch, index) => (index < locked || ch === " " ? ch : LETTERS[Math.floor(random() * LETTERS.length) % LETTERS.length])).join("");
}

// How far a board cell is pushed from the pointer, in board cells: nothing beyond `radius`, most right under it.
// `dx`, `dy` run from the pointer to the cell's centre.
export function repel(dx, dy, radius = 2.8, reach = 1.45) {
  const distance = Math.hypot(dx, dy);
  if (!(distance < radius)) return [0, 0];
  const push = (1 - distance / radius) ** 2 * reach;
  const round = (value) => Math.round(value * 100) / 100 || 0;
  if (distance < 0.001) return [0, round(push)];
  return [round((dx / distance) * push), round((dy / distance) * push)];
}

// A box relative to the header's navigation, and how a bar must be displaced and stretched to start from another one:
// [dx, dy, scaleX]. Null when it has not moved.
export function navBox(item, nav) {
  const a = item.getBoundingClientRect();
  const b = nav.getBoundingClientRect();
  return { left: a.left - b.left, top: a.top - b.top, width: a.width, height: a.height };
}
export function navShift(from, to) {
  if (!from || !to || !(from.width > 0) || !(to.width > 0)) return null;
  const dx = from.left - to.left;
  const dy = from.top - to.top;
  if (Math.abs(dx) < 1 && Math.abs(dy) < 1 && Math.abs(from.width - to.width) < 1) return null;
  return [dx, dy, from.width / to.width];
}

// Changing page inside the theme. When the new page has been fetched (astro:after-preparation, right before the page being
// left is captured), a move between two pages of the theme that is not the Collection's own shelf swap gets html.ak-paging,
// so the whole window except the header is captured as one picture (theme.css, "Changing page"). At the swap, the view
// transition Astro started is kept for the new page's mount, with the direction and where the current section's bar sat
// in the header. The listeners are installed once and outlive page swaps. Nothing here imports the shared navigation code,
// so the shared scripts of the other themes are bundled exactly as before.
export function pagesToScan({ from, to, fromTheme, toTheme, shelfSwap }) {
  return fromTheme === "arknights" && toTheme === "arknights" && !shelfSwap && !!from && !!to && from.pathname !== to.pathname;
}
let paging = null;
// Counts navigations, so a change that ends late never takes the class off html while the next one is being captured.
let generation = 0;
let installed = false;
function installPaging(doc, win, moving) {
  if (installed) return;
  installed = true;
  const html = () => doc.documentElement;
  let preparing = null;
  doc.addEventListener("astro:before-preparation", (event) => {
    generation++;
    paging = null;
    preparing = null;
    html().classList.remove("ak-paging");
    if (moving() && typeof doc.startViewTransition === "function") preparing = event;
  });
  doc.addEventListener("astro:after-preparation", () => {
    const event = preparing;
    preparing = null;
    if (!event || !moving()) return;
    const toTheme = event.newDocument?.documentElement?.dataset?.theme;
    // core/navigation/shelf-swap.mjs marks a move between two Collection pages on html just before this.
    if (!pagesToScan({ from: event.from, to: event.to, fromTheme: html().dataset.theme, toTheme, shelfSwap: "shelfSwap" in html().dataset })) return;
    paging = { back: event.direction === "back" };
    html().classList.add("ak-paging");
  });
  doc.addEventListener("astro:before-swap", (event) => {
    if (!paging) return;
    // A swipe Back the browser animates itself comes with a stand-in transition that has no pictures to scan.
    const real = typeof win.ViewTransition === "function" && event.viewTransition instanceof win.ViewTransition;
    if (!real || !moving()) {
      paging = null;
      return;
    }
    const nav = doc.querySelector(".ak-nav");
    const item = nav?.querySelector('a[aria-current="page"]');
    Object.assign(paging, { at: win.performance.now(), transition: event.viewTransition, nav: nav && item ? navBox(item, nav) : null });
  });
}

export function mountArknights(doc, win) {
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
  const animations = new Set();
  const play = (el, frames, options) => {
    const animation = el.animate(frames, options);
    animations.add(animation);
    const forget = () => animations.delete(animation);
    animation.finished.then(forget, forget);
    return animation;
  };
  installPaging(doc, win, moving);

  // 1. The rail counts through the homepage's sectors as the reader scrolls: the number changes with a short vertical
  // cut and the word is decoded into the new one. Marks on the progress line show where each sector starts, the
  // current one lit. Other pages show their own section, fixed.
  const rail = doc.querySelector("[data-ak-rail]");
  const sectors = [...doc.querySelectorAll("[data-ak-sector]")];
  const number = doc.querySelector("[data-ak-counter-no]");
  const at = doc.querySelector("[data-ak-counter-at]");
  const word = doc.querySelector("[data-ak-counter-word]");
  const track = doc.querySelector("[data-ak-track]");
  let shown = -1;
  let frame = 0;
  let decoding = 0;
  const ticks = [];
  const decode = (final) => {
    win.cancelAnimationFrame(decoding);
    decoding = 0;
    if (!word) return;
    if (!moving()) { word.textContent = final; return; }
    const started = win.performance.now();
    const step = (now) => {
      const done = Math.min(1, (now - started) / 320);
      word.textContent = done >= 1 ? final : decodeFrame(final, done);
      decoding = done >= 1 ? 0 : win.requestAnimationFrame(step);
    };
    decoding = win.requestAnimationFrame(step);
  };
  const show = (index) => {
    if (index === shown || !sectors[index]) return;
    const first = shown === -1;
    shown = index;
    const sector = sectors[index];
    if (number) number.textContent = sector.dataset.akSector;
    if (at) at.textContent = sector.dataset.akSector;
    if (rail) rail.dataset.akAt = String(index);
    ticks.forEach((tick, place) => tick.classList.toggle("is-current", place === index));
    if (first) {
      if (word) word.textContent = sector.dataset.akWord;
      return;
    }
    decode(sector.dataset.akWord);
    if (number && moving()) {
      number.classList.remove("is-turning");
      void number.offsetWidth;
      number.classList.add("is-turning");
    }
  };
  const measure = () => {
    frame = 0;
    show(currentSector(sectors.map((sector) => sector.getBoundingClientRect().top), win.innerHeight));
  };
  const placeTicks = () => {
    const scrollable = doc.documentElement.scrollHeight - win.innerHeight;
    sectors.forEach((sector, index) => {
      const top = sector.getBoundingClientRect().top + win.scrollY;
      ticks[index].style.top = `${(tickPlace(top, win.innerHeight, scrollable) * 100).toFixed(2)}%`;
    });
  };
  if (sectors.length && number) {
    if (track) {
      for (const sector of sectors) {
        const tick = doc.createElement("span");
        tick.className = "ak-rail-tick";
        tick.dataset.akTick = sector.dataset.akSector;
        track.append(tick);
        ticks.push(tick);
      }
      placeTicks();
      cleanups.push(() => ticks.forEach((tick) => tick.remove()));
      // The marks depend on the page's length and on the window's height, which can change without the page resizing.
      on(win, "resize", placeTicks, { passive: true });
      if ("ResizeObserver" in win) {
        const sizes = new win.ResizeObserver(() => placeTicks());
        sizes.observe(doc.body);
        cleanups.push(() => sizes.disconnect());
      }
    }
    measure();
    const queue = () => { if (!frame) frame = win.requestAnimationFrame(measure); };
    on(win, "scroll", queue, { passive: true });
    on(win, "resize", queue, { passive: true });
    on(number, "animationend", () => number.classList.remove("is-turning"));
  }

  // 2. Arriving at a sector: the first time each homepage sector below the first screen comes into view, its number turns
  // in, its head is wiped in and its entries follow one after another (theme.css, "Arrivals"). Sectors already in view
  // when the page is mounted are left as they are, so nothing the reader has seen disappears.
  const armed = [];
  let arrivals = null;
  const disarm = () => {
    arrivals?.disconnect();
    arrivals = null;
    for (const sector of armed.splice(0)) delete sector.dataset.akArmed;
  };
  if (moving() && sectors.length && "IntersectionObserver" in win) {
    arrivals = new win.IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.dataset.akShown = "";
        arrivals?.unobserve(entry.target);
      }
    }, { rootMargin: "0px 0px -22% 0px" });
    for (const sector of sectors) {
      if ("akEnter" in sector.dataset || sector.getBoundingClientRect().top < win.innerHeight - 40) continue;
      sector.dataset.akArmed = "";
      armed.push(sector);
      arrivals.observe(sector);
    }
    cleanups.push(disarm);
    // Focus reaching a sector that has not arrived yet (the keyboard) shows it as it is, without the entrance, so what
    // holds focus is never clipped.
    on(doc, "focusin", (event) => {
      const sector = event.target?.closest?.("[data-ak-armed]:not([data-ak-shown])");
      if (!sector) return;
      delete sector.dataset.akArmed;
      arrivals?.unobserve(sector);
    });
  }

  // 3. The board answers the pointer: cells near it are pushed aside and drift back when it moves on or leaves.
  const record = doc.querySelector(".ak-record");
  const board = record?.querySelector(".ak-matrix");
  const cells = board ? [...board.querySelectorAll("rect")].map((rect) => ({
    rect,
    x: Number(rect.getAttribute("x")) + Number(rect.getAttribute("width")) / 2,
    y: Number(rect.getAttribute("y")) + Number(rect.getAttribute("height")) / 2,
  })) : [];
  let probe = null;
  let probeFrame = 0;
  let pushed = false;
  const settle = () => {
    win.cancelAnimationFrame(probeFrame);
    probeFrame = 0;
    probe = null;
    if (!pushed) return;
    pushed = false;
    for (const cell of cells) cell.rect.style.removeProperty("translate");
  };
  const push = () => {
    probeFrame = 0;
    if (!probe || !moving()) return settle();
    const matrix = board.getScreenCTM?.();
    if (!matrix) return;
    const point = new win.DOMPoint(probe.x, probe.y).matrixTransform(matrix.inverse());
    for (const cell of cells) {
      const [dx, dy] = repel(cell.x - point.x, cell.y - point.y);
      if (dx || dy) cell.rect.style.translate = `${dx}px ${dy}px`;
      else cell.rect.style.removeProperty("translate");
    }
    pushed = true;
  };
  if (cells.length) {
    on(record, "pointermove", (event) => {
      if (event.pointerType === "touch" || !fine.matches || !moving()) return;
      probe = { x: event.clientX, y: event.clientY };
      if (!probeFrame) probeFrame = win.requestAnimationFrame(push);
    });
    on(record, "pointerleave", settle);
    cleanups.push(settle);
  }

  // 4. Changing page inside the theme: the header holds and the bar under the current section travels from the section
  // just left, while the new page is uncovered across the window behind a line of signal colour, from the right going
  // forward and from the left going back. The page being left dims a little as it is covered.
  const from = paging;
  paging = null;
  const nav = doc.querySelector(".ak-nav");
  if (from?.transition && moving() && win.performance.now() - from.at < 2000) {
    const item = nav?.querySelector('a[aria-current="page"]');
    if (item) {
      const to = navBox(item, nav);
      const shift = from.nav ? navShift(from.nav, to) : [0, 0, 0];
      if (shift) {
        const frames = from.nav
          ? [{ transform: `translate(${shift[0]}px,${shift[1]}px) scaleX(${shift[2]})` }, { transform: "none" }]
          : [{ transform: "scaleX(0)" }, { transform: "none" }];
        try { play(item, frames, { duration: 380, easing: CUT, pseudoElement: "::after" }); } catch {}
      }
    }
    // The swap took the class off html with the old page's attributes: the new page is captured the same way.
    html.classList.add("ak-paging");
    const line = doc.createElement("div");
    line.className = "ak-pagescan";
    line.setAttribute("aria-hidden", "true");
    doc.body.append(line);
    let ended = false;
    let fallback = 0;
    const mine = generation;
    const end = () => {
      if (ended) return;
      ended = true;
      win.clearTimeout(fallback);
      line.remove();
      if (generation === mine) html.classList.remove("ak-paging");
    };
    cleanups.push(end);
    // Never leave the line behind, even if the transition does not report back.
    fallback = win.setTimeout(end, 2000);
    from.transition.ready.then(() => {
      if (!moving()) return end();
      const width = win.innerWidth;
      const duration = pageScanDuration(width);
      const inset = from.back ? ["inset(0 100% 0 0)", "inset(0)"] : ["inset(0 0 0 100%)", "inset(0)"];
      const edge = from.back ? [-1, width - 1] : [width - 1, -1];
      play(html, { clipPath: inset }, { duration, easing: CUT, pseudoElement: "::view-transition-new(root)" });
      play(html, { opacity: [1, 0.55] }, { duration, easing: "linear", pseudoElement: "::view-transition-old(root)" });
      const run = play(html, { transform: edge.map((x) => `translateX(${x}px)`) }, { duration, easing: CUT, pseudoElement: "::view-transition-new(ak-page-scan)" });
      run.finished.then(end, end);
    }).catch(end);
    from.transition.finished?.then(end, end);
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

  // 5. Switching light and dark: the new mode is scanned in from the top of the window behind a line of signal colour.
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

  // 6. Motion paused: whatever is running shows its final state at once, sectors not yet reached are simply there, and
  // the board's cells go back to their places.
  on(doc, "site:motion-change", () => {
    if (moving()) return;
    number?.classList.remove("is-turning");
    if (shown >= 0 && word) { win.cancelAnimationFrame(decoding); decoding = 0; word.textContent = sectors[shown]?.dataset.akWord ?? word.textContent; }
    disarm();
    settle();
    for (const animation of [...animations]) animation.finish?.();
  });

  return () => {
    for (const cleanup of cleanups.reverse()) cleanup();
    win.cancelAnimationFrame(frame);
    win.cancelAnimationFrame(decoding);
    for (const animation of [...animations]) animation.cancel();
    html.classList.remove("ak-moding");
    doc.querySelectorAll(".ak-scanline").forEach((line) => line.remove());
  };
}
