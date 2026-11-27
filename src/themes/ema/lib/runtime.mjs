import { mountEmaHome } from "./home.mjs";
import { mountEmaStage } from "./stage.mjs";
import { mountEmaPresentation } from "./presentation.mjs";
import { mountEmaConsole } from "./console.mjs";
import { mountEmaCursorRing } from "./cursor-ring.mjs";
import { mountEmaSettings } from "./settings.mjs";
import { mountColorModeReveal } from "../../../core/preferences/color-mode-reveal.mjs";

// Ema's page enhancements; shared features are mounted by SiteNavigation.
// mountEmaStage drives the redesigned homepage (#ema-stage); mountEmaHome is the r3 homepage
// runtime (#ema-home), kept until the redesign is confirmed and then removed with its tests.
export function mountEma(doc, win) {
  // The light/dark reveal is slower and softer-eased than Blank's, like the rest of Ema's motion.
  const cleanups = [mountEmaHome(doc, win), mountEmaStage(doc, win), mountEmaPresentation(doc, win), mountEmaConsole(doc, win), mountEmaCursorRing(doc, win), mountEmaSettings(doc, win), mountColorModeReveal(doc, win, { duration: 640, easing: "cubic-bezier(0.22, 1, 0.36, 1)" })];
  return () => cleanups.reverse().forEach((cleanup) => cleanup?.());
}
