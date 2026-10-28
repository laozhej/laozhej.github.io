# Blank / 艾玛个人网站

基于 [Yuimi-chaya 的 Blank 主题](https://yuimi-chaya.github.io/themes/blank/)独立化的 Astro 静态站。保留 Blank 的黑白阅读界面，并提供独立的艾玛主题。两套主题共用文章、个人资料、作品、收藏和功能；示例内容均明确标注。

网站：**[laozhej.github.io](https://laozhej.github.io/)** · 支持简体中文、日本語、English，以及浅色 / 深色模式。

## 本地运行

需要 Node.js 22.12.0 或更新版本（推荐 Node.js 24）。

```sh
npm ci
npm run dev
```

打开终端显示的本地地址。构建与检查成品：

```sh
npm run build
npm run preview
```

构建输出为 `dist/`，可部署到支持静态网站的服务。

## 修改内容

| 要修改的内容 | 文件 |
| --- | --- |
| 站名、导航路径 | `src/lib/site.ts` |
| 三语界面文案、导航和分类名称 | `src/core/i18n/messages.ts` |
| 日语、英语的个人资料与收藏数据 | `src/core/i18n/content.ts` |
| 个人简介、近况、兴趣 | `src/core/data/profile.ts` |
| 项目列表 | `src/core/data/projects.ts` |
| 闲暇收藏 | `src/core/data/games.ts` |
| GitHub / Steam 个人主页链接（所有语言和主题共用） | `src/core/data/social.ts` |
| 全主题共用的搜索、筛选、排序、阅读进度 | `src/core/features/` |
| 全主题共用的页面切换过渡与页面脚本生命周期 | `src/core/navigation/` |
| 全主题共用的深浅色偏好与首屏初始化 | `src/core/preferences/` |
| 文章 | `src/content/blog/*.md` |
| 首页结构与开场文案 | `src/themes/blank/pages/HomePage.astro` |
| 黑白主题、字体、间距、响应式 | `src/themes/blank/styles/theme.css` |
| 页面框架、导航、页脚 | `src/themes/blank/layouts/BlankLayout.astro` |
| 艾玛主题的页面、样式与交互 | `src/themes/ema/` |
| 主题注册、切换和偏好 | `src/core/themes/` |
| 艾玛主题图片与来源记录 | `public/themes/ema/assets/`、`public/themes/ema/ASSETS.json` |
| 全主题共用的网站图标 | `src/core/components/SiteIcons.astro`、`assets/branding/` |
| 正式网址 | `astro.config.mjs` 中的 `site` |

`Blank Space` 是暂用站名。三篇文章均为示例，可以编辑或删除。GitHub 和 Steam 个人主页链接已配置；其他个人简介可继续完善，页面没有虚构经历。

添加文章时，复制已有 Markdown 文件，修改顶部的 `title`、`description`、`pubDate`、`category`、`tags`。分类可选 `tech`、`anime`、`life`；`draft: true` 的文章不会发布。正式发布自己的文章时，移除示例提示及 `示例` 标签。

## 已包含

- 首页、文字归档、文章详情、作品、闲暇、关于、404。
- 标题 / 摘要 / 标签搜索，分类筛选，日期排序，URL 筛选状态恢复。
- 文章目录、当前章节高亮、阅读进度、返回顶部。
- 右上角月亮 / 太阳按钮切换浅色与深色；未手动选择时跟随系统变化，手动选择会在当前浏览器中保存，并在页面、语言、接入公共模块的主题之间共用。
- 简体中文 / 日本語 / English 切换；三篇示例文章也有完整译文，语言和深浅色选择相互独立。
- Blank / 艾玛主题切换，保留当前语言、栏目、文章、查询参数和锚点。主题选择与深浅色选择相互独立。
- 关于页与页脚的 GitHub / Steam 链接，以及三语致谢与许可页（`/credits/`）。
- 站内页面切换不整页刷新：页头保持不动，正文淡出淡入；语言、主题和深浅色选择随之保留，浏览器前进 / 后退恢复原滚动位置。
- 樱色档案（艾玛主题）首页参考 Yuimi-chaya 的 Fuyukawa Kagari 主题：用本站四张素材拼成的漫画分镜墙、集中线和樱羽艾玛立绘，玻璃质感标题与终端打字行，每天自动弹出一次的「今日公告」便笺（可勾选当日不再弹出），随滚动浮现的站长名片，以及显示访客本地时间、喜欢标签掉落堆积的第二幕。所有艾玛页面都有飘落的樱花瓣，宽屏另有侧边樱花滚动标记。
- 艾玛主题各页面都有暂停 / 播放动效按钮；暂停后两套主题都跳过页面过渡。系统开启减少动态时同样跳过，并停用该按钮。
- 桌面及移动端布局、键盘焦点、跳到正文、减少动画偏好支持。

## 全站语言与主题

中文使用 `/`，日语使用 `/ja/`，英语使用 `/en/`。右上角切换器会保留当前栏目或文章，并保存全站统一的 `site-locale` 偏好。从不带语言前缀的入口访问时，会使用这个偏好；明确的 `/ja/`、`/en/` 链接优先。没有 JavaScript 时，语言链接仍可使用。

文章的中文源放在 `src/content/blog/`；译文放在 `ja/`、`en/` 子目录，设置 `locale` 和与中文文件名对应的 `translationKey`。不要把语言前缀写进文章链接。没有译文时，会显示中文原文并附上说明；不会自动生成或伪造翻译。

语言层位于 `src/core/i18n/`，独立于 Blank。后续主题必须复用 `getI18n()`、`getSiteContent()`、`LanguagePreference.astro` 和 `LanguageSwitcher.astro`，并为三种语言生成页面。主题路径放在语言前缀之后，如 `/ja/themes/new/blog/`，切换主题时保留当前语言。项目的 `AGENTS.md` 已记录这项约束。

个人资料、项目、收藏与社交链接来自同一份公共数据；文章也只维护一组 Markdown 源文件。修改后重新部署，所有接入这些数据的主题都会呈现更新。同一语言的内容共用；中文内容的修改不会自动翻译成日语或英语，译文仍需维护。

搜索、分类筛选、日期排序、阅读进度和深浅色逻辑均位于公共核心。Blank 使用根路径，艾玛主题使用 `/themes/ema/`；日语和英语主题入口分别为 `/ja/themes/ema/`、`/en/themes/ema/`。导航中的主题菜单会保留当前栏目、文章、语言及适用的查询参数和锚点。选择保存在统一的 `site-theme` 偏好中；实际页面主题由 URL 决定，直接链接和浏览器历史不会被已保存的偏好强制改写。

各主题负责布局、颜色和交互呈现，通过统一标记接入同一套功能。新增主题时请按 [主题接入说明](docs/THEMES.md) 接入数据、功能、语言与路由，不要复制主题内的业务逻辑。

检查公共语言、偏好与功能接口：`npm test`（使用 Node.js 24 的 TypeScript 支持）。

## GitHub Pages 部署

公开仓库为 `laozhej/laozhej.github.io`，使用 GitHub Actions 构建和部署。每次推送到 `main`，工作流会使用 Node.js 24 安装锁定依赖、运行公共模块测试、构建静态页面并发布 `dist/`。也可以在 Actions 中手动运行 **Deploy to GitHub Pages**。

仓库的 **Settings → Pages → Build and deployment → Source** 使用 **GitHub Actions**。部署状态与日志见仓库 Actions 页面。

这是用户名站点，正式地址位于域名根目录，因此 `astro.config.mjs` 只设置 `site: "https://laozhej.github.io"`，不设置仓库名 `base`。后续更新可直接修改此仓库的文章、数据和主题源码，无需 ChatGPT Sites。

## 来源与许可

Blank 主题的 CSS、组件与交互基于 [Yuimi-chaya/Yuimi-chaya.github.io](https://github.com/Yuimi-chaya/Yuimi-chaya.github.io)，以 MIT 许可复用，原始版权声明保留在 `LICENSE`。来源版本为 `4007a9498600c137b3912483ccee2b78b489b1bd`。适配包括独立路由、站点元数据、内容替换与移除跨主题菜单。

没有复制上游站长的文章、漫画、立绘、音乐或个人资料。界面图标由 `@iconify-json/tabler` / Tabler Icons 提供，许可为 MIT。所有主题共享确定性排版生成的 `B.` 网站图标；当前页面不加载此前的 AI 樱花图标，也不加载 AI 首页效果图或 AI 生成的角色图片。

艾玛主题的四张角色／漫画图片来自各自记录的外部来源，下载后在本站本地提供，未使用生成式 AI 重绘；仅做等比例缩放和格式转换。原始来源、署名、校验值及处理方式见 [素材清单](public/themes/ema/ASSETS.json)。来源可追溯和署名不构成公开使用授权，图片不随软件 MIT 许可授权；面向装饰性网站公开使用的许可尚未确认。详见 [第三方素材说明](THIRD_PARTY_ASSETS.md)。

示例文章及其译文的许可范围见 [内容许可说明](CONTENT_LICENSE.md)。网站不加载外部字体。

