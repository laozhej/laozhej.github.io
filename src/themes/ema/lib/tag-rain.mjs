// Falling tags for the Sakura Archive homepage, adapted from the tag rain in
// src/themes/fuyukawa-kagari/pages/HomePage.astro of Yuimi-chaya/Yuimi-chaya.github.io
// (MIT License, Copyright (c) 2026 Yuimi-chaya; full text in LICENSE).
// Changes here: the tags are this site's shared favourites (listed in the HTML, which stays the
// accessible copy), small blossoms replace the reference's mascot, the pile stays instead of fading,
// and it runs only on wide screens with motion on. Otherwise the plain list shows.
const PALETTES = {
  light: [
    { fill: '#fff6f9', stroke: '#efbcd0', ink: '#8a4a69' },
    { fill: '#f4f0fb', stroke: '#cfc4ee', ink: '#5b4f8f' },
    { fill: '#fbf5e8', stroke: '#e2cfa6', ink: '#6f5a2f' },
    { fill: '#eff7f2', stroke: '#b7dcc6', ink: '#3f6553' },
  ],
  dark: [
    { fill: '#3b2c38', stroke: '#8a5a72', ink: '#f6cfe0' },
    { fill: '#302d45', stroke: '#6a6196', ink: '#ddd5f8' },
    { fill: '#38322a', stroke: '#7d6b48', ink: '#f0e2c2' },
    { fill: '#2a3632', stroke: '#5a7d6c', ink: '#cfe9dc' },
  ],
};
const random = (min, max) => min + Math.random() * (max - min);
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function stepBody(body, dt, width, floor) {
  body.vy += 0.055 * dt;
  body.x += body.vx * dt;
  body.y += body.vy * dt;
  body.angle += body.spin * dt;
  if (body.x - body.radius < 10) { body.x = body.radius + 10; body.vx = Math.abs(body.vx) * 0.52; body.spin *= 0.35; }
  if (body.x + body.radius > width - 10) { body.x = width - body.radius - 10; body.vx = -Math.abs(body.vx) * 0.52; body.spin *= 0.35; }
  if (body.y + body.radius > floor) {
    body.y = floor - body.radius;
    body.vy *= -0.16; body.vx *= 0.62; body.spin *= 0.18;
    if (Math.abs(body.vy) < 0.72) body.vy = 0;
    if (Math.abs(body.vx) < 0.16) body.vx = 0;
    if (Math.abs(body.spin) < 0.018) body.spin = 0;
  }
  if (Math.abs(body.vx) + Math.abs(body.vy) < 0.42) { body.spin *= 0.72; if (Math.abs(body.spin) < 0.02) body.spin = 0; }
  return body;
}

