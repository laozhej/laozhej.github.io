// Site-wide Command Palette & Quick Search (⌘K / Ctrl+K / `/`).
// Uses native modal <dialog closedby="any"> opened via showModal(), with Safari closedby light-dismiss
// fallback, IME-safe Enter handling (isComposing || keyCode === 229), lazy locale search-index fetching,
// instant quick actions (color mode, motion, themes, languages), and smooth top-layer exit animation.
import { supportsTopLayerExit } from "./prose.mjs";

const indexCache = new Map();

export function normalizeQuery(value) {
  return String(value ?? "").normalize("NFKC").toLowerCase().trim().replace(/\s+/g, " ");
}

export function resolveSitePath(path, localePrefix = "", themeRoot = "") {
  const clean = String(path || "/");
  const normalized = clean.startsWith("/") ? clean : `/${clean}`;
  return `${localePrefix}${themeRoot}${normalized}`;
}

export function scoreRecord(record, query, terms) {
  if (!terms.length) return 1;
  const hay = normalizeQuery(record.q || `${record.title} ${record.sub || ""}`);
  if (!terms.every((term) => hay.includes(term))) return 0;
  const title = normalizeQuery(record.title);
  let score = 10;
  if (title === query) score += 100;
  else if (title.startsWith(query)) score += 60;
  else if (title.includes(query)) score += 35;
  else if (terms.every((term) => title.includes(term))) score += 20;
  if (record.group === "pages") score += 6;
  else if (record.group === "articles" || record.group === "projects") score += 4;
  return score;
}

export function filterPaletteItems({ records = [], actions = [], query = "", maxPerGroup = 8, maxTotal = 28 }) {
  const normalized = normalizeQuery(query);
  const terms = normalized ? normalized.split(" ").filter(Boolean) : [];
  const groups = [];
  const order = ["pages", "articles", "projects", "collection", "actions"];

  if (!terms.length) {
    const byGroup = { pages: [], articles: [], projects: [], collection: [], actions: [] };
    for (const rec of records) {
      if (rec.group === "pages" && byGroup.pages.length < 6) byGroup.pages.push(rec);
      else if (rec.group === "articles" && byGroup.articles.length < 4) byGroup.articles.push(rec);
      else if (rec.group === "projects" && byGroup.projects.length < 2) byGroup.projects.push(rec);
    }
    for (const act of actions) {
      if (byGroup.actions.length < 8) byGroup.actions.push({ ...act, group: "actions" });
    }
    for (const key of order) {
      if (byGroup[key].length > 0) groups.push({ key, items: byGroup[key] });
    }
    return groups;
  }

  const scored = { pages: [], articles: [], projects: [], collection: [], actions: [] };
  for (const rec of records) {
    const score = scoreRecord(rec, normalized, terms);
    if (score > 0 && scored[rec.group]) scored[rec.group].push({ item: rec, score });
  }
  for (const act of actions) {
    const item = { ...act, group: "actions" };
    const score = scoreRecord(item, normalized, terms);
    if (score > 0) scored.actions.push({ item, score });
  }

  let total = 0;
  for (const key of order) {
    if (total >= maxTotal) break;
    const list = scored[key].sort((a, b) => b.score - a.score);
    const limit = key === "collection" ? Math.min(14, maxTotal - total) : Math.min(maxPerGroup, maxTotal - total);
    const picked = list.slice(0, limit).map(({ item }) => item);
    if (picked.length > 0) {
      groups.push({ key, items: picked });
      total += picked.length;
    }
  }
  return groups;
}

function isEditable(node) {
  if (!node || typeof node !== "object") return false;
  const tag = String(node.tagName || "").toUpperCase();
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (node.isContentEditable) return true;
  return Boolean(node.closest?.("[contenteditable=''], [contenteditable='true']"));
}

function navigateTo(doc, win, href, { reload = false } = {}) {
  const targetUrl = new URL(href, win.location.href);
  // Same page hash jump: scroll straight to the target work/section without reloading.
  if (!reload && targetUrl.origin === win.location.origin && targetUrl.pathname === win.location.pathname && targetUrl.hash) {
    const rawId = decodeURIComponent(targetUrl.hash.slice(1));
    let el = doc.getElementById(rawId);
    if (el?.hidden) {
      doc.querySelector("[data-site-reset]")?.click?.();
      el = doc.getElementById(rawId);
    }
    if (el) {
      try { win.history.replaceState(win.history.state, "", `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`); } catch { /* ignore */ }
      el.scrollIntoView?.({ behavior: doc.documentElement.dataset.motionPaused === "true" ? "auto" : "smooth", block: "center" });
      el.classList?.remove("is-cmdk-target");
      void el.offsetWidth;
      el.classList?.add("is-cmdk-target");
      win.setTimeout(() => el.classList?.remove("is-cmdk-target"), 1800);
      return;
    }
  }
  if (reload || !doc.body || typeof doc.createElement !== "function") {
    win.location.assign(href);
    return;
  }
  const link = doc.createElement("a");
  link.href = href;
  link.hidden = true;
  doc.body.append(link);
  link.click();
  link.remove();
}

