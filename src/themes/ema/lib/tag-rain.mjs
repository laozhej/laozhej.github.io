// Falling tags for the Sakura Archive homepage, adapted from the tag rain in
// src/themes/fuyukawa-kagari/pages/HomePage.astro of Yuimi-chaya/Yuimi-chaya.github.io
// (MIT License, Copyright (c) 2026 Yuimi-chaya; full text in LICENSE).
// The HTML list supplies both the animated pieces and the static, accessible view.
import { containBody, stepBody, stepPile } from './tag-rain-physics.mjs';

const random = (min, max) => min + Math.random() * (max - min);
const FRAME_MS = 1000 / 60;
const STEP_MS = FRAME_MS / 2;
const FLOOR_INSET = 8;

function shuffle(items) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function paint(body) {
  const x = body.x - body.width / 2, y = body.y - body.height / 2;
  body.element.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) rotate(${body.angle.toFixed(4)}rad)`;
  body.paintedX = body.x; body.paintedY = body.y; body.paintedAngle = body.angle;
}

export function mountTagRain(root, win, { canAnimate = () => true } = {}) {
  const stage = root.querySelector('[data-k-signal]');
  const field = stage?.querySelector('[data-k-rain]');
  const again = stage?.querySelector('[data-k-rain-again]');
  const tags = [...(field?.querySelectorAll('[data-k-tags] li') ?? [])];
  if (!tags.length || !again) return { refresh() {}, cleanup() {} };

  const wide = win.matchMedia('(min-width: 761px)');
  const blossoms = Array.from({ length: Math.min(5, Math.ceil(tags.length / 6)) }, () => {
    const flower = win.document.createElement('span');
    flower.className = 'k-rain-blossom';
    flower.setAttribute('aria-hidden', 'true');
    return flower;
  });
  let width = 0, floor = 0;
  let bodies = [], pending = [], lanes = [];
  let started = false, settled = false, inView = !('IntersectionObserver' in win);
  let frame = 0, lastTime = 0, remainder = 0, dropIn = 0, quietTime = 0;

  function spawn(body) {
    // Mirror each pair of release points, then vary their order and drift.
    // Fractions still fit when the field resizes between two drops.
    if (!lanes.length) {
      const perSide = Math.max(2, Math.round(width / 300));
      const left = shuffle(Array.from({ length: perSide }, (_, i) => (i + random(0.25, 0.75)) / (2 * perSide)));
      lanes = left.flatMap((x) => Math.random() < 0.5 ? [x, 1 - x] : [1 - x, x]);
    }
    body.x = width * lanes.pop();
    body.y = -body.height - random(0, 20);
    body.vx = random(-0.55, 0.55);
    body.vy = random(1.4, 2.4);
    body.angle = random(-0.22, 0.22);
    body.spin = random(-0.008, 0.008);
    stepBody(body, 0, width, floor);
    bodies.push(body);
  }

  function tick(now) {
    frame = 0;
    const elapsed = Math.min(32, Math.max(0, now - lastTime));
    lastTime = now;
    dropIn -= elapsed;
    if (pending.length && dropIn <= 0) {
      spawn(pending.pop());
      dropIn = random(105, 155);
    }

    remainder += elapsed;
    while (remainder >= STEP_MS) {
      stepPile(bodies, STEP_MS / FRAME_MS, width, floor);
      remainder -= STEP_MS;
    }
    // Include the travel of the tips: a pill can still be rocking with its center at rest.
    const moving = bodies.some((body) => {
      if (body.paintedX === undefined) return true;
      const travel = Math.hypot(body.x - body.paintedX, body.y - body.paintedY);
      const rotation = body.width * Math.abs(body.angle - body.paintedAngle) / 2;
      return travel + rotation > 0.32 * elapsed / FRAME_MS;
    });
    for (const body of bodies) paint(body);
    quietTime = pending.length || moving ? 0 : quietTime + elapsed;
    settled = quietTime >= 240;
    if (!settled) frame = win.requestAnimationFrame(tick);
  }

  function wake() {
    if (frame || settled || !inView || win.document.hidden) return;
    lastTime = win.performance.now();
    frame = win.requestAnimationFrame(tick);
  }

  function cancelFrame() {
    win.cancelAnimationFrame(frame);
    frame = 0;
  }

  function start() {
    if (!wide.matches || !canAnimate()) return;
    cancelFrame();
    stage.classList.add('is-raining');
    again.hidden = false;
    field.append(...blossoms);
    const elements = [...tags, ...blossoms];
    for (const element of elements) element.style.removeProperty('transform');
    width = field.clientWidth;
    floor = field.clientHeight - FLOOR_INSET;
    pending = shuffle(elements.map((element) => {
      const w = element.offsetWidth, h = element.offsetHeight;
      return { element, width: w, height: h, radius: h / 2, halfSpine: (w - h) / 2 };
    }));
    bodies = []; lanes = [];
    started = true; settled = false; remainder = 0; dropIn = 0; quietTime = 0;
    wake();
  }

  function stop() {
    cancelFrame();
    if (!started) return;
    started = false;
    stage.classList.remove('is-raining');
    again.hidden = true;
    for (const tag of tags) tag.style.removeProperty('transform');
    for (const flower of blossoms) flower.remove();
    bodies = []; pending = [];
  }

  function refresh() {
    if (win.document.hidden) { cancelFrame(); return; }
    if (!wide.matches || !canAnimate()) { stop(); return; }
    if (!inView) { cancelFrame(); return; }
    if (started) wake();
    else start();
  }

  function resize() {
    if (!started || !wide.matches) return;
    const nextWidth = field.clientWidth, nextFloor = field.clientHeight - FLOOR_INSET;
    if (nextWidth === width && nextFloor === floor) return;
    for (const body of bodies) {
      body.x *= nextWidth / width;
      body.y *= nextFloor / floor;
      containBody(body, nextWidth, nextFloor);
      paint(body);
    }
    width = nextWidth; floor = nextFloor; settled = false; quietTime = 0;
    wake();
  }

  const observer = 'IntersectionObserver' in win ? new win.IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    refresh();
  }) : null;
  observer?.observe(stage);
  const sizeObserver = new win.ResizeObserver(resize);
  sizeObserver.observe(field);
  wide.addEventListener('change', refresh);
  again.addEventListener('click', start);

  return {
    refresh,
    cleanup() {
      observer?.disconnect();
      sizeObserver.disconnect();
      wide.removeEventListener('change', refresh);
      again.removeEventListener('click', start);
      stop();
    },
  };
}
