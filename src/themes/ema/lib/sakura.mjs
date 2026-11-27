// Ema's falling petals come from Sakura.js (Jeroen Hammann, MIT), loaded as a classic script in
// EmaLayout's head, which defines `window.Sakura`. The library drops one petal every `delay` ms
// into the fixed `.ema-sakura` layer; it falls for roughly 6–11 s on a laptop screen, so a shorter
// delay means more petals on screen at once (about fall time / delay).
// Owner's request (2026-11-28): more, easier-to-see petals, in the library's own petal style.
export const SAKURA_DELAY = {
  home: 200, // ~40 petals at once on a 900px-tall window
  page: 280, // inner pages, where text sits under the fall: ~25
  phoneHome: 260, // ~24 on an 844px-tall phone
  phonePage: 360, // ~18
};
export const SAKURA_OPTIONS = { minSize: 11, maxSize: 17, hideScrollbars: false };
const PHONE = "(max-width: 760px)";

export function sakuraDelay(home, phone) {
  return SAKURA_DELAY[phone ? (home ? "phoneHome" : "phonePage") : (home ? "home" : "page")];
}

export function mountEmaSakura(doc, win) {
  const layer = doc.querySelector(".ema-sakura");
  const Sakura = win.Sakura;
  if (!layer || typeof Sakura !== "function") return undefined;
  const home = doc.body.hasAttribute("data-ema-home");
  const phone = win.matchMedia(PHONE);
  const paused = () => doc.documentElement.dataset.motionPaused === "true"
    || win.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let sakura;
  let running = false;
  const start = () => {
    if (running || paused()) return;
    const delay = sakuraDelay(home, phone.matches);
    if (sakura) { sakura.settings.delay = delay; sakura.start(); }
    else sakura = new Sakura(".ema-sakura", { ...SAKURA_OPTIONS, delay });
    running = true;
  };
  const stop = () => {
    if (!running) return;
    sakura.stop();
    running = false;
  };
  const motion = () => (paused() ? stop() : start());
  const resize = () => { if (sakura) sakura.settings.delay = sakuraDelay(home, phone.matches); };
  doc.addEventListener("site:motion-change", motion);
  phone.addEventListener("change", resize);
  start();
  return () => {
    doc.removeEventListener("site:motion-change", motion);
    phone.removeEventListener("change", resize);
    // Removes every petal and ends the library's timer, which would otherwise keep
    // feeding the detached layer after an in-site navigation swaps the page.
    stop();
  };
}
