// Collection Serendipity random picker ("随机抽一部 / Pick one at random").
// Draws from real entries in the active collection view (respecting active genre/search filters on a shelf),
// avoids immediate repeats when >= 2 candidates exist, and jumps smoothly to the picked work.

export function pickRandomEntry(pool, lastKey = "", random = Math.random) {
  if (!Array.isArray(pool) || pool.length === 0) return null;
  const candidates = pool.length > 1 && lastKey ? pool.filter((item) => item.key !== lastKey) : pool;
  const list = candidates.length > 0 ? candidates : pool;
  const idx = Math.min(list.length - 1, Math.max(0, Math.floor(random() * list.length)));
  return list[idx];
}

export function mountSerendipity(root, win, random = Math.random) {
  const dataNode = root.querySelector("[data-site-serendipity-data]");
  const pickBtn = root.querySelector("[data-site-serendipity-pick]");
  const againBtn = root.querySelector("[data-site-serendipity-again]");
  const closeBtn = root.querySelector("[data-site-serendipity-close]");
  const jumpBtn = root.querySelector("[data-site-serendipity-jump]");
  const openLink = root.querySelector("[data-site-serendipity-open]");
  const extLink = root.querySelector("[data-site-serendipity-ext]");
  const extLabel = root.querySelector("[data-site-serendipity-ext-label]");
  const card = root.querySelector("[data-site-serendipity-card]");
  const media = root.querySelector("[data-site-serendipity-media]");
  const shelfTag = root.querySelector("[data-site-serendipity-shelf-tag]");
  const titleEl = root.querySelector("[data-site-serendipity-title]");
  const originalEl = root.querySelector("[data-site-serendipity-original]");
  const metaEl = root.querySelector("[data-site-serendipity-meta]");
  const statusEl = root.querySelector("[data-site-serendipity-status]");
  if (!dataNode || !pickBtn || !card) return () => {};

  let config;
  try {
    config = JSON.parse(dataNode.textContent || "{}");
  } catch {
    return () => {};
  }
  const fullPool = Array.isArray(config.pool) ? config.pool : [];
  if (fullPool.length === 0) return () => {};

  const doc = root.ownerDocument;
  let lastKey = "";
  let current = null;
  let pulseTimer = 0;

  const activePool = () => {
    if (!config.isShelf) return fullPool;
    const listRoot = doc.querySelector?.("[data-site-entries]");
    if (!listRoot) return fullPool;
    const visibleIds = new Set(
      [...listRoot.querySelectorAll("[data-site-entry]:not([hidden])")].map((el) => el.id).filter(Boolean),
    );
    if (visibleIds.size === 0) return fullPool;
    const matched = fullPool.filter((item) => visibleIds.has(item.anchorId));
    return matched.length > 0 ? matched : fullPool;
  };

  const renderPick = (item) => {
    current = item;
    lastKey = item.key;
    if (shelfTag) shelfTag.textContent = item.shelfName;
    if (titleEl) {
      titleEl.textContent = item.name;
      if (item.lang) titleEl.setAttribute("lang", item.lang);
      else titleEl.removeAttribute("lang");
    }
    if (originalEl) {
      originalEl.textContent = item.original || "";
      originalEl.hidden = !item.original;
    }
    if (metaEl) {
      metaEl.textContent = item.meta || "";
      metaEl.hidden = !item.meta;
    }
    if (media) {
      media.textContent = "";
      media.dataset.shape = item.cover?.shape || (item.shelf === "games" ? "wide" : "tall");
      if (item.cover?.src) {
        const img = doc.createElement("img");
        img.src = item.cover.src;
        img.alt = "";
        img.decoding = "async";
        img.style.objectPosition = item.cover.focus || "50% 50%";
        media.append(img);
      } else {
        const span = doc.createElement("span");
        span.textContent = item.name;
        media.append(span);
      }
    }
    if (jumpBtn) jumpBtn.hidden = !config.isShelf;
    if (openLink) {
      openLink.hidden = Boolean(config.isShelf);
      openLink.setAttribute("href", item.shelfHref);
    }
    if (extLink && extLabel) {
      if (item.link?.href) {
        extLink.setAttribute("href", item.link.href);
        extLabel.textContent = item.link.label || "";
        extLink.hidden = false;
      } else {
        extLink.hidden = true;
      }
    }
    card.hidden = false;
    card.classList?.remove("is-dealt");
    void card.offsetWidth;
    card.classList?.add("is-dealt");
    if (statusEl) {
      statusEl.textContent = (config.labels?.announced || "{shelf}: {name}")
        .replace("{shelf}", item.shelfName)
        .replace("{name}", item.name);
    }
  };

  const onPick = () => {
    const item = pickRandomEntry(activePool(), lastKey, random);
    if (!item) return;
    renderPick(item);
  };

  const onJump = () => {
    if (!current?.anchorId) return;
    let target = doc.getElementById?.(current.anchorId);
    if (target?.hidden) {
      doc.querySelector?.("[data-site-reset]")?.click?.();
      target = doc.getElementById?.(current.anchorId);
    }
    if (!target) return;
    const paused = doc.documentElement?.dataset?.motionPaused === "true";
    target.scrollIntoView?.({ behavior: paused ? "auto" : "smooth", block: "center" });
    target.classList?.remove("is-cmdk-target");
    void target.offsetWidth;
    target.classList?.add("is-cmdk-target");
    win.clearTimeout?.(pulseTimer);
    pulseTimer = win.setTimeout?.(() => target.classList?.remove("is-cmdk-target"), 1800) ?? 0;
  };

  const onClose = () => {
    card.hidden = true;
    card.classList?.remove("is-dealt");
    pickBtn.focus?.();
  };

  root.hidden = false;
  pickBtn.addEventListener("click", onPick);
  againBtn?.addEventListener("click", onPick);
  jumpBtn?.addEventListener("click", onJump);
  closeBtn?.addEventListener("click", onClose);

  return () => {
    win.clearTimeout?.(pulseTimer);
    pickBtn.removeEventListener("click", onPick);
    againBtn?.removeEventListener("click", onPick);
    jumpBtn?.removeEventListener("click", onJump);
    closeBtn?.removeEventListener("click", onClose);
  };
}
