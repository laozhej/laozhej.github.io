# 新主题接入说明

主题负责页面布局、颜色、字体、插画和动效。个人内容与可复用功能由 `src/core` 提供。Blank 保留原有根路由；艾玛「樱色档案」使用 `/themes/ema/`；「终末地工业风」使用 `/themes/endfield/`。共享主题切换器在保留栏目、文章、语言及 URL 状态的同时切换外观。

## 共用内容

| 内容 | 接口或来源 |
| --- | --- |
| 个人资料、近况、兴趣、作品、收藏 | `getSiteContent(locale)`，来自 `src/core/i18n/content.ts` |
| 中文资料源 | `src/core/data/profile.ts`、`projects.ts`、`games.ts` |
| GitHub / Steam 等外链 | `socialLinks`，来自 `src/core/data/social.ts` |
| 已发布文章、稳定 slug、译文缺失处理 | `getPublishedPosts(locale)`，来自 `src/core/content/blog.ts` |
| 站名和全站导航定义 | `site`，来自 `src/lib/site.ts` |
| UI、无障碍与 SEO 文案 | `getI18n(pathname)`，来自 `src/core/i18n` |
| 避免尴尬换行 | `keepTails(text)`，来自 `src/core/i18n/wrap.mjs` |
| 项目截图及其深色版本 | `project.image.src` 与 `project.image.darkSrc`，来源记录在 `public/projects/ASSETS.json` |

所有主题都从这些接口读取，不在主题目录复制个人资料或文章。文章详细页继续通过 Astro 内容渲染接口显示同一篇 Markdown。更新内容并重新构建、部署后，所有接入的主题同步更新。不同语言的译文仍要分别维护，不能把内容共用理解为自动翻译。

新功能涉及新的内容字段时，先扩展公共数据及各语言内容，再由各主题决定如何展示。展示方式可以不同，数据身份、链接和分类键保持一致。

页面上显示的标题和短句用 `keepTails()` 包一层：它把结尾的数字和前一个词连在一起（「救赎 2」不会只剩「2」换到下一行），并让中日文句末的两个字留在同一行（不会出现「交／互。」）。只用于显示的文字，不要用于 `data-search`、`aria-label` 等属性。数据文件里照常书写，不要手动插入不换行字符。

项目截图有浅色和深色两张，都是同一页面的真实截图。展示截图的页面同时输出两张 `<img>`，分别加上 `blank-shot-light` 和 `blank-shot-dark`，由 Blank 样式按 `html[data-color-mode]` 只显示其中一张，深色页面上不会出现一块亮白的图。更换截图时两张一起重新截取，并更新 `ASSETS.json`。

喜欢的游戏（`favoriteGames`）每一项都带有 `url`：由 `getSiteContent` 按 `key` 从 `games.ts` 中同一款游戏取得，优先官方游戏页面，没有时用 Steam 商店页面。新主题展示喜欢的游戏时，游戏名必须链接到 `item.url`（新标签页打开，`rel="noopener noreferrer"`）；不要在主题里另写链接。新增喜欢的游戏时，先确认它在 `games.ts` 里，并填写 `url`（官方页面）或 `steam`。

各主题的 `<head>` 统一使用 `src/core/components/SiteIcons.astro`，共用非 AI 的 `B.` 排版网站图标和触屏图标；不要在主题内另外维护图标链接。

各主题的页脚统一挂载 `src/core/components/SiteAttribution.astro`，同时保留站点版权行（所有主题统一为 `site.owner`，即「© 年份 Asahi Arataki」）、指向本站仓库 `site.repository` 的「本站源码」链接和指向 Yuimi-chaya 主仓库的多语言来源署名；不要在新主题中只复制版权行而遗漏作者署名。主题可自行安排其布局，详细素材来源仍在「致谢与许可」页展示。

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

