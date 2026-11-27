// This legacy key is now site-wide. Keep it so existing visitors retain their choice.
export const COLOR_MODE_STORAGE_KEY = "blank-color-mode";
export const DEFAULT_COLOR_MODE_COLORS = { light: "#ffffff", dark: "#141414" };
const sessionPreferences = new WeakMap();

export function mountColorMode(doc, win) {
  const buttons = [...doc.querySelectorAll("[data-color-mode-toggle]")];
  const system = win.matchMedia("(prefers-color-scheme: dark)");
  const readPreference = (fallback = null) => {
    try {
      const saved = win.localStorage.getItem(COLOR_MODE_STORAGE_KEY);
      return saved === "light" || saved === "dark" ? saved : null;
    } catch {
      return fallback;
    }
  };
  let preference = readPreference(sessionPreferences.get(win));
  const apply = () => {
    const mode = preference ?? (system.matches ? "dark" : "light");
    doc.documentElement.dataset.colorMode = mode;
    const meta = doc.querySelector('meta[name="theme-color"]');
    const colors = {
      light: meta?.dataset.colorModeLight ?? DEFAULT_COLOR_MODE_COLORS.light,
      dark: meta?.dataset.colorModeDark ?? DEFAULT_COLOR_MODE_COLORS.dark,
    };
    meta?.setAttribute("content", colors[mode]);
    for (const button of buttons) {
      button.setAttribute("aria-pressed", String(mode === "dark"));
      button.title = mode === "dark" ? button.dataset.labelLight : button.dataset.labelDark;
    }
  };
  // Every press still switches to the other mode. Switching to the mode the system is using drops the
  // saved choice, so the page follows the system again, the way it did before the first press.
  const toggle = () => {
    const next = doc.documentElement.dataset.colorMode === "dark" ? "light" : "dark";
    preference = next === (system.matches ? "dark" : "light") ? null : next;
    sessionPreferences.set(win, preference);
    try {
      if (preference) win.localStorage.setItem(COLOR_MODE_STORAGE_KEY, preference);
      else win.localStorage.removeItem(COLOR_MODE_STORAGE_KEY);
    } catch {}
    apply();
  };
  const restore = () => {
    preference = readPreference(preference);
    apply();
  };
  const syncStorage = (event) => {
    if (event.key === COLOR_MODE_STORAGE_KEY || event.key === null) restore();
  };
  const syncSystem = () => { if (preference === null) apply(); };

  apply();
  for (const button of buttons) {
    button.hidden = false;
    button.addEventListener("click", toggle);
  }
  system.addEventListener("change", syncSystem);
  win.addEventListener("storage", syncStorage);
  win.addEventListener("pageshow", restore);
  return () => {
    for (const button of buttons) button.removeEventListener("click", toggle);
    system.removeEventListener("change", syncSystem);
    win.removeEventListener("storage", syncStorage);
    win.removeEventListener("pageshow", restore);
  };
}
