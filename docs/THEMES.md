# 新主题接入说明

主题负责页面布局、颜色、字体、插画和动效。个人内容与可复用功能由 `src/core` 提供。2026-11-28 起「明日方舟」作为默认主题使用根路由（旧 `/themes/arknights/` 保留 `noindex` 跳转）；Blank 使用 `/themes/blank/`；艾玛「樱色档案」使用 `/themes/ema/`；「终末地工业风」使用 `/themes/endfield/`。共享主题切换器在保留栏目、文章、语言及 URL 状态的同时切换外观。

## 共用内容

| 内容 | 接口或来源 |
| --- | --- |
| 个人资料、近况、兴趣、作品、收藏 | `getSiteContent(locale)`，来自 `src/core/i18n/content.ts` |
| 中文资料源 | `src/core/data/profile.ts`、`projects.ts`、`games.ts`；收藏的漫画和电视剧在 `collection.ts`，电影在 `movies.ts`，动漫在 `animes.ts` |
| GitHub / Steam 等外链 | `socialLinks`，来自 `src/core/data/social.ts` |
| 已发布文章、稳定 slug、译文缺失处理 | `getPublishedPosts(locale)`，来自 `src/core/content/blog.ts` |
| 站名和全站导航定义 | `site`，来自 `src/lib/site.ts` |
| UI、无障碍与 SEO 文案 | `getI18n(pathname)`，来自 `src/core/i18n` |
| 避免尴尬换行 | `keepTails(text)`，来自 `src/core/i18n/wrap.mjs` |
| 项目截图及其深色版本 | `project.image.src` 与 `project.image.darkSrc`，来源记录在 `public/projects/ASSETS.json`；截图组 `project.gallery`，每张带 `label`、`meta`（模式、尺寸、截图日期）与 `alt` |

所有主题都从这些接口读取，不在主题目录复制个人资料或文章。文章详细页继续通过 Astro 内容渲染接口显示同一篇 Markdown。更新内容并重新构建、部署后，所有接入的主题同步更新。不同语言的译文仍要分别维护，不能把内容共用理解为自动翻译。

新功能涉及新的内容字段时，先扩展公共数据及各语言内容，再由各主题决定如何展示。展示方式可以不同，数据身份、链接和分类键保持一致。

页面上显示的标题和短句用 `keepTails()` 包一层：它把结尾的数字和前一个词连在一起（「救赎 2」不会只剩「2」换到下一行），并让中日文句末的两个字留在同一行（不会出现「交／互。」）。只用于显示的文字，不要用于 `data-search`、`aria-label` 等属性。数据文件里照常书写，不要手动插入不换行字符。

项目截图有浅色和深色两张，都是同一页面的真实截图。展示截图的页面同时输出两张 `<img>`，分别加上 `blank-shot-light` 和 `blank-shot-dark`，由 Blank 样式按 `html[data-color-mode]` 只显示其中一张，深色页面上不会出现一块亮白的图。更换截图时两张一起重新截取，并更新 `ASSETS.json`。

艾玛的作品页（2026-11-15 试点）同样成对输出主图，但每张图和它的图注各放在一个 `<figure>` 里（`.ema-works-lead.is-light` / `.is-dark`），由 `styles/works.css` 按同一属性切换；`project.gallery` 中其余截图按记录顺序排在下方的截图行，原样显示，深色模式下也保持浅色原图。图注直接使用每张截图的 `label` 与 `meta`，替代文字使用 `alt`，所以更换截图时这三项要和 `ASSETS.json` 一起更新；`tests/ema-works.test.mjs` 核对四种语言图注中的模式、尺寸和日期与清单一致。

喜欢的游戏（`favoriteGames`）每一项都带有 `url`：由 `getSiteContent` 按 `key` 从 `games.ts` 中同一款游戏取得，优先官方游戏页面，没有时用 Steam 商店页面。新主题展示喜欢的游戏时，游戏名必须链接到 `item.url`（新标签页打开，`rel="noopener noreferrer"`）；不要在主题里另写链接。新增喜欢的游戏时，先确认它在 `games.ts` 里，并填写 `url`（官方页面）或 `steam`。

各主题的 `<head>` 统一使用 `src/core/components/SiteIcons.astro`，共用非 AI 的 `B.` 排版网站图标和触屏图标；不要在主题内另外维护图标链接。

搜索与链接预览元数据统一由 `src/core/components/SiteMeta.astro` 输出：描述、规范地址、四种语言及 `x-default` 的 hreflang、Open Graph 与 Twitter 卡片、文章发布时间和本语言 RSS 的 `alternate` 链接。四套主题呈现同一份内容，因此规范地址与 hreflang 一律指向「规范主题」在相应语言下的同一页；规范主题由 `src/core/themes/routing.mjs` 的 `canonicalTheme` 决定（2026-11-28 起随默认根路径改为 `arknights`，并同步更新为深色终端风分享图；原 `2026-11-23` 起为 `blank`）。`og:url` 仍是页面自身地址，分享出去的链接会打开被分享的主题。404 页和旧 `/themes/arknights/` 跳转页加 `noindex`，不进站点地图。主题布局只传入 `title`、`description`、`siteName`、`isArticlePage` 和 `article`，不要另写这些标签。分享图默认使用 `public/og/<locale>.png`（`scripts/og-image.mjs` 生成，域名、署名、`ema.brand`、`home.kicker` 或 `home.statement*` 改动后需重新生成）；文章填写 `cover` 时改用封面。站点地图由 `@astrojs/sitemap` 生成（`/sitemap-index.xml`），按 `isIndexedPath` 只列规范主题下四种语言的页面，不含 404 与跳转页；`public/robots.txt` 指向它。RSS 位于 `/rss.xml` 与 `/<locale>/rss.xml`（`src/core/content/feed.ts`），条目与该语言的文章列表一致，未翻译的文章保留简体中文原文。

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

导航使用共享 `LanguageSwitcher`（由统一导航生命周期初始化语言偏好）。语言按钮的可访问名称是「切换语言」加上按钮上显示的语言代码（例如「切换语言 简中」），这样用语音操作的人说出看到的字也能点中它（WCAG 2.5.3）；悬停提示仍只写「切换语言」。深浅色按钮保留 `data-color-mode-toggle`、`data-label-dark`、`data-label-light`、`aria-label` 和初始 `aria-pressed="false"`，并在 JS 初始化前设为 `hidden`；按钮外观由主题提供。标签均通过 `t()` 取得各语言译文。

全站使用 `site-locale`、`blank-color-mode` 和 `site-theme` 三个偏好键。深浅色沿用旧名字以保留访客设置，实际已经全主题共用。未手动选择时实时跟随系统；手动选择后优先使用该选择。每按一次深浅色按钮都切到另一种模式；切到的正好是系统当前的模式时，删掉保存的选择，页面重新跟随系统（2026-11-27 站主同意修改原来“手动选择后一直保持”的规则，条件是体验和交互不受影响）。所以按钮的外观、动效和每次按下的结果都和以前相同，只是不再把和系统相同的模式存下来；改版前已经存下的选择保留，直到访客再按按钮。不另设“自动”按钮。同源页面和标签页共用深浅色选择，不会同步到另一个设备。

## 读屏念出的名称

（2026-11-27，站主同意路线图第 14 问后四套主题一起改。）可以按的东西，名称里要有它上面看得见的字，最好以这些字开头，这样用语音操作的人说出看到的字就能点中它（WCAG 2.5.3）；同一页上的导航区域名字不能重复，读屏列出的区域才分得清。新主题照这几条做：

- 顶栏的站名链接：名称是看得见的字依次排列，再加「首页」（`a11y.home`）。版次标记（`BLANK / 01`、`EMA / 02`、`EF / 03`、`AK / 04`）在布局里是一个常量，显示和名称都用它，两处不会对不上。站名链接里的几段字之间留一个空格：链接是 flex 行，空格不画出来，但把可见文字当成一串读时，字和字不会粘在一起。终末地和明日方舟页脚的站名链接也是看得见的字（站名和 `Base`）。
- 收藏页游戏柜（Ema）和海报卡上的商店链接：`games.opens` 以链接上显示的「Steam」或「官网」开头，后面是游戏名和「在新窗口打开」，不用括号（有的检查工具比较时会去掉括号里的部分）。
- 动效按钮：系统要求减少动态时，名称（`ema.motion.reduced`）以按钮上显示的「动效」开头。终末地和明日方舟的动效按钮只有图标，这句话出现在它们的悬停提示里。
- 导航区域：顶栏是「主导航」（`a11y.navigation`），每页只有这一个；页脚的栏目链接是「页脚导航」（`a11y.footerNavigation`）；页脚的社交链接是「页脚：在其他地方找到我」（`social.footerHeading`，由 `SocialLinks` 的 `label` 传入），关于页正文里的那一组仍叫「在其他地方找到我」；Blank 首页的计数条是「索引」（`home.index`），和终末地、明日方舟首页的同类区域同名。
- `tests/a11y-names.test.mjs` 守着这几条。

