export function mountLanguagePreference(doc) {
  const menu = doc.querySelector("[data-site-language-menu]");
  if (!menu) return () => {};
  const removers = [];
  const listen = (target, type, handler) => {
    target.addEventListener(type, handler);
    removers.push(() => target.removeEventListener(type, handler));
  };
  listen(doc, "click", (event) => {
    if (!menu.contains(event.target)) menu.open = false;
  });
  listen(doc, "keydown", (event) => {
    if (event.key === "Escape" && menu.open && !event.defaultPrevented) {
      // Mark the key as handled so an enclosing panel (Ema's settings) stays open.
      event.preventDefault();
      menu.open = false;
      menu.querySelector("summary")?.focus();
    }
  });
  // Tabbing out of an open menu closes it.
  listen(doc, "focusout", (event) => {
    if (menu.open && event.relatedTarget && menu.contains(event.target) && !menu.contains(event.relatedTarget)) menu.open = false;
  });
  return () => removers.splice(0).forEach((remove) => remove());
}
