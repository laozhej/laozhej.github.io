# 樱花像素网站图标

使用内置 imagegen 生成并按用户反馈修改，2026-10-26。最终版为饱满、圆润的五片花瓣，移除了第一版花瓣末端的深缺口；透明背景。

- `sakura-pixel-master.png`：最终生成原图，未修改。
- `public/favicon-sakura-16.png` / `favicon-sakura-32.png`：最近邻缩放导出的浏览器图标，保留透明度。
- `public/favicon.ico`：包含 16、32、48 像素的 PNG 图标。
- `public/apple-touch-icon.png`：180 像素图标。
- 所有主题通过 `src/core/components/SiteIcons.astro` 共享。

## 初始生成提示词

```text
Use case: logo-brand
Asset type: a production website favicon and app icon for a personal website.
Primary request: one beautiful sakura cherry blossom in authentic crisp pixel art, on a truly transparent background.
Subject: a single face-on five-petal Japanese cherry blossom, each petal has a small recognizable central notch; simple compact flower silhouette, delicate but immediately recognizable at 16 by 16 and 32 by 32 pixels.
Style: classic carefully hand-placed low-resolution 2D pixel sprite, designed on a strict 32 by 32 logical pixel grid and displayed enlarged with nearest-neighbor square pixels. All pixel blocks have identical size, all edges follow that grid. Limited palette: warm light pink petals, a few richer rose pixels, deep muted berry outline, a tiny warm pink center. Broad simple petal shapes; exceptionally sparse shading.
Composition: square canvas, flower centered and almost filling the square with a narrow equal transparent margin. The flower alone, all five petals fully visible.
Constraints: genuinely transparent background (alpha), no checkerboard baked into the image, no background tile or badge, no text, no letters, no watermark. No stems, no leaves, no scattered petals, no sparkles. No gradients, no blur, no glow, no anti-aliased curves, no 3D. Clear silhouette and enough outline contrast to work on both white and dark browser tabs. Deliver exactly one icon, not a sheet or mockup.
```

## 根据用户反馈修改的最终提示词

```text
Use case: precise-object-edit
Edit target: the supplied pixel-art pink sakura flower icon.
The user says the deeply split petals look like crab claws. Correct the petal shapes.
Change each of the FIVE petals into a very full, plump, rounded oval/fan shape with a continuous convex outer rim. Fill in and REMOVE EVERY V-shaped cleft and notch at the end of every petal. No split tips at all. Each petal should feel soft, broad, rounded, and complete. Keep five distinct petals arranged radially around the same small center, with gentle shallow separation BETWEEN petals.
Preserve the overall pink cherry-blossom identity, centered square composition, simple pixel-art medium, light pink palette, muted berry-colored pixel outline and the genuinely transparent background. Use clean consistent square pixel steps to describe the rounded curves. This is a tiny website favicon, so keep it compact and legible with sparse details. Make the internal center/stamen lines somewhat lighter and less dominant, so the round pink petals are the main impression.
No branches, leaves, text, extra symbols, glow, drop shadow, gradient background, badge or mockup. Output one transparent flower icon only.
```
