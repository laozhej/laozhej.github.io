import { versionedUrl } from "./request-version.mjs";

// Prefetch a same-site page when a link is hovered (80 ms intent), focused or
// pressed, under the same versioned URL the router fetches (request-version.mjs).
// Astro's built-in prefetch requests the plain URL, which the versioned navigation
// request never reuses, so every visit downloaded each page twice; it is disabled
// in astro.config.mjs. Slow or data-saving connections only prefetch on press.
export function mountPrefetch(doc, win) {
  const done = new Set();
  let timer = 0;
  const slow = () => {
    const connection = win.navigator.connection;
    return Boolean(connection && (connection.saveData || /2g/.test(connection.effectiveType ?? "")));
  };
  const destination = (target) => {
    const link = target?.closest?.("a[href]");
    if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;
    if (link.hasAttribute("data-astro-reload") || link.dataset.astroPrefetch === "false") return;
    let url;
    try { url = new URL(link.href, win.location.href); } catch { return; }
    if (url.origin !== win.location.origin) return;
    // A link to this page (often just an anchor) never fetches.
    if (url.pathname === win.location.pathname && url.search === win.location.search) return;
    return url;
  };
  const prefetch = (url) => {
    if (win.navigator.onLine === false) return;
    const version = doc.querySelector('meta[name="site-build"]')?.content;
    const href = versionedUrl(url.href, version).href;
    if (done.has(href)) return;
    done.add(href);
    const link = doc.createElement("link");
    if (link.relList?.supports?.("prefetch")) {
      link.rel = "prefetch";
      link.href = href;
      doc.head.append(link);
    } else {
      win.fetch(href, { priority: "low", credentials: "same-origin" }).catch(() => done.delete(href));
    }
  };
  const intend = (event) => {
    const url = destination(event.target);
    if (!url || slow()) return;
    cancel();
    timer = win.setTimeout(() => prefetch(url), 80);
  };
  const cancel = () => { if (timer) win.clearTimeout(timer); timer = 0; };
  const press = (event) => {
    const url = destination(event.target);
    if (url) prefetch(url);
  };
  const listeners = [
    ["mouseover", intend], ["focusin", intend], ["mouseout", cancel], ["focusout", cancel],
    ["touchstart", press], ["mousedown", press],
  ];
  for (const [type, handler] of listeners) doc.addEventListener(type, handler, { passive: true });
  return () => {
    cancel();
    for (const [type, handler] of listeners) doc.removeEventListener(type, handler, { passive: true });
  };
}
