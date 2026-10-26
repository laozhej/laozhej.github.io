# Blank 个人网站

基于 [Yuimi-chaya 的 Blank 主题](https://yuimi-chaya.github.io/themes/blank/)独立化的 Astro 静态站。保留黑白排版、大标题、编号目录和阅读体验；文章、个人资料与作品已替换为本站内容及明确标注的示例。

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
| 三语界面文案、简介、导航和分类名称 | `src/core/i18n/messages.ts` |
| 日语、英语的个人资料与收藏数据 | `src/core/i18n/content.ts` |
| 个人简介、近况、兴趣 | `src/core/data/profile.ts` |
| 项目列表 | `src/core/data/projects.ts` |
| 闲暇收藏 | `src/core/data/games.ts` |
| GitHub / Steam 个人主页链接（所有语言和主题共用） | `src/core/data/social.ts` |
| 文章 | `src/content/blog/*.md` |
| 首页结构与开场文案 | `src/themes/blank/pages/HomePage.astro` |
| 黑白主题、字体、间距、响应式 | `src/themes/blank/styles/theme.css` |
| 页面框架、导航、页脚 | `src/themes/blank/layouts/BlankLayout.astro` |
| 正式网址 | `astro.config.mjs` 中的 `site` |

`Blank Space` 是暂用站名。三篇文章均为示例，可以编辑或删除。GitHub 和 Steam 个人主页链接已配置；其他个人简介可继续完善，页面没有虚构经历。

添加文章时，复制已有 Markdown 文件，修改顶部的 `title`、`description`、`pubDate`、`category`、`tags`。分类可选 `tech`、`anime`、`life`；`draft: true` 的文章不会发布。正式发布自己的文章时，移除示例提示及 `示例` 标签。

## 已包含

- 首页、文字归档、文章详情、作品、闲暇、关于、404。
- 标题 / 摘要 / 标签搜索，分类筛选，日期排序，URL 筛选状态恢复。
- 文章目录、当前章节高亮、阅读进度、返回顶部。
- 右上角月亮 / 太阳按钮切换浅色与深色；首次访问跟随系统，手动选择会在当前浏览器中保存，并用于所有页面。
- 简体中文 / 日本語 / English 切换；三篇示例文章也有完整译文，语言和深浅色选择相互独立。
- 关于页与页脚的 GitHub / Steam 链接，以及三语致谢与许可页（`/credits/`）。
- 桌面及移动端布局、键盘焦点、跳到正文、减少动画偏好支持。

## 全站语言与后续主题

中文使用 `/`，日语使用 `/ja/`，英语使用 `/en/`。右上角切换器会保留当前栏目或文章，并保存全站统一的 `site-locale` 偏好。从不带语言前缀的入口访问时，会使用这个偏好；明确的 `/ja/`、`/en/` 链接优先。没有 JavaScript 时，语言链接仍可使用。

文章的中文源放在 `src/content/blog/`；译文放在 `ja/`、`en/` 子目录，设置 `locale` 和与中文文件名对应的 `translationKey`。不要把语言前缀写进文章链接。没有译文时，会显示中文原文并附上说明；不会自动生成或伪造翻译。

语言层位于 `src/core/i18n/`，独立于 Blank。后续主题必须复用 `getI18n()`、`getSiteContent()`、`LanguagePreference.astro` 和 `LanguageSwitcher.astro`，并为三种语言生成页面。主题路径放在语言前缀之后，如 `/ja/themes/new/blog/`，切换主题时保留当前语言。项目的 `AGENTS.md` 已记录这项约束。

检查公共语言接口：`npm test`（此测试命令使用 Node.js 24 的 TypeScript 支持）。

## GitHub Pages 部署

公开仓库为 `laozhej/laozhej.github.io`，使用 GitHub Actions 构建和部署。每次推送到 `main`，工作流会使用 Node.js 24 安装锁定依赖、运行语言测试、构建静态页面并发布 `dist/`。也可以在 Actions 中手动运行 **Deploy to GitHub Pages**。

仓库的 **Settings → Pages → Build and deployment → Source** 使用 **GitHub Actions**。部署状态与日志见仓库 Actions 页面。

这是用户名站点，正式地址位于域名根目录，因此 `astro.config.mjs` 只设置 `site: "https://laozhej.github.io"`，不设置仓库名 `base`。后续更新可直接修改此仓库的文章、数据和主题源码，无需 ChatGPT Sites。

## 来源与许可

Blank 主题的 CSS、组件与交互基于 [Yuimi-chaya/Yuimi-chaya.github.io](https://github.com/Yuimi-chaya/Yuimi-chaya.github.io)，以 MIT 许可复用，原始版权声明保留在 `LICENSE`。来源版本为 `4007a9498600c137b3912483ccee2b78b489b1bd`。适配包括独立路由、站点元数据、内容替换与移除跨主题菜单。

没有复制原作者的文章、漫画、立绘、音乐或个人资料。图标由 `@iconify-json/tabler` / Tabler Icons 提供，许可为 MIT。本站不加载外部字体或角色图片。

