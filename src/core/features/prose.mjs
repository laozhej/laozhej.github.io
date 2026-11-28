// Shared article & gallery enhancements:
// 1. Code block copy buttons (Invoker Commands `command="--copy"` + `commandfor`, with click fallback,
//    Async Clipboard API + legacyCopy fallback, and role="status" live announcements).
// 2. Heading `#` anchor links inside `[data-site-prose]` with permalink click-to-copy.
// 3. Native modal `<dialog>` image lightbox (`closedby="any"` + fallback, top-layer entry/exit animations
//    with `overlay` + `transition-behavior: allow-discrete` + `data-closing` fallback for Firefox/Safari).

const SVG_NS = "http://www.w3.org/2000/svg";

function iconSvg(doc, cls, paths) {
  const svg = doc.createElementNS(SVG_NS, "svg");
  svg.setAttribute("class", cls);
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", "16");
  svg.setAttribute("height", "16");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "1.8");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");
  for (const d of paths) {
    const p = doc.createElementNS(SVG_NS, "path");
    p.setAttribute("d", d);
    svg.append(p);
  }
  return svg;
}

const COPY_PATHS = [
  "M7 9.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z",
  "M4.012 16.737a2 2 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1",
];
const CHECK_PATHS = ["M5 12l5 5l10 -10"];
const CLOSE_PATHS = ["M18 6l-12 12", "M6 6l12 12"];

function legacyCopy(doc, text) {
  const previousFocus = doc.activeElement;
  const field = Object.assign(doc.createElement("textarea"), { value: text });
  field.setAttribute("readonly", "");
  field.style.cssText = "position:fixed;inset-block-start:0;opacity:0";
  doc.body.append(field);
  field.select();
  try {
    return typeof doc.execCommand === "function" && doc.execCommand("copy");
  } finally {
    field.remove();
    previousFocus?.focus?.({ preventScroll: true });
  }
}

export async function writeClipboard(doc, win, text) {
  try {
    if (win.navigator?.clipboard?.writeText) {
      await win.navigator.clipboard.writeText(text);
      return true;
    }
  } catch { /* Fall through to legacyCopy. */ }
  return legacyCopy(doc, text);
}

const displayTransitionSupport = new WeakMap();
export function canTransitionDisplay(doc = document, win = window) {
  if (displayTransitionSupport.has(win)) return displayTransitionSupport.get(win);
  if (!win.CSS?.supports?.("transition-behavior", "allow-discrete") || !doc.body || typeof win.getComputedStyle !== "function") {
    return false;
  }
  const probe = doc.createElement("div");
  probe.style.cssText = "transition: display 1s allow-discrete !important; display: block;";
  doc.body.append(probe);
  win.getComputedStyle(probe).display;
  probe.style.display = "none";
  const supported = win.getComputedStyle(probe).display === "block";
  probe.remove();
  displayTransitionSupport.set(win, supported);
  return supported;
}

export function supportsTopLayerExit(doc = document, win = window) {
  return Boolean(win.CSS?.supports?.("overlay", "auto") && canTransitionDisplay(doc, win));
}

export const CODE_COLLAPSE_THRESHOLD = 18;
export const CODE_PREVIEW_LINES = 12;

export function countCodeLines(pre) {
  const lineNodes = pre?.querySelectorAll?.(".line");
  if (lineNodes && lineNodes.length > 0) {
    let count = lineNodes.length;
    const last = lineNodes[count - 1];
    if (count > 1 && !(last.textContent || "").length) count--;
    return count;
  }
  const code = pre?.querySelector?.("code") ?? pre;
  const raw = (code?.textContent ?? "").replace(/\r?\n$/, "");
  return raw ? raw.split(/\r?\n/).length : 0;
}