## 主题选择

每个主题的 `<head>` 挂载 `src/core/themes/ThemePreference.astro`，并挂载一次 `src/core/themes/ThemeSwitcher.astro`。Blank 把切换器放在导航里，显示当前主题名称；其他主题传入 `floating`，在 `<body>` 里渲染为固定在右下角、没有文字的调色板按钮，点击后列表向上展开，列出带编号的全部主题。浮动按钮的外观和进出动效由各主题的 `.site-theme-dock` 样式提供：打开和关闭都要有动效（关闭借助 `::details-content` 的 `content-visibility` 过渡保持可见），暂停动效或系统减少动态时直接切换。切换器提供自己的基础菜单样式，主题可用 `--site-menu-background` 和 `--site-menu-color` 调整菜单颜色。

Ema 是例外：窗口宽度不足 1260px 时，页面两侧放不下浮动按钮，Ema 在顶栏按钮里再渲染一次同一个 `floating` 切换器（列表向下展开），由 CSS 按宽度只显示其中一个。`src/core/themes/preference.mjs` 本来就处理页面上的所有 `[data-site-theme-menu]`，共享代码无需改动。

`site-theme` 保存手动选择。**URL 始终决定当前主题**：保存的选择不会把显式主题链接、Blank 根路由或浏览器历史自动重定向。`html[data-theme]` 是当前主题；`data-preferred-theme` 是保存的偏好，存储不可用时回退到当前主题。切换链接在点击时读取当前 URL，保留语言、栏目、完整文章 slug、查询参数和锚点。禁用 JavaScript 时仍可用普通链接切换页面。

## 大屏幕缩放

各主题按笔记本尺寸用 px 设计。为了在大屏幕上不缩在页面中央，构建时 `src/core/styles/fluid-px.mjs`（在 `astro.config.mjs` 注册的 PostCSS 插件）把 `src/` 下样式里的 px 改写为 `calc(N * var(--site-px, 1px))`；1px 及以下的细线、`url()` 和字符串保持原样。`src/core/styles/scale.css` 定义 `--site-px`：窗口宽度不超过 1600px 时恰好是 1px，页面与原设计完全一致；更宽时随宽度增大，最多 1.5px，同时受窗口高度约束（`100vh / 720`），宽而矮的窗口里整屏场景仍放得下。根字号随之同比放大，rem 尺寸也一起缩放，并以访客自己的默认字号为起点。

新主题布局要在主题样式之前 `import "@/core/styles/scale.css";`，样式照常写 px 即可。图标的尺寸来自 HTML 属性，`scale.css` 为 astro-icon 用到的 11–24 号尺寸补充了 CSS 尺寸；用到新尺寸时在那里加一行。脚本会解析、或者表示滚动距离而非视觉尺寸的 px 值，在声明前加 `/* px:fixed */` 注释即可保留原值。宽而矮的窗口里缩放受高度限制，横向排列的内容可以用 `max(设计宽度, 设计宽度 ÷ 1600 × 100vw)` 保持它在 1600px 窗口里所占的宽度比例。

## 字体与字号

2026-11-27 站主看过与 soki.moe 的对照后，选了“先修字体”：修好等宽字体，字号收到六档左右。

### 自托管字体（四套主题）

2026-11-27 站主要求“把字体统一一下，让网站使用我们自己已经找好的独有字体而不是系统字体”，“不喜欢 Windows 的默认字体”，“要有那种日系风格”，并让 agent 按推荐来。从这一天起，四套主题都不再用访客设备上的系统字体，每台电脑和手机看到的是同一套字。

| 主题 | 正文与界面 | 标题与衬线 | 标签与编号 | 拉丁字母展示字 |
| --- | --- | --- | --- | --- |
| Blank | Noto Sans SC / TC / JP（思源黑体） | Noto Serif SC / TC / JP（思源宋体） | JetBrains Mono | 同正文 |
| Ema | 霞鹜文楷（简中）、霞鹜文楷 TC（繁中）、Klee One（日文）、Nunito（英文，2026-11-28 起） | Noto Serif SC / TC / JP | JetBrains Mono，中日文接正文字体 | Gloock |
| 终末地 | Noto Sans SC / TC / JP | 同正文 | JetBrains Mono | Saira |
| 明日方舟 | Noto Sans SC / TC / JP | 同正文 | JetBrains Mono | Oswald |

- 每种语言用自己的字形：简中和英文用 SC，繁中用 TC（Ema 用台湾字形的霞鹜文楷 TC），日文用 JP（Ema 用日本 Fontworks 的 Klee One，霞鹜文楷就是由它衍生的）。
- Ema 的英文页面（2026-11-28，站主从四款对照里选了 Nunito）：`html[data-theme="ema"]:lang(en)` 把正文字体栈换成 `"Nunito Variable","Site Kai SC","LXGW WenKai"`。Nunito 只有拉丁字母等西文字符，页面里的中文名字和术语照旧落到霞鹜文楷。Nunito 来自 Fontsource（`@fontsource-variable/nunito/wght.css`，和 Gloock 一样打进主题 CSS，五条 `@font-face` 约 1.5KB，没用到就不下载），不另做截字文件；`EmaLayout.astro` 只在英文页面预加载拉丁字母文件（约 39KB），有 ō、š 这类带变音符号字母的页面（英文首页、关于页）再取约 36KB 的扩展分片。没有加载斜体：Ema 英文正文里没有斜体文字。
- 加载分两层。第一层是 `src/core/fonts/subsets.css` 声明的“Site …”字体：`public/fonts/site/` 里的 12 个文件，每个只含全站用这款字体显示的字（约 300–950 个，另加 ASCII、常用标点和日期用字），每个 180–430KB，同一种语言的所有页面共用，访客只下载一次。`src/core/fonts/FontLinks.astro` 在各布局的 `<head>` 里预加载本页主题和语言用到的这几个文件。第二层是同一款字体的 Fontsource 分片版：字体栈里紧跟在“Site …”之后，样式表等页面加载完、浏览器空闲时才取（`requestIdleCallback`，站内换页后同样处理；没有 JavaScript 时不取），首屏用不到它们，在慢速网络上也不再和 Ema 的立绘抢带宽；只有页面上出现第一层没有的字（之后新写的内容）时，浏览器才下载含这个字的分片，所以新字也是同一款字体。
- 实测（Chrome 158，本地服务器，冷缓存）：Blank 简中页面的字体共约 455KB，Ema 简中约 700KB，繁中约 950KB，日文约 1.1MB（Klee One 字形较复杂）；终末地、明日方舟约 400KB。不截字、只用分片版时，同样的页面要 0.9–3.3MB。
- 全站逐页检查（Chrome 158）时，关于页和致谢页（Blank、终末地、明日方舟，各语言）还会多下载一两个分片（约 50–100KB）。在页面文字、属性和伪元素里都没找到截取文件缺的字，原因还没查清；字体显示不受影响。
- 字体样式表不放进打包的主题 CSS：共用的页面布局会把四套主题的样式都带到每一页，所有分片的 `@font-face` 加起来有 1.5MB。
- 内容有较多新字时，重新截取第一层可以省下分片的下载：在构建好的页面上统计每款字体显示的字（包括 data 属性和 `::before`、`::after` 里的提示文字），再用 `subset-font` 从原始字体截取。原始字体来自 google/fonts 和 lxgw 的发布页，脚本在工作区 `outputs/self-hosted-fonts/`（`collect-all-slow.mjs`、`subset-all.mjs`），还没放进仓库。不重新截取也不会显示错字体，只是多下载几个分片。
- 等宽字体统一用 JetBrains Mono（明日方舟原本就自托管），中日文接本主题的正文字体。霞鹜文楷 Mono 的字母和汉字分在同一批分片里，单独取字母做不到，繁中页还会显示大陆字形，所以没有用。
- 许可都是 SIL OFL 1.1，文件在 `public/licenses/`，致谢页四种语言都有条目。`tests/self-hosted-fonts.test.mjs` 守着这些约定：字体栈里没有系统字体名，每个“Site …”字体都有文件，后面都接着同一款字体的分片版，每个布局都加载这两层，每款字体都有许可文件。