export function mountTagRain(root, win, { canAnimate = () => true } = {}) {
  const stage = root.querySelector('[data-k-signal]');
  const canvas = stage?.querySelector('[data-k-rain]');
  const again = stage?.querySelector('[data-k-rain-again]');
  const labels = stage ? [...stage.querySelectorAll('[data-k-tags] li')].map((item) => item.textContent.trim()).filter(Boolean) : [];
  const ctx = canvas?.getContext?.('2d');
  const idle = { refresh() {}, cleanup() {} };
  if (!stage || !canvas || !ctx || !labels.length) return idle;
  const wideEnough = win.matchMedia('(min-width: 761px)');
  const state = { bodies: [], queue: [], started: false, dropping: false, raf: 0, last: 0, nextDrop: 0, lastDrop: 0, width: 1, height: 1, dpr: 1 };
  let font = '600 15px sans-serif';
  let palette = PALETTES.light;
  let disposed = false;
  const allowed = () => !disposed && canAnimate() && wideEnough.matches;

  const resize = () => {
    const rect = stage.getBoundingClientRect();
    state.dpr = clamp(win.devicePixelRatio || 1, 1, 2);
    state.width = Math.max(1, Math.floor(rect.width));
    state.height = Math.max(1, Math.floor(rect.height));
    canvas.width = Math.floor(state.width * state.dpr);
    canvas.height = Math.floor(state.height * state.dpr);
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  };
  const measure = (label) => {
    ctx.save(); ctx.font = font;
    const width = clamp(ctx.measureText(label).width + 40, 84, Math.min(260, state.width * 0.76));
    ctx.restore();
    return { width, height: 40 };
  };
  const makeTag = (label, index) => {
    const size = measure(label);
    const radius = Math.max(size.width, size.height) * 0.34;
    return { type: 'tag', label, color: palette[index % palette.length], ...size, radius,
      x: random(radius + 12, state.width - radius - 12), y: -random(60, 260),
      vx: random(-1.2, 1.2), vy: random(0.5, 1.8), angle: random(-0.3, 0.3), spin: random(-0.018, 0.018) };
  };
  const makeBlossom = () => {
    const size = random(26, 36);
    return { type: 'blossom', width: size, height: size, radius: size * 0.52, color: palette[0],
      x: random(30, state.width - 30), y: -random(80, 320), vx: random(-1.5, 1.5), vy: random(0.4, 1.6),
      angle: random(0, Math.PI), spin: random(-0.02, 0.02) };
  };
  const drawTag = (body) => {
    ctx.save();
    ctx.translate(body.x, body.y); ctx.rotate(body.angle);
    ctx.beginPath();
    ctx.roundRect(-body.width / 2, -body.height / 2, body.width, body.height, body.height / 2);
    ctx.fillStyle = body.color.fill; ctx.strokeStyle = body.color.stroke; ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(120, 72, 96, .14)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 6;
    ctx.fill(); ctx.shadowColor = 'transparent'; ctx.stroke();
    ctx.fillStyle = body.color.ink; ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(body.label, 0, 1, body.width - 28);
    ctx.restore();
  };
  const drawBlossom = (body) => {
    ctx.save();
    ctx.translate(body.x, body.y); ctx.rotate(body.angle);
    const r = body.width / 2;
    ctx.fillStyle = '#f4b6cc'; ctx.strokeStyle = '#d98aa9'; ctx.lineWidth = 1.2;
    for (let i = 0; i < 5; i++) {
      ctx.rotate((Math.PI * 2) / 5);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-r * 0.42, -r * 0.36, -r * 0.5, -r * 0.86, -r * 0.2, -r);
      ctx.lineTo(0, -r * 0.86); ctx.lineTo(r * 0.2, -r);
      ctx.bezierCurveTo(r * 0.5, -r * 0.86, r * 0.42, -r * 0.36, 0, 0);
      ctx.fill(); ctx.stroke();
    }
    ctx.fillStyle = '#c76b92'; ctx.beginPath(); ctx.arc(0, 0, r * 0.16, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  };
  const collide = () => {
    const bodies = state.bodies;
    for (let i = 0; i < bodies.length; i++) for (let j = i + 1; j < bodies.length; j++) {
      const a = bodies[i], b = bodies[j];
      const dx = b.x - a.x, dy = b.y - a.y;
      const distance = Math.hypot(dx, dy) || 0.001, min = a.radius + b.radius;
      if (distance >= min) continue;
      const nx = dx / distance, ny = dy / distance, overlap = (min - distance) * 0.52;
      a.x -= nx * overlap; a.y -= ny * overlap; b.x += nx * overlap; b.y += ny * overlap;
      const impulse = ((b.vx - a.vx) * nx + (b.vy - a.vy) * ny) * 0.62;
      if (impulse < 0) { a.vx += impulse * nx; a.vy += impulse * ny; b.vx -= impulse * nx; b.vy -= impulse * ny; a.spin *= 0.58; b.spin *= 0.58; }
    }
  };
  const draw = () => {
    ctx.clearRect(0, 0, state.width, state.height);
    state.bodies.forEach((body) => (body.type === 'blossom' ? drawBlossom(body) : drawTag(body)));
  };
  const stopFrame = () => { win.cancelAnimationFrame(state.raf); state.raf = 0; };
  const tick = (now) => {
    state.raf = 0;
    if (!allowed() || win.document.hidden) return;
    const dt = clamp((now - state.last) / 16.67, 0.4, 2.1);
    state.last = now;
    if (state.dropping && now >= state.nextDrop) {
      const next = state.queue.shift();
      if (next) { state.bodies.push(next); state.lastDrop = now; state.nextDrop = now + random(120, 220); }
      else state.dropping = false;
    }
    const floor = state.height - 24;
    state.bodies.forEach((body) => stepBody(body, dt, state.width, floor));
    for (let i = 0; i < 3; i++) collide();
    draw();
    const calm = !state.dropping && state.bodies.every((body) => Math.abs(body.vx) + Math.abs(body.vy) < 0.2);
    if (!calm || now - state.lastDrop < 600) state.raf = win.requestAnimationFrame(tick);
  };
  const start = () => {
    if (!allowed()) return;
    stopFrame();
    const dark = win.document.documentElement.dataset.colorMode === 'dark';
    palette = dark ? PALETTES.dark : PALETTES.light;
    font = `600 15px ${win.getComputedStyle(stage).fontFamily || 'sans-serif'}`;
    resize();
    const blossoms = Math.max(3, Math.min(6, Math.round(labels.length / 6)));
    state.queue = [...labels.map(makeTag), ...Array.from({ length: blossoms }, makeBlossom)].sort(() => Math.random() - 0.5);
    state.bodies = []; state.started = true; state.dropping = true;
    state.last = win.performance.now(); state.nextDrop = 0;
    stage.classList.add('is-raining');
    state.raf = win.requestAnimationFrame(tick);
  };
  const stop = () => {
    stopFrame();
    state.bodies = []; state.queue = []; state.started = false; state.dropping = false;
    stage.classList.remove('is-raining');
    ctx.clearRect(0, 0, state.width, state.height);
  };
  const observer = 'IntersectionObserver' in win ? new win.IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting) && !state.started) start();
  }, { rootMargin: '-34% 0px -42% 0px', threshold: 0.02 }) : null;
  observer?.observe(stage);
  const onResize = () => {
    if (!state.started) return;
    if (!allowed()) { stop(); return; }
    resize();
    state.bodies.forEach((body) => { body.x = clamp(body.x, body.radius + 10, state.width - body.radius - 10); body.y = Math.min(body.y, state.height - 24 - body.radius); });
    if (!state.raf) { state.last = win.performance.now(); state.raf = win.requestAnimationFrame(tick); }
  };
  const replay = () => { stop(); start(); };
  win.addEventListener('resize', onResize, { passive: true });
  wideEnough.addEventListener('change', onResize);
  again?.addEventListener('click', replay);
  return {
    refresh() {
      if (again) again.hidden = !allowed();
      if (!allowed()) stop();
      else if (state.started && !state.raf) { state.last = win.performance.now(); state.raf = win.requestAnimationFrame(tick); }
    },
    cleanup() {
      disposed = true;
      stop();
      observer?.disconnect();
      win.removeEventListener('resize', onResize);
      wideEnough.removeEventListener('change', onResize);
      again?.removeEventListener('click', replay);
    },
  };
}
