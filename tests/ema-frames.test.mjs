import test from 'node:test';
import assert from 'node:assert/strict';
import { mountEmaFrames } from '../src/themes/ema/lib/frames.mjs';
import { messages } from '../src/core/i18n/messages.ts';

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
  return { frames, pending, click, api, controls, status, label, art, hit };
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

test('placeholder plates switch at once with the site labels: hint first, then next, and restart on the last pose', async () => {
  const node = (dataset = {}) => Object.assign(new EventTarget(), {
    dataset, attributes: {}, hidden: true,
    setAttribute(k, v) { this.attributes[k] = v; },
    getAttribute(k) { return this.attributes[k]; },
    removeAttribute(k) { delete this.attributes[k]; },
  });
  // Plates are plain elements: no decode(), no src, no alt.
  const plates = Array.from({ length: 5 }, (_, i) => node({ label: `pose-${i}`, active: String(i === 0) }));
  const hit = node(), prev = node(), next = node(), label = node();
  hit.attributes['aria-label'] = 'Click Ema for the next scene';
  const number = node(), pose = node();
  const status = Object.assign(node(), { querySelector: s => ({ '[data-frame-status-no]': number, '[data-frame-status-label]': pose })[s] });
  const controls = node({ next: 'Next scene', restart: 'Start again', error: 'Try again' });
  controls.querySelector = s => ({ '[data-frame-prev]': prev, '[data-frame-next]': next, '[data-frame-next-label]': label, '[data-frame-status]': status })[s];
  const art = node(); art.querySelectorAll = () => plates;
  const root = { querySelector: s => ({ '[data-ema-frames]': art, '[data-frame-controls]': controls, '[data-frame-hit]': hit })[s] };
  const api = mountEmaFrames(root, {}, { canAnimate: () => true });
  assert.equal(hit.hidden, false); assert.equal(controls.hidden, false);
  assert.equal(hit.attributes['aria-label'], 'Click Ema for the next scene', 'the hint stays until the first change');
  hit.dispatchEvent(Object.assign(new Event('click'), { detail: 1 })); await flush();
  assert.equal(plates[1].dataset.active, 'true');
  assert.equal(plates[0].attributes['aria-hidden'], 'true');
  assert.equal(number.textContent, '02 / 05'); assert.equal(pose.textContent, ' · pose-1');
  assert.equal(label.textContent, 'Next scene'); assert.equal(hit.attributes['aria-label'], 'Next scene');
  for (let i = 0; i < 3; i++) { next.dispatchEvent(Object.assign(new Event('click'), { detail: 1 })); await flush(); }
  assert.equal(plates[4].dataset.active, 'true');
  assert.equal(label.textContent, 'Start again'); assert.equal(hit.attributes['aria-label'], 'Start again');
  next.dispatchEvent(Object.assign(new Event('click'), { detail: 1 })); await flush();
  assert.equal(plates[0].dataset.active, 'true', 'restart returns to the first pose');
  prev.dispatchEvent(Object.assign(new Event('click'), { detail: 1 })); await flush();
  assert.equal(plates[4].dataset.active, 'true', 'previous from the first pose wraps to the last');
  assert.equal(plates.some((plate) => 'src' in plate || 'alt' in plate), false, 'plates never get image attributes');
  api.cleanup();
});

test('a drag that starts on Ema does not switch the pose; a tap or a keyboard press does', async () => {
  const p = setup();
  const send = (type, init) => p.hit.dispatchEvent(Object.assign(new Event(type), init));
  send('pointerdown', { clientX: 100, clientY: 100 });
  send('pointermove', { clientX: 100, clientY: 160, buttons: 1 });
  send('click', { detail: 1 });
  assert.equal(p.pending.length, 0, 'the drag asked for no image');
  send('pointerdown', { clientX: 100, clientY: 100 });
  send('pointermove', { clientX: 103, clientY: 102, buttons: 1 });
  send('click', { detail: 1 });
  assert.equal(p.pending.length, 1, 'a tap with a little jitter still switches');
  p.pending[0].resolve(); await flush();
  assert.equal(p.frames[1].dataset.active, 'true');
  send('click', { detail: 0 });
  assert.equal(p.pending.length, 2, 'Enter or Space on the focused button switches');
});

test('the hint on Ema names a tap as well as a click, so it fits touch and mouse in every locale', () => {
  // The hint is also the tap target's accessible name until the first switch (HomePage.astro).
  const hint = (locale) => messages[locale]['ema.frames.hint'];
  assert.equal(hint('zh-CN'), '点击艾玛，翻开下一幕');
  assert.equal(hint('zh-TW'), '點一下艾瑪，翻開下一幕');
  assert.equal(hint('ja'), 'エマをタップ・クリックして次のカットへ');
  assert.equal(hint('en'), 'Tap or click Ema for the next scene');
});
