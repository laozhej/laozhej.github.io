# 第三方素材与许可边界

本文件记录素材的出处和许可边界，不授予新的使用许可。仓库的软件 MIT 许可不覆盖第三方角色、美术、漫画、图片、字体、音频或视频；权利仍由相应权利人持有。署名、公开可下载及文件校验一致均不等同于获得转载或网站发布授权。

## 艾玛主题

2026-11-14，站主明确要求从提交 `76c9da5690e89a7816bb4b44eefacbcc87521446` 恢复首页五张艾玛图片，覆盖此前仅允许占位图的限制。本次只恢复以下五个 Git blob 并更改文件名，字节、透明通道和尺寸不变，没有重新编码、缩放、裁切、重绘或生成式 AI 处理：

| 历史文件 | 当前文件（`public/themes/ema/assets/`） | 尺寸 |
| --- | --- | --- |
| `ema.webp` | `ema-pose-01.webp` | 905 × 2400 |
| `ema-frame-wave.webp` | `ema-pose-02.webp` | 1030 × 2400 |
| `ema-frame-together.webp` | `ema-pose-03.webp` | 1030 × 2400 |
| `ema-frame-talk.webp` | `ema-pose-04.webp` | 1030 × 2400 |
| `ema-frame-refute.webp` | `ema-pose-05.webp` | 1472 × 2048 |

[素材清单](public/themes/ema/ASSETS.json) 保留历史来源 URL、署名、导入处理记录、原图哈希，并新增恢复提交、旧路径与文件校验信息。历史记录将这些文件记为《魔法少女ノ魔女裁判》／Acacia 的四张立绘和一张论破演出图；本次只确认与 Git 历史文件一致，**来源、具体创作信息与公开使用授权仍未确认**。站主的恢复指令不等于权利人的授权，文件校验一致也不构成授权或来源认证。

