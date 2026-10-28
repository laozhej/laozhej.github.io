import { mountLive2D } from '../../../core/live2d/controller.mjs';

// KyokiStudio fan model, used on this noncommercial personal site.
// Model-specific provenance and restrictions live beside the assets.
export function mountFrieren(root, doc, win) {
  return mountLive2D(root, doc, win, {
    createRenderer: async (options) => {
      const { createCubismRenderer } = await import('../../../core/live2d/renderer.mjs');
      return createCubismRenderer({
        ...options,
        modelUrl: '/themes/ema/live2d/frieren/Frieren.model3.json',
        coreUrl: '/vendor/live2d/5-r.4/live2dcubismcore.min.js',
      });
    },
  });
}
