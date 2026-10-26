import { mountCollection } from "./collection.mjs";
import { mountReading } from "./reading.mjs";
import { mountColorMode } from "../preferences/color-mode.mjs";

const mountedDocuments = new WeakMap();

// Themes provide data-site-* hooks; this entry point owns the shared behavior.
export function mountSiteFeatures(doc, win) {
  mountedDocuments.get(doc)?.();
  const cleanups = [
    mountColorMode(doc, win),
    ...[...doc.querySelectorAll("[data-site-collection]")].map((root) => mountCollection(root, win)),
    mountReading(doc, win),
  ];
  let disposed = false;
  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    for (const remove of cleanups) remove();
    win.removeEventListener("pagehide", pagehide);
    mountedDocuments.delete(doc);
  };
  // A cached page keeps its listeners so browser back/forward restores it intact.
  const pagehide = (event) => { if (!event.persisted) cleanup(); };
  win.addEventListener("pagehide", pagehide);
  mountedDocuments.set(doc, cleanup);
  return cleanup;
}
