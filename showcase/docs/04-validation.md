# 验证范围与复现

[返回案例首页](../README.md) · [截图清单](../gallery/README.md)

## 快照与环境

本次案例整理日期为 **2026-10-31**。网站实现基线为 [`de9b413`](https://github.com/laozhej/laozhej.github.io/commit/de9b413e6944d27f3c105c53f85ddf9a160d7deb)，同次 showcase 更新补充作品介绍和案例链接。下述本地结果对应该版本及本次改动，不是对未来版本的长期保证。

- 本地 Node.js：22.23.0；GitHub Actions 配置为 Node.js 24。
- 使用现有依赖与锁文件，不为 showcase 添加前端运行依赖。
- 截图来源：本机生产构建，由 Chromium 浏览器访问；尺寸与显示状态见[截图清单](../gallery/README.md)。

## 已执行的检查

| 检查 | 结果及含义 |
| --- | --- |
| `npm test` | 94 项测试通过；验证公共模块及主题交互逻辑 |
| `npm run build` | 成功生成 84 个页面，覆盖三主题、四语言及现有栏目 |
| `npm run showcase:check` | 84 个语言／主题页面、12 个本地化作品入口、88 个案例本地文件链接通过检查 |
| 浏览器检查 | 12 个作品页窄视口检查及主题／语言切换、深浅色、历史返回、减少动态检查通过；本次采样无页面脚本异常 |

空文章目录会触发 Astro 的内容集合警告。目前没有正式博客文章，该警告与当前内容状态一致，不代表已验证真实文章在每个主题里的排版。

## 测试覆盖什么

| 范围 | 测试文件 |
| --- | --- |
| 语言与主题路径、偏好、404 映射 | [`i18n`](../../tests/i18n.test.mjs)、[`themes`](../../tests/themes.test.mjs)、[`preferences`](../../tests/preferences.test.mjs) |
| 导航清理、换页、构建缓存与主题登记 | [`navigation`](../../tests/navigation.test.mjs)、[`navigation-cache`](../../tests/navigation-cache.test.mjs)、[`theme-runtime`](../../tests/theme-runtime.test.mjs) |
| 搜索筛选、收藏、便笺与宽屏转换 | [`features`](../../tests/features.test.mjs)、[`games`](../../tests/games.test.mjs)、[`notes`](../../tests/notes.test.mjs)、[`fluid-px`](../../tests/fluid-px.test.mjs) |
| 艾玛动效、场景、图片帧、电台和看板娘控制 | [`ema-motion`](../../tests/ema-motion.test.mjs)、[`ema-scenes`](../../tests/ema-scenes.test.mjs)、[`ema-frames`](../../tests/ema-frames.test.mjs)、[`live2d-controller`](../../tests/live2d-controller.test.mjs) |

部分测试使用受控 DOM、窗口或音频替身，适合检查状态与清理逻辑。它们不能替代真实浏览器渲染、实际声音质量或视觉审阅。

## 浏览器记录

真实画面和检查的机器可读结果保存在 [`gallery/manifest.json`](../gallery/manifest.json) 与 [`browser-checks.json`](../browser-checks.json)。记录包含实际视口、语言、主题、颜色模式与检查结果。截图为单次取样，不能证明滚动和过渡全过程都正确。

本次使用 Chromium 156.0.8078.74，逐张查看了 9 张画面。作品入口在 390 × 844 下覆盖三套主题与四种语言，没有检测到页面横向溢出。实际点击验证了以下行为：

- 英文作品页从 Blank 切到工业风，保留语言、查询参数与锚点，窗口未重新加载。
- 工业风作品页切换日语，保留主题和查询，按设计清除可能随翻译变化的锚点。
- 手动深色选择跨主题、跨语言保留；浏览器返回恢复原页面语言。
- 启用系统减少动态后，艾玛页面进入暂停状态，动效按钮标记为不可用。

## 复现

在仓库根目录运行：

```sh
npm ci
npm test
npm run build
npm run showcase:check
npm run preview
```

打开终端打印的本机地址。按截图清单中的路径设置视口和颜色模式；对比时需注意系统中文字体、浏览器、动画时刻和本地时间可能造成差异。更新截图后同时更新 manifest 与验证记录。

## 尚未覆盖

本次未执行 Lighthouse 性能基准、完整 WCAG 审核、真实 iOS / Android 设备测试或 Firefox / Safari 的兼容矩阵。没有发布这些方面的评分或通过结论。Live2D 控制逻辑测试也不等于模型在所有 GPU 上的渲染验证。
