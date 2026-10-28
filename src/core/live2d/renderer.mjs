// Loaded only when a visible desktop guide needs animation. Core is kept local
// and versioned; no executable code is fetched from a third-party CDN at runtime.
const coreLoads = new WeakMap();

function loadCore(doc, win, url) {
  if (win.Live2DCubismCore) return Promise.resolve();
  if (coreLoads.has(win)) return coreLoads.get(win);
  const loading = new Promise((resolve, reject) => {
    const script = doc.createElement('script');
    const finish = (error) => {
      win.clearTimeout(timeout);
      script.onload = script.onerror = null;
      if (error) { script.remove(); reject(error); } else resolve();
    };
    const timeout = win.setTimeout(() => finish(new Error('Cubism Core load timed out')), 15000);
    script.src = url;
    script.async = true;
    script.dataset.astroRerun = '';
    script.onload = () => finish(win.Live2DCubismCore ? null : new Error('Cubism Core unavailable'));
    script.onerror = () => finish(new Error('Cubism Core failed to load'));
    doc.head.append(script);
  });
  coreLoads.set(win, loading);
  loading.catch(() => coreLoads.delete(win));
  return loading;
}

export async function createCubismRenderer({ canvas, signal, modelUrl, coreUrl }) {
  const doc = canvas.ownerDocument;
  const win = doc.defaultView;
  const check = () => signal.throwIfAborted();
  check();
  await loadCore(doc, win, coreUrl);
  check();
  const [{ Application, Container, utils }, { Live2DModel, Live2DFactory, Cubism4ModelSettings, config, cubism4Ready }] = await Promise.all([
    import('pixi.js'), import('pixi-live2d-display/cubism4'),
  ]);
  check();
  config.sound = false;
  let app;
  let model, initialized = false, destroyed = false, frame = 0, lastTime = 0, active = false;
  let textureUrls = [];
  const objectUrls = [];
  const loading = new win.AbortController();
  const forwardAbort = () => loading.abort(signal.reason);
  const abortSetup = () => destroy();
  const timeout = win.setTimeout(() => loading.abort(new Error('Live2D resources timed out')), 15000);
  signal.addEventListener('abort', forwardAbort, { once: true });
  loading.signal.addEventListener('abort', abortSetup, { once: true });
  function finishLoading() {
    win.clearTimeout(timeout);
    signal.removeEventListener('abort', forwardAbort);
    loading.signal.removeEventListener('abort', abortSetup);
  }
  function waitForSetup(promise) {
    loading.signal.throwIfAborted();
    return new Promise((resolve, reject) => {
      const abort = () => { loading.signal.removeEventListener('abort', abort); reject(loading.signal.reason); };
      loading.signal.addEventListener('abort', abort, { once: true });
      Promise.resolve(promise).then((value) => {
        loading.signal.removeEventListener('abort', abort);
        resolve(value);
      }, (error) => {
        loading.signal.removeEventListener('abort', abort);
        reject(error);
      });
    });
  }
  function stop() {
    active = false;
    win.cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
  }
  function destroy() {
    if (destroyed) return;
    destroyed = true;
    stop();
    finishLoading();
    loading.abort();
    // The library's destroy assumes internalModel exists. A rejected .moc3
    // load has no internal model, but still needs its XHRs and container freed.
    try {
      if (model?.internalModel) model.destroy();
      else if (model) { model.emit('destroy'); Container.prototype.destroy.call(model); }
    } catch {}
    try { if (initialized) app.destroy(false, { children: true }); } catch {}
    // Blob URLs make each mount's textures independent, including during a swap.
    for (const url of textureUrls) { try { utils.TextureCache[url]?.destroy(true); } catch {} }
    for (const url of objectUrls) win.URL.revokeObjectURL(url);
  }
  try {
    await waitForSetup(cubism4Ready());
    const source = new URL(modelUrl, doc.baseURI).href;
    const response = await win.fetch(source, { signal: loading.signal });
    if (!response.ok) throw new Error('Model settings unavailable');
    const settings = await response.json();
    const refs = settings.FileReferences;
    if (typeof refs?.Moc !== 'string' || !Array.isArray(refs.Textures) || !refs.Textures.length) throw new Error('Invalid model settings');
    const paths = [refs.Moc, ...refs.Textures, ...(refs.Physics ? [refs.Physics] : [])];
    // All network I/O is abortable and bounded, before allocating WebGL. The
    // factory later consumes only local blobs rather than its unbounded XHRs.
    const blobs = await Promise.all(paths.map(async (path) => {
      const asset = await win.fetch(new URL(path, source).href, { signal: loading.signal });
      if (!asset.ok) throw new Error('Model resource unavailable');
      return asset.blob();
    }));
    loading.signal.throwIfAborted();
    const moc = await blobs[0].arrayBuffer();
    loading.signal.throwIfAborted();
    if (win.Live2DCubismCore.Moc.prototype.hasMocConsistency(moc) !== 1) throw new Error('Invalid moc data');
    for (const blob of blobs) objectUrls.push(win.URL.createObjectURL(blob));
    settings.url = source;
    textureUrls = objectUrls.slice(1, 1 + refs.Textures.length);
    settings.FileReferences = {
      Moc: objectUrls[0], Textures: textureUrls,
      ...(refs.Physics ? { Physics: objectUrls.at(-1) } : {}),
    };
    const localSettings = new Cubism4ModelSettings(settings);
    // The library's legacy URL resolver corrupts nested blob:http(s) schemes.
    // Every resource was fetched above; keep those exact local URLs intact.
    localSettings.resolveURL = (path) => {
      if (!objectUrls.includes(path)) throw new Error('Unexpected model resource');
      return path;
    };
    app = new Application({
      view: canvas, width: canvas.clientWidth || 164, height: canvas.clientHeight || 240,
      backgroundAlpha: 0, antialias: true,
      resolution: Math.min(win.devicePixelRatio || 1, 2), autoDensity: true,
      autoStart: false, sharedTicker: false, powerPreference: 'low-power',
      preserveDrawingBuffer: true,
    });
    initialized = true;
    check();
    const options = {
      autoUpdate: false, autoInteract: false,
      motionPreload: 'NONE', idleMotionGroup: '__site_quiet__',
    };
    model = new Live2DModel(options);
    await waitForSetup(Live2DFactory.setupLive2DModel(model, localSettings, options));
    loading.signal.throwIfAborted();
    const internal = model.internalModel;
    // Authoring canvases often have large empty margins. Fit the visible mesh,
    // including its staff, so the character stands at the bottom of the page.
    internal.coreModel.update();
    const opacity = internal.coreModel.getModel().drawables.opacities;
    let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
    for (let i = 0; i < opacity.length; i++) {
      if (opacity[i] < 0.01) continue;
      const vertices = internal.getDrawableVertices(i);
      for (let j = 0; j < vertices.length; j += 2) {
        const point = internal.localTransform.apply({ x: vertices[j], y: vertices[j + 1] });
        left = Math.min(left, point.x); right = Math.max(right, point.x);
        top = Math.min(top, point.y); bottom = Math.max(bottom, point.y);
      }
    }
    if (!Number.isFinite(left) || right <= left || bottom <= top) throw new Error('Empty model');
    const scale = Math.min((app.screen.width - 16) / (right - left), (app.screen.height - 16) / (bottom - top));
    model.scale.set(scale);
    model.position.set(app.screen.width / 2 - (left + right) / 2 * scale, app.screen.height - 8 - bottom * scale);
    const breath = internal.breath.getParameters();
    for (const parameter of breath) parameter.peak *= 0.25;
    internal.eyeBlink?.setBlinkingInterval(5);
    app.stage.addChild(model);
    model.update(0);
    app.render();
    finishLoading();
    function tick(time) {
      if (!active || destroyed) return;
      const dt = lastTime ? time - lastTime : 1000 / 30;
      if (dt >= 1000 / 30) {
        lastTime = time;
        model.update(Math.min(dt, 50));
        app.render();
      }
      frame = win.requestAnimationFrame(tick);
    }
    return {
      setActive(value) {
        if (destroyed || value === active) return;
        if (!value) { stop(); return; }
        active = true;
        frame = win.requestAnimationFrame(tick);
      },
      focus(x, y) { if (!destroyed) internal.focusController.focus(x, y); },
      destroy,
    };
  } catch (error) {
    destroy();
    throw error;
  }
}
