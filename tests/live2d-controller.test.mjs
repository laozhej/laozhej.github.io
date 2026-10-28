import test from 'node:test';
import assert from 'node:assert/strict';
import { mountLive2D } from '../src/core/live2d/controller.mjs';

const settle = () => new Promise((resolve) => setImmediate(resolve));
function deferred() {
  let resolve, reject;
  const promise = new Promise((done, fail) => { resolve = done; reject = fail; });
  return { promise, resolve, reject };
}
function media(matches) {
  return Object.assign(new EventTarget(), {
    matches,
    set(value) { this.matches = value; this.dispatchEvent(new Event('change')); },
  });
}
function fixture({ desktop = true, hidden = false, tabHidden = false, paused = false, reduced = false, fine = true, createRenderer } = {}) {
  const queries = { desktop: media(desktop), reduced: media(reduced), pointer: media(fine) };
  const canvas = new EventTarget();
  const root = {
    hidden, dataset: {},
    querySelector: (selector) => selector === '[data-live2d-canvas]' ? canvas : null,
    getBoundingClientRect: () => ({ left: 14, right: 178, top: 660, bottom: 900, width: 164, height: 240 }),
  };
  const doc = Object.assign(new EventTarget(), {
    hidden: tabHidden,
    documentElement: { dataset: { motionPaused: String(paused) } },
  });
  const win = Object.assign(new EventTarget(), {
    AbortController,
    matchMedia: (query) => query.includes('min-width') ? queries.desktop
      : query.includes('prefers-reduced-motion') ? queries.reduced : queries.pointer,
  });
  const active = [], gaze = [], loads = [];
  let destroyed = 0;
  const renderer = {
    setActive: (value) => active.push(value),
    focus: (x, y) => gaze.push([x, y]),
    destroy: () => { destroyed += 1; },
  };
  const controller = mountLive2D(root, doc, win, {
    createRenderer(options) {
      loads.push(options);
      return createRenderer ? createRenderer(options, renderer) : Promise.resolve(renderer);
    },
  });
  return {
    root, canvas, doc, win, queries, renderer, controller, active, gaze, loads,
    destroyed: () => destroyed,
    motion(value) {
      doc.documentElement.dataset.motionPaused = String(value);
      doc.dispatchEvent(new Event('site:motion-change'));
    },
    visibility(value) { doc.hidden = value; doc.dispatchEvent(new Event('visibilitychange')); },
    move(x, y) { doc.dispatchEvent(Object.assign(new Event('pointermove'), { clientX: x, clientY: y, pointerType: 'mouse' })); },
  };
}

test('hidden, narrow, background and reduced-motion pages do not load a model', async () => {
  for (const options of [{ hidden: true }, { desktop: false }, { tabHidden: true }, { paused: true }, { reduced: true }]) {
    const p = fixture(options);
    await settle();
    assert.equal(p.loads.length, 0);
    assert.equal(p.root.dataset.live2dState, 'fallback');
    p.root.hidden = false;
    p.doc.hidden = false;
    p.doc.documentElement.dataset.motionPaused = 'false';
    p.queries.desktop.matches = true;
    p.queries.reduced.matches = false;
    p.controller.refresh();
    await settle();
    assert.equal(p.loads.length, 1);
    assert.equal(p.root.dataset.live2dState, 'ready');
    assert.deepEqual(p.active, [true]);
    p.controller.cleanup();
    assert.equal(p.destroyed(), 1);
  }
});

test('a loaded model freezes and resumes with motion, visibility and desktop preferences', async () => {
  const p = fixture();
  await settle();
  p.motion(true);
  assert.deepEqual(p.active, [true, false]);
  assert.equal(p.root.dataset.live2dState, 'ready', 'paused model keeps its last frame');
  p.motion(false);
  p.visibility(true);
  p.visibility(false);
  p.queries.desktop.set(false);
  p.queries.desktop.set(true);
  p.queries.reduced.set(true);
  p.queries.reduced.set(false);
  p.root.hidden = true;
  p.controller.refresh();
  p.root.hidden = false;
  p.controller.refresh();
  assert.deepEqual(p.active, [true, false, true, false, true, false, true, false, true, false, true]);
  assert.equal(p.loads.length, 1, 'resuming reuses the loaded renderer');
  p.controller.cleanup();
  const count = p.active.length;
  p.motion(true);
  p.visibility(true);
  p.queries.desktop.set(false);
  assert.equal(p.active.length, count, 'cleanup removes all lifecycle listeners');
});

