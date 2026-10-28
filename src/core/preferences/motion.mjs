// Retain the original Ema key so existing visitors keep their preference.
export const MOTION_STORAGE_KEY = "ema-home-motion-paused";
const sessionPreferences = new WeakMap();

export function readMotionPreference(win) {
  try { return win.localStorage.getItem(MOTION_STORAGE_KEY) === "true"; }
  catch { return sessionPreferences.get(win) ?? false; }
}

export function motionIsPaused(win) {
  return readMotionPreference(win) || win.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function mountMotionPreference(doc, win) {
  const media = win.matchMedia("(prefers-reduced-motion: reduce)");
  const buttons = [...doc.querySelectorAll("[data-motion-toggle]")];
  let userPaused = readMotionPreference(win);
  const apply = () => {
    const paused = userPaused || media.matches;
    doc.documentElement.dataset.motionPaused = String(paused);
    for (const button of buttons) {
      const label = media.matches ? button.dataset.motionReduced
        : userPaused ? button.dataset.motionResume : button.dataset.motionPause;
      button.hidden = false;
      button.setAttribute("aria-pressed", String(paused));
      button.setAttribute("aria-disabled", String(media.matches));
      button.setAttribute("aria-label", label);
      button.title = label;
      button.querySelector("[data-motion-pause-icon]")?.toggleAttribute("hidden", paused);
      button.querySelector("[data-motion-play-icon]")?.toggleAttribute("hidden", !paused);
    }
    doc.dispatchEvent(new win.CustomEvent("site:motion-change", { detail: { paused, userPaused, reduced: media.matches } }));
  };
  const toggle = () => {
    if (media.matches) return;
    userPaused = !userPaused;
    sessionPreferences.set(win, userPaused);
    try { win.localStorage.setItem(MOTION_STORAGE_KEY, String(userPaused)); } catch {}
    apply();
  };
  const restore = () => { userPaused = readMotionPreference(win); apply(); };
  const storage = (event) => { if (event.key === MOTION_STORAGE_KEY || event.key === null) restore(); };
  buttons.forEach((button) => button.addEventListener("click", toggle));
  media.addEventListener("change", apply);
  win.addEventListener("storage", storage);
  win.addEventListener("pageshow", restore);
  apply();
  return () => {
    buttons.forEach((button) => button.removeEventListener("click", toggle));
    media.removeEventListener("change", apply);
    win.removeEventListener("storage", storage);
    win.removeEventListener("pageshow", restore);
  };
}