export function mountProse(doc, win) {
  const rawProse = doc.querySelector?.("[data-site-prose]");
  const prose = rawProse && typeof rawProse.querySelectorAll === "function" ? rawProse : null;
  const lightboxRoots = [...(doc.querySelectorAll?.("[data-site-lightbox]") ?? [])].filter(
    (el) => el && typeof el.querySelectorAll === "function",
  );
  if (!prose && lightboxRoots.length === 0) return () => {};

  const labelsSource =
    (prose?.dataset?.copyCode || prose?.dataset?.lightboxOpen ? prose : null) ??
    prose?.closest?.("[data-copy-code], [data-lightbox-open]") ??
    prose ??
    lightboxRoots[0];
  const dataset = labelsSource?.dataset ?? {};
  const labels = {
    copyCode: dataset.copyCode || "Copy code",
    copyCodeLang: dataset.copyCodeLang || "Copy {lang} code",
    copied: dataset.copied || "Copied",
    copyFailed: dataset.copyFailed || "Copy failed",
    copyHeading: dataset.copyHeading || "Copy link to {title}",
    lightboxOpen: dataset.lightboxOpen || "Zoom image: {alt}",
    lightboxLabel: dataset.lightboxLabel || "Image preview",
    lightboxClose: dataset.lightboxClose || "Close preview",
    codeExpand: dataset.codeExpand || "Expand remaining {n} lines",
    codeCollapse: dataset.codeCollapse || "Collapse code block",
  };

  const cleanups = [];
  const timers = new WeakMap();
  let lastMessage = "";

  const report = (control, tip, ok) => {
    if (!control || !tip) return;
    win.clearTimeout(timers.get(control));
    control.removeAttribute("data-copied");
    control.removeAttribute("data-failed");
    let message = ok ? labels.copied : labels.copyFailed;
    if (message === lastMessage) message += "\u00A0";
    lastMessage = message;
    tip.textContent = "";
    void control.offsetWidth;
    control.setAttribute(ok ? "data-copied" : "data-failed", "");
    win.requestAnimationFrame(() => { tip.textContent = message; });
    timers.set(control, win.setTimeout(() => {
      control.removeAttribute("data-copied");
      control.removeAttribute("data-failed");
      tip.textContent = "";
    }, 2000));
  };

  // ---- 1. Code block copy buttons (Invoker Commands + fallback) ------------------------------
  async function copyElement(button, target) {
    const text = target?.matches?.("input, textarea") ? target.value : (target?.innerText ?? target?.textContent ?? "").trim();
    if (!text) return;
    const tip = button.nextElementSibling;
    const ok = await writeClipboard(doc, win, text);
    report(button, tip, ok);
  }

  let codeIndex = 0;
  if (prose) {
    for (const pre of [...prose.querySelectorAll("pre")]) {
      if (pre.closest(".site-code-block")) continue;
      const code = pre.querySelector("code") ?? pre;
      if (!code.id) code.id = `site-code-${codeIndex++}`;
      const lang = (pre.dataset.language || "").trim();
      const showLang = lang && !/^(plaintext|text|txt)$/i.test(lang);
      const ariaLabel = showLang ? labels.copyCodeLang.replace("{lang}", lang) : labels.copyCode;

      const wrapper = doc.createElement("div");
      wrapper.className = "site-code-block copyable";
      const copyHost = doc.createElement("span");
      copyHost.className = "site-copy";
      if (showLang) {
        const badge = doc.createElement("span");
        badge.className = "site-code-lang";
        badge.setAttribute("aria-hidden", "true");
        badge.textContent = lang;
        copyHost.append(badge);
      }
      const button = doc.createElement("button");
      button.type = "button";
      button.className = "site-copy-button";
      button.setAttribute("command", "--copy");
      button.setAttribute("commandfor", code.id);
      button.setAttribute("aria-label", ariaLabel);
      button.append(
        iconSvg(doc, "site-copy-icon site-copy-icon--copy", COPY_PATHS),
        iconSvg(doc, "site-copy-icon site-copy-icon--ok", CHECK_PATHS),
      );
      const tip = doc.createElement("span");
      tip.className = "site-copy-tip";
      tip.setAttribute("role", "status");
      copyHost.append(button, tip);

      pre.before(wrapper);
      wrapper.append(copyHost, pre);
      if (!pre.hasAttribute("tabindex")) pre.setAttribute("tabindex", "0");

      const totalLines = countCodeLines(pre);
      let foldBtn = null;
      let onFoldClick = null;
      if (totalLines >= CODE_COLLAPSE_THRESHOLD) {
        const hiddenLines = Math.max(1, totalLines - CODE_PREVIEW_LINES);
        wrapper.classList.add("is-collapsible");
        wrapper.dataset.collapsed = "true";
        foldBtn = doc.createElement("button");
        foldBtn.type = "button";
        foldBtn.className = "site-code-fold";
        foldBtn.setAttribute("aria-expanded", "false");
        foldBtn.setAttribute("aria-controls", code.id);
        foldBtn.textContent = labels.codeExpand.replace("{n}", String(hiddenLines));
        onFoldClick = () => {
          const nextOpen = wrapper.dataset.collapsed === "true";
          wrapper.dataset.collapsed = nextOpen ? "false" : "true";
          foldBtn.setAttribute("aria-expanded", String(nextOpen));
          foldBtn.textContent = nextOpen
            ? labels.codeCollapse
            : labels.codeExpand.replace("{n}", String(hiddenLines));
        };
        foldBtn.addEventListener("click", onFoldClick);
        wrapper.append(foldBtn);
      }

      cleanups.push(() => {
        win.clearTimeout(timers.get(button));
        if (foldBtn && onFoldClick) foldBtn.removeEventListener("click", onFoldClick);
        wrapper.before(pre);
        wrapper.remove();
      });
    }

    // Register ONLY one path so a click never copies twice.
    if ("CommandEvent" in win) {
      const onCommand = (event) => {
        if (event.command === "--copy" && prose.contains(event.source)) {
          copyElement(event.source, event.target);
        }
      };
      doc.addEventListener("command", onCommand, true);
      cleanups.push(() => doc.removeEventListener("command", onCommand, true));
    } else {
      const onClick = (event) => {
        if (event.defaultPrevented) return;
        const button = event.target?.closest?.('button[command="--copy"]');
        if (!button || !prose.contains(button)) return;
        const target = doc.getElementById(button.getAttribute("commandfor"));
        if (target) copyElement(button, target);
      };
      doc.addEventListener("click", onClick);
      cleanups.push(() => doc.removeEventListener("click", onClick));
    }

    // ---- 2. Heading `#` anchors with permalink copy ------------------------------------------
    for (const heading of [...prose.querySelectorAll("h2[id], h3[id]")]) {
      if (heading.querySelector(".heading-anchor")) continue;
      const title = heading.textContent?.trim() ?? "";
      const id = heading.id;
      const wrap = doc.createElement("span");
      wrap.className = "site-heading-copy";
      const anchor = doc.createElement("a");
      anchor.className = "heading-anchor";
      anchor.href = `#${encodeURIComponent(id)}`;
      anchor.setAttribute("aria-label", labels.copyHeading.replace("{title}", title));
      const hash = doc.createElement("span");
      hash.setAttribute("aria-hidden", "true");
      hash.textContent = "#";
      anchor.append(hash);
      const tip = doc.createElement("span");
      tip.className = "site-copy-tip heading-anchor-tip";
      tip.setAttribute("role", "status");
      wrap.append(anchor, tip);
      heading.append(wrap);

      const onAnchorClick = async (event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
        const url = new URL(`#${encodeURIComponent(id)}`, win.location.href).href;
        const ok = await writeClipboard(doc, win, url);
        report(anchor, tip, ok);
      };
      anchor.addEventListener("click", onAnchorClick);
      cleanups.push(() => {
        win.clearTimeout(timers.get(anchor));
        anchor.removeEventListener("click", onAnchorClick);
        wrap.remove();
      });
    }
  }

  // ---- 3. Native modal <dialog> lightbox -----------------------------------------------------
  const zoomRoots = [prose, ...lightboxRoots].filter(Boolean);
  const zoomImages = [];
  for (const root of zoomRoots) {
    for (const img of [...root.querySelectorAll("img")]) {
      if (img.closest("a, button, summary, dialog, [aria-hidden='true']")) continue;
      if (zoomImages.includes(img)) continue;
      zoomImages.push(img);
    }
  }

  if (zoomImages.length > 0 && typeof win.HTMLDialogElement === "function") {
    const dialog = doc.createElement("dialog");
    dialog.className = "site-lightbox";
    dialog.setAttribute("closedby", "any");
    dialog.setAttribute("aria-label", labels.lightboxLabel);

    const frame = doc.createElement("div");
    frame.className = "site-lightbox-frame";
    const closeBtn = doc.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "site-lightbox-close";
    closeBtn.setAttribute("aria-label", labels.lightboxClose);
    closeBtn.title = labels.lightboxClose;
    closeBtn.append(iconSvg(doc, "site-lightbox-close-icon", CLOSE_PATHS));

    const figure = doc.createElement("figure");
    figure.className = "site-lightbox-figure";
    const preview = doc.createElement("img");
    preview.className = "site-lightbox-img";
    preview.alt = "";
    const caption = doc.createElement("figcaption");
    caption.className = "site-lightbox-caption";
    caption.hidden = true;
    figure.append(preview, caption);
    frame.append(closeBtn, figure);
    dialog.append(frame);
    doc.body.append(dialog);

    let lastTrigger = null;

    async function closeTopLayer() {
      if (!dialog.open) return;
      if (!supportsTopLayerExit(doc, win) && doc.documentElement.dataset.motionPaused !== "true") {
        dialog.setAttribute("data-closing", "");
        const animations = typeof dialog.getAnimations === "function" ? dialog.getAnimations({ subtree: true }) : [];
        if (animations.length > 0) {
          await Promise.race([
            Promise.allSettled(animations.map((a) => a.finished)),
            new Promise((r) => win.setTimeout(r, 600)),
          ]);
        }
        if (!dialog.hasAttribute("data-closing")) return;
        dialog.removeAttribute("data-closing");
      }
      if (dialog.open) dialog.close();
    }

    const onCloseBtn = () => { closeTopLayer(); };
    closeBtn.addEventListener("click", onCloseBtn);

    const onCancel = (event) => {
      if (!supportsTopLayerExit(doc, win)) {
        event.preventDefault();
        closeTopLayer();
      }
    };
    dialog.addEventListener("cancel", onCancel);

    const onDialogClose = () => {
      dialog.removeAttribute("data-closing");
      lastTrigger?.focus?.();
      lastTrigger = null;
    };
    dialog.addEventListener("close", onDialogClose);

    // Fallback light-dismiss for browsers without closedby support (Safari).
    let backdropDown = false;
    const isOutsideDialog = (event) => {
      const rect = dialog.getBoundingClientRect();
      return (
        event.clientY < rect.top ||
        event.clientY > rect.bottom ||
        event.clientX < rect.left ||
        event.clientX > rect.right
      );
    };
    const onPointerDown = (event) => {
      backdropDown = event.target === dialog && isOutsideDialog(event);
    };
    const onBackdropClick = (event) => {
      if (!backdropDown) return;
      backdropDown = false;
      if (event.target === dialog && isOutsideDialog(event)) closeTopLayer();
    };
    if (!("closedBy" in win.HTMLDialogElement.prototype)) {
      dialog.addEventListener("pointerdown", onPointerDown);
      dialog.addEventListener("click", onBackdropClick);
    }

    for (const img of zoomImages) {
      const trigger = doc.createElement("button");
      trigger.type = "button";
      trigger.className = "site-zoom-trigger";
      const altText = img.getAttribute("alt")?.trim() || "";
      const fig = img.closest("figure");
      const figEl = fig && !fig.classList?.contains("article-side-illustration") ? fig.querySelector("figcaption") : null;
      const figParts = figEl?.childNodes?.length
        ? [...figEl.childNodes].map((node) => node.textContent?.trim() || "").filter(Boolean)
        : [];
      const figText = figParts.length > 0 ? figParts.join(" · ") : (figEl?.textContent?.trim() || "");
      trigger.setAttribute("aria-label", labels.lightboxOpen.replace("{alt}", altText || figText || labels.lightboxLabel));

      img.before(trigger);
      trigger.append(img);

      const onOpen = () => {
        if (dialog.open) return;
        dialog.removeAttribute("data-closing");
        lastTrigger = trigger;
        preview.src = img.currentSrc || img.src;
        preview.alt = altText;
        const captionText = figText || altText;
        caption.textContent = captionText;
        caption.hidden = !captionText;
        dialog.showModal();
      };
      trigger.addEventListener("click", onOpen);
      cleanups.push(() => {
        trigger.removeEventListener("click", onOpen);
        trigger.before(img);
        trigger.remove();
      });
    }

    cleanups.push(() => {
      closeBtn.removeEventListener("click", onCloseBtn);
      dialog.removeEventListener("cancel", onCancel);
      dialog.removeEventListener("close", onDialogClose);
      dialog.removeEventListener("pointerdown", onPointerDown);
      dialog.removeEventListener("click", onBackdropClick);
      if (dialog.open) dialog.close();
      dialog.remove();
    });
  }

  return () => {
    for (const cleanup of cleanups.reverse()) cleanup();
  };
}