其余 2026-11-13 清理的素材仍未恢复，包括三张《葬送的芙莉莲》摘图、《Summer Pockets》主视觉、久远寺有珠插画、旧项目缩略图与旧 showcase 截图。五张图片沿用当前 B 构图和切换交互。后续新画稿计划及本次恢复的范围见 [美术指引](docs/ART-DIRECTION.md#13-owner-requested-restoration-2026-11-14)。

### 站主头像

樱色档案的站主头像取自画师游亜于 2025-10-24 发布的《わんこエマちゃん》。按站主于 2026-11-27 在附件里圈出的范围裁切无标注的原图，缩小并转为圆形 WebP。2026-11-28 按站主要求把原图中的方格背景改为纯白，保留人物的白色描边和手写字。公开使用授权待核实。[Pixiv 原作](https://www.pixiv.net/artworks/136654991) · [裁切坐标与文件校验](public/themes/ema/ASSETS.json)

### 首页樱枝

《Cherry blossom》由 kenjirou yamamoto（yamachem）于 2015-03-18 发布。作者注明使用 Inkscape 绘制，Openclipart 以 CC0 1.0 提供这件作品。[原作](https://openclipart.org/detail/216154/cherry%20blossom) · [作者](https://openclipart.org/artist/yamachem) · [平台授权](https://openclipart.org/share)

本站保留原作的三条矢量路径，去除两层矩形底色，裁取枝梢，为浅色和深色首页分别调整填色。处理全程未使用生成式 AI。原图和两个本站版本的 SHA-256 见[樱枝素材清单](public/themes/ema/cherry-blossom/ASSETS.json)。

### 樱色电台

《思い出はずっと》和《星をかぞえて》使用 OtoLogic 发布的慢版音源，许可为 CC BY 4.0。电台内已标注来源。[曲目原页](https://otologic.jp/free/bgm/music-box01.html) · [OtoLogic 使用条款](https://otologic.jp/free/license)

《上海红茶馆》（管弦乐）来自站主提供的 MP3，编曲者、该版本的发布页和公开使用授权待核实。三个文件均按原始字节保存。[音频清单](public/themes/ema/audio/ASSETS.json)

## 喜欢的角色头像

`public/characters/` 收录站主指定的 67 位角色头像。樱羽艾玛和月代雪排在前两位。`public/characters/ASSETS.json` 逐项记录名称、作品、原图与来源页面、制作／画师署名、裁切坐标、尺寸及文件校验。其余 65 张来自作品官网，或《明日方舟》官方客户端资源的可追溯镜像；该镜像的画师署名来自游戏 `skin_table` 数据。P3/P5 主角姓名采用用户指定的结城理、雨宫莲，游戏官网中的“主人公”称呼不构成这些姓名的出处。

2026-11-26 按站主要求，关于页的樱羽艾玛、月代雪两张头像从清理前的提交 `5236eb4` 按原始字节恢复。旧清单记载两图均裁自站主于 2026-10-29 提供的截图。原始发表页面、画师和转载授权仍未确认。两图现在与其余 65 张头像一同记录在[角色素材清单](public/characters/ASSETS.json)，其中保留了历史路径、裁切坐标、尺寸与 SHA-256。

2026-10-30 新增头像覆盖《轻音少女》《紫罗兰永恒花园》《命运石之门》《赛博朋克：边缘行者》《刀剑神域》《我的青春恋爱物语果然有问题。》《游戏人生》《魔女之旅》《ATRI -My Dear Moments-》《为美好的世界献上爆焰！》《缘之空》《终将成为你》《冰菓》《五等分的新娘》，均采用各自官方动画网站发布的角色插图或设定图。未公开单张插图作者的来源明确标记为未署名，不将原作者或制作公司视为该张插图的个人画师。

2026-11-05 新增的 10 位《东方Project》角色采用《东方弹幕神乐》手游官方档案中的角色立绘。每张头像的画师署名均取自对应角色页，清单还记录原图和 320 × 320 WebP 头像的 SHA-256。[官方角色档案](https://danmaku.jp/archive/character/) · [游戏二次创作指南](https://danmaku.jp/archive/news/637Qdiel8W3Kx5mFbTDQAz/)

仅进行矩形裁切、LANCZOS 缩放和 WebP 编码，未使用生成式 AI。角色与插图版权归原权利人所有，仓库 MIT 许可不覆盖头像；来源及署名记录不构成转载授权。

## 游戏页卡片图

`public/games/` 下的图片用于樱色档案主题游戏页的卡片，每个游戏一张。`public/games/ASSETS.json` 逐项记录来源页面、原图 URL、来源类型、开发商与发行商（照抄自 Steam 商店数据或官网）、原始及输出 SHA-256、尺寸、页面显示时的裁切焦点、处理方式和核对日期。

- 20 款 Steam 游戏使用各自 Steam 商店的资料库背景图（library hero）；《STEINS;GATE》的资料库背景只有齿轮纹样，改用其商店页背景图。
- 《明日方舟》使用 Yostar 韩国官网的分享图，《Arcaea》使用 lowiro 官网的海报图，《羊蹄山之魂》使用 PlayStation 官网的分享图。

处理仅包含等比例 LANCZOS 缩小、RGB 转换和有损 WebP 编码（quality 80）；资产文件没有裁切、调色、合成或使用生成式 AI。卡片上的裁切由页面 CSS（`object-fit` 与焦点位置）完成。

这些图片是权利人公开发布的宣传素材，但本站没有确认获得装饰性网站公开使用或再分发的许可。开发商与发行商名称只是来源页面上的署名，不是正式版权声明，也不表示权利人赞助、认可或授权本站。

## 电影收藏海报

电影卡片使用站主 Notion 电影记录中已与单片版本匹配的海报。每张图的出处、影片资料和文件校验值列在 [电影海报清单](public/collection/ASSETS.json)。本站只做等比例缩小和 WebP 编码。制片公司资料用于识别作品，海报设计署名以原图为准。海报版权归相应权利人所有，转载许可未核实。

## 软件、图标及字体

- Blank 的软件版权声明和 MIT 文本保存在 `LICENSE` 与 `public/licenses/yuimi-chaya-MIT.txt`。
- Tabler Icons 的 MIT 许可保存在 `public/licenses/tabler-icons-MIT.txt`；此许可不扩展到角色或漫画图片。
- 共享网站图标是 `B.` 的确定性字母排版，详见 `assets/branding/README.md`。渲染时使用本机 Arial Bold 字体，未随仓库提供字体文件。
- `public/og/` 下的四张链接预览图（1200×630，每种语言一张）是 Blank 首页标题区的文字排版，由 `scripts/og-image.mjs` 用本机 Chrome 与系统字体渲染，文字取自 `site.ts` 与 `messages.ts`；不含插图、照片或第三方美术，未使用图像生成模型。清单与校验见 `public/og/ASSETS.json`。
- 樱色档案主题的标题（“Arataki.br’s Base”）使用 Duarte Pinto 设计的 Gloock（Copyright 2022 The Gloock Project Authors），通过 npm 包 `@fontsource/gloock` 随站点自托管，只引入拉丁字母子集；许可为 SIL Open Font License 1.1，全文保存在 `public/licenses/gloock-OFL.txt`。
- 终末地工业风主题的英文标签、编号和标题使用 Saira（Copyright 2020 The Saira Project Authors），通过 npm 包 `@fontsource-variable/saira` 随站点自托管，浏览器只按需下载用到的拉丁字母子集；许可为 SIL Open Font License 1.1，全文保存在 `public/licenses/saira-OFL.txt`。
- 终末地工业风主题背景的等高线 `public/themes/endfield/contour-a.svg`、`contour-b.svg` 由 endfield-ui 设计套件的生成脚本绘制，不含任何游戏官方素材；该主题只借鉴界面结构习惯，不使用《明日方舟：终末地》的字体、标志、图标、立绘或截图。
- 明日方舟主题的英文栏目名、标题和大号编号使用 Oswald（Copyright 2016 The Oswald Project Authors），日期、编号和技术标注使用 JetBrains Mono（Copyright 2020 The JetBrains Mono Project Authors），分别通过 npm 包 `@fontsource-variable/oswald`、`@fontsource-variable/jetbrains-mono` 随站点自托管，浏览器只按需下载用到的拉丁字母子集；许可均为 SIL Open Font License 1.1，全文保存在 `public/licenses/oswald-OFL.txt`、`public/licenses/jetbrains-mono-OFL.txt`。
- 明日方舟主题的三角网格 `public/themes/arknights/lattice.svg` 是手写的 SVG 路径；顶栏的方块菱形图标、点阵数字（`src/themes/arknights/lib/matrix.mjs`）和扫描线都由代码绘制，不含任何游戏官方素材，未使用图像生成模型。该主题只借鉴《明日方舟》官网的版式习惯，不使用游戏的字体、标志、图标、角色、立绘、截图或世界观用语。首页“喜欢的游戏”面板里的图片是 `public/games/` 中已登记的游戏图，来源见 `public/games/ASSETS.json`，没有新增图片。
- 页面不从外部服务器加载字体；除上述字体外，文字使用访客设备的系统字体。

## 不发布的历史文件

`assets/branding/sakura-pixel-master.png` 与 `SAKURA_HISTORY.md` 保存历史 AI 图标及其生成记录。当前页面不引用它们，`public/` 不含旧樱花图标，构建产物不包含这张历史原图。AI 首页效果图也不是网站资产，不应被放入 `public/` 或作为页面截图背景加载。
