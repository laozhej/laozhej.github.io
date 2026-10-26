const STORAGE_KEY = "blank-color-mode";

export function mountColorMode(doc, win) {
  const button = doc.querySelector("[data-color-mode-toggle]");
  if (!button) return () => {};
  const system = win.matchMedia("(prefers-color-scheme: dark)");
  const readPreference = (fallback = null) => {
    try {
      const saved = win.localStorage.getItem(STORAGE_KEY);
      return saved === "light" || saved === "dark" ? saved : null;
    } catch {
      return fallback;
    }
  };
  let preference = readPreference();
  const apply = () => {
    const mode = preference ?? (system.matches ? "dark" : "light");
    doc.documentElement.dataset.colorMode = mode;
    doc.querySelector('meta[name="theme-color"]')?.setAttribute("content", mode === "dark" ? "#141414" : "#ffffff");
    button.setAttribute("aria-pressed", String(mode === "dark"));
    button.title = mode === "dark" ? button.dataset.labelLight : button.dataset.labelDark;
  };
  const toggle = () => {
    preference = doc.documentElement.dataset.colorMode === "dark" ? "light" : "dark";
    try { win.localStorage.setItem(STORAGE_KEY, preference); } catch {}
    apply();
  };
  const restore = () => {
    preference = readPreference(preference);
    apply();
  };
  const syncStorage = (event) => {
    if (event.key === STORAGE_KEY || event.key === null) restore();
  };
  const syncSystem = () => { if (preference === null) apply(); };

  apply();
  button.hidden = false;
  button.addEventListener("click", toggle);
  system.addEventListener("change", syncSystem);
  win.addEventListener("storage", syncStorage);
  win.addEventListener("pageshow", restore);
  return () => {
    button.removeEventListener("click", toggle);
    system.removeEventListener("change", syncSystem);
    win.removeEventListener("storage", syncStorage);
    win.removeEventListener("pageshow", restore);
  };
}
