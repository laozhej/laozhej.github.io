import { motionIsPaused } from "../preferences/motion.mjs";

// Astro owns navigation, history, focus restoration, loading and cancellation.
// This small adapter owns the lifetime of our imperative page enhancements.
export function installNavigationLifecycle(doc, win, mountPage) {
  let cleanup = () => {};
  let mountedBody;
  let keyboardNavigation = false;
  let historyPosition;
  const mount = () => {
    if (mountedBody === doc.body) return;
    cleanup();
    mountedBody = doc.body;
    cleanup = mountPage() ?? (() => {});
    if (keyboardNavigation && !win.location.hash) doc.querySelector("main")?.focus({ preventScroll: true });
    keyboardNavigation = false;
  };
  const click = (event) => {
    const link = event.target.closest?.("a[href]");
    if (link && !event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey) keyboardNavigation = event.detail === 0;
  };
  const beforeSwap = (event) => {
    // Popstate has already selected the destination history entry. Capture its
    // position before a temporary, shorter server-rendered layout can clamp it.
    const state = event.navigationType === "traverse" ? win.history?.state : undefined;
    historyPosition = Number.isFinite(state?.scrollY) ? { top: state.scrollY, left: state.scrollX ?? 0 } : undefined;
    // The parsed destination has not executed its head scripts yet. Apply the
    // current preference before Astro captures it, avoiding a light-theme flash.
    const mode = doc.documentElement.dataset.colorMode;
    if (mode) {
      event.newDocument.documentElement.dataset.colorMode = mode;
      const meta = event.newDocument.querySelector('meta[name="theme-color"]');
      const color = mode === "dark" ? meta?.dataset.colorModeDark : meta?.dataset.colorModeLight;
      if (color) meta.setAttribute("content", color);
    }
    const paused = motionIsPaused(win);
    event.newDocument.documentElement.dataset.motionPaused = String(paused);
    if (paused) event.viewTransition.skipTransition();
    cleanup();
    cleanup = () => {};
    mountedBody = undefined;
  };
  const afterSwap = () => {
    // The URL is now current, but the new view-transition snapshot has not yet
    // been taken. Establish measured homepage heights before that snapshot.
    const fromKeyboard = keyboardNavigation;
    mount();
    if (historyPosition) {
      win.scrollTo({ ...historyPosition, behavior: "instant" });
      historyPosition = undefined;
    } else if (win.location.hash) {
      // Cross-page anchors must use the enhanced layout's final geometry too.
      let id;
      try { id = decodeURIComponent(win.location.hash.slice(1)); } catch { return; }
      const target = doc.getElementById(id);
      target?.scrollIntoView({ block: "start", behavior: "instant" });
      if (fromKeyboard) target?.focus({ preventScroll: true });
    }
  };
  doc.addEventListener("click", click, true);
  doc.addEventListener("astro:before-swap", beforeSwap);
  doc.addEventListener("astro:after-swap", afterSwap);
  doc.addEventListener("astro:page-load", mount);
  mount();
  return () => {
    cleanup();
    doc.removeEventListener("click", click, true);
    doc.removeEventListener("astro:before-swap", beforeSwap);
    doc.removeEventListener("astro:after-swap", afterSwap);
    doc.removeEventListener("astro:page-load", mount);
  };
}
