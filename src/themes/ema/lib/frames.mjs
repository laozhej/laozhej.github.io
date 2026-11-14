// Ema's five poses. A pose is either an image, kept hidden until it has decoded, or a labelled
// placeholder plate that shows at once. A generation token makes rapid clicks and page teardown safe.
// The pose a click would show next is fetched ahead: once the page is idle after loading, and again
// after every change, so the first click does not wait for the network. With Save-Data or a 2G
// connection it is fetched only when the visitor reaches for Ema or the theatre (pointer or focus).
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
  // The status may hold the number and the pose in separate parts (short windows hide the pose).
  const statusNumber = status.querySelector?.('[data-frame-status-no]');
  const statusLabel = status.querySelector?.('[data-frame-status-label]');
  const isImage = (frame) => typeof frame.decode === 'function';
  const description = isImage(frames[0]) ? frames[0].alt : '';
  const setStatus = (number, label) => {
    if (statusNumber && statusLabel) { statusNumber.textContent = number; statusLabel.textContent = label; }
    else status.textContent = number + label;
  };
  let current = 0, requested = 0, generation = 0, disposed = false;
  const removers = [];
  const listen = (el, type, fn) => {
    el.addEventListener(type, fn);
    removers.push(() => el.removeEventListener(type, fn));
  };
  const connection = window.navigator?.connection;
  const frugal = () => Boolean(connection?.saveData) || /(^|-)2g$/.test(connection?.effectiveType ?? '');
  let ahead = 1;
  // Start the download of one pose. A failed download clears its source, so a later request retries.
  function prefetch(index) {
    const image = frames[(index + frames.length) % frames.length];
    if (disposed || !isImage(image) || image.getAttribute('src')) return;
    image.addEventListener?.('error', () => image.removeAttribute('src'), { once: true });
    image.src = image.dataset.src;
  }
  const prefetchAhead = () => prefetch(requested + ahead);
  let cancelIdle = () => {};
  function whenIdle() {
    if (disposed || frugal()) return;
    if (window.requestIdleCallback) {
      const id = window.requestIdleCallback(prefetchAhead, { timeout: 4000 });
      cancelIdle = () => window.cancelIdleCallback(id);
    } else if (window.setTimeout) {
      const id = window.setTimeout(prefetchAhead, 1200);
      cancelIdle = () => window.clearTimeout(id);
    }
  }
  function refresh() {
    if (!canAnimate()) art.dataset.instant = 'true';
  }
  // step: the direction of travel (+1 next, -1 previous), so the pose fetched ahead is the one after.
  async function show(index, keyboard, step = 1) {
    requested = (index + frames.length) % frames.length;
    ahead = step;
    const selected = requested, token = ++generation, image = frames[selected];
    controls.setAttribute('aria-busy', 'true');
    try {
      if (isImage(image)) {
        if (!image.getAttribute('src')) image.src = image.dataset.src;
        await image.decode();
      }
      if (disposed || token !== generation) return;
      art.dataset.instant = String(keyboard || !canAnimate());
      onChange();
      current = selected;
      frames.forEach((frame, i) => {
        frame.dataset.active = String(i === current);
        frame.setAttribute('aria-hidden', String(i !== current));
        if (isImage(frame)) frame.alt = i === current ? `${description} · ${frame.dataset.label}` : '';
      });
      setStatus(`${String(current + 1).padStart(2, '0')} / ${String(frames.length).padStart(2, '0')}`, ` · ${image.dataset.label}`);
      const action = current === frames.length - 1 ? controls.dataset.restart : controls.dataset.next;
      nextLabel.textContent = action;
      hit.setAttribute('aria-label', action);
      if (!frugal()) prefetchAhead();
    } catch {
      if (!disposed && token === generation) {
        image.removeAttribute('src');
        requested = current;
        setStatus('', controls.dataset.error);
      }
    } finally {
      if (!disposed && token === generation) controls.setAttribute('aria-busy', 'false');
    }
  }
  const forward = (event) => show(requested + 1, event.detail === 0);
  // A press on Ema that turns into a drag is not a request for the next pose. (Touch panning never
  // produces a click; this covers a mouse or pen dragged across her.) Keyboard clicks have detail 0.
  let downX = 0, downY = 0, dragged = false;
  listen(hit, 'pointerdown', (event) => { downX = event.clientX; downY = event.clientY; dragged = false; });
  listen(hit, 'pointermove', (event) => { if (event.buttons && Math.hypot(event.clientX - downX, event.clientY - downY) > 10) dragged = true; });
  listen(hit, 'click', (event) => {
    if (dragged && event.detail !== 0) { dragged = false; return; }
    forward(event);
  });
  listen(next, 'click', forward);
  listen(prev, 'click', (event) => show(requested - 1, event.detail === 0, -1));
  const keys = (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const index = { ArrowRight: requested + 1, ArrowLeft: requested - 1, Home: 0, End: frames.length - 1 }[event.key];
    if (index === undefined) return;
    event.preventDefault();
    show(index, true, event.key === 'ArrowLeft' || event.key === 'End' ? -1 : 1);
  };
  listen(controls, 'keydown', keys);
  listen(hit, 'keydown', keys);
  // Reaching for Ema or the theatre is a strong hint; it fetches ahead even on a frugal connection.
  for (const el of [hit, controls]) { listen(el, 'pointerenter', prefetchAhead); listen(el, 'focusin', prefetchAhead); }
  if (window.document?.readyState === 'complete') whenIdle();
  else if (window.addEventListener) {
    window.addEventListener('load', whenIdle, { once: true });
    removers.push(() => window.removeEventListener('load', whenIdle));
  }
  hit.hidden = controls.hidden = false;
  return {
    refresh,
    cleanup() {
      disposed = true;
      generation++;
      cancelIdle();
      removers.forEach(remove => remove());
    },
  };
}
