# 验证范围与复现

[返回案例首页](../README.md) · [截图清单](../gallery/README.md)

## 检查环境与基线

本验证记录更新于 **2026-11-28**（基于 `main` [`f80b3e3`](https://github.com/laozhej/laozhej.github.io/commit/f80b3e31fb491a083e17f00d2bf8b1428801680d) 及全站文案与字体同步）。画廊中的 6 张 PNG 仍保留 2026-10-31 历史快照（见 [`gallery/manifest.json`](../gallery/manifest.json)），待页头美术定稿后统一重拍。

- 本地 Node.js：`24.19.0`（与 GitHub Actions 部署版本一致；`PATH=/usr/local/bin:/usr/bin:/bin`）。
- 浏览器检查环境：桌面端 Playwright 驱动的 Chrome `158.0.8127.38`（macOS），访问本地生产构建 `dist/`。

## 已执行的检查

| 检查 | 结果及含义 |
| --- | --- |
| `npm test` | 40 份测试文件共 **272 项**测试全部通过；覆盖公共层、四语、无障碍名称、触控目标、自托管字体与四套主题运行时 |
| `npm run build` | 成功生成 **280 个静态页面**（含旧地址的跳转页），覆盖四套主题、四种语言、全部栏目及四语文章 `dev-log-01` |
| `npm run showcase:check` | 112 个主题／语言页面、16 个本地化作品页案例链接与案例文档内全部本地链接均通过校验 |
| 浏览器窄视口与交互检查 | Chrome `158.0.8127.38` 检查全部 16 个作品页（390 × 844 均无横向溢出）与 6 项跨主题／跨语言交互，无页面脚本异常 |

## 测试覆盖范围

| 范围 | 测试文件 |
| --- | --- |
| 语言路由、浏览器语言分流、译文选择与文案一致性 | [`i18n`](../../tests/i18n.test.mjs)、[`wrap`](../../tests/wrap.test.mjs)、[`seo`](../../tests/seo.test.mjs) |
| 主题路径、运行时挂载与清理、导航缓存与滚动恢复 | [`themes`](../../tests/themes.test.mjs)、[`theme-runtime`](../../tests/theme-runtime.test.mjs)、[`navigation`](../../tests/navigation.test.mjs)、[`navigation-cache`](../../tests/navigation-cache.test.mjs)、[`scroll-restore`](../../tests/scroll-restore.test.mjs) |
| 深浅色、动效暂停、搜索筛选、平滑回顶与宽屏缩放 | [`preferences`](../../tests/preferences.test.mjs)、[`features`](../../tests/features.test.mjs)、[`back-to-top`](../../tests/back-to-top.test.mjs)、[`fluid-px`](../../tests/fluid-px.test.mjs)、[`frontend-robustness`](../../tests/frontend-robustness.test.mjs) |
| 无障碍名称、网页平台规范与四主题 44 px 点按范围 | [`a11y-names`](../../tests/a11y-names.test.mjs)、[`web-platform`](../../tests/web-platform.test.mjs)、[`blank-targets`](../../tests/blank-targets.test.mjs)、[`ema-targets`](../../tests/ema-targets.test.mjs)、[`ema-tap-targets`](../../tests/ema-tap-targets.test.mjs)、[`endfield-targets`](../../tests/endfield-targets.test.mjs) |
| 字体自托管、图片资产清单与收藏数据 | [`self-hosted-fonts`](../../tests/self-hosted-fonts.test.mjs)、[`assets`](../../tests/assets.test.mjs)、[`games`](../../tests/games.test.mjs)、[`notes`](../../tests/notes.test.mjs)、[`image-import`](../../tests/image-import.test.mjs) |
| 樱色档案、Blank、终末地与明日方舟主题专项 | [`blank-ema-motion`](../../tests/blank-ema-motion.test.mjs)、[`ema-stage`](../../tests/ema-stage.test.mjs)、[`ema-frames`](../../tests/ema-frames.test.mjs)、[`ema-avatar`](../../tests/ema-avatar.test.mjs)、[`collection`](../../tests/collection.test.mjs)、[`ema-works`](../../tests/ema-works.test.mjs)、[`ema-article-art`](../../tests/ema-article-art.test.mjs)、[`ema-plate`](../../tests/ema-plate.test.mjs)、[`ema-storyboard`](../../tests/ema-storyboard.test.mjs)、[`ema-ring`](../../tests/ema-ring.test.mjs)、[`ema-terminal`](../../tests/ema-terminal.test.mjs)、[`ema-motion`](../../tests/ema-motion.test.mjs)、[`endfield-motion`](../../tests/endfield-motion.test.mjs)、[`arknights`](../../tests/arknights.test.mjs) |

注：单元测试验证逻辑、结构与约束，不能替代真实浏览器渲染、真机触控或视觉审阅。

## 浏览器交互记录

机器可读的浏览器检查结果保存在 [`browser-checks.json`](../browser-checks.json)。Chrome `158.0.8127.38` 在 390 × 844 下检查了全部 16 个作品页（4 套主题 × 4 种语言），横向溢出均为 `false`，无 `pageerror`；并在 1440 × 900 下验证了以下 6 项交互：

- 英文作品页从 Blank 切换到终末地工业风，保留语言、查询参数与锚点。
- 终末地作品页切换到日语，保留当前主题与查询参数。
- 浏览器后退后恢复上一个语言版本。
- 手动切换深色模式后，跨主题（Blank → 明日方舟）与跨语言（en → ja）保持深色。
- 再次点击深浅色按钮切回系统当前浅色后，清除本地覆盖项，恢复跟随系统。
- 开启系统 `prefers-reduced-motion: reduce` 后，樱色档案页面自动进入暂停动效状态。

## 复现

在仓库根目录使用 Node 24 运行：

```sh
npm ci
npm test
npm run build
npm run showcase:check
```

若要在浏览器中本地查看构建产物，建议用静态文件服务打开 `dist/`（例如 `python3 -m http.server 4321 --directory dist`）。

## 尚未覆盖

本机自动化运行仅覆盖桌面端 Playwright 驱动的 Chromium / WebKit；**真正的 macOS / iOS Safari、Firefox、实体手机触控、真实触控板滚轮舞台体验及完整 Lighthouse 基准**尚未在本轮执行，不据此宣称已完成跨设备真机验收。
