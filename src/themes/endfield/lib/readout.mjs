// Figures that settle: the digits of a number spin and lock in from the left, like a counter on a panel.
// Only digits change. They are tabular, so nothing shifts, and Chinese, Japanese and Latin text never moves.
// The numbers themselves are the page's real dates, counts and entry numbers; this only delays showing them.

export const hasDigits = (text) => /\d/.test(text);

// The text at `progress` (0 to 1): the leading characters are final, the digits after them are stand-ins.
export function settleFrame(final, progress, random = Math.random) {
  const chars = [...final];
  const locked = Math.floor(Math.min(1, Math.max(0, progress)) * chars.length);
  return chars.map((ch, index) => (index < locked || ch < "0" || ch > "9" ? ch : String(Math.floor(random() * 10) % 10))).join("");
}

// Things that start together are spaced `step` ms apart, or closer when there are many,
// so that the last one never starts more than `spread` ms after the first.
export function staggerGap(count, step = 38, spread = 190) {
  return count > 1 ? Math.min(step, spread / (count - 1)) : 0;
}

export function createReadouts(win) {
  const running = new Map();
  const textNodes = (el) => {
    const out = [];
    const walker = el.ownerDocument.createTreeWalker(el, 4); // NodeFilter.SHOW_TEXT
    while (walker.nextNode()) out.push({ node: walker.currentNode, final: walker.currentNode.data });
    return out;
  };
  const restore = (el) => {
    const state = running.get(el);
    if (!state) return;
    win.cancelAnimationFrame(state.frame);
    for (const part of state.parts) part.node.data = part.final;
    running.delete(el);
  };
  const settle = (el, ms = 360) => {
    if (!el?.isConnected) return;
    // A second request while one is running starts over from the same final text.
    const parts = running.get(el)?.parts ?? textNodes(el);
    restore(el);
    if (!hasDigits(parts.map((part) => part.final).join(""))) return;
    const total = parts.reduce((sum, part) => sum + [...part.final].length, 0);
    const state = { parts, frame: 0 };
    running.set(el, state);
    const started = win.performance.now();
    const step = (now) => {
      const done = Math.min(1, (now - started) / ms);
      if (done >= 1 || !el.isConnected) return restore(el);
      // One left-to-right lock across all the element's text, whatever it is split into.
      let before = 0;
      for (const part of parts) {
        const length = [...part.final].length;
        const local = length ? Math.min(1, Math.max(0, (done * total - before) / length)) : 1;
        part.node.data = settleFrame(part.final, local);
        before += length;
      }
      state.frame = win.requestAnimationFrame(step);
    };
    state.frame = win.requestAnimationFrame(step);
  };
  // Leaving the page or pausing motion: every figure shows its real value at once.
  const stop = () => { for (const el of [...running.keys()]) restore(el); };
  return { settle, stop, get size() { return running.size; } };
}