导航使用共享 `LanguageSwitcher`（由统一导航生命周期初始化语言偏好）。深浅色按钮保留 `data-color-mode-toggle`、`data-label-dark`、`data-label-light`、`aria-label` 和初始 `aria-pressed="false"`，并在 JS 初始化前设为 `hidden`；按钮外观由主题提供。标签均通过 `t()` 取得各语言译文。

全站使用 `site-locale`、`blank-color-mode` 和 `site-theme` 三个偏好键。深浅色沿用旧名字以保留访客设置，实际已经全主题共用。未手动选择时实时跟随系统；手动选择后优先使用该选择，不添加“自动”按钮。同源页面和标签页共用深浅色选择，不会同步到另一个设备。

## 主题选择

每个主题的 `<head>` 挂载 `src/core/themes/ThemePreference.astro`，并挂载一次 `src/core/themes/ThemeSwitcher.astro`。Blank 把切换器放在导航里，显示当前主题名称；其他主题传入 `floating`，在 `<body>` 里渲染为固定在右下角、没有文字的调色板按钮，点击后列表向上展开，列出带编号的全部主题。浮动按钮的外观和进出动效由各主题的 `.site-theme-dock` 样式提供：打开和关闭都要有动效（关闭借助 `::details-content` 的 `content-visibility` 过渡保持可见），暂停动效或系统减少动态时直接切换。切换器提供自己的基础菜单样式，主题可用 `--site-menu-background` 和 `--site-menu-color` 调整菜单颜色。

Ema 是例外：窗口宽度不足 1260px 时，页面两侧放不下浮动按钮，Ema 在顶栏按钮里再渲染一次同一个 `floating` 切换器（列表向下展开），由 CSS 按宽度只显示其中一个。`src/core/themes/preference.mjs` 本来就处理页面上的所有 `[data-site-theme-menu]`，共享代码无需改动。

`site-theme` 保存手动选择。**URL 始终决定当前主题**：保存的选择不会把显式主题链接、Blank 根路由或浏览器历史自动重定向。`html[data-theme]` 是当前主题；`data-preferred-theme` 是保存的偏好，存储不可用时回退到当前主题。切换链接在点击时读取当前 URL，保留语言、栏目、完整文章 slug、查询参数和锚点。禁用 JavaScript 时仍可用普通链接切换页面。

## 大屏幕缩放

各主题按笔记本尺寸用 px 设计。为了在大屏幕上不缩在页面中央，构建时 `src/core/styles/fluid-px.mjs`（在 `astro.config.mjs` 注册的 PostCSS 插件）把 `src/` 下样式里的 px 改写为 `calc(N * var(--site-px, 1px))`；1px 及以下的细线、`url()` 和字符串保持原样。`src/core/styles/scale.css` 定义 `--site-px`：窗口宽度不超过 1600px 时恰好是 1px，页面与原设计完全一致；更宽时随宽度增大，最多 1.5px，同时受窗口高度约束（`100vh / 720`），宽而矮的窗口里整屏场景仍放得下。根字号随之同比放大，rem 尺寸也一起缩放，并以访客自己的默认字号为起点。

新主题布局要在主题样式之前 `import "@/core/styles/scale.css";`，样式照常写 px 即可。图标的尺寸来自 HTML 属性，`scale.css` 为 astro-icon 用到的 11–24 号尺寸补充了 CSS 尺寸；用到新尺寸时在那里加一行。脚本会解析、或者表示滚动距离而非视觉尺寸的 px 值，在声明前加 `/* px:fixed */` 注释即可保留原值。宽而矮的窗口里缩放受高度限制，横向排列的内容可以用 `max(设计宽度, 设计宽度 ÷ 1600 × 100vw)` 保持它在 1600px 窗口里所占的宽度比例。

## 功能入口

每个主题布局在 `<head>` 挂载一次 `src/core/navigation/SiteNavigation.astro`，由它提供 Astro `ClientRouter` 和统一的页面生命周期。不要再在布局或切换器中单独调用运行时入口。

