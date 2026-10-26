import { mountSiteFeatures } from "../../../core/features/runtime.mjs";

export function mountBlank(doc, win) {
  const cleanup = mountSiteFeatures(doc, win);
  const missingPath = doc.querySelector("[data-blank-missing-path]");
  const from = new URL(win.location.href).searchParams.get("from");
  if (missingPath && from) {
    missingPath.textContent = from;
    missingPath.hidden = false;
  }
  return cleanup;
}
