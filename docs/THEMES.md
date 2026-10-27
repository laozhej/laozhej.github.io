# 新主题接入说明

主题负责页面布局、颜色、字体、插画和动效。个人内容与可复用功能由 `src/core` 提供。Blank 保留原有根路由；艾玛「樱色档案」使用 `/themes/ema/`。共享主题切换器在保留栏目、文章、语言及 URL 状态的同时切换外观。

## 共用内容

| 内容 | 接口或来源 |
| --- | --- |
| 个人资料、近况、兴趣、作品、收藏 | `getSiteContent(locale)`，来自 `src/core/i18n/content.ts` |
| 中文资料源 | `src/core/data/profile.ts`、`projects.ts`、`games.ts` |
| GitHub / Steam 等外链 | `socialLinks`，来自 `src/core/data/social.ts` |
| 已发布文章、稳定 slug、译文缺失处理 | `getPublishedPosts(locale)`，来自 `src/core/content/blog.ts` |
| 站名和全站导航定义 | `site`，来自 `src/lib/site.ts` |
| UI、无障碍与 SEO 文案 | `getI18n(pathname)`，来自 `src/core/i18n` |

所有主题都从这些接口读取，不在主题目录复制个人资料或文章。文章详细页继续通过 Astro 内容渲染接口显示同一篇 Markdown。更新内容并重新构建、部署后，所有接入的主题同步更新。不同语言的译文仍要分别维护，不能把内容共用理解为自动翻译。

新功能涉及新的内容字段时，先扩展公共数据及三语内容，再由各主题决定如何展示。展示方式可以不同，数据身份、链接和分类键保持一致。

各主题的 `<head>` 统一使用 `src/core/components/SiteIcons.astro`，共用非 AI 的 `B.` 排版网站图标和触屏图标；不要在主题内另外维护图标链接。

## 语言与深浅色

在新主题布局的 `<head>` 中放入两个公共组件：

```astro
---
import LanguagePreference from "@/core/i18n/LanguagePreference.astro";
import LanguageSwitcher from "@/core/i18n/LanguageSwitcher.astro";
import ColorModePreference from "@/core/preferences/ColorModePreference.astro";
---
<!-- 放在 head 内、页面绘制前 -->
<LanguagePreference />
<ColorModePreference lightColor="#ffffff" darkColor="#141414" />
```

`ColorModePreference` 同时输出 `theme-color` meta，不要重复添加。新主题可以传入自己的浏览器顶栏颜色；页面 CSS 则使用 `html[data-color-mode="light"]` / `html[data-color-mode="dark"]` 设置自身配色。

导航使用共享 `LanguageSwitcher`（它会自行初始化语言偏好）。深浅色按钮保留 `data-color-mode-toggle`、`data-label-dark`、`data-label-light`、`aria-label` 和初始 `aria-pressed="false"`，并在 JS 初始化前设为 `hidden`；按钮外观由主题提供。标签均通过 `t()` 取得三语译文。

全站使用 `site-locale`、`blank-color-mode` 和 `site-theme` 三个偏好键。深浅色沿用旧名字以保留访客设置，实际已经全主题共用。未手动选择时实时跟随系统；手动选择后优先使用该选择，不添加“自动”按钮。同源页面和标签页共用深浅色选择，不会同步到另一个设备。

## 主题选择

每个主题的 `<head>` 挂载 `src/core/themes/ThemePreference.astro`，导航挂载 `src/core/themes/ThemeSwitcher.astro`。二者无需参数。切换器提供自己的基础菜单样式，主题可用 `--site-menu-background` 和 `--site-menu-color` 调整菜单颜色。

`site-theme` 保存手动选择。**URL 始终决定当前主题**：保存的选择不会把显式主题链接、Blank 根路由或浏览器历史自动重定向。`html[data-theme]` 是当前主题；`data-preferred-theme` 是保存的偏好，存储不可用时回退到当前主题。切换链接在点击时读取当前 URL，保留语言、栏目、完整文章 slug、查询参数和锚点。禁用 JavaScript 时仍可用普通链接切换页面。

## 功能入口

每个主题布局只挂载一次公共入口：

```astro
<script>
  import { mountSiteFeatures } from "@/core/features/runtime.mjs";
  mountSiteFeatures(document, window);
</script>
```

入口根据页面现有标记启用对应功能；缺少集合或文章区域时跳过。返回值是清理函数，供将来主动替换布局时调用。重复挂载会先清理旧实例；普通页面退出会释放事件，浏览器前进/后退缓存则保留可恢复的实例。

Blank 的 `lib/runtime.mjs` 是薄适配器，调用公共入口后只处理自己的 404 路径提示。新主题不需要导入它。