```astro
---
import SiteNavigation from "@/core/navigation/SiteNavigation.astro";
import { pageTransition } from "@/core/navigation/animations.mjs";
---
<head><SiteNavigation /></head>
<header transition:name="site-header" transition:animate="none">…</header>
<main transition:name="site-content" transition:animate={pageTransition}>…</main>
```

`SiteNavigation` 统一挂载动效偏好、语言与主题偏好和公共功能入口 `mountSiteFeatures`。每次 `astro:before-swap` 清理旧实例，`astro:after-swap` 同步测量并挂载新页面，`astro:page-load` 做幂等兜底；先建立首页完整高度，再恢复历史滚动位置或跨页锚点。重复初始化、普通离页和浏览器缓存恢复都必须保留清理机制。

公共层不导入任何主题代码。主题专属的页面增强由主题布局在 `<body>` 末尾自行登记，主题 id 与 `themes` 登记一致：

```astro
<script>
  import { registerThemeRuntime } from "@/core/themes/runtime.mjs";
  import { mountNewTheme } from "../lib/runtime.mjs";
  registerThemeRuntime("new", mountNewTheme);
</script>
```

挂载函数接收 `(document, window)`，可返回清理函数；不要在其中再次调用 `mountSiteFeatures`。生命周期只挂载 `html[data-theme]` 对应的运行时，因此其他主题的页面不会加载或执行它。首次从别的主题进入时，布局脚本在页面替换之后才执行，登记时会立即挂载到当前页面；同一主题重复登记会被忽略。Blank 的 `lib/runtime.mjs` 只处理 404 路径提示；Ema 的 `lib/runtime.mjs` 组合 `mountEmaHome`、`mountEmaPresentation` 与 `mountEmaConsole`。可复用功能继续放在 `src/core/features`。

页面正文使用 200ms 淡出和 280ms 淡入／轻微位移，页头保持稳定；不支持原生 View Transition 时由 Astro 的动画回退接管。暂停动效或系统 reduced motion 时跳过过渡。手动偏好沿用 `ema-home-motion-paused`，由共享 `motion.mjs` 管理，`html[data-motion-paused]` 反映最终状态，`site:motion-change` 在 document 上广播 `{ paused, userPaused, reduced }`。Ema 各页面都有同一个暂停／播放按钮，图标、鼠标提示与键盘提示保持一致。

Blank 首页（`src/themes/blank/pages/HomePage.astro`）以共享资料中的小尺寸头像、姓名、Nero、简短介绍和社交链接开篇，接着展示 `projectEntries` 中首个真实项目的截图、标题、状态、摘要和案例入口；下方集中展示近况与少量精选游戏、动画和角色图片，并保留完整收藏入口。常用工具留在关于页。有文章时展示最近三篇及日期，缺少译文时标明原文语言；没有文章时省略首页文章区，保留顶栏文章导航。