test('a renderer that resolves after disposal is destroyed without activating', async () => {
  const pending = deferred();
  const p = fixture({ createRenderer: () => pending.promise });
  assert.equal(p.root.dataset.live2dState, 'loading');
  p.controller.cleanup();
  assert.equal(p.loads[0].signal.aborted, true);
  pending.resolve(p.renderer);
  await settle();
  assert.equal(p.destroyed(), 1);
  assert.deepEqual(p.active, []);
  assert.equal(p.root.dataset.live2dState, 'fallback');
  p.controller.cleanup();
  assert.equal(p.destroyed(), 1, 'cleanup is idempotent');
});

test('pausing while loading prevents the arriving model from starting animation', async () => {
  const pending = deferred();
  const p = fixture({ createRenderer: () => pending.promise });
  p.motion(true);
  pending.resolve(p.renderer);
  await settle();
  assert.deepEqual(p.active, [false]);
  assert.equal(p.root.dataset.live2dState, 'ready');
  p.motion(false);
  assert.deepEqual(p.active, [false, true]);
  p.controller.cleanup();
});

test('load failures retain the poster and do not retry on every preference change', async () => {
  for (const createRenderer of [() => Promise.reject(new Error('load failed')), () => { throw new Error('WebGL unavailable'); }]) {
    const p = fixture({ createRenderer });
    await settle();
    assert.equal(p.root.dataset.live2dState, 'fallback');
    assert.equal(p.loads[0].signal.aborted, true);
    p.motion(true);
    p.motion(false);
    p.visibility(true);
    p.visibility(false);
    p.controller.refresh();
    assert.equal(p.loads.length, 1);
    p.controller.cleanup();
  }
});

test('context loss disposes the renderer and leaves a stable fallback', async () => {
  const p = fixture();
  await settle();
  const event = new Event('webglcontextlost', { cancelable: true });
  p.canvas.dispatchEvent(event);
  assert.equal(event.defaultPrevented, true);
  assert.equal(p.root.dataset.live2dState, 'fallback');
  assert.equal(p.destroyed(), 1);
  p.controller.refresh();
  p.motion(true);
  p.motion(false);
  p.canvas.dispatchEvent(new Event('webglcontextrestored'));
  assert.equal(p.loads.length, 1);
  p.controller.cleanup();
  assert.equal(p.destroyed(), 1);
});

test('context loss during loading also destroys a late renderer', async () => {
  const pending = deferred();
  const p = fixture({ createRenderer: () => pending.promise });
  p.canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true }));
  assert.equal(p.loads[0].signal.aborted, true);
  pending.resolve(p.renderer);
  await settle();
  assert.equal(p.destroyed(), 1);
  assert.deepEqual(p.active, []);
  assert.equal(p.root.dataset.live2dState, 'fallback');
  p.controller.cleanup();
});

test('gaze follows only a nearby fine pointer and settles when interaction ends', async () => {
  const p = fixture();
  await settle();
  p.move(800, 200);
  assert.deepEqual(p.gaze, [], 'distant pointer movement leaves the guide alone');
  p.move(268, 570);
  assert.equal(p.gaze.length, 1);
  assert.ok(p.gaze[0][0] > 0 && p.gaze[0][0] <= 0.22);
  assert.ok(p.gaze[0][1] > 0 && p.gaze[0][1] <= 0.22);
  p.move(800, 200);
  assert.deepEqual(p.gaze.at(-1), [0, 0]);
  p.move(168, 680);
  p.motion(true);
  assert.deepEqual(p.gaze.at(-1), [0, 0], 'pausing settles the gaze');
  const pausedCount = p.gaze.length;
  p.move(168, 680);
  assert.equal(p.gaze.length, pausedCount);
  p.motion(false);
  p.move(168, 680);
  p.queries.pointer.set(false);
  assert.deepEqual(p.gaze.at(-1), [0, 0], 'a coarse pointer never keeps a prior mouse gaze');
  const coarseCount = p.gaze.length;
  p.move(168, 680);
  assert.equal(p.gaze.length, coarseCount);
  p.queries.pointer.set(true);
  p.move(168, 680);
  p.doc.dispatchEvent(new Event('pointerleave'));
  assert.deepEqual(p.gaze.at(-1), [0, 0]);
  p.controller.cleanup();
});
