import { mountColorModeReveal } from "../../../core/preferences/color-mode-reveal.mjs";
import { mountBlankReveal } from "./reveal.mjs";

// Shared features (including the 404 missing-path hint) are mounted by SiteNavigation.
// Blank adds the circular light/dark reveal and the scroll reveal (both skipped while motion is paused or reduced).
export function mountBlank(doc, win) {
  const cleanups = [mountColorModeReveal(doc, win), mountBlankReveal(doc, win)];
  return () => cleanups.reverse().forEach((cleanup) => cleanup?.());
}
