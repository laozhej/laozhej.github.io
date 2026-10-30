// Load only requested poses; keep the current image visible until its replacement
// has decoded. A generation token makes rapid clicks and page teardown safe.
export function mountEmaFrames(root, window, { canAnimate, onChange = () => {} }) {
  const art = root.querySelector('[data-ema-frames]');
  const controls = root.querySelector('[data-frame-controls]');
  const hit = root.querySelector('[data-frame-hit]');
  const idle = { refresh() {}, cleanup() {} };
  if (!art || !controls || !hit) return idle;
  const frames = [...art.querySelectorAll('[data-ema-frame]')];
  if (frames.length < 2) return idle;
  const prev = controls.querySelector('[data-frame-prev]');
  const next = controls.querySelector('[data-frame-next]');
  const nextLabel = controls.querySelector('[data-frame-next-label]');
  const status = controls.querySelector('[data-frame-status]');
  const description = frames[0].alt;
  let current = 0, requested = 0, generation = 0, disposed = false;
  const removers = [];
  const listen = (el, type, fn) => {
    el.addEventListener(type, fn);
    removers.push(() => el.removeEventListener(type, fn));
  };
  function refresh() {
    if (!canAnimate()) art.dataset.instant = 'true';
  }
  async function show(index, keyboard) {
    requested = (index + frames.length) % frames.length;
    const selected = requested, token = ++generation, image = frames[selected];
    controls.setAttribute('aria-busy', 'true');
    try {
      if (!image.getAttribute('src')) image.src = image.dataset.src;
      await image.decode();
      if (disposed || token !== generation) return;
      art.dataset.instant = String(keyboard || !canAnimate());
      onChange();
      current = selected;
      frames.forEach((frame, i) => {
        frame.dataset.active = String(i === current);
        frame.setAttribute('aria-hidden', String(i !== current));
        frame.alt = i === current ? `${description} · ${frame.dataset.label}` : '';
      });
      status.textContent = `${String(current + 1).padStart(2, '0')} / ${String(frames.length).padStart(2, '0')} · ${image.dataset.label}`;
      const action = current === frames.length - 1 ? controls.dataset.restart : controls.dataset.next;
      nextLabel.textContent = action;
      hit.setAttribute('aria-label', action);
    } catch {
      if (!disposed && token === generation) {
        image.removeAttribute('src');
        requested = current;
        status.textContent = controls.dataset.error;
      }
    } finally {
      if (!disposed && token === generation) controls.setAttribute('aria-busy', 'false');
    }
  }
  const forward = (event) => show(requested + 1, event.detail === 0);
  listen(hit, 'click', forward);
  listen(next, 'click', forward);
  listen(prev, 'click', (event) => show(requested - 1, event.detail === 0));
  const keys = (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const index = { ArrowRight: requested + 1, ArrowLeft: requested - 1, Home: 0, End: frames.length - 1 }[event.key];
    if (index === undefined) return;
    event.preventDefault();
    show(index, true);
  };
  listen(controls, 'keydown', keys);
  listen(hit, 'keydown', keys);
  hit.hidden = controls.hidden = false;
  return {
    refresh,
    cleanup() {
      disposed = true;
      generation++;
      removers.forEach(remove => remove());
    },
  };
}