### 六档字号（Blank 和 Ema）

- 阅读和界面文字只用六档：`--blank-fs-xs` 12px、`--blank-fs-sm` 14px、`--blank-fs-md` 16px、`--blank-fs-lg` 20px、`--blank-fs-xl` 24px、`--blank-fs-2xl` 30px。变量用 rem 写，随大屏幕缩放。Blank 和 Ema 在各自的 `html[data-theme]` 上定义这六个变量，样式里写成 `var(--blank-fs-sm, 原来的值)`。终末地和明日方舟不定义它们，所以这两个主题页面里复用的 Blank 组件会取括号里的原值，外观不变。
- 不进六档的有：32px 及以上的大标题、站名、页数和编号大字，Ema 首屏的标题、幕号、印章、时钟这些画面里的字，还有 Ema 手机顶栏图标下的说明文字。最后这项是 10px，窄于 360px 时 9.5px，和手机标签栏一样；用 12px 时，英文菜单在 360px 宽的手机上会伸到设置按钮底下。
- 新写样式时从六档里选。要用别的尺寸，先在这里写明理由。

## 功能入口

每个主题布局在 `<head>` 挂载一次 `src/core/navigation/SiteNavigation.astro`，由它提供 Astro `ClientRouter` 和统一的页面生命周期。不要再在布局或切换器中单独调用运行时入口。

站内跳转的抓取地址带构建号（`request-version.mjs` 的 `__site_build`），避免部署后打开旧的缓存页面。Astro 自带的预取请求的是不带构建号的地址，点击时用不上，所以在 `astro.config.mjs` 关闭（`prefetch: false`），改由 `navigation/prefetch.mjs` 在悬停 80ms、聚焦或按下链接时，用同一个带构建号的地址预取；省流量或 2G 网络只在按下时预取，锚点、外站、新标签页和 `data-astro-reload` 链接不预取。主题切换链接带 `data-astro-reload`，以完整页面加载目标主题（与上游一致），不在路由内跨主题替换文档。颜色模式和暂停动效都由 `ColorModePreference.astro` 的内联脚本在首次绘制前写入 `html`。语言和主题菜单处理 Escape 时调用 `preventDefault()`，外层面板（Ema 的设置面板）跳过已处理的按键，所以一次 Escape 只关闭一层；焦点移出菜单时菜单收起。列表筛选只在同一页面的历史记录间恢复筛选状态，返回到其他页面时不重排即将离开的列表。

滚动位置的恢复：路由内的后退和前进由 `lifecycle.mjs` 在新页面挂载之后恢复。刷新或整页后退时，路由一启动就按 `history.state` 滚动，这时页面脚本还没挂载，页面往往比最终矮；所以 `SiteNavigation.astro` 用一段内联脚本先记下这个位置（`window.__siteRestoredScroll`），`lifecycle.mjs` 在页面挂载后再应用一次，主题运行时晚到时（`themes/runtime.mjs` 发出 `site:theme-runtime-mounted`）再应用一次；读者一有操作（滚轮、触摸、按键、点按）或开始跳转就丢弃。主题里会接管滚动的脚本，必须把恢复出来的位置当作读者原本所在的位置：Ema 的场景遮罩（`lib/rail.mjs`）在挂载时如果页面已经滚动过，或 `history.state.scrollY` 大于 2，就不触发遮罩，直到读者下一次用滚轮。

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

页面正文使用 200ms 淡出和 280ms 淡入／轻微位移，页头保持稳定；不支持原生 View Transition 时由 Astro 的动画回退接管。终末地在支持 View Transition 的浏览器里改用自己的换页动效（见「终末地工业风」一节），其余不变。暂停动效或系统 reduced motion 时跳过过渡。手动偏好沿用 `ema-home-motion-paused`，由共享 `motion.mjs` 管理，`html[data-motion-paused]` 反映最终状态，`site:motion-change` 在 document 上广播 `{ paused, userPaused, reduced }`。Ema 各页面都有同一个暂停／播放按钮，图标、鼠标提示与键盘提示保持一致。

Blank 首页（`src/themes/blank/pages/HomePage.astro`）以共享资料中的小尺寸头像、姓名、Nero、简短介绍和社交链接开篇，接着展示 `projectEntries` 中首个真实项目的截图、标题、状态、摘要和案例入口；下方集中展示近况与少量精选游戏、动画和角色图片，并保留完整收藏入口。常用工具留在关于页。有文章时展示最近三篇及日期，缺少译文时标明原文语言；没有文章时省略首页文章区，保留顶栏文章导航。

Blank 的点按范围（2026-11-26，站主要求“和终末地一样处理”）：凡是能按的东西都至少有 44px 的可点范围，规则在 `styles/journal.css` 最后的 “Tap targets” 一段，全部限定在 `html[data-theme="blank"]` 下（Ema 和终末地的页面也带 `data-blank`，并经 `PageLayout` 加载这份样式表），`tests/blank-targets.test.mjs` 守着。做法和终末地相同：在控件外面加一个不画任何东西的 `::before` 或 `::after`，外观不变。顶栏的站名、五个栏目（很高但只有约 42px 宽，向两侧伸进栏目之间的空隙）、语言、深浅色和主题三个按钮（40px 带 1px 描边，绝对定位从描边内侧算起，所以伸出 3px）、文字页搜索框的清除按钮、页脚的外链和最后一行、筛选按钮（标签短的只有约 30px 宽）、文章的分类和标签链接，以及宽于 760px 时 36px 高的文字链接都这样处理；栏目和筛选按钮的 `::after` 已用来画下划线，所以用 `::before`。标签可能折行、页脚最后一行在平板宽度会折行，这两处的扩展层放在链接下面（容器 `z-index:0`，伪元素 `z-index:-1`）。页脚加了 `isolation:isolate`，理由同终末地。挨得太近、只能加间距的几处（外观有变化）：主题列表的每一行从 42.8px 加到 44px；宽于 760px 时文章目录的标题 44px、条目上下各 12.5px（和它在 760px 以下原有的尺寸一致）；致谢页紧跟在另一个链接后面的链接上方留 8px；宽于 760px 时页脚最后一行折行的行距从 12px 加到 25px（不折行时没有变化）。页面因此只在两处变高：致谢页在宽于 760px 时高 8px（1920px 宽的屏幕上按比例为 10px）；平板宽度下页脚最后一行折成两行的语言里，页面高 13px。另外修了一个原有的问题：480px 以下，主题列表从按钮左边缘向右展开（共用样式 `theme.css` 里 `.blank-header .site-theme-options { left:0; right:auto; }`，当初切换器在顶栏左侧），而按钮在顶栏最右端，列表因此大半伸出屏幕右缘，各行点不到；现在 `journal.css` 在同一宽度下让它从按钮右边缘向左展开，整份列表都在屏幕里。

Ema 首页（`src/themes/ema/pages/HomePage.astro`）保留 B 构图：站长姓名与 Nero 在左、艾玛在舞台前层、五姿态剧场在右（手机上在角色下缘）。`lib/stage.mjs` 管理舞台视差与资料卡拉起，`lib/rail.mjs` 管理章节导览；触屏、暂停动效、减少动态或关闭脚本时使用静态页面与原生滚动，具体行为见 `docs/REFERENCE.md`。2026-11-14 按站主要求从 `76c9da5` 原样恢复的 `ema-pose-01.webp` 至 `ema-pose-05.webp` 替换线框与占位说明，图片地址与原尺寸读取 `public/themes/ema/ASSETS.json`，在原舞台框内等比显示并沿用底部淡出。手机及竖屏平板中剧场卡横跨人物时，整个 `.k-frames` 在卡片后方完全淡出并裁去不可见点击区域，避免腿部在卡片下方重新显露；淡出终点与卡片底部共用偏移量，另留 16px 视差余量。图片框尺寸与原图文件不变，横向并排布局和无 JavaScript 时不启用此遮罩。首图直接加载；页面空闲后预取下一幕，之后每次切换再预取下一幕（开启省流量或处于 2G 网络时，只在指针或键盘焦点移到艾玛或剧场卡时预取），`lib/frames.mjs` 等待解码成功后切换；失败保留当前图并允许重试，快速切换只接受最后一次请求。提示、上一幕／下一幕、最后一幕的「重新翻阅」和四语姿态名称仍来自 `ema-messages`。素材来源及公开使用授权仍未确认，文件校验不代表授权。背景分镜（`components/Storyboard.astro`）在右侧两格画有代码绘制的静物（合上的笔记本，上面放着一支笔，下缘露出粉色书签；托碟上的一杯茶，茶面有几道涟漪，杯口一道浅樱色），纸面上部另有一层自观者左上方斜落、带淡淡窗棂的窗光（`.k-window-light`）。2026-11-27 起这三件用 Codex 的早期草稿画法（站主对 ROADMAP 第 15 问的回答，PR #50）；Journal 页头和文章页的装饰仍用 `lib/still-life.mjs` 里 PR #15 的画法。三者都不随姿态切换，颜色取自主题现有的墨色、纸色与浅樱色变量，手机与竖屏平板的上下排布中不显示。剧场卡以上边缘定位，提示较长时向下延展。

