# 第三方素材与许可边界

本文件记录素材的出处和许可边界，不授予新的使用许可。仓库的软件 MIT 许可不覆盖第三方角色、美术、漫画、图片、字体、音频或视频；权利仍由相应权利人持有。署名、公开可下载及文件校验一致均不等同于获得转载或网站发布授权。

## 艾玛主题

`public/themes/ema/ASSETS.json` 是四张图片的来源清单，包含来源页面、原图 URL、署名、原始及输出 SHA-256、尺寸、处理方式和核对日期。文件位于 `public/themes/ema/assets/`：

| 文件 | 内容与来源 |
| --- | --- |
| `ema.webp` | 《魔法少女ノ魔女裁判》樱羽艾玛立绘，来源副本由 Bilibili BWIKI 收录；作品归属 Acacia。 |
| `shiroha.webp` | TV 动画《Summer Pockets》官方画廊「メインビジュアル（鳴瀬しろは編）」；©VISUAL ARTS/Key/鳥白島観光協会。 |
| `alice.webp` | TYPE-MOON《魔法使いの夜》官网久远寺有珠角色插画；©TYPE-MOON。 |
| `shiki.webp` | 星海社・最前線公开试读《空の境界 the Garden of sinners》第1回第008页；漫画天空すふぃあ，原作奈須きのこ，角色设计原案武内崇。 |

这四个文件未使用生成式 AI 制作、重绘、扩图或补画。转换仅包含等比例 LANCZOS 缩放、RGB / RGBA 模式转换及无损 WebP 编码；资产文件没有裁切、调色或更改漫画文字。页面可能通过 CSS 容器显示局部或应用显示滤镜，这不改变原始文件，也不产生新的素材授权。

当前没有确认这四张图获得装饰性网站公开使用或再分发的许可。适用说明需要与实际使用方式逐项核对：