export function mountCommandPalette(doc, win) {
  const dialog = doc.querySelector?.("[data-site-cmdk]");
  if (!dialog || typeof dialog.showModal !== "function") return () => {};
  const metaNode = dialog.querySelector("[data-site-cmdk-meta]");
  const input = dialog.querySelector("[data-site-cmdk-input]");
  const list = dialog.querySelector("[data-site-cmdk-list]");
  const empty = dialog.querySelector("[data-site-cmdk-empty]");
  const notice = dialog.querySelector("[data-site-cmdk-notice]");
  const status = dialog.querySelector("[data-site-cmdk-status]");
  const clearBtn = dialog.querySelector("[data-site-cmdk-clear]");
  const closeBtn = dialog.querySelector("[data-site-cmdk-close]");
  if (!metaNode || !input || !list) return () => {};

  let meta;
  try {
    meta = JSON.parse(metaNode.textContent || "{}");
  } catch {
    return () => {};
  }

  const hasMotionControl = Boolean(doc.querySelector?.("[data-motion-toggle]"));
  const actions = (meta.actions ?? []).filter((act) => act.action !== "motion" || hasMotionControl);
  const triggers = [...(doc.querySelectorAll?.("[data-site-cmdk-open]") ?? [])];
  const hiddenTriggers = triggers.filter((el) => el.hidden);
  for (const el of hiddenTriggers) el.hidden = false;

  // Update shortcut hint label for non-Apple platforms.
  const isApple = /Mac|iPhone|iPad|iPod/i.test(win.navigator?.platform || win.navigator?.userAgent || "");
  if (!isApple) {
    for (const kbd of doc.querySelectorAll?.("[data-site-cmdk-kbd]") ?? []) kbd.textContent = "Ctrl K";
  }

  let records = indexCache.get(meta.indexUrl) ?? null;
  let loading = false;
  let loadFailed = false;
  let flatItems = [];
  let activeIndex = -1;
  let lastTrigger = null;
  let disposed = false;

  const setActive = (nextIndex, scroll = true) => {
    const options = [...list.querySelectorAll('[role="option"]')];
    if (!options.length) {
      activeIndex = -1;
      input.removeAttribute("aria-activedescendant");
      return;
    }
    const clamped = ((nextIndex % options.length) + options.length) % options.length;
    activeIndex = clamped;
    options.forEach((opt, idx) => {
      const selected = idx === clamped;
      opt.setAttribute("aria-selected", String(selected));
      opt.classList.toggle("is-active", selected);
    });
    const active = options[clamped];
    input.setAttribute("aria-activedescendant", active.id);
    if (scroll) active.scrollIntoView?.({ block: "nearest" });
  };

  const render = () => {
    if (disposed) return;
    const query = input.value;
    if (clearBtn) clearBtn.hidden = !query;
    const grouped = filterPaletteItems({ records: records ?? [], actions, query });
    list.textContent = "";
    flatItems = [];

    if (notice) {
      if (loading && !records) {
        notice.textContent = meta.labels?.loading || "Loading…";
        notice.hidden = false;
      } else if (loadFailed) {
        notice.textContent = meta.labels?.loadError || "";
        notice.hidden = !notice.textContent;
      } else {
        notice.hidden = true;
        notice.textContent = "";
      }
    }

    let optCounter = 0;
    for (const group of grouped) {
      const groupEl = doc.createElement("div");
      groupEl.className = "site-cmdk-group";
      groupEl.setAttribute("role", "group");
      const titleId = `site-cmdk-grp-${group.key}`;
      groupEl.setAttribute("aria-labelledby", titleId);

      const titleEl = doc.createElement("div");
      titleEl.className = "site-cmdk-group-title";
      titleEl.id = titleId;
      titleEl.setAttribute("role", "presentation");
      titleEl.textContent = meta.labels?.groups?.[group.key] ?? group.key;
      groupEl.append(titleEl);

      for (const item of group.items) {
        const index = optCounter++;
        const opt = doc.createElement("div");
        opt.className = "site-cmdk-item";
        opt.id = `site-cmdk-opt-${index}`;
        opt.setAttribute("role", "option");
        opt.setAttribute("aria-selected", "false");
        opt.tabIndex = -1;
        opt.dataset.cmdkIndex = String(index);

        const main = doc.createElement("span");
        main.className = "site-cmdk-item-main";
        const label = doc.createElement("span");
        label.className = "site-cmdk-item-title";
        label.textContent = item.title;
        main.append(label);
        if (item.sub) {
          const sub = doc.createElement("span");
          sub.className = "site-cmdk-item-sub";
          sub.textContent = item.sub;
          main.append(sub);
        }
        opt.append(main);

        const badge = doc.createElement("span");
        badge.className = "site-cmdk-item-badge";
        badge.setAttribute("aria-hidden", "true");
        badge.textContent = item.current ? "✓" : (item.action ? "⚡" : "↵");
        opt.append(badge);

        groupEl.append(opt);
        flatItems.push(item);
      }
      list.append(groupEl);
    }

    const count = flatItems.length;
    if (empty) empty.hidden = count > 0 || loading;
    if (status && query.trim()) {
      status.textContent = count > 0
        ? (meta.labels?.count || "{n}").replace("{n}", String(count))
        : (meta.labels?.empty || "");
    } else if (status) {
      status.textContent = "";
    }
    setActive(count > 0 ? 0 : -1, false);
  };

  const ensureIndex = async () => {
    if (records || loading || !meta.indexUrl || typeof win.fetch !== "function") return;
    loading = true;
    loadFailed = false;
    render();
    try {
      const response = await win.fetch(meta.indexUrl, { headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      records = Array.isArray(payload?.items) ? payload.items : [];
      indexCache.set(meta.indexUrl, records);
    } catch {
      loadFailed = true;
      records = [];
    } finally {
      loading = false;
      render();
    }
  };

  async function closePalette() {
    if (!dialog.open) return;
    if (!supportsTopLayerExit(doc, win) && doc.documentElement.dataset.motionPaused !== "true") {
      dialog.setAttribute("data-closing", "");
      const animations = typeof dialog.getAnimations === "function" ? dialog.getAnimations({ subtree: true }) : [];
      if (animations.length > 0) {
        await Promise.race([
          Promise.allSettled(animations.map((a) => a.finished)),
          new Promise((r) => win.setTimeout(r, 400)),
        ]);
      }
      if (!dialog.hasAttribute("data-closing")) return;
      dialog.removeAttribute("data-closing");
    }
    if (dialog.open) dialog.close();
  }

  const openPalette = (trigger = null) => {
    if (dialog.open) return;
    dialog.removeAttribute("data-closing");
    lastTrigger = trigger ?? doc.activeElement;
    input.value = "";
    render();
    dialog.showModal();
    input.focus?.();
    ensureIndex();
  };

  const activate = async (item, { newTab = false } = {}) => {
    if (!item) return;
    if (item.action === "mode") {
      await closePalette();
      doc.querySelector("[data-color-mode-toggle]")?.click?.();
      return;
    }
    if (item.action === "motion") {
      await closePalette();
      doc.querySelector("[data-motion-toggle]")?.click?.();
      return;
    }
    if (item.action === "theme") {
      try { win.localStorage?.setItem("site-theme", item.themeId); } catch { /* ignore */ }
      await closePalette();
      if (newTab) win.open?.(item.href, "_blank", "noopener");
      else navigateTo(doc, win, item.href, { reload: true });
      return;
    }
    if (item.action === "locale") {
      try { win.localStorage?.setItem("site-locale", item.localeId); } catch { /* ignore */ }
      await closePalette();
      if (newTab) win.open?.(item.href, "_blank", "noopener");
      else navigateTo(doc, win, item.href);
      return;
    }
    const href = resolveSitePath(item.path, meta.localePrefix, meta.themeRoot);
    await closePalette();
    if (newTab) win.open?.(href, "_blank", "noopener");
    else navigateTo(doc, win, href);
  };

  const onInput = () => render();
  const onClear = () => {
    input.value = "";
    input.focus?.();
    render();
  };
  const onCloseBtn = () => { closePalette(); };

  const onInputKeydown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive(activeIndex + 1);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive(activeIndex - 1);
      return;
    }
    if (event.key === "Home" && flatItems.length > 0 && !input.value) {
      event.preventDefault();
      setActive(0);
      return;
    }
    if (event.key === "End" && flatItems.length > 0 && !input.value) {
      event.preventDefault();
      setActive(flatItems.length - 1);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      // IME-safe enter handling (handles Chrome/Firefox isComposing and Safari keyCode 229).
      if (event.isComposing || event.keyCode === 229) return;
      if (activeIndex >= 0 && flatItems[activeIndex]) {
        activate(flatItems[activeIndex], { newTab: event.metaKey || event.ctrlKey });
      }
    }
  };

  const onListClick = (event) => {
    const opt = event.target?.closest?.('[role="option"]');
    if (!opt) return;
    const index = Number(opt.dataset.cmdkIndex);
    if (Number.isInteger(index) && flatItems[index]) {
      activate(flatItems[index], { newTab: event.metaKey || event.ctrlKey });
    }
  };

  const onListMouseMove = (event) => {
    const opt = event.target?.closest?.('[role="option"]');
    if (!opt) return;
    const index = Number(opt.dataset.cmdkIndex);
    if (Number.isInteger(index) && index !== activeIndex) setActive(index, false);
  };

  const onCancel = (event) => {
    if (!supportsTopLayerExit(doc, win)) {
      event.preventDefault();
      closePalette();
    }
  };

  const onDialogClose = () => {
    dialog.removeAttribute("data-closing");
    if (lastTrigger && lastTrigger.isConnected !== false) lastTrigger.focus?.();
    lastTrigger = null;
  };

  // Fallback light-dismiss for browsers without closedby support (Safari).
  let pressedOutside = false;
  const isOutside = (event) => {
    const r = dialog.getBoundingClientRect();
    return event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom;
  };
  const onPointerDown = (event) => { pressedOutside = isOutside(event); };
  const onPointerUp = (event) => {
    if (pressedOutside && isOutside(event)) closePalette();
    pressedOutside = false;
  };
  const needsClosedByFallback = typeof win.HTMLDialogElement === "function" && !("closedBy" in win.HTMLDialogElement.prototype);
  if (needsClosedByFallback) {
    dialog.addEventListener("pointerdown", onPointerDown);
    dialog.addEventListener("pointerup", onPointerUp);
  }

  const onGlobalKeydown = (event) => {
    if (event.isComposing || event.keyCode === 229) return;
    const mod = event.metaKey || event.ctrlKey;
    if (mod && !event.altKey && !event.shiftKey && String(event.key).toLowerCase() === "k") {
      event.preventDefault();
      if (dialog.open) closePalette();
      else openPalette(doc.activeElement);
      return;
    }
    if (!mod && !event.altKey && event.key === "/" && !dialog.open && !isEditable(event.target)) {
      // Do not hijack `/` when another modal dialog (e.g. image lightbox) is open.
      if (doc.querySelector?.("dialog[open]")) return;
      event.preventDefault();
      openPalette(doc.activeElement);
    }
  };

  const onTriggerClick = (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || (typeof event.button === "number" && event.button !== 0)) return;
    event.preventDefault();
    openPalette(event.currentTarget);
  };

  input.addEventListener("input", onInput);
  input.addEventListener("keydown", onInputKeydown);
  clearBtn?.addEventListener("click", onClear);
  closeBtn?.addEventListener("click", onCloseBtn);
  list.addEventListener("click", onListClick);
  list.addEventListener("mousemove", onListMouseMove);
  dialog.addEventListener("cancel", onCancel);
  dialog.addEventListener("close", onDialogClose);
  doc.addEventListener("keydown", onGlobalKeydown);
  for (const el of triggers) el.addEventListener("click", onTriggerClick);

  return () => {
    disposed = true;
    input.removeEventListener("input", onInput);
    input.removeEventListener("keydown", onInputKeydown);
    clearBtn?.removeEventListener("click", onClear);
    closeBtn?.removeEventListener("click", onCloseBtn);
    list.removeEventListener("click", onListClick);
    list.removeEventListener("mousemove", onListMouseMove);
    dialog.removeEventListener("cancel", onCancel);
    dialog.removeEventListener("close", onDialogClose);
    dialog.removeEventListener("pointerdown", onPointerDown);
    dialog.removeEventListener("pointerup", onPointerUp);
    doc.removeEventListener("keydown", onGlobalKeydown);
    for (const el of triggers) el.removeEventListener("click", onTriggerClick);
    for (const el of hiddenTriggers) el.hidden = true;
    if (dialog.open) dialog.close();
  };
}