「樱色便笺」暂时下架。`HomePage.astro` 中的 `sakuraNotesEnabled` 关闭时，四种语言的首页都省略便笺入口、预览、对话框和便笺数据。

功能启用时，「樱色便笺」使用原生 `<dialog>`（`lib/notice.mjs`），访客点击入口后打开，不会自动弹出，也不在浏览器里保存任何状态。关闭方式包括关闭按钮、Esc，以及在遮罩上按下并松开（`closedby="any"`）。不支持该属性的浏览器由 `notice.mjs` 按同样的规则处理。便笺按访客本地日期从共享便笺中选取，缺少译文时显示原文并说明。

喜欢的标签只读取公共资料、收藏与社交链接，较长的分组先显示一部分。「让标签落下一次」只在动效开启时出现。


Ema 的点按范围（2026-11-26，站主要求“和终末地、Blank 一样处理”）：凡是能按的东西都至少有 44px 的可点范围（Games 和 About 页自 PR #31 起已经如此），规则在 `styles/theme.css` 最后的 “Tap targets” 一段，全部限定在 `html[data-theme="ema"]` 下（Blank 和终末地的页面也经 `PageLayout` 加载这份样式表，而且 Blank 的页面也用 `.blank-*` 这些类名），`tests/ema-tap-targets.test.mjs` 守着。能不改外观的地方，在控件外面加一个不画任何东西的 `::before` 或 `::after`：顶栏的站名（窄于 1101px 时只剩 34px 的花形标志，四面都伸出）、语言和设置按钮、三个控制按钮（40px 带 1px 描边，伸出 3px；动效按钮的 `::after` 是提示，用 `::before`。语言按钮和动效按钮是毛玻璃背景，扩展层向两侧伸出时 Chrome 会把它们边缘的几个像素画得差一点（最多 9/255）：语言按钮本来就有 84px 宽，只向上下伸出；动效按钮的扩展层加 `will-change: transform`，画在单独的图层上，按钮本身的画法就不变）、1260px 以上左缘控制台的标签（34px 宽，向右伸进旁边的空白）、首页舞台的便笺按钮（约 100px 宽、带阴影，向两侧伸出时同样会改变边缘几个像素，所以只向上下伸出）、向下箭头、资料卡上的链接、“让标签落下一次”和文章区的“全部文章”、页脚的站名、外链和最后一行，以及 Ema 显示的共用页面上的筛选按钮、文章的分类和标签链接和宽于 760px 时 36px 高的文字链接。标签和页脚最后一行会折行，扩展层放在链接下面（容器 `z-index:0`，伪元素 `z-index:-1`）；页脚加了 `isolation:isolate`，理由同终末地。挨得太近、只能加间距的几处（外观有变化）：340–760px 宽时顶栏五个栏目从约 34px 宽变成至少 44px（中日文两个字的标签；英文本来就更宽，不变），图标和文字居中，间距仍是 2px，菜单仍然居中；主题列表的每一行从 42.8px 加到 44px；页脚最后一行折行时行距从 12px 加到 25px；宽于 760px 时文章目录的标题 44px、条目上下各 12.5px；致谢页紧跟在另一个链接后面的链接上方留 8px。窄于 340px 时，五个 44px 的栏目放不进窗口两边和设置按钮之间、同时保持居中，所以那里的栏目保持原来约 30px 宽。

控制台（`lib/console.mjs`）在 1260px 及更宽的窗口里从左侧边缘的标签打开；更窄时标签收进页脚的「控制台」按钮，面板从窗口底部升起，两种位置都不遮挡页面内容。首页和收藏页给 `EmaLayout` 传入 `cursorRing`，控制台里多一个「光标光圈」开关（`lib/cursor-ring.mjs`）：细圈跟随鼠标或触控板指针，系统指针保持不变；默认开启，访客的选择保存在 localStorage 的 `ema-cursor-ring`；触屏、暂停动效或系统减少动态时不显示。

「樱色电台」（`lib/radio.mjs`）通过一个音频播放器按《思い出はずっと》（慢版）、《星をかぞえて》（慢版）、《上海红茶馆》（管弦乐）的顺序循环播放。只有点击播放后才加载选中的 MP3。在樱色档案内换页时保留当前曲目、播放进度和音量。最后一个页面释放播放器 1.5 秒后仍无新页面接手时暂停。曲目文件、顺序和署名记录在[音频清单](../public/themes/ema/audio/ASSETS.json)。

### 搜索、筛选和排序

| DOM 标记 | 用途 |
| --- | --- |
| `data-site-collection` | 集合根节点；用 `data-unit` 和 `data-unit-one` 提供本语言的数量单位 |
| `data-site-filter-form` | 筛选表单，初始 `hidden`，初始化后显示。含搜索框时，把这个属性和 `hidden` 放在包住表单的 `<search>` 元素上，不写 `role="search"`（文字页如此）：没有 JavaScript 时不会留下空的搜索区域，表单的提交事件会冒泡到它 |
| `data-site-entries` | 条目容器 |
| `data-site-entry` | 条目；`data-category` 是分类键（可以有几个，用空格分开：一部动漫属于两个题材），`data-search` 是标题/摘要/标签文本，`data-date` 是时间戳 |
| `data-site-query` | 可选搜索输入，建议 `maxlength="300"` |
| `data-site-sort` | 可选 select，选项值 `newest` / `oldest` |
| `data-site-category="all"` 或分类键 | 分类按钮，使用 `type="button"` 和 `aria-pressed` |
| `data-site-clear` / `data-site-reset` | 可选清空搜索 / 重置所有条件按钮 |
| `data-site-empty` | 可选空结果提示，初始 `hidden` |
| `data-site-count` | 可选结果数量输出，建议 `aria-live="polite"` |
| `data-site-group` | 可选，条目容器里的分组（收藏页按类型分的组）：组里没有符合条件的条目时整组隐藏；组里的 `data-site-group-count` 写入当前显示的条数，属性值是补零的位数 |

要使用筛选时，表单和条目容器是必需的；搜索、排序和提示可以按页面需要省略。没有可选的条件时不输出表单：作品页只有一个项目时省略分类，文章页没有文章时只保留空状态（它保留 `#blank-search` 锚点，顶栏的搜索入口仍然落在这里）。没有表单时公共核心不做任何处理，条目照常显示。含筛选控件的主题应确保 `[hidden]` 元素不会被自己的 CSS 强制显示。窄屏要收起「排序」这类标签时，只在视觉上隐藏（Blank 在 760px 及以下如此），不要用 `display:none`：那样下拉框就没有名字了，读屏只念出当前选项。无 JavaScript 时仍显示全部内容。

URL 参数 `q`、`category`、`sort` 由公共核心读写，保留当前语言、主题路径、无关参数和锚点。一个页面只放一组使用这些 URL 参数的集合，避免相互覆盖。Blank 继续保留原来的 `#blank-search` 输入锚点，其他主题可用自己的输入 id。

2026-11-28 起，离散的分类切换、排序切换与重置操作在支持 View Transitions 的浏览器中以局部 `startViewTransition` 平滑过渡（过渡期间给 `html` 挂 `site-filtering`、给各条目写 `viewTransitionName` 与 `viewTransitionClass: "site-collection-item"`，在 `finished.finally` 与清理函数中移除）。搜索输入、历史恢复、`popstate`、收藏切架（`data-shelf-swap`）、暂停动效、系统减少动态以及保留自有 WAAPI 扫入动效的终末地主题均跳过此过渡。

### 文章阅读

