// Own the lifecycle of a decorative model independently of its rendering library.
export function mountLive2D(root, doc, win, { createRenderer }) {
  const canvas = root.querySelector('[data-live2d-canvas]');
  root.dataset.live2dState = 'fallback';
  if (!canvas) return { refresh() {}, cleanup() {} };

  const desktop = win.matchMedia('(min-width: 1000px)');
  const reduced = win.matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = win.matchMedia('(hover: hover) and (pointer: fine)');
  const removers = [];
  let renderer, aborter;
  let disposed = false, failed = false, loading = false, active = null;
  let gazeX = 0, gazeY = 0;
  const listen = (target, name, handler, options) => {
    target.addEventListener(name, handler, options);
    removers.push(() => target.removeEventListener(name, handler, options));
  };
  const allowed = () => desktop.matches && !root.hidden && !doc.hidden
    && !reduced.matches && doc.documentElement.dataset.motionPaused !== 'true';
  const destroy = (instance) => {
    // A lost WebGL context can also make the renderer's own teardown throw.
    try { instance?.destroy(); } catch {}
  };
  function fallback() {
    if (disposed || failed) return;
    failed = true;
    loading = false;
    aborter?.abort();
    const previous = renderer;
    renderer = undefined;
    active = null;
    root.dataset.live2dState = 'fallback';
    destroy(previous);
  }
  function focus(x, y) {
    if (!renderer || (x === gazeX && y === gazeY)) return;
    try {
      renderer.focus(x, y);
      gazeX = x;
      gazeY = y;
    } catch { fallback(); }
  }
  const resetFocus = () => focus(0, 0);

  async function load() {
    loading = true;
    root.dataset.live2dState = 'loading';
    aborter = new win.AbortController();
    try {
      const loaded = await createRenderer({ canvas, signal: aborter.signal });
      // A loader may finish after cancellation, even when it accepts a signal.
      if (disposed || failed || aborter.signal.aborted) { destroy(loaded); return; }
      renderer = loaded;
      loading = false;
      root.dataset.live2dState = 'ready';
      refresh();
    } catch (error) {
      if (!aborter.signal.aborted) win.console?.warn('Live2D unavailable; using the still portrait.', error);
      if (!disposed && !failed) fallback();
    }
  }

  function refresh() {
    if (disposed || failed) return;
    const nextActive = allowed();
    if (!renderer) {
      if (nextActive && !loading) void load();
      return;
    }
    if (!nextActive || !pointer.matches) resetFocus();
    if (!renderer) return;
    if (active !== nextActive) {
      try { renderer.setActive(nextActive); active = nextActive; }
      catch { fallback(); }
    }
  }

  function track(event) {
    if (!renderer || active !== true || !allowed() || !pointer.matches) return;
    if (event.pointerType === 'touch') { resetFocus(); return; }
    const bounds = root.getBoundingClientRect();
    const margin = 100;
    const { clientX: x, clientY: y } = event;
    if (bounds.width <= 0 || bounds.height <= 0
      || x < bounds.left - margin || x > bounds.right + margin
      || y < bounds.top - margin || y > bounds.bottom + margin) {
      resetFocus();
      return;
    }
    const clamp = (value) => Math.max(-0.22, Math.min(0.22, value));
    // Right and up are positive, with a deliberately small range of movement.
    focus(
      clamp((x - bounds.left - bounds.width / 2) / (bounds.width / 2 + margin) * 0.22),
      clamp((bounds.top + bounds.height / 2 - y) / (bounds.height / 2 + margin) * 0.22),
    );
  }

  listen(doc, 'site:motion-change', refresh);
  listen(doc, 'visibilitychange', refresh);
  listen(desktop, 'change', refresh);
  listen(reduced, 'change', refresh);
  listen(pointer, 'change', refresh);
  listen(doc, 'pointermove', track, { passive: true });
  listen(doc, 'pointerleave', resetFocus);
  listen(win, 'blur', resetFocus);
  listen(canvas, 'webglcontextlost', (event) => {
    event.preventDefault();
    fallback();
  });
  refresh();

  return {
    refresh,
    cleanup() {
      if (disposed) return;
      disposed = true;
      removers.forEach((remove) => remove());
      aborter?.abort();
      const previous = renderer;
      renderer = undefined;
      root.dataset.live2dState = 'fallback';
      destroy(previous);
    },
  };
}
