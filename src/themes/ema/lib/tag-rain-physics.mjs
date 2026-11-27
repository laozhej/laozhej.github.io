// Each pill is a line segment with a round cap at either end. A blossom is the
// same shape with a segment of length zero. Positions are field-local CSS pixels.
const WALL_INSET = 10;
const CONTACT_GAP = 2;
const MAX_TILT = 0.32;

function orient(body) {
  body.armX = body.halfSpine * Math.cos(body.angle);
  body.armY = body.halfSpine * Math.sin(body.angle);
}

export function containBody(body, width, floor) {
  const side = WALL_INSET + Math.abs(body.armX) + body.radius;
  if (body.x < side) {
    body.x = side;
    if (body.vx < 0) body.vx *= -0.28;
    body.spin *= 0.5;
  } else if (body.x > width - side) {
    body.x = width - side;
    if (body.vx > 0) body.vx *= -0.28;
    body.spin *= 0.5;
  }
  const bottom = floor - Math.abs(body.armY) - body.radius;
  if (body.y > bottom) {
    body.y = bottom;
    if (body.vy > 0) body.vy = body.vy > 1 ? -body.vy * 0.19 : 0;
    body.vx *= 0.72;
    body.spin *= 0.35;
  }
}

export function stepBody(body, dt, width, floor) {
  body.vy += 0.19 * dt;
  body.x += body.vx * dt;
  body.y += body.vy * dt;
  body.angle += body.spin * dt;
  if (body.halfSpine > 0) {
    body.angle = Math.max(-MAX_TILT, Math.min(MAX_TILT, body.angle));
    if (body.y + body.radius + Math.abs(body.halfSpine * Math.sin(body.angle)) >= floor) {
      body.angle *= 0.84 ** dt;
    }
  }
  orient(body);
  containBody(body, width, floor);
  return body;
}

function collide(a, b) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const caps = a.radius + b.radius + CONTACT_GAP;
  const overlapX = caps + Math.abs(a.armX) + Math.abs(b.armX) - Math.abs(dx);
  const overlapY = caps + Math.abs(a.armY) + Math.abs(b.armY) - Math.abs(dy);
  if (overlapX <= 0 || overlapY <= 0) return;

  // Test the side normals and the four cap-to-cap directions. The least overlap
  // gives the contact normal, including when the two long sides are parallel.
  let depth = Math.min(overlapX, overlapY);
  let nx = overlapX < overlapY ? Math.sign(dx) || 1 : 0;
  let ny = nx ? 0 : Math.sign(dy) || 1;
  function overlaps(x, y) {
    const length = Math.hypot(x, y);
    if (length < 0.0001) return true;
    x /= length;
    y /= length;
    const center = dx * x + dy * y;
    const overlap = caps + Math.abs(a.armX * x + a.armY * y) + Math.abs(b.armX * x + b.armY * y) - Math.abs(center);
    if (overlap <= 0) return false;
    if (overlap < depth) {
      depth = overlap;
      nx = center < 0 ? -x : x;
      ny = center < 0 ? -y : y;
    }
    return true;
  }
  if (!overlaps(-a.armY, a.armX) || !overlaps(-b.armY, b.armX)) return;
  for (const end of [-1, 1]) {
    const x = dx + end * b.armX, y = dy + end * b.armY;
    if (!overlaps(x + a.armX, y + a.armY) || !overlaps(x - a.armX, y - a.armY)) return;
  }

  const push = depth / 2;
  a.x -= nx * push; a.y -= ny * push;
  b.x += nx * push; b.y += ny * push;
  const closing = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
  if (closing < 0) {
    const normal = closing * 0.54;
    // Paper grips paper: cancel sideways slip up to the friction available at this contact.
    const slip = (b.vy - a.vy) * nx - (b.vx - a.vx) * ny;
    const friction = -normal * 0.65;
    const tangent = Math.max(-friction, Math.min(friction, slip / 2));
    const ix = nx * normal - ny * tangent, iy = ny * normal + nx * tangent;
    a.vx += ix; a.vy += iy;
    b.vx -= ix; b.vy -= iy;
    a.spin *= 0.7; b.spin *= 0.7;
  }
}

export function stepPile(bodies, dt, width, floor) {
  for (const body of bodies) stepBody(body, dt, width, floor);
  for (let pass = 0; pass < 4; pass++) {
    for (let i = 1; i < bodies.length; i++) {
      for (let j = 0; j < i; j++) collide(bodies[j], bodies[i]);
    }
    // Another pill can push this one past a wall even when its own step was in bounds.
    for (const body of bodies) containBody(body, width, floor);
  }
}
