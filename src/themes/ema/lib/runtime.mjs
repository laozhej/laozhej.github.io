import { mountEmaHome } from "./home.mjs";
import { mountEmaPresentation } from "./presentation.mjs";

// Ema's page enhancements; shared features are mounted by SiteNavigation.
export function mountEma(doc, win) {
  const cleanups = [mountEmaHome(doc, win), mountEmaPresentation(doc, win)];
  return () => cleanups.reverse().forEach((cleanup) => cleanup?.());
}
