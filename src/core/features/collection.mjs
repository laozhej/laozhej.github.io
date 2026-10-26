export function normalizeSearch(value) {
  return String(value ?? "").normalize("NFKC").toLowerCase().trim().replace(/\s+/g, " ");
}

export function matchesEntry(entry, query, category) {
  if (category !== "all" && entry.category !== category) return false;
  const haystack = normalizeSearch(entry.search);
  return normalizeSearch(query).split(" ").filter(Boolean).every((term) => haystack.includes(term));
}

export function readCollectionState(url, categories) {
  const params = new URL(url).searchParams;
  const category = params.get("category") ?? "all";
  return {
    query: (params.get("q") ?? "").slice(0, 300),
    category: categories.includes(category) ? category : "all",
    sort: params.get("sort") === "oldest" ? "oldest" : "newest"
  };
}

export function collectionUrl(url, state) {
  const result = new URL(url);
  for (const [key, value] of [
    ["q", state.query.trim()],
    ["category", state.category === "all" ? "" : state.category],
    ["sort", state.sort === "oldest" ? "oldest" : ""]
  ]) {
    if (value) result.searchParams.set(key, value);
    else result.searchParams.delete(key);
  }
  return `${result.pathname}${result.search}${result.hash}`;
}

export function mountCollection(root, win) {
  const form = root.querySelector("[data-site-filter-form]");
  const list = root.querySelector("[data-site-entries]");
  if (!form || !list) return () => {};
  const input = root.querySelector("[data-site-query]");
  const sort = root.querySelector("[data-site-sort]");
  const buttons = [...root.querySelectorAll("[data-site-category]")];
  const clear = root.querySelector("[data-site-clear]");
  const reset = root.querySelector("[data-site-reset]");
  const empty = root.querySelector("[data-site-empty]");
  const count = root.querySelector("[data-site-count]");
  const entries = [...list.querySelectorAll("[data-site-entry]")];
  const categories = buttons.map((button) => button.dataset.siteCategory);
  const listeners = [];
  const on = (node, event, handler) => {
    if (!node) return;
    node.addEventListener(event, handler);
    listeners.push(() => node.removeEventListener(event, handler));
  };
  let state;
  let urlTimer = 0;
  let disposed = false;

  const syncUrl = () => {
    if (disposed) return;
    win.clearTimeout(urlTimer);
    urlTimer = 0;
    try {
      win.history.replaceState(win.history.state, "", collectionUrl(win.location.href, state));
    } catch {
      // Filtering still works in restricted storage/history environments.
    }
  };
  const apply = (writeUrl = true, immediate = true) => {
    let visible = 0;
    for (const entry of entries) {
      entry.hidden = !matchesEntry(entry.dataset, input ? state.query : "", state.category);
      if (!entry.hidden) visible++;
    }
    if (sort) {
      const direction = state.sort === "oldest" ? 1 : -1;
      const ordered = [...entries].sort((a, b) => direction * (Number(a.dataset.date) - Number(b.dataset.date)));
      for (const entry of ordered) list.append(entry);
      sort.value = state.sort;
    }
    for (const button of buttons) button.setAttribute("aria-pressed", String(button.dataset.siteCategory === state.category));
    if (input && input.value !== state.query) input.value = state.query;
    if (clear) clear.hidden = !state.query;
    if (count) count.textContent = `${visible} ${visible === 1 ? (root.dataset.unitOne ?? root.dataset.unit) : root.dataset.unit}`;
    if (empty) empty.hidden = visible > 0;
    if (writeUrl) {
      if (immediate) syncUrl();
      else {
        win.clearTimeout(urlTimer);
        urlTimer = win.setTimeout(syncUrl, 180);
      }
    }
  };
  const restore = () => {
    win.clearTimeout(urlTimer);
    urlTimer = 0;
    state = readCollectionState(win.location.href, categories);
    if (!input) state.query = "";
    if (!sort) state.sort = "newest";
    apply(false);
  };
  on(form, "submit", (event) => { event.preventDefault(); syncUrl(); });
  const search = (event) => {
    if (event.isComposing) return;
    state.query = input.value.slice(0, 300);
    apply(true, false);
  };
  on(input, "input", search);
  on(input, "compositionend", search);
  on(sort, "change", () => { state.sort = sort.value === "oldest" ? "oldest" : "newest"; apply(); });
  for (const button of buttons) {
    on(button, "click", () => { state.category = button.dataset.siteCategory; apply(); });
  }
  on(clear, "click", () => { state.query = ""; apply(); input?.focus(); });
  on(reset, "click", () => {
    state = { query: "", category: "all", sort: "newest" };
    apply();
    (input ?? buttons[0])?.focus();
  });
  on(win, "popstate", restore);
  on(win, "pagehide", syncUrl);
  restore();
  form.hidden = false;
  return () => {
    disposed = true;
    win.clearTimeout(urlTimer);
    listeners.forEach((remove) => remove());
  };
}

