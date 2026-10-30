import test from 'node:test';
import assert from 'node:assert/strict';
import { mountEmaFrames } from '../src/themes/ema/lib/frames.mjs';

function setup() {
  const node = (dataset = {}) => Object.assign(new EventTarget(), {
    dataset, attributes: {}, hidden: true,
    setAttribute(k, v) { this.attributes[k] = v; },
    getAttribute(k) { return k === 'src' ? this.src : this.attributes[k]; },
    removeAttribute(k) { delete this[k]; delete this.attributes[k]; },
  });
  const pending = [];
  const frames = Array.from({ length: 3 }, (_, i) => Object.assign(node({ src: `pose-${i}`, label: `scene-${i}`, active: String(i === 0) }), {
    alt: i === 0 ? 'Ema' : '',
    decode: () => new Promise((resolve, reject) => pending.push({ resolve, reject })),
  }));
  const hit = node(), prev = node(), next = node(), label = node(), status = node();
  const controls = node({ next: 'Next', restart: 'Restart', error: 'Try again' });
  const art = node(); art.querySelectorAll = () => frames;
  controls.querySelector = s => ({ '[data-frame-prev]': prev, '[data-frame-next]': next, '[data-frame-next-label]': label, '[data-frame-status]': status })[s];
  const root = { querySelector: s => ({ '[data-ema-frames]': art, '[data-frame-controls]': controls, '[data-frame-hit]': hit })[s] };
  const api = mountEmaFrames(root, {}, { canAnimate: () => false });
  const click = () => next.dispatchEvent(Object.assign(new Event('click'), { detail: 1 }));
  return { frames, pending, click, api, controls, status, label, art };
}
const flush = () => new Promise(resolve => setImmediate(resolve));

test('late image decoding cannot replace a newer selection, and teardown invalidates pending work', async () => {
  const p = setup(); p.click(); p.click();
  p.pending[1].resolve(); await flush();
  assert.equal(p.frames[2].dataset.active, 'true');
  assert.equal(p.label.textContent, 'Restart');
  p.pending[0].resolve(); await flush();
  assert.equal(p.frames[1].dataset.active, 'false');
  assert.equal(p.art.dataset.instant, 'true');
  p.click(); p.api.cleanup(); p.pending[2].resolve(); await flush();
  assert.equal(p.frames[2].dataset.active, 'true');
});

test('failed images preserve the current scene and allow the same action to retry', async () => {
  const p = setup(); p.click(); p.pending[0].reject(new Error('offline')); await flush();
  assert.equal(p.frames[0].dataset.active, 'true');
  assert.equal(p.frames[1].getAttribute('src'), undefined);
  assert.equal(p.controls.attributes['aria-busy'], 'false');
  assert.equal(p.status.textContent, 'Try again');
  p.click(); p.pending[1].resolve(); await flush();
  assert.equal(p.frames[1].dataset.active, 'true');
  p.api.cleanup();
});
