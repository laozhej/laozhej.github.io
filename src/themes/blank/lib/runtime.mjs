import { mountColorModeReveal } from "../../../core/preferences/color-mode-reveal.mjs";
import { mountBlankReveal } from "./reveal.mjs";

// Shared features are mounted by SiteNavigation. Blank adds its 404 path hint, the circular
// light/dark reveal and the scroll reveal (both skipped while motion is paused or reduced).
export function mountBlank(doc, win) {
  const missingPath = doc.querySelector("[data-blank-missing-path]");
  const from = new URL(win.location.href).searchParams.get("from");
  if (missingPath && from) {
    missingPath.textContent = from;
    missingPath.hidden = false;
  }
  const cleanups = [mountColorModeReveal(doc, win), mountBlankReveal(doc, win)];
  return () => cleanups.reverse().forEach((cleanup) => cleanup?.());
}
