// Themes register their own page enhancements here, so the shared navigation
// never imports theme code. A theme's layout script registers once per session;
// the shared lifecycle mounts only the runtime of the theme the page rendered.
const runtimes = new Map();
const listeners = new Set();

export function registerThemeRuntime(theme, mount) {
  // Astro may re-run an inlined layout script after a swap. Keeping the first
  // function reference makes repeated registration harmless.
  if (runtimes.has(theme)) return;
  runtimes.set(theme, mount);
  for (const listener of [...listeners]) listener(theme);
}

export function mountThemeRuntime(doc, win) {
  const theme = doc.documentElement.dataset.theme;
  let cleanup;
  const start = () => {
    const mount = runtimes.get(theme);
    if (!mount || cleanup) return;
    cleanup = mount(doc, win) ?? (() => {});
  };
  // On a first visit to a theme, its layout script runs after the swap that
  // mounted the page, so the runtime arrives late and is mounted then.
  const listener = (registered) => { if (registered === theme) start(); };
  listeners.add(listener);
  start();
  return () => {
    listeners.delete(listener);
    cleanup?.();
    cleanup = undefined;
  };
}