Ema 首页（`src/themes/ema/pages/HomePage.astro`）保留 B 构图：站长姓名与 Nero 在左、艾玛在舞台前层、五姿态剧场在右（手机上在角色下缘）。`lib/stage.mjs` 管理舞台视差与资料卡拉起，`lib/rail.mjs` 管理章节导览；触屏、暂停动效、减少动态或关闭脚本时使用静态页面与原生滚动，具体行为见 `docs/REFERENCE.md`。2026-11-14 按站主要求从 `76c9da5` 原样恢复的 `ema-pose-01.webp` 至 `ema-pose-05.webp` 替换线框与占位说明，图片地址与原尺寸读取 `public/themes/ema/ASSETS.json`，在原舞台框内等比显示并沿用底部淡出。手机及竖屏平板中剧场卡横跨人物时，整个 `.k-frames` 在卡片后方完全淡出并裁去不可见点击区域，避免腿部在卡片下方重新显露；淡出终点与卡片底部共用偏移量，另留 16px 视差余量。图片框尺寸与原图文件不变，横向并排布局和无 JavaScript 时不启用此遮罩。首图直接加载；页面空闲后预取下一幕，之后每次切换再预取下一幕（开启省流量或处于 2G 网络时，只在指针或键盘焦点移到艾玛或剧场卡时预取），`lib/frames.mjs` 等待解码成功后切换；失败保留当前图并允许重试，快速切换只接受最后一次请求。提示、上一幕／下一幕、最后一幕的「重新翻阅」和四语姿态名称仍来自 `ema-messages`。素材来源及公开使用授权仍未确认，文件校验不代表授权。背景分镜（`components/Storyboard.astro`）在右侧两格画有代码绘制的静物（合上的笔记本与书签、笔，落了一片花瓣的茶杯），纸面上部另有一层自观者左上方斜落的窗光（`.k-light`）；三者都不随姿态切换，颜色取自主题现有的墨色、纸色与浅樱色变量，手机与竖屏平板的上下排布中不显示。剧场卡以上边缘定位，提示较长时向下延展。

Ema 首页的「樱色便笺」使用原生 `<dialog>`（`lib/notice.mjs`），只在点击首屏或文章空状态里的入口后打开，不会自动弹出，也不在浏览器里保存任何状态；便笺按访客本地日期从共享便笺中选取，缺少译文时显示原文并说明。喜欢的标签只读取公共资料、收藏与社交链接，较长的分组先显示一部分；「让标签落下一次」只在动效开启时出现。


控制台（`lib/console.mjs`）在 1260px 及更宽的窗口里从左侧边缘的标签打开；更窄时标签收进页脚的「控制台」按钮，面板从窗口底部升起，两种位置都不遮挡页面内容。首页和游戏页给 `EmaLayout` 传入 `cursorRing`，控制台里多一个「光标光圈」开关（`lib/cursor-ring.mjs`）：细圈跟随鼠标或触控板指针，系统指针保持不变；默认开启，访客的选择保存在 localStorage 的 `ema-cursor-ring`；触屏、暂停动效或系统减少动态时不显示。控制台控制「樱色电台」（`lib/radio.mjs`）：曲目以音符数据写在代码中，用 Web Audio 合成；播放引擎挂在 `window.__emaRadio`，每个艾玛页面挂载时 `hold()`、清理时 `release()`，最后一个页面释放 1.5 秒后仍无新页面接手就停止，因此切换到其他主题会自动静音。

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

要使用筛选时，表单和条目容器是必需的；搜索、排序和提示可以按页面需要省略。没有可选的条件时不输出表单：作品页只有一个项目时省略分类，文章页没有文章时只保留空状态（它保留 `#blank-search` 锚点，顶栏的搜索入口仍然落在这里）。没有表单时公共核心不做任何处理，条目照常显示。含筛选控件的主题应确保 `[hidden]` 元素不会被自己的 CSS 强制显示。无 JavaScript 时仍显示全部内容。

URL 参数 `q`、`category`、`sort` 由公共核心读写，保留当前语言、主题路径、无关参数和锚点。一个页面只放一组使用这些 URL 参数的集合，避免相互覆盖。Blank 继续保留原来的 `#blank-search` 输入锚点，其他主题可用自己的输入 id。

### 文章阅读

在正文上设置 `data-site-prose`，在进度条的可缩放子元素上设置 `data-site-progress`，固定页头设置 `data-site-header`。进度元素由主题设置 `transform-origin: left` 及样式。目录容器使用 `data-site-toc`，内部为指向真实标题 id 的锚点链接。公共核心设置进度条 `scaleX()`，并给当前章节链接设置 `aria-current="location"`；主题提供高亮样式。

## 终末地工业风

