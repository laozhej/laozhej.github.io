// A theme supplies the list and labels; navigation owns mounting and cleanup.
export function mountDisclosure(root, win) {
  const toggle = root.querySelector("[data-site-disclosure-toggle]");
  const label = toggle?.querySelector("[data-site-disclosure-label]");
  const items = [...root.querySelectorAll("[data-site-disclosure-item]")];
  const limit = Math.max(1, Number(root.dataset.limit) || 6);
  if (!toggle || !label || items.length <= limit) return () => {};
  const extra = items.slice(limit);
  // Keep expansion through lifecycle remounts and browser back/forward snapshots.
  let expanded = toggle.getAttribute("aria-expanded") === "true";
  const apply = () => {
    extra.forEach((item) => { item.hidden = !expanded; });
    toggle.setAttribute("aria-expanded", String(expanded));
    label.textContent = expanded ? toggle.dataset.labelLess : toggle.dataset.labelMore;
  };
  const onClick = () => {
    expanded = !expanded;
    apply();
    if (!expanded) {
      // Collapsing a long list must keep its control within reach.
      const rect = toggle.getBoundingClientRect();
      if (rect.top < 0 || rect.bottom > win.innerHeight) {
        toggle.scrollIntoView({ block: "nearest", behavior: "instant" });
      }
    }
  };
  apply();
  toggle.hidden = false;
  toggle.addEventListener("click", onClick);
  return () => toggle.removeEventListener("click", onClick);
}