在正文上设置 `data-site-prose`，在进度条的可缩放子元素上设置 `data-site-progress`，固定页头设置 `data-site-header`。进度元素由主题设置 `transform-origin: left` 及样式。目录容器使用 `data-site-toc`，内部为指向真实标题 id 的锚点链接；可选的 `[data-site-reading-pct]` 由 `reading.mjs` 同步写入阅读百分比（无 JavaScript 时由 `html:not([data-site-js="true"])` 隐藏）。公共核心设置进度条 `scaleX()`，并给当前章节链接设置 `aria-current="location"`；四套主题在支持 CSS Anchor Positioning 时通过 `anchor-name: --site-toc-active` 与 `nav::before` 的 `border-inline-start` 绘制平滑滑动高亮条，不支持时回退到静态左边框。

2026-11-28 起新增三项共享阅读能力：
- **构建期字数与阅读时间**（`src/core/content/reading-time.mjs`）：统计中日文字符与拉丁词数，在文章头部、文末信息卡与 `PostRow` 列表中按四种语言展示。
- **正文复制与图片灯箱**（`src/core/features/prose.mjs`）：由 `mountSiteFeatures` 挂载，为代码块添加 Invoker Commands 复制按钮、为 `h2[id]` / `h3[id]` 添加 `#` 锚点复制链接（按钮外部 `role="status"` 气泡与 44×44px 触控区），并为正文与作品截图提供原生 `<dialog closedby="any">` 图片灯箱；四套主题在各自样式表中提供主题色适配。
- **文末双栏信息卡**（`.site-colophon`）：位于 `<footer class="blank-article-end">` 内，左栏列出作者、日期与篇幅，右栏给出与 `CONTENT_LICENSE.md` 一致的版权说明与致谢页链接，在四套主题中各自适配风格。

### 回到顶部

Ema、终末地和明日方舟页脚的「回到顶部」链接带 `data-site-top`（2026-11-27，站主要求给这些按钮加上滚动的动效）。它仍是指向本页 `<main>` 的普通链接：落点、地址栏里的 `#…-main`、后退回到页脚、焦点移到 `<main>` 都和以前一样，没有 JavaScript 时照常跳转。公共核心的 `src/core/features/back-to-top.mjs` 在捕获阶段监听点击，赶在 Astro 路由处理之前：点击时给根元素写上行内的 `scroll-behavior: smooth`，等这次滚动结束（`scrollend`）再撤掉，原来有行内值就还原；没有收到 `scrollend` 时（本来就在顶部，或者浏览器不支持这个事件），3 秒后撤掉。所以只有这一次跳转是平滑滚动，主题里其他的滚动照旧，例如跳到正文的链接、Ema 首页的场景切换。不能在下一帧就撤掉（PR #51 最初这样做）：页面还在加载图片时，Chrome 和 WebKit 都会把锚点跳转推迟到下一次排版，那时已经撤掉，就变成直接跳。线上的 Ema 页面经常碰到这种情况；在本机把图片放慢 2.5 秒，Ema 在 Chrome 和 WebKit 里都会直接跳，终末地和明日方舟在 Chrome 里也会。PR #52 改成等滚动结束。滚动的快慢由浏览器决定，和 Blank 相同。系统减少动态或者按了站内的暂停按钮时不处理，照旧瞬间跳到顶部；带修饰键或用中键的点击也不处理。Blank 不加这个属性：它的根元素本来就是 `scroll-behavior: smooth`（暂停和减少动态时为 `auto`），效果一样。地址里带着筛选条件时（例如收藏页选了一个类型），路由把页内的 `#` 链接当作换页，重新换上整个页面（路线图第 4.1 节第 1 项），这时四套主题的「回到顶部」都和以前一样直接跳到顶部，不滚动。在 Playwright 驱动的 Chrome 158 和 WebKit 27.2 里，滚动途中转动滚轮停不下它（Blank 的也一样，这是浏览器自己的平滑滚动），从点击到停在顶部，Chrome 里按距离约 0.3 到 1.2 秒，WebKit 里约 0.3 秒；真机和真正的 Safari 上没有试过。`tests/back-to-top.test.mjs` 守着这些约定。

### Blank 和 Ema 的动效（2026-11-27）

站主看过与 soki.moe 的对照后，要求“补动态效果，增加并优化”。只改了 Blank 和 Ema。终末地和明日方舟有自己的动效，没有动。这一节写的所有动效，在站内暂停按钮按下（`html[data-motion-paused="true"]`）或系统开了减少动态时都不播放，开关和链接照常生效。

- **深浅色从按钮处圆形展开**。共用的 `src/core/preferences/color-mode-reveal.mjs` 在捕获阶段接住深浅色按钮的点击，用同文档的视图过渡包住原来的切换（`color-mode.mjs` 照旧负责切换和保存），新配色从点击的位置以圆形铺满窗口。用键盘按下时，从按钮中心展开。Blank 用 480ms、`--blank-ease`，Ema 用 640ms，曲线更柔和。过渡期间根元素带 `site-mode-reveal` 类：只截取根，Astro 的页头和正文分组暂时取消；圆里不播颜色过渡，以免旧颜色闪一下。样式在各主题自己的样式表里，限定在 `html[data-theme="blank"]` 或 `html[data-theme="ema"]`。浏览器不支持视图过渡、动效暂停或减少动态时，点击直接切换。终末地仍用自己的版本。
- **首页首次打开的进场**。只在第一次完整加载首页时播放：BlankLayout 和 EmaLayout 的 `<head>` 里有一段内联脚本，在第一次绘制之前给根元素加上 `data-intro`；动效暂停时（同在 `<head>` 里、先一步运行的偏好脚本已经判断过）或站内跳转途中（根元素带 `data-astro-transition`）不加。约两秒后脚本把它去掉，所以之后暂停再恢复也不会重播。站内跳转回首页时，由换页过渡负责入场。
  - Blank（`styles/motion.css`）：眉题、“Blank Space.”、两行陈述、简介、↓ 按钮和三格索引依次上浮 14px 并淡入，每项 560ms，最后一项在 360ms 时开始。
  - Ema（`styles/stage.css` 末尾）：纸面背景淡入；艾玛从不透明度 .35 上浮 26px，不从 0 开始，以免首屏最大的图片晚出现；眉题、名字、日记行、终端行依次上浮；最后是剧场卡和“向下浏览”。全部在 1.5 秒内结束。舞台脚本控制的 `transform` 不受影响，因为进场动画用的是单独的 `translate` 属性。
- **Blank 的滚动浮现**（`lib/reveal.mjs`）：首屏以下的栏目标题、文章行、项目、游戏行、关于页各块和文章结尾，第一次滚进视口时上浮 18px 并淡入，520ms，同一批之间相隔 60ms，最多相隔 240ms。打开页面时已在首屏里的内容不播放；从下方直接跳到页中间时，视口上方的内容也不播放。嵌在另一个目标里的元素跟随外层一起动。内容在 CSS 里始终可见，所以没有 JavaScript 时页面完整。做法和 Ema 内页原有的滚动浮现（`presentation.mjs`）相同。
- **Blank 标题下划线的划出**：文章行、首页大块、索引格、项目名等标题在悬停时下划线从下方升上来并显现（`text-underline-offset` 和 `text-decoration-color` 的过渡），代替原来一下子出现；多行标题也逐行带线。按钮和图标按钮的底色、字色变化有 180ms 的过渡。
- **Ema 首页目录卡**：鼠标悬停时卡片上浮 4px，彩色投影加深、边框带粉色，和收藏页的游戏柜一致。
- **Ema 的“向下浏览”箭头**：三个箭头原本依次一亮一灭地硬闪，现在是柔和的明暗起伏，依次过去，像一道向下的波。
- **表面层级、按压反馈与可打断菜单（2026-11-28）**：Ema 将界面圆角与阴影收拢为 `--ema-r-sm`（8px）、`--ema-r-md`（14px）、`--ema-r-pill`（999px）与 `--ema-shadow-flat` / `--ema-shadow-lift` / `--ema-shadow-panel`，关于页区分可点击卡片（游戏/动漫悬停轻抬）与静态参考卡片（技术栈/角色/现在保持平贴）；Blank 与 Ema 按钮增加短暂 `:active` 轻压回弹；两套主题的顶栏语言/主题菜单使用触发源锚定（`transform-origin: top right`）的 `::details-content` + `@starting-style` 与独立的 `transition-behavior: allow-discrete` 过渡。

`tests/blank-ema-motion.test.mjs` 与 `tests/polish-reading-ab.test.mjs` 守着这些约定：样式不越出所属主题，进场只在动效开启时播放，进场标记只在首次完整加载时设置，深浅色切换在暂停、减少动态或不支持视图过渡时立即生效且只切换一次。

## 收藏（2026-11-28）