- [Acacia 官方指南](https://manosaba.com/guidelines)第7节说明官方立绘、背景等素材的使用和转载限制。
- [TYPE-MOON 官方版权说明](https://typemoon.com/copyright)说明作品图片使用规则以及作品介绍、感想引用的例外。
- [最前線使用条款](https://sai-zen-sen.jp/rule.html)及[下载 FAQ](https://sai-zen-sen.jp/faq.html)区分私人下载与内容转载。
- [Summer Pockets 动画官方画廊](https://summerpockets-anime.jp/visualgallery/)提供来源和版权署名；本站未确认面向装饰性网站使用的许可。

这些链接用于核实来源和规则，不表示权利人赞助、认可或授权本站。公开仓库分发图片与网站部署一样，需要考虑对应素材的使用范围。

## 喜欢的角色头像

`public/characters/` 收录用户于 2026-10-29、2026-10-30 指定的 55 位角色头像，在原有樱羽艾玛、月代雪之后展示。`public/characters/ASSETS.json` 逐项记录名称、作品、原图与来源页面、制作／画师署名、裁切坐标、尺寸及文件校验；2026-10-30 新增的 20 项包含简中、台湾繁中、日文和英文名称。素材来自作品官网，或《明日方舟》官方客户端资源的可追溯镜像；该镜像的画师署名来自游戏 `skin_table` 数据。P3/P5 主角姓名采用用户指定的结城理、雨宫莲，游戏官网中的“主人公”称呼不构成这些姓名的出处。

2026-10-30 新增头像覆盖《轻音少女》《紫罗兰永恒花园》《命运石之门》《赛博朋克：边缘行者》《刀剑神域》《我的青春恋爱物语果然有问题。》《游戏人生》《魔女之旅》《ATRI -My Dear Moments-》《为美好的世界献上爆焰！》《缘之空》《终将成为你》《冰菓》《五等分的新娘》，均采用各自官方动画网站发布的角色插图或设定图。未公开单张插图作者的来源明确标记为未署名，不将原作者或制作公司视为该张插图的个人画师。

仅进行矩形裁切、LANCZOS 缩放和 WebP 编码，未使用生成式 AI。角色与插图版权归原权利人所有，仓库 MIT 许可不覆盖头像；来源及署名记录不构成转载授权。原有两位角色的头像来源仍见 `public/themes/ema/ASSETS.json`。

## 游戏页卡片图

`public/games/` 下的图片用于樱色档案主题游戏页的卡片，每个游戏一张。`public/games/ASSETS.json` 逐项记录来源页面、原图 URL、来源类型、开发商与发行商（照抄自 Steam 商店数据或官网）、原始及输出 SHA-256、尺寸、页面显示时的裁切焦点、处理方式和核对日期。

- 20 款 Steam 游戏使用各自 Steam 商店的资料库背景图（library hero）；《STEINS;GATE》的资料库背景只有齿轮纹样，改用其商店页背景图。
- 《明日方舟》使用 Yostar 韩国官网的分享图，《Arcaea》使用 lowiro 官网的海报图，《羊蹄山之魂》使用 PlayStation 官网的分享图。

处理仅包含等比例 LANCZOS 缩小、RGB 转换和有损 WebP 编码（quality 80）；资产文件没有裁切、调色、合成或使用生成式 AI。卡片上的裁切由页面 CSS（`object-fit` 与焦点位置）完成。

这些图片是权利人公开发布的宣传素材，但本站没有确认获得装饰性网站公开使用或再分发的许可。开发商与发行商名称只是来源页面上的署名，不是正式版权声明，也不表示权利人赞助、认可或授权本站。

## 芙莉莲 Live2D 看板娘

Ema 主题左下角使用 kyokiStudio 发布的《葬送的芙莉莲》同人 Live2D 模型，文件位于 `public/themes/ema/live2d/frieren/`。发布来源为 [BOOTH「[同人モデル] フリーレン / [FanArt Live2d] Frieren」](https://booth.pm/ja/items/5323958)，配布文件名为 `Frieren.zip`。

该商品页写明：“Do not use for commerce and monetize please.” 本站按禁止商用、禁止变现的条件用于个人非商业展示。商品页没有单列网页嵌入或文件再分发条款。模型和原作角色的权利仍归各自权利人，仓库的软件 MIT 许可不覆盖模型、纹理或静态海报。上文关于四张插画的处理记录与授权状态仅指 `ema.webp`、`shiroha.webp`、`alice.webp`、`shiki.webp`。

## 软件、图标及字体

- Blank 的软件版权声明和 MIT 文本保存在 `LICENSE` 与 `public/licenses/yuimi-chaya-MIT.txt`。
- Tabler Icons 的 MIT 许可保存在 `public/licenses/tabler-icons-MIT.txt`；此许可不扩展到角色或漫画图片。
- 共享网站图标是 `B.` 的确定性字母排版，详见 `assets/branding/README.md`。渲染时使用本机 Arial Bold 字体，未随仓库提供字体文件。
- 樱色档案主题的标题（“Arataki.br’s Base”）使用 Duarte Pinto 设计的 Gloock（Copyright 2022 The Gloock Project Authors），通过 npm 包 `@fontsource/gloock` 随站点自托管，只引入拉丁字母子集；许可为 SIL Open Font License 1.1，全文保存在 `public/licenses/gloock-OFL.txt`。
- Live2D 渲染使用 [PixiJS 6.5.10](https://github.com/pixijs/pixijs/tree/v6.5.10) 与 [pixi-live2d-display 0.4.0](https://github.com/guansss/pixi-live2d-display/tree/v0.4.0)，各自 MIT 许可保存在 `public/licenses/pixi-MIT.txt` 和 `public/licenses/pixi-live2d-display-MIT.txt`。
- Cubism Core 从 [Live2D 官方 Cubism SDK for Web 5-r.4](https://www.live2d.com/en/sdk/download/web/) 提取，原样自托管于 `public/vendor/live2d/5-r.4/`；目录内保留 `LICENSE.md` 与 `RedistributableFiles.txt`。Core 适用 [Live2D Proprietary Software License](https://www.live2d.com/eula/live2d-proprietary-software-license-agreement_en.html)，渲染库包含的 Cubism Framework 适用 [Live2D Open Software License](https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html)，两者均不因外层库或本站采用 MIT 而改变许可。软件许可不授予模型或角色素材的使用权。
- 终末地工业风主题的英文标签、编号和标题使用 Saira（Copyright 2020 The Saira Project Authors），通过 npm 包 `@fontsource-variable/saira` 随站点自托管，浏览器只按需下载用到的拉丁字母子集；许可为 SIL Open Font License 1.1，全文保存在 `public/licenses/saira-OFL.txt`。
- 终末地工业风主题背景的等高线 `public/themes/endfield/contour-a.svg`、`contour-b.svg` 由 endfield-ui 设计套件的生成脚本绘制，不含任何游戏官方素材；该主题只借鉴界面结构习惯，不使用《明日方舟：终末地》的字体、标志、图标、立绘或截图。
- 页面不从外部服务器加载字体；除上述字体外，文字使用访客设备的系统字体。

## 不发布的历史文件

`assets/branding/sakura-pixel-master.png` 与 `SAKURA_HISTORY.md` 保存历史 AI 图标及其生成记录。当前页面不引用它们，`public/` 不含旧樱花图标，构建产物不包含这张历史原图。AI 首页效果图也不是网站资产，不应被放入 `public/` 或作为页面截图背景加载。