`src/themes/endfield/` 借鉴《明日方舟：终末地》界面的结构习惯，不使用游戏的任何字体、标志、图标、立绘或截图。变体为 standard：唯一强调色 `#FFFA00`、中性纸色、标准切角、等高线底纹。规则：

- 强调色只表示当前位置、可点击内容和醒目提醒，只做填充，上面写墨字；浅色模式里不当线或文字用。标出当前位置的线用 `--ef-trace`（浅色为墨，深色为强调色）。
- 可以按的东西切掉右下角，不可点的是直角，圆角一律为 0。切角用渐变绘制而非 `clip-path`，避免裁掉焦点框和动效提示。
- 拉丁字（标签、编号、计数）用自托管的 Saira 可变字体，宽度 112%–125%；中日文使用系统黑体。编号、日期和计数都来自真实数据：首页文章编号按发布先后从 `No.001` 起，最新一篇编号最大。
- 首页（`pages/HomePage.astro`）是展示页：字段统计、实心加空心的站名、一处马克笔、带斜线纹影子的最新文章画框。其余栏目复用 Blank 页面，由 `styles/theme.css` 中 `.ef-content` 下的规则统一外观。
- 入场动效只在首页首屏，短而硬；暂停动效或系统减少动态时不播放。该主题没有专属运行时脚本。

## 路由与新增功能

新增主题仍需实现页面、样式和四种语言的路由；公共模块不会自动生成这些 UI。`src/core/themes/registry.ts` 导出 `routing.mjs` 中的主题登记与纯函数；在 `themes` 登记主题根路径，并用 `getThemePath(theme, path, locale)` 生成该主题内的导航和文章链接。传入已有主题路径也不会重复添加根路径；省略 locale 时保留输入路径中的语言。`getTheme(path)` 识别当前主题，`stripTheme(path)` 返回去除语言和主题前缀的内容路径。原始 `core/i18n` 的 `getI18n().href()` 只处理语言前缀，不会自动添加主题根路径。

共用内页可使用 `core/themes/i18n.ts` 的 `getThemedI18n(pathname)`；它保留原翻译接口，并让 `href()` 根据当前 URL 自动选择主题。`core/themes/PageLayout.astro` 按当前主题选择完整布局，同时透传页面 props 和正文 slot。Ema 的非首页包装页复用现有内容与功能标记，避免维护另一套文章、搜索或收藏逻辑；Ema 首页独立实现。`stripTheme("/ja/themes/ema/blog/")` 返回 `/blog/`，可直接用于导航当前栏目的判断。

语言前缀位于主题路径之前，例如 `/ja/themes/ema/blog/`。`src/pages/themes/ema/[...page].astro` 生成中文页面，`src/pages/[lang]/themes/ema/[...page].astro` 生成繁中、日、英页面，统一调用 `getThemeStaticPaths` 读取公共文章和稳定 slug。主题内包含首页、文章列表与详情、作品、游戏、关于、致谢和 404。Blank 的中文错误页仍是 `/404.html`，艾玛对应 `/themes/ema/404/`；语言和主题切换均映射到实际生成路径。

GitHub Pages 对任意未生成的路径仍返回根目录的 Blank 404 文档。主题运行时尊重这个文档实际渲染的主题，不能仅根据不存在的请求路径改成 Ema；错误页的主题菜单切到另一主题实际存在的 404 路由，并保留 URL 中的语言、查询参数和锚点。

以后添加留言、点赞、登录或后台管理等功能时，把数据访问与规则放在公共服务模块，各主题只做相应的 UI。如果需要跨访客或跨设备共享动态数据，应接入同一个后端服务。当前静态站尚未包含这些后端功能。

## 验证

运行 `npm test` 和 `npm run build`。新增主题时还需检查四种语言的路由、共享资料及文章是否一致，切换主题后的语言和深浅色偏好、搜索筛选、文章目录，以及手机宽度下的操作入口。公共行为升级应修改 `src/core`，避免在各主题分别修补。