站主的要求是“参照 soki 的网站的结构，把游戏栏目改为收藏，加入左侧的分类栏：漫画、动漫、电影/电视剧、游戏”，“四个主题都要”，并让关于页的“更多游戏”链到收藏的游戏分类。“电影/电视剧”按站主说的“五个区分”理解为两类，所以一共五类，顺序照站主写的：漫画、动漫、电影、电视剧、游戏。

- 地址：总览 `/collection/`，五个分类 `/collection/manga/`、`anime/`、`movies/`、`tv/`、`games/`，四套主题、四种语言都有（`static-paths.ts`）。每个分类是单独的页面，所以侧栏是普通链接，没有 JavaScript 也能用，也能直接链到某一类（关于页的“更多游戏”、各首页的游戏入口都链到 `/collection/games/`）。原来的 `/games/` 保留为跳转页（`core/components/MovedPage.astro`，`routing.mjs` 的 `movedPaths`）：带着查询和锚点跳到同一主题、同一语言的 `/collection/games/`（`?category=story` 仍是同一个类型筛选，`#game-tsushima` 仍落在那款游戏上），没有 JavaScript 时由 `meta refresh` 跳转；`noindex`，规范地址指向新页，不进站点地图。
- 数据：`getSiteContent(locale).collection`（`core/content/select-collection.mjs`）。游戏来自 `games.ts`，按类型分组，顺序和类型筛选相同；动漫来自 `animes.ts`（站主 Notion 片单里允许展示的那几部），一部可以属于几个题材，所以不分组，只按题材筛选；电影来自 `core/data/movies.ts`，收录站主同意公开并已核对片名、海报和上映年份的单片；漫画、电视剧写在 `core/data/collection.ts`，文件开头写了怎样添加（名称、题材、链接、封面），题材沿用动漫的九个，四种语言已有名称；`checkWorks` 在 `npm test` 和构建时检查。封面放 `public/collection/`，来源记录写进同目录的 `ASSETS.json`，不用生成式 AI 图片。每个条目的形状相同：编号、本语言名称（缺译名时显示简体中文并标 `lang`）、原名、题材键、封面（宽或竖）、链接（Steam 或官网）、是否最爱。
- 结构：页头照各主题原样（Blank、终末地、明日方舟是 `PageHead` 的 “Collection.”，Ema 是中文标题加拉丁副标题），下面是侧栏加分类内容。侧栏列出“全部”和五个分类及数量，当前项 `aria-current="page"`；桌面上随页面滚动保持在顶栏下方，900px 及以下变成分类内容上方的格子（Ema 窄于 560px 时两列）。分类页：编号和名称、数量和类型数，类型筛选和搜索（共用的 `data-site-*`），按类型分组，组标题带当前条数；空的分类显示“这一格还空着。之后再补上。”。总览：有内容的分类各显示一行预览（游戏以关于页的最爱打头）和“查看全部 N 款游戏”，空的分类合成一句话列在最后。
- 组件：Blank、终末地、明日方舟共用 `themes/blank/pages/CollectionPage.astro` 和 `components/WorkCard.astro`（卡片是 `<article>`，标题链接的 `::after` 盖住整张卡，链接名称以看得见的标题开头，再说明打开哪个网站、在新窗口打开）；各主题在自己的样式表里改外观。Ema 用自己的 `themes/ema/pages/CollectionPage.astro` 和 `styles/collection.css`（由 `games.css` 改名而来）：游戏仍是站主 2026-11-27 选定的游戏柜（手机上是紧凑的横排），其余分类是同一家族的竖版海报卡。
- 各主题的样子：Blank 是带编号、细线分隔的目录，当前项左侧一条墨线，卡片只有图、编号和衬线标题，悬停时标题下划线划出；Ema 是樱色档案的分类卡片，每类一个色块图标和计数胶囊，当前项是一块粉色底和一朵别在角上的樱花；终末地是“//”标注的编号目录，每类配宽体英文词，当前项是切角的黄色色块，卡片是切角面板，悬停时露出斜线纹影子、链接标签被黄色擦满；明日方舟是档案索引，每类英文词在上、本语言名称在下（英文页只显示一次），当前项是信号色竖线加浅底，图片平时降低饱和度、指向时恢复，分类标题后面有一个大号的英文水印。
- 动效（`core/navigation/shelf-swap.mjs`）：在总览和各分类之间换页时，页头和侧栏不动，只有分类内容换掉；当前项的标记从刚离开的那一类滑到新的一类（时长和曲线由各主题在标记上的 `--shelf-marker-duration`、`--shelf-marker-ease` 决定：Blank 420ms，Ema 560ms 带一点回弹，终末地 320ms 机械曲线，明日方舟 360ms）。新内容的进场按各主题：Blank 从下方（往回走时从上方）淡入上浮；Ema 像一页纸放到桌上那样轻轻落定，新标记角上的樱花弹出；终末地沿一条竖边切入，旧内容同时沿同一条边被切走，往后走从左、往回走从右；明日方舟由上往下扫描出来，扫描线是一条信号色的光（运行时用脚本播放，因为它的测试要求定时动效都由脚本控制）。读者已经滚进旧分类时，新分类从侧栏同样的高度开始，旧内容不再显示，免得它整块滑过窗口。换页期间 `html` 带 `data-shelf-swap="next|prev"`（和 `data-shelf-jump`），这时页头、侧栏和分类内容才各有自己的 view-transition 名字（`SiteNavigation.astro`），其他换页和深浅色切换都不受影响。暂停动效、系统减少动态或浏览器不支持 View Transitions 时直接换页。终末地另外沿用它的列表动效：打开页面时前 8 张卡片依次出现，筛选后窗口内的卡片逐张点亮，侧栏的数字在指向时跳动后停在真实数值。
- 首页和关于页：顶栏第四项改为“收藏”（`nav.collection`：收藏、收藏、コレクション、Collection），Ema 的提示词是 collection，明日方舟的英文词是 Collection（右侧计数栏里这个较长的词用较小的字距，保持一行）。Ema 首页目录的第三张卡改为“收藏 / Collection”，大数字是收藏总数。关于页“喜欢的游戏”下面是“更多游戏”（`about.gamesMore`），四套主题都链到 `/collection/games/`；Ema 原来的“全部 23 款游戏”换成这个链接。
- 译名：繁体中文的“动漫”用“動畫”（“動漫”也包括单独成类的漫画），电视剧用“影集”；日文用マンガ、アニメ、映画、ドラマ、ゲーム；英文的计数单位分单复数。
- `tests/collection.test.mjs` 守着这些约定；`npm run showcase:check` 检查每种语言、每套主题的 12 个栏目页（含总览和五个分类）和 16 个跳转页。

## 终末地工业风

`src/themes/endfield/` 借鉴《明日方舟：终末地》界面的结构习惯，不使用游戏的任何字体、标志、图标、立绘或截图。变体为 standard：唯一强调色 `#FFFA00`、中性纸色、标准切角、等高线底纹。规则：

