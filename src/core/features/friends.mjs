// The Friends page's two behaviours (src/themes/*/pages/FriendsPage.astro, `[data-site-friends]`):
// 1. An avatar that fails to load is hidden, so the name's first letter beneath it shows (an image with empty alt
//    text already draws nothing when broken; this also covers browsers that draw a broken-image icon).
// 2. The copy button puts this site's card on the clipboard as `key: value` lines and says so in its status bubble.
//    Without JavaScript the button stays hidden and the card's fields can be selected and copied by hand.
import { writeClipboard } from "./prose.mjs";

export function mountFriends(root, win) {
  const doc = root.ownerDocument ?? win.document;
  const cleanups = [];
  for (const img of root.querySelectorAll("[data-site-friend-avatar] img")) {
    const hide = () => { img.hidden = true; };
    if (img.complete && img.naturalWidth === 0) hide();
    else {
      img.addEventListener("error", hide, { once: true });
      cleanups.push(() => img.removeEventListener("error", hide));
    }
  }
  const button = root.querySelector("[data-site-friends-copy]");
  const tip = button?.nextElementSibling;
  if (button && tip) {
    button.hidden = false;
    let timer = 0;
    const copy = async () => {
      const ok = await writeClipboard(doc, win, button.dataset.copyText ?? "");
      win.clearTimeout(timer);
      button.removeAttribute("data-copied");
      button.removeAttribute("data-failed");
      tip.textContent = "";
      void button.offsetWidth;
      button.setAttribute(ok ? "data-copied" : "data-failed", "");
      // A fresh text node each time, so screen readers announce a second copy too.
      win.requestAnimationFrame(() => { tip.textContent = (ok ? root.dataset.copied : root.dataset.copyFailed) ?? ""; });
      timer = win.setTimeout(() => {
        button.removeAttribute("data-copied");
        button.removeAttribute("data-failed");
        tip.textContent = "";
      }, 2000);
    };
    button.addEventListener("click", copy);
    cleanups.push(() => { button.removeEventListener("click", copy); win.clearTimeout(timer); });
  }
  return () => { for (const remove of cleanups) remove(); };
}
