// Accessible section-heading link copy buttons inside [data-site-prose].
// Follows modern-web-guidance/copy-button: Invoker Commands (command + commandfor) with a single-path
// click fallback, Async Clipboard API with failure reporting, role="status" outside the button,
// WeakMap timer cleanup, and a no-break space toggle so VoiceOver announces repeated copies.

const HASH_SVG = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 9l14 0"/><path d="M5 15l14 0"/><path d="M11 4l-4 16"/><path d="M17 4l-4 16"/></svg>';
const CHECK_SVG = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5l10 -10"/></svg>';

function headingText(heading) {
  let text = "";
  for (const node of heading.childNodes) {
    if (node.nodeType === 3) text += node.nodeValue ?? "";
    else if (node.nodeType === 1 && !node.classList?.contains("site-heading-copy")) text += node.textContent ?? "";
  }
  return text.trim();
}

export function mountProseAnchors(doc, win) {
  const prose = doc.querySelector("[data-site-prose]");
  if (!prose || typeof prose.querySelectorAll !== "function") return () => {};
  const host = prose.closest?.("[data-copy-heading-label]") ?? prose;
  const labelTpl = host.dataset?.copyHeadingLabel ?? "Copy link to section: {title}";
  const copiedText = host.dataset?.copiedText ?? "Link copied";
  const failedText = host.dataset?.copyFailedText ?? "Copy failed";

  const headings = [...prose.querySelectorAll("h2[id], h3[id]")];
  if (!headings.length) return () => {};

  const created = [];
  const timers = new WeakMap();
  const activeTimers = new Set();
  let lastMessage = "";

  for (const heading of headings) {
    if (heading.querySelector(".site-heading-copy")) continue;
    const title = headingText(heading);
    const wrap = doc.createElement("span");
    wrap.className = "site-heading-copy";

    const button = doc.createElement("button");
    button.type = "button";
    button.className = "site-copy-button";
    button.setAttribute("command", "--copy-heading");
    button.setAttribute("commandfor", heading.id);
    button.setAttribute("aria-label", labelTpl.replace("{title}", title || heading.id));
    button.innerHTML = `<span class="site-copy-icon site-copy-icon--idle">${HASH_SVG}</span><span class="site-copy-icon site-copy-icon--done">${CHECK_SVG}</span>`;

    const tip = doc.createElement("span");
    tip.className = "site-copy-tip";
    tip.setAttribute("role", "status");

    wrap.append(button, tip);
    heading.classList.add("site-copyable-heading");
    heading.append(wrap);
    created.push({ heading, wrap });
  }

  function report(button, ok) {
    const tip = button.nextElementSibling;
    if (!tip) return;
    const prev = timers.get(button);
    if (prev) {
      win.clearTimeout(prev);
      activeTimers.delete(prev);
    }
    button.removeAttribute("data-copied");
    button.removeAttribute("data-failed");
    let message = ok ? copiedText : failedText;
    // VoiceOver skips identical consecutive status announcements even after clearing.
    if (message === lastMessage) message += "\u00A0";
    lastMessage = message;
    tip.textContent = "";
    void button.offsetWidth;
    button.setAttribute(ok ? "data-copied" : "data-failed", "");
    win.requestAnimationFrame(() => { tip.textContent = message; });
    const id = win.setTimeout(() => {
      activeTimers.delete(id);
      timers.delete(button);
      button.removeAttribute("data-copied");
      button.removeAttribute("data-failed");
      tip.textContent = "";
    }, 2000);
    timers.set(button, id);
    activeTimers.add(id);
  }

  async function copyHeadingUrl(button, target) {
    if (!target?.id) return;
    const url = `${win.location.origin}${win.location.pathname}#${encodeURIComponent(target.id)}`;
    try {
      if (!win.navigator?.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await win.navigator.clipboard.writeText(url);
      report(button, true);
    } catch {
      report(button, false);
    }
  }

  const useCommand = "CommandEvent" in win;
  const onCommand = (event) => {
    if (event.command !== "--copy-heading") return;
    if (!prose.contains(event.target)) return;
    copyHeadingUrl(event.source, event.target);
  };
  const onClick = (event) => {
    if (event.defaultPrevented) return;
    const button = event.target?.closest?.('button[command="--copy-heading"]');
    if (!button || !prose.contains(button)) return;
    const target = doc.getElementById(button.getAttribute("commandfor") ?? "");
    if (target) copyHeadingUrl(button, target);
  };

  if (useCommand) doc.addEventListener("command", onCommand, true);
  else doc.addEventListener("click", onClick);

  return () => {
    if (useCommand) doc.removeEventListener("command", onCommand, true);
    else doc.removeEventListener("click", onClick);
    for (const id of activeTimers) win.clearTimeout(id);
    activeTimers.clear();
    for (const { heading, wrap } of created) {
      heading.classList.remove("site-copyable-heading");
      wrap.remove();
    }
  };
}