- 强调色只表示当前位置、可点击内容和醒目提醒，只做填充，上面写墨字；浅色模式里不当线或文字用。标出当前位置的线用 `--ef-trace`（浅色为墨，深色为强调色）。
- 可以按的东西切掉右下角，不可点的是直角，圆角一律为 0。切角用渐变绘制而非 `clip-path`，避免裁掉焦点框和动效提示。
- 拉丁字（标签、编号、计数）用自托管的 Saira 可变字体，宽度 112%–125%；中日文使用系统黑体。编号、日期和计数都来自真实数据：首页文章编号按发布先后从 `No.001` 起，最新一篇编号最大。
- 首页（`pages/HomePage.astro`）是展示页：字段统计、实心加空心的站名、一处马克笔、带斜线纹影子的最新文章画框。其余栏目复用 Blank 页面，由 `styles/theme.css` 中 `.ef-content` 下的规则统一外观。
- 动效都对应一次操作，短而硬，只改变 `transform`、`opacity`、`clip-path` 和 `background-size`，不改变布局；静止时页面和没有动效时完全一样。系统要求减少动态时全部关闭。暂停动效时，打开页面、换页、深浅色、数字、指针和列表这几类停止；按钮、链接的悬停填充和按下反馈照常，它们只是对指针的直接回应。
  - 打开页面：首页的站名、统计字段和黄色标记从左向右展开；其余栏目的大标题同样展开，随后是计数、说明和列表的前 8 行（更靠下的行直接显示），文章标题下的三色线从左画出。日期、计数和编号里的数字先跳动，再从左到右依次停在真实数值上：只有数字变化，文字和宽度都不动。整段不超过 1 秒。键盘跳转后正文区域获得焦点时不跳动，读屏不会读到中间值。一次访问的第一个页面要等脚本到达才能跳动；如果脚本在页面显示 200ms 之后才到（冷缓存的首次访问通常如此），数字就保持原样，不在入场结束后再跳一次。
  - 悬停或聚焦：按钮和右下角主题按钮的强调色从左擦入，文字按钮上另有一条细线随之扫过；文字链接、首页三个计数、筛选块、顶栏站名的标签和「最新一篇」标签由强调色从左填满；顶栏栏目的灰块擦入；看板顶边的墨条伸到整宽；所在块里的编号和日期再停一次（聚焦时只动对读屏隐藏的数字）。按下时切角块下沉 1px。
  - 首页首屏，只在鼠标或触控板下：最新文章的画框、斜线纹影子、标签和大编号随指针错开几个像素（最多 12px），站名后面露出同一行字的描边。指针离开后回到原位。
  - 换页（主题内）：顶栏不动，新页面由一道斜边盖过旧页面，前进时从左到右，后退时从右到左；两页沿同一条边裁切，旧页面留在原位；顶栏的强调色块从上一个栏目滑到当前栏目。跨主题仍是整页加载。不支持 View Transitions 的浏览器沿用共享的淡入淡出。
  - 深浅色：新模式从按钮处以圆形揭开，约 3000px/秒，240–600ms。切换本身仍由共享的 `mountColorMode` 完成；主题运行时在捕获阶段接住这次点击，在一次 View Transition 里把同一个点击重新派发给按钮。暂停动效或浏览器不支持时不接管，点击照常直达共享逻辑。
  - 筛选、排序、清除条件：结果立即更新，窗口内的行从上到下依次出现（每行间隔 38ms，行多时压缩间隔）。
  - 语言菜单的开合与右下角主题列表相同：先展开，各行依次出现；关闭时反向。
- 点按范围：凡是能按的东西都至少有 44px 的可点范围（规则在 `styles/theme.css` 的 “Tap targets” 一段，`tests/endfield-targets.test.mjs` 守着）。绝大多数是在不改变外观的前提下扩大的（PR #37）；最后四处彼此挨得太近，站主 2026-11-26 同意为它们加大间距（PR #38），这四处的外观因此有变化，见本段最后一条。
  - 做法是在控件外面加一个不画任何东西的 `::before` 或 `::after`。顶栏三个图标按钮的两个伪元素都已占用（强调色擦入、动效按钮的提示），所以布局里给它们各放了一个空的 `<span class="ef-hit" aria-hidden="true">`，绝对定位，四周比色块多出 1px（手机 2px）。按钮本身的盒子和背景一点不动：试过用内边距或透明边框加 `background-clip` 来扩大按钮，WebKit 里顶栏灰色块的颜色会在每次加载之间差 1–3/255；直接把边框盒写成 44px，宽于 1600px 的屏幕上旁边的控件还会偏移约 0.1px。
  - 挨在一起的链接平分中间的空隙。页脚最后一行在窄屏会折行，文章的标签也可能折行：这两处把扩展层放在链接下面（容器自成层叠上下文，伪元素 `z-index:-1`），每个链接自己的文字永远归它自己。这个办法只在容器内没有别的块级盒子挡着、而且那块地方不在某一行文字的行盒里时有效，所以别处不用；致谢页正文里的链接就因此改回了普通的扩展层。
  - 文字链接（`.blank-text-link`）在 760px 以下本来就是 44px，只在更宽的布局里扩展；手机上再扩展会压到下面紧挨着的链接。
  - 页脚加了 `isolation:isolate`。扩展层要求链接是定位元素；文章页在页脚之前有粘性定位的目录，浏览器会把之后的定位文字画进另一个透明图层，字的混色因此差一点（实测约 2000 个像素差 1/255，宽于 1600px 时个别字缘差到 49/255）。让页脚自成一层、连同它的实色背景一起画，像素就和原来完全相同。给页脚里别的元素加定位时不要去掉这一条。
  - 加了间距的四处（PR #38，站主 2026-11-26 同意；改之前它们是 29px、27px、33–40px、36px）：页脚三个栏目链接的间隔从 8px 加到 24px（`.ef-footer-sections`，每个链接 21px 高，相邻两行相距 45px）；页脚最后一行折行时的行距从 8px 加到 26px（`row-gap`，每行 19px 高，相距 45px；只有一行时没有变化）；宽于 760px 时文章目录的标题从 40px 加到 44px，每个条目上下各留 12.5px（单行条目从 33px 变成 44px），和它在 760px 以下原有的尺寸一致；致谢页正文里紧跟在另一个链接后面的链接上方留 8px，折到下一行时两个链接相距 44px。页面因此变高：手机上页脚高 68px，平板 32–50px，桌面 31px；致谢页在宽于 760px 时再多 8px。改完之后，终末地所有页面上量到的 4438 个控件没有小于 44px 的（Chrome 158；WebKit 里文字页的排序下拉框除外，见路线图第 8 节）。
- 主题运行时 `lib/runtime.mjs` 由布局用 `registerThemeRuntime("endfield", mountEndfield)` 登记，只在终末地页面加载；数字跳动在 `lib/readout.mjs`。换页的斜边写在样式表里（`ef-shutter-left`、`ef-shutter-right`，分别保留斜边左侧和右侧；后退时两页互换并反向播放）：运行时在页面替换后把新旧两页正文区域在窗口中的位置写到 `html` 的 `--ef-old-x`、`--ef-old-y`、`--ef-old-w`、`--ef-new-x`、`--ef-new-y`，约 1 秒后移除，这样首页（整宽）和其余栏目（居中内容栏）之间、以及滚动过的页面换页时，旧页面都不缩放、不跳动。深浅色揭开期间 `html` 带有 `ef-moding` 类，整页作为一张图捕获。
- 两处容易写错的地方：`clip-path` 的起止形状必须有相同的顶点数，否则浏览器不会过渡而是直接切换（按钮的擦入此前就是这样）；入场关键帧要同时写出起点和终点，从某个形状过渡到「无裁切」同样只会跳变。`tests/endfield-motion.test.mjs` 检查这两点，也检查样式表里所有 View Transition 规则都限定在 `html[data-theme="endfield"]` 下（这份样式表会经 `PageLayout` 加载到其他主题的页面）。

## 明日方舟

`src/themes/arknights/`（2026-11-26，PR #43，站主的请求是“设计一个新的明日方舟主题……发挥创意，结构和其他主题一样”；站主同日验收：“keep the Arknights design as it is”，没有新请求时按现状保留）借鉴《明日方舟》官网 <https://ak.hypergryph.com/> 的版式习惯：英文分类词配中文栏目名、右侧的计数栏、大号裁切的背景英文、单一信号色和技术标注。设计依据是 hypergryph-graphic-design 技能的设计语言（`references/design-language.md`、`composition-recipes.md`），设定是“这个网站是一台正在运行的档案终端”。不使用游戏的任何字体、标志、图标、角色、立绘、截图或世界观用语；结构和其他主题一样：一个布局、一个首页、一份样式表、一个运行时，其余栏目复用 Blank 的页面。

