import { getRadio, TRACKS, trackLength } from './radio.mjs';

// The left-edge console contains the Sakura Radio controls.
export function mountEmaConsole(doc, win) {
  const root = doc.querySelector('[data-ema-console]');
  if (!root) return () => {};
  const toggle = root.querySelector('[data-console-toggle]');
  const panel = root.querySelector('[data-console-panel]');
  const close = root.querySelector('[data-console-close]');
  const radioRoot = root.querySelector('[data-radio]');
  const removers = [];
  const listen = (target, event, handler) => {
    if (!target) return;
    target.addEventListener(event, handler);
    removers.push(() => target.removeEventListener(event, handler));
  };
  const $ = (selector) => root.querySelector(selector);
  const clock = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

  function setOpen(open) {
    if (!panel || !toggle) return;
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    root.classList.toggle('is-open', open);
  }
  if (toggle && panel) {
    toggle.hidden = false;
    setOpen(false);
    listen(toggle, 'click', () => setOpen(panel.hidden));
    listen(close, 'click', () => { setOpen(false); toggle.focus(); });
    listen(doc, 'keydown', (event) => {
      if (event.key === 'Escape' && !panel.hidden) { setOpen(false); toggle.focus(); }
    });
  }

  const radio = getRadio(win);
  let names = [];
  try { names = JSON.parse(radioRoot?.dataset.tracks || '[]'); } catch (_) {}
  const title = $('[data-radio-title]'), count = $('[data-radio-count]');
  const play = $('[data-radio-play]'), progress = $('[data-radio-progress]');
  const elapsed = $('[data-radio-elapsed]'), length = $('[data-radio-length]');
  const volume = $('[data-radio-volume]'), unsupported = $('[data-radio-unsupported]');
  let frame = 0;
  function render() {
    if (!radioRoot) return;
    const total = trackLength(TRACKS[radio.index]);
    const position = radio.position();
    if (title) title.textContent = names[radio.index] ?? '';
    if (count) count.textContent = `${radio.index + 1} / ${TRACKS.length}`;
    if (elapsed) elapsed.textContent = clock(position);
    if (length) length.textContent = clock(total);
    if (progress) progress.style.transform = `scaleX(${(position / total).toFixed(4)})`;
    if (volume && doc.activeElement !== volume) volume.value = String(Math.round(radio.volume * 100));
    radioRoot.classList.toggle('is-playing', radio.playing);
    if (play) {
      play.setAttribute('aria-pressed', String(radio.playing));
      play.setAttribute('aria-label', radio.playing ? play.dataset.pause : play.dataset.play);
      play.title = play.getAttribute('aria-label');
      play.querySelector('[data-radio-play-icon]')?.toggleAttribute('hidden', radio.playing);
      play.querySelector('[data-radio-pause-icon]')?.toggleAttribute('hidden', !radio.playing);
    }
  }
  // The progress bar only animates while the panel is open and a tune is playing.
  function loop() {
    frame = 0;
    render();
    if (radio.playing && panel && !panel.hidden) frame = win.requestAnimationFrame(loop);
  }
  const wake = () => { if (!frame) frame = win.requestAnimationFrame(loop); };
  if (radioRoot) {
    if (!radio.supported) {
      radioRoot.querySelectorAll('button, input').forEach((control) => { control.disabled = true; });
      if (unsupported) unsupported.hidden = false;
    }
    listen(play, 'click', () => { if (radio.playing) radio.pause(); else radio.play(); });
    listen($('[data-radio-prev]'), 'click', () => radio.select(radio.index - 1));
    listen($('[data-radio-next]'), 'click', () => radio.select(radio.index + 1));
    listen(volume, 'input', () => radio.setVolume(Number(volume.value) / 100));
    listen(toggle, 'click', wake);
    removers.push(radio.subscribe(() => { render(); wake(); }));
    radio.hold();
    render();
  }

  return () => {
    win.cancelAnimationFrame(frame);
    removers.forEach((remove) => remove());
    if (radioRoot) radio.release();
  };
}
