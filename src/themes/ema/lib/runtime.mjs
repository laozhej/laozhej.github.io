import { mountEmaHome } from "./home.mjs";
import { mountEmaStage } from "./stage.mjs";
import { mountEmaPresentation } from "./presentation.mjs";
import { mountEmaConsole } from "./console.mjs";
import { mountEmaCursorRing } from "./cursor-ring.mjs";
import { mountEmaSettings } from "./settings.mjs";

// Ema's page enhancements; shared features are mounted by SiteNavigation.
// mountEmaStage drives the redesigned homepage (#ema-stage); mountEmaHome is the r3 homepage
// runtime (#ema-home), kept until the redesign is confirmed and then removed with its tests.
export function mountEma(doc, win) {
  const cleanups = [mountEmaHome(doc, win), mountEmaStage(doc, win), mountEmaPresentation(doc, win), mountEmaConsole(doc, win), mountEmaCursorRing(doc, win), mountEmaSettings(doc, win)];
  return () => cleanups.reverse().forEach((cleanup) => cleanup?.());
}
