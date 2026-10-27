# 共用 B. 网站图标

当前图标是字母 `B.` 与素色圆角底，使用 Arial Bold 字体和 Pillow 确定性排版，2026-10-27。未调用图片生成模型，没有角色、花朵或生成式重绘内容。所有主题与语言通过 `src/core/components/SiteIcons.astro` 共享这一套图标。

- `b-mark.svg`：可编辑的排版源，仅包含圆角矩形与文字；字体文件未打包或嵌入。
- `build_icons.py`：渲染脚本，以 4 倍尺寸排版后使用 LANCZOS 缩小。
- `public/favicon.svg`：同一 SVG 排版源的发布副本。
- `public/favicon-16.png`、`public/favicon-32.png`：16 / 32 像素图标，保留圆角外透明度。
- `public/favicon.ico`：16、32、48、64、128、256 像素版本。
- `public/apple-touch-icon.png`：180 像素 RGB 图标；背景不透明，由系统应用外轮廓遮罩。
- `sha256.txt`：当前发布文件的 SHA-256，可逐项验证。

重新渲染需要 Python、Pillow，以及本机已安装的 Arial Bold TrueType 字体：

```sh
python3 assets/branding/build_icons.py --font '/path/to/Arial Bold.ttf'
```

相同字体文件及 Pillow / FreeType / libpng 版本下输出可重复。SVG 使用 `Arial, Helvetica, sans-serif` 字体栈；不带 Arial 的客户端可能选用后备字体。PNG / ICO 不依赖访客本机字体。

## 历史素材

`sakura-pixel-master.png` 是 2026-10-26 使用 imagegen 制作的历史原图，记录见 `SAKURA_HISTORY.md`。它保留在非 `public/` 的资料目录中，未被页面或当前图标引用，不进入构建发布文件。旧的 `public/favicon-sakura-16.png` 和 `public/favicon-sakura-32.png` 已删除；ICO 与 Apple 图标已替换为 B. 排版图标。
