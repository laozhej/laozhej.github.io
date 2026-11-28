import { mountCollection } from "./collection.mjs";
import { mountReading } from "./reading.mjs";
import { mountDisclosure } from "./disclosure.mjs";
import { mountBackToTop } from "./back-to-top.mjs";
import { mountProse } from "./prose.mjs";
import { mountCommandPalette } from "./command-palette.mjs";
import { mountSerendipity } from "./serendipity.mjs";
import { mountFriends } from "./friends.mjs";
import { mountColorMode } from "../preferences/color-mode.mjs";

const mountedDocuments = new WeakMap();

// Themes provide data-site-* hooks; this entry point owns the shared behavior.
export function mountSiteFeatures(doc, win) {
  mountedDocuments.get(doc)?.();
  const missingPath = doc.querySelector("[data-blank-missing-path]");
  if (missingPath && win?.location?.href) {
    const from = new URL(win.location.href).searchParams.get("from");
    if (from) {
      missingPath.textContent = from;
      missingPath.hidden = false;
    }
  }
  const cleanups = [
    mountColorMode(doc, win),
    ...[...doc.querySelectorAll("[data-site-collection]")].map((root) => mountCollection(root, win)),
    ...[...doc.querySelectorAll("[data-site-disclosure]")].map((root) => mountDisclosure(root, win)),
    ...[...doc.querySelectorAll("[data-site-serendipity]")].map((root) => mountSerendipity(root, win)),
    ...[...doc.querySelectorAll("[data-site-friends]")].map((root) => mountFriends(root, win)),
    mountReading(doc, win),
    mountBackToTop(doc, win),
    mountProse(doc, win),
    mountCommandPalette(doc, win),
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
