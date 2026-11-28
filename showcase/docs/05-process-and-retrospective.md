# 开发协作与复盘

[返回案例首页](../README.md)

## 谁做了什么

Asahi Arataki 提供个人资料、原创文章、选定的游戏／动画／角色收藏、视觉方向与最终验收，并负责整个网站的长期维护。Claude 与 Codex 等 AI 工具辅助前端设计、组件实现、可访问性排查、自动化测试与文档整理。Blank 的代码起点与樱色档案的参考布局来自 Yuimi-chaya，仓库保留完整上游署名，不把继承部分算作从零原创。

本案例完全基于真实源码、公开提交、路线图记录和本地验证结果编写，不虚构工时或开发效率数字。

## 公开记录中的关键演进

| 阶段 | 可核对提交 |
| --- | --- |
| 早期多主题架构与四语基础 | [`de9b413`](https://github.com/laozhej/laozhej.github.io/commit/de9b413)：Blank、樱色档案、终末地与四语共享核心 |
| 樱色档案与 Blank 首页重做、首篇博文上线 | PR #12–#19：立绘舞台、静物与分镜条、第一篇四语文章 `dev-log-01`、展板式作品页 |
| SEO、交互修复与版式回退 | PR #20–#31：sitemap/RSS/OG 分享图、滚动位置恢复、按站主对照验收恢复并定稿内页版式 |
| 终末地交互动效、现代 Web 与触控目标 | PR #35–#42：终末地交互动效、axe-core 首次扫描、三主题 44 px 点按范围、CC0 樱枝 |
| 新增第四套主题「明日方舟」 | [`e5d3d72`](https://github.com/laozhej/laozhej.github.io/commit/e5d3d72)、[`9ef2bbb`](https://github.com/laozhej/laozhej.github.io/commit/9ef2bbb)：档案终端主题与四主题同步 |
| 读屏名称、电台、头像与动效完善 | [`db563f9`](https://github.com/laozhej/laozhej.github.io/commit/db563f9)、[`89adf54`](https://github.com/laozhej/laozhej.github.io/commit/89adf54)、[`65d9a78`](https://github.com/laozhej/laozhej.github.io/commit/65d9a78)、[`06c37e3`](https://github.com/laozhej/laozhej.github.io/commit/06c37e3)：WCAG 2.5.3 与逐像素对比度、MP3 樱色电台、平滑回顶、Blank/Ema 动效 |
| 自托管字体、跟随系统与浏览器语言 | [`10a7f14`](https://github.com/laozhej/laozhej.github.io/commit/10a7f14)、[`99821e7`](https://github.com/laozhej/laozhej.github.io/commit/99821e7)、[`d3e521c`](https://github.com/laozhej/laozhej.github.io/commit/d3e521c)、[`224b511`](https://github.com/laozhej/laozhej.github.io/commit/224b511)、[`f80b3e3`](https://github.com/laozhej/laozhej.github.io/commit/f80b3e3)：深浅色自动回退跟随系统、按浏览器语言分流、四主题自托管字库、延迟分片与 Ema 英文正文 Nunito |
| 联系方式扩展与全站文案校对 | [`3b64f6c`](https://github.com/laozhej/laozhej.github.io/commit/3b64f6c)、[`6385d71`](https://github.com/laozhej/laozhej.github.io/commit/6385d71) 及当前分支：补齐邮箱／Instagram／X、全站四语文案修补与风格打磨 |

## 目前有效的做法

**把共享能力收进 `src/core`，把视觉隔离在 `src/themes`。** 路由、国际化、深浅色、动效暂停、平滑回顶、搜索筛选与自托管字体都在公共层一次修好，四套主题同步受益；样式前缀与测试守住边界，防止共享改动破坏已冻结的终末地和明日方舟主题。

**把规则写进可执行测试与文档契约。** [`AGENTS.md`](../../AGENTS.md)、[`docs/THEMES.md`](../../docs/THEMES.md) 和 [`docs/ROADMAP.md`](../../docs/ROADMAP.md) 明确分工、冻结项与验证口径；38 份测试文件在本地和部署前守住路由、可访问性名称、触控目标、资源清单与字体约定。

**先出对照再定视觉方向。** 涉及布局与视觉的改动通过桌面与手机整页对照交给站主判断，避免“测试通过”被误当成视觉验收通过。

## 需要继续付出的成本

四主题 × 四语言让每次公共改动都要验证 224 个静态页与多种视口／配色组合。`PageLayout.astro` 目前把四套主题的样式打包进同一份公共样式表，按主题拆分仍是一项待做性能优化（见 `docs/ROADMAP.md` 第 4.3 节）。另外，第三方立绘与收藏配图的长期授权整理、以及新文章的持续写作，都需要站主后续推进。

## 下一步

- 定下樱色档案页头插画方向后，统一重拍 `public/projects/gallery/` 与 `showcase/gallery/` 截图并同步清单。
- 在真实 Safari（macOS / iOS）、Firefox 与实体手机上补做真机检查（滚动恢复、View Transitions、滚轮舞台与原生下拉框高度）。
- 评估清理 r3 首页残留文件与按主题拆分共享样式表，进一步减小页面加载体积。
- 持续补充新的开发记录与项目，丰富真实文章与游戏短评内容。
