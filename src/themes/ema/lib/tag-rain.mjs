// Favourite tags fall into a heap once per pass through the scene. The list is
// an ordinary flex-wrapped <ul> until motion is allowed, and returns to it on pause.
const GRAVITY = 1900;
const COLUMN = 4;
const BLOSSOMS = 5;

export function mountTagRain(section, doc, win, { canAnimate }) {
  const list = section?.querySelector('[data-tag-rain]');
  const idle = { visibility() {}, refresh() {}, measure() {}, cleanup() {} };
  if (!section || !list) return idle;
  const tags = [...list.querySelectorAll('[data-tag]')];
  if (!tags.length) return idle;
  const random = (min, max) => min + Math.random() * (max - min);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  let state = 'idle', raf = 0, last = 0, clock = 0, width = 0, floor = 0;
  // skyline is the settled heap; planned also counts pieces still in the air.
  let bodies = [], skyline = null, planned = null, layer = null, ratio = 0;

  const columnRange = (left, right) => [clamp(Math.floor(left / COLUMN), 0, skyline.length - 1), clamp(Math.ceil(right / COLUMN), 0, skyline.length - 1)];
  const surface = (left, right, line = skyline) => {
    const [from, to] = columnRange(left, right);
    let top = floor;
    for (let column = from; column <= to; column += 1) top = Math.min(top, line[column]);
    return top;
  };
  // Rest on whatever lies beneath: tilt toward the lower side, then sit on the highest support.
  function rest(body, line = skyline) {
    const half = body.w / 2;
    let angle = 0;
    if (!body.round) {
      const left = surface(body.x - half, body.x - half * .2, line);
      const right = surface(body.x + half * .2, body.x + half, line);
      angle = clamp(Math.atan2(right - left, body.w * .8), -.34, .34);
    }
    const slope = Math.tan(angle), lift = body.h / (2 * Math.cos(angle)), reach = half * Math.cos(angle);
    const [from, to] = columnRange(body.x - reach, body.x + reach);
    let y = Infinity;
    for (let column = from; column <= to; column += 1) y = Math.min(y, line[column] - slope * (column * COLUMN - body.x));
    return { y: y - lift, angle, slope, lift, from, to };
  }
  function commit(body, place, line = skyline) {
    for (let column = place.from; column <= place.to; column += 1) {
      line[column] = Math.min(line[column], place.y + place.slope * (column * COLUMN - body.x) - place.lift);
    }
  }
  // Each piece looks at a few random spots and drops toward the deepest one,
  // so the heap packs like a real pile instead of stacking into a tower.
  function aim(body) {
    body.dropped = true;
    const half = body.w / 2, low = half + 8, high = Math.max(low, width - half - 8);
    let best = body.x, bestScore = -Infinity;
    for (let tries = 0; tries < 8; tries += 1) {
      body.x = tries ? random(low, high) : clamp(body.x, low, high);
      const place = rest(body, planned);
      const score = place.y - Math.abs(place.angle) * 90;
      if (score > bestScore) { bestScore = score; best = body.x; }
    }
    body.x = best;
    body.vx = 0;
    commit(body, rest(body, planned), planned);
  }
  const draw = (body) => {
    body.el.style.transform = `translate3d(${(body.x - body.w / 2).toFixed(1)}px,${(body.y - body.h / 2).toFixed(1)}px,0) rotate(${body.angle.toFixed(3)}rad)`;
  };

  function start() {
    if (state !== 'idle' || !canAnimate() || ratio < .3) return;
    width = section.clientWidth;
    // Hold the static list's height so the page below never jumps; narrow
    // screens get a little more floor so the heap stays clear of the cards.
    const height = section.clientHeight + (width < 600 ? 96 : 0);
    if (!width || !height) return;
    section.style.minHeight = `${height}px`;
    list.classList.add('is-raining');
    const sizes = tags.map((tag) => ({ w: tag.offsetWidth, h: tag.offsetHeight }));
    layer = doc.createElement('div');
    layer.className = 'rain-layer';
    layer.setAttribute('aria-hidden', 'true');
    const blossoms = Array.from({ length: BLOSSOMS }, () => layer.appendChild(doc.createElement('span')));
    blossoms.forEach((blossom) => { blossom.className = 'rain-blossom'; });
    section.append(layer);
    floor = height - 6;
    skyline = new Float32Array(Math.ceil(width / COLUMN) + 1).fill(floor);
    planned = skyline.slice();
    const entries = [
      ...tags.map((el, index) => ({ el, ...sizes[index] })),
      ...blossoms.map((el) => ({ el, w: el.offsetWidth || 36, h: el.offsetHeight || 36, round: true })),
    ].sort(() => Math.random() - .5);
    // Stratified drop points spread the heap across the whole width.
    bodies = entries.map((entry, index) => {
      const span = Math.max(1, width - entry.w - 24);
      return {
        ...entry,
        x: 12 + entry.w / 2 + span * ((index * .618 + random(0, .35)) % 1),
        y: -entry.h - random(20, 140),
        vx: random(-36, 36), vy: random(0, 120),
        angle: random(-.5, .5), spin: random(-2.6, 2.6),
        dropAt: index * .12 + random(0, .06),
        bounced: false, dropped: false, settled: false, ease: null,
      };
    });
    bodies.forEach(draw);
    state = 'raining'; clock = 0; last = 0;
    raf = win.requestAnimationFrame(frame);
  }
  function frame(now) {
    raf = 0;
    if (state !== 'raining') return;
    if (!canAnimate()) { reset(); return; }
    const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
    last = now; clock += dt;
    let moving = false;
    for (const body of bodies) {
      if (body.ease) {
        body.ease.t = Math.min(1, body.ease.t + dt / .22);
        const k = 1 - (1 - body.ease.t) ** 3;
        body.angle = body.ease.from + (body.ease.to - body.ease.from) * k;
        body.y = body.ease.y0 + (body.ease.y1 - body.ease.y0) * k;
        if (body.ease.t >= 1) body.ease = null; else moving = true;
        draw(body);
        continue;
      }
      if (body.settled) continue;
      moving = true;
      if (clock < body.dropAt) continue;
      if (!body.dropped) aim(body);
      body.vy = Math.min(body.vy + GRAVITY * dt, 1500);
      body.x += body.vx * dt; body.y += body.vy * dt; body.angle += body.spin * dt;
      const half = body.w / 2;
      if (body.x < half + 6 || body.x > width - half - 6) { body.x = clamp(body.x, half + 6, width - half - 6); body.vx *= -.6; }
      const ground = surface(body.x - half, body.x + half) - body.h / 2;
      if (body.y < ground) { draw(body); continue; }
      if (!body.bounced && body.vy > 420) {
        body.bounced = true; body.y = ground; body.vy *= -.3; body.spin *= -.45; body.vx *= .6;
        draw(body); continue;
      }
      const place = rest(body);
      commit(body, place);
      body.settled = true;
      // A capsule looks the same upside down, so settle by the shortest turn.
      const from = body.round ? body.angle : ((body.angle + Math.PI / 2) % Math.PI + Math.PI) % Math.PI - Math.PI / 2;
      body.ease = { t: 0, from, to: body.round ? body.angle : place.angle, y0: Math.min(body.y, place.y), y1: place.y };
      body.angle = from;
      draw(body);
    }
    if (moving) raf = win.requestAnimationFrame(frame);
    else state = 'settled';
  }
  function reset() {
    win.cancelAnimationFrame(raf); raf = 0;
    bodies.forEach((body) => { body.el.style.transform = ''; });
    bodies = []; skyline = planned = null;
    layer?.remove(); layer = null;
    list.classList.remove('is-raining');
    section.style.minHeight = '';
    state = 'idle';
  }
  return {
    // Replays after the reader has scrolled back above the scene.
    visibility(nextRatio, top) {
      ratio = nextRatio;
      if (ratio === 0 && top > 0 && state !== 'idle') reset();
      else start();
    },
    refresh() {
      if (!canAnimate()) { if (state !== 'idle') reset(); }
      else start();
    },
    measure() {
      if (state !== 'idle' && Math.abs(section.clientWidth - width) > 24) { reset(); start(); }
    },
    cleanup: reset,
  };
}
