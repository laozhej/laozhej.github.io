# 四种语言与内容身份

[返回案例首页](../README.md)

## 界面、内容和路径分开处理

全站支持 `zh-CN`、`zh-TW`、`ja`、`en` 四种语言。简体中文位于无前缀路径，其余三种语言使用语言前缀，且语言前缀始终位于主题前缀之前，例如 `/zh-TW/themes/blank/about/`。

界面文案与无障碍名称集中在 [`messages.ts`](../../src/core/i18n/messages.ts) 及按主题拆分的几个消息模块；个人资料、项目、游戏、动画与角色由 [`getSiteContent(locale)`](../../src/core/i18n/content.ts) 统一返回。游戏、动画和角色用稳定 `key` 关联多语言名称与共享链接，四套主题不各自复制字典。

台湾繁体中文（`zh-TW`）独立维护，使用台湾惯用词与官方译名（例如「專案」「檢視」「自行託管」「碧血狂殺 2」「對馬戰鬼」「電馭叛客 2077」），而不是对简体中文做机械转码。四种语言还各自加载对应地区字形标准的自托管字体（SC / TC / JP）。

## 切换的是语言，不是内容身份

博客文章通过 `translationKey` 关联同一篇文章的多语言版本。以已发布的 `dev-log-01` 为例：

```text
简体原文：src/content/blog/dev-log-01.md
繁体译文：src/content/blog/zh-TW/dev-log-01.md
日语译文：src/content/blog/ja/dev-log-01.md
英语译文：src/content/blog/en/dev-log-01.md

公开地址：/blog/dev-log-01/
繁中地址：/zh-TW/blog/dev-log-01/
樱色日文：/ja/themes/ema/blog/dev-log-01/
Blank 英文：/en/themes/blank/blog/dev-log-01/
```

[`select-posts.mjs`](../../src/core/content/select-posts.mjs) 按 `translationKey` 分组后选取请求语言；若某语言尚未翻译，则保留简体中文原文并在页面上明确提示当前显示原文。草稿不会对外发布，重复译文或缺少中文源会在构建与测试时报错。

同一套内容同时输出各语言的 RSS 订阅（`/rss.xml` 与 `/<locale>/rss.xml`，由 [`feed.ts`](../../src/core/content/feed.ts) 生成）以及指向规范主题的 `canonical` 与 `hreflang` 标记（[`SiteMeta.astro`](../../src/core/components/SiteMeta.astro)）。

## 访问路径、自动语言与偏好

`site-locale` 在四套主题间共享。语言决策规则由 [`LanguagePreference.astro`](../../src/core/i18n/LanguagePreference.astro) 在首次绘制前执行：

1. 带语言前缀的 URL 直接展示指定语言，不被本地偏好覆盖。
2. 无语言前缀入口和根 `404.html` 优先读取已保存的 `site-locale`；未保存时按浏览器语言偏好列表匹配 `zh-CN`、`zh-TW`、`ja`、`en`，全不匹配时回退到英语（`en`）。
3. 即使客户端脚本仍在下载，点击语言菜单也会立刻保存选择并跳转，避免早点失效。

从任意带参数路径（例如 `/ja/themes/ema/collection/games/?category=story#top`）切换主题时，公共路由组合函数会保留语言、栏目、查询参数与锚点。

## 维护约束

- 每条共享界面键都必须在四种语言中成套出现且非空，由 [`tests/i18n.test.mjs`](../../tests/i18n.test.mjs) 检查（同时守住站主英文名顺序 `Asahi Arataki` 与英文拼写一致性）。
- 作品页指向本案例文档的链接按四种语言分别标注，非简体中文页面明确说明案例正文为简体中文。
- 日文与中文断行使用 [`wrap.mjs`](../../src/core/i18n/wrap.mjs) 防止句末孤字或尾部序号被拆到下一行。