- 颜色：深色模式是运行中的终端（近黑底 `#0d0f11`、墨白字，信号色 `#19cff2` 可以作文字和线）；浅色模式是打印出来的档案纸（暖纸色 `#eceae4`、墨色 `#121416`，信号色只做填充、上面写墨字）。当前位置的标记（`--ak-trace`、`--ak-number`）浅色为墨、深色为信号色。对比度：浅色正文 15.4、次要文字 6.5；深色正文 15.9、次要文字 7.8；信号色上的墨字 10.4。
- 字体有三种角色：拉丁栏目词、标题和大号编号用 Oswald 可变字体；日期、编号和标注用 JetBrains Mono 可变字体；中文、日文和正文用系统黑体。两种字体都是 SIL OFL 1.1，经 Fontsource 自托管，许可全文在 `public/licenses/`，致谢页有说明。
- 顶栏：站名标志（CSS 画的方块菱形图标、“ARATAKI.BR”、信号色的“BASE”牌、主题编号“AK / 04”，编号按 `themes` 的登记顺序算出）、居中的五个栏目，以及语言、深浅色、搜索和动效按钮。栏目上一行是固定的英文分类词（Index、Journal、Works、Collection、About，在 `lib/sections.mjs`；2026-11-28 起 Games 改为 Collection），下一行是本语言的栏目名；英文页面两者相同，只显示一次。当前栏目：深色为信号色字，浅色为墨字，顶栏底边有一条 3px 的信号色线。
- 右侧计数栏（1200px 及更宽）：竖线右边 112px 的一栏，显示当前位置的大号编号、“// 01 / 04”和英文词，下面是阅读进度（支持 `animation-timeline: scroll()` 的浏览器按滚动位置填充），最下面是站点地址和主题按钮。首页按读者滚动经过的区段计数（00 Index 到 04 Status，`lib/runtime.mjs`），其他页面显示所属的栏目，致谢页和 404 不显示编号。它重复顶栏已经说明的信息，所以对读屏隐藏，里面也没有可按的东西。正文让出这一栏的宽度，顶栏的菜单仍按整个页面居中。窄于 1200px 时不显示。
- 首页（`pages/HomePage.astro`）分五个区段，内容都来自共享数据：00 首屏（标注行、站名大标题和 BASE 牌、两句宣言、简介、两个按钮；右边是最新一篇的点阵牌，用 5×7 点阵画出它的编号，编号规则与终末地相同，最早的一篇是 001，见 `lib/matrix.mjs`；底部是文字、作品、游戏三个计数）、01 最近写下的事（日志式列表：分类、日期、标题、摘要、编号）、02 正在进行（工具的两栏术语表）、03 喜欢的游戏（四个竖条面板，图片是 `games.ts` 里已经登记的游戏图，平时降低饱和度，指向或聚焦时恢复原色，链接与关于页相同）、04 最近的状态（三条近况）。区段底部被裁切的大号英文词是 CSS 生成内容，替代文字为空，只是装饰。日期在页面上写成“2026 // 11 / 15”，读屏读到的是本语言的普通日期。
- 其余栏目复用 Blank 的页面，由 `styles/theme.css` 中 `.ak-content` 下的规则统一外观：页面标题用 Oswald 大写，句号换成标题下的一条信号色粗线；编号框、筛选块、目录当前项、文章标题下的信号色线、404 的编号。页脚两种模式都是深色，站名大字裁切在底部；页脚的栏目链接不再叫“主导航”，不和顶栏重名。
- 主题按钮：计数栏底部的方块按钮，指向或打开时信号色从下往上填满。列表向上展开，展开的边缘有一条信号色线，各行一步一行地出现；关闭时反向、更快。
- 动效只在动效开启、系统没有要求减少动态时播放，都对应一次操作或页面的打开：打开首页时标题从左擦入、点阵牌从上往下扫出、亮点逐行点亮，整段约 0.9 秒；内页标题擦入、标题下的线画出；计数栏在区段变化时编号做一次短的竖直切换；指向点阵牌时一道扫描线扫过一次；切换深浅色时新模式从窗口顶部往下扫出，边缘有一条信号色扫描线（运行时接住按钮的点击，在一次 View Transition 里重新派发给共享的切换逻辑；扫描线元素只在切换期间存在，结束前移除）；语言菜单和主题列表的开合。按钮填充、链接箭头和行的位移这类悬停反馈在暂停动效时照常，系统减少动态时关闭。
- 点按范围：凡是能按的东西都至少有 44px 的可点范围（`styles/theme.css` 的 “Tap targets” 一段，`tests/arknights.test.mjs` 守着）。做法与终末地相同：不画任何东西的伪元素，顶栏的图标按钮用空的 `.ak-hit`。页脚栏目链接 21px 高、间隔 24px；页脚最后一行 19px 高，折行时行距 26px；窄于 1200px 时页脚最后一行右侧留出主题按钮的位置，页面滚到底时按钮不压住链接。Chrome 158 在 1440×900、1366×620、820×1180、390×844、360×780 下量到的 4718 个控件没有小于 44px 的。
- 作用范围：每条规则都限定在 `html[data-theme="arknights"]`、`[data-arknights]` 或主题自己的 `ak-` 类名下，关键帧名都带 `ak-` 前缀，View Transition 规则都以 `html[data-theme="arknights"]` 开头；`tests/arknights.test.mjs` 逐条检查。这份样式表经 `PageLayout` 加载到所有主题的页面：加入后共用样式表从 171.0 KB（gzip 27.5 KB）变成 225.2 KB（gzip 38.7 KB），原来的内容一字不差地排在前面，所以其他主题的层叠顺序不变。

## 路由与新增功能

新增主题仍需实现页面、样式和四种语言的路由；公共模块不会自动生成这些 UI。`src/core/themes/registry.ts` 导出 `routing.mjs` 中的主题登记与纯函数；在 `themes` 登记主题根路径，并用 `getThemePath(theme, path, locale)` 生成该主题内的导航和文章链接。传入已有主题路径也不会重复添加根路径；省略 locale 时保留输入路径中的语言。`getTheme(path)` 识别当前主题，`stripTheme(path)` 返回去除语言和主题前缀的内容路径。原始 `core/i18n` 的 `getI18n().href()` 只处理语言前缀，不会自动添加主题根路径。

共用内页可使用 `core/themes/i18n.ts` 的 `getThemedI18n(pathname)`；它保留原翻译接口，并让 `href()` 根据当前 URL 自动选择主题。`core/themes/PageLayout.astro` 按当前主题选择完整布局，同时透传页面 props 和正文 slot。Ema 的非首页包装页复用现有内容与功能标记，避免维护另一套文章、搜索或收藏逻辑；Ema 首页独立实现。Ema 的作品页（2026-11-15 试点）也独立实现：读取同一份 `projectEntries` 与 `projectTechLines`，保留 Blank 作品页的 `data-site-*` 标记，在不止一个项目和方向时同样输出筛选；Blank 的 `ProjectsPage` 不变，Blank 与终末地照旧使用它。其样式 `styles/works.css` 随 Ema 布局的样式表在 `article.css` 之后加载，全部限定在 `.ema-content` 下。Blank 的 `PageHead` 在标题行内留有可选的具名插槽 `art`，`BlogIndexPage` 以 `head-art` 转发；目前只有 Ema 的文字页（美术方案 P2 试点）填入，Blank 与终末地不传入内容，输出不变。Blank 的 `ArticlePage` 另有两个空的具名插槽：文章头部标签行之后的 `header-art`，以及正文（`data-site-prose`）之后、文末说明之前的 `end-art`；目前只有 Ema 的文章页（2026-11-15 文章页试点，`components/ArticleArt.astro`）填入书签丝带、网点角饰和带花瓣的细分隔线，Blank 与终末地不传入内容，输出不变。装饰不放进正文容器，阅读进度、目录和正文排版不受影响。插槽内容的样式须限定在本主题的类名下（Ema 为 `.ema-content`），因为各主题布局的样式表会经 `PageLayout` 加载到所有主题的页面。`stripTheme("/ja/themes/ema/blog/")` 返回 `/blog/`，可直接用于导航当前栏目的判断。

语言前缀位于主题路径之前，例如 `/ja/themes/ema/blog/`。`src/pages/themes/ema/[...page].astro` 生成中文页面，`src/pages/[lang]/themes/ema/[...page].astro` 生成繁中、日、英页面，统一调用 `getThemeStaticPaths` 读取公共文章和稳定 slug。主题内包含首页、文章列表与详情、作品、收藏（总览和五个分类）、关于、致谢和 404，另有 `/games/` 跳转页。Blank 的中文错误页仍是 `/404.html`，艾玛对应 `/themes/ema/404/`；语言和主题切换均映射到实际生成路径。

GitHub Pages 对任意未生成的路径仍返回根目录的 Blank 404 文档。主题运行时尊重这个文档实际渲染的主题，不能仅根据不存在的请求路径改成 Ema；错误页的主题菜单切到另一主题实际存在的 404 路由，并保留 URL 中的语言、查询参数和锚点。

以后添加留言、点赞、登录或后台管理等功能时，把数据访问与规则放在公共服务模块，各主题只做相应的 UI。如果需要跨访客或跨设备共享动态数据，应接入同一个后端服务。当前静态站尚未包含这些后端功能。

## 验证

运行 `npm test` 和 `npm run build`。文字压在图片、渐变或半透明层上时 axe 判断不了对比度，要在渲染后的页面上逐像素量（2026-11-27 起的做法见路线图第 4.6 节第 5 项）。新增主题时还需检查四种语言的路由、共享资料及文章是否一致，切换主题后的语言和深浅色偏好、搜索筛选、文章目录，以及手机宽度下的操作入口。公共行为升级应修改 `src/core`，避免在各主题分别修补。