### 搜索、筛选和排序

| DOM 标记 | 用途 |
| --- | --- |
| `data-site-collection` | 集合根节点；用 `data-unit` 和 `data-unit-one` 提供本语言的数量单位 |
| `data-site-filter-form` | 筛选表单，初始 `hidden`，初始化后显示 |
| `data-site-entries` | 条目容器 |
| `data-site-entry` | 条目；`data-category` 是分类键，`data-search` 是标题/摘要/标签文本，`data-date` 是时间戳 |
| `data-site-query` | 可选搜索输入，建议 `maxlength="300"` |
| `data-site-sort` | 可选 select，选项值 `newest` / `oldest` |
| `data-site-category="all"` 或分类键 | 分类按钮，使用 `type="button"` 和 `aria-pressed` |
| `data-site-clear` / `data-site-reset` | 可选清空搜索 / 重置所有条件按钮 |
| `data-site-empty` | 可选空结果提示，初始 `hidden` |
| `data-site-count` | 可选结果数量输出，建议 `aria-live="polite"` |

表单和条目容器是必需的；搜索、排序和提示可以按页面需要省略。含筛选控件的主题应确保 `[hidden]` 元素不会被自己的 CSS 强制显示。无 JavaScript 时仍显示全部内容。

URL 参数 `q`、`category`、`sort` 由公共核心读写，保留当前语言、主题路径、无关参数和锚点。一个页面只放一组使用这些 URL 参数的集合，避免相互覆盖。Blank 继续保留原来的 `#blank-search` 输入锚点，其他主题可用自己的输入 id。

### 文章阅读

在正文上设置 `data-site-prose`，在进度条的可缩放子元素上设置 `data-site-progress`，固定页头设置 `data-site-header`。进度元素由主题设置 `transform-origin: left` 及样式。目录容器使用 `data-site-toc`，内部为指向真实标题 id 的锚点链接。公共核心设置进度条 `scaleX()`，并给当前章节链接设置 `aria-current="location"`；主题提供高亮样式。

## 路由与新增功能

新增主题仍需实现页面、样式和三语路由；公共模块不会自动生成这些 UI。`src/core/themes/registry.ts` 导出 `routing.mjs` 中的主题登记与纯函数；在 `themes` 登记主题根路径，并用 `getThemePath(theme, path, locale)` 生成该主题内的导航和文章链接。传入已有主题路径也不会重复添加根路径；省略 locale 时保留输入路径中的语言。`getTheme(path)` 识别当前主题，`stripTheme(path)` 返回去除语言和主题前缀的内容路径。原始 `core/i18n` 的 `getI18n().href()` 只处理语言前缀，不会自动添加主题根路径。

共用内页可使用 `core/themes/i18n.ts` 的 `getThemedI18n(pathname)`；它保留原翻译接口，并让 `href()` 根据当前 URL 自动选择主题。`core/themes/PageLayout.astro` 按当前主题选择完整布局，同时透传页面 props 和正文 slot。Ema 的非首页包装页复用现有内容与功能标记，避免维护另一套文章、搜索或收藏逻辑；Ema 首页独立实现。`stripTheme("/ja/themes/ema/blog/")` 返回 `/blog/`，可直接用于导航当前栏目的判断。

语言前缀位于主题路径之前，例如 `/ja/themes/ema/blog/`。`src/pages/themes/ema/[...page].astro` 生成中文页面，`src/pages/[lang]/themes/ema/[...page].astro` 生成日英页面，统一调用 `getThemeStaticPaths` 读取公共文章和稳定 slug。主题内包含首页、文章列表与详情、作品、闲暇、关于、致谢和 404。Blank 的中文错误页仍是 `/404.html`，艾玛对应 `/themes/ema/404/`；语言和主题切换均映射到实际生成路径。

GitHub Pages 对任意未生成的路径仍返回根目录的 Blank 404 文档。主题运行时尊重这个文档实际渲染的主题，不能仅根据不存在的请求路径改成 Ema；错误页的主题菜单切到另一主题实际存在的 404 路由，并保留 URL 中的语言、查询参数和锚点。

以后添加留言、点赞、登录或后台管理等功能时，把数据访问与规则放在公共服务模块，各主题只做相应的 UI。如果需要跨访客或跨设备共享动态数据，应接入同一个后端服务。当前静态站尚未包含这些后端功能。

## 验证

运行 `npm test` 和 `npm run build`。新增主题时还需检查三语路由、共享资料及文章是否一致，切换主题后的语言和深浅色偏好、搜索筛选、文章目录，以及手机宽度下的操作入口。公共行为升级应修改 `src/core`，避免在各主题分别修补。
