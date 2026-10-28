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

## 软件、图标及字体

- Blank 的软件版权声明和 MIT 文本保存在 `LICENSE` 与 `public/licenses/yuimi-chaya-MIT.txt`。
- Tabler Icons 的 MIT 许可保存在 `public/licenses/tabler-icons-MIT.txt`；此许可不扩展到角色或漫画图片。
- 共享网站图标是 `B.` 的确定性字母排版，详见 `assets/branding/README.md`。渲染时使用本机 Arial Bold 字体，未随仓库提供字体文件。
- 樱色档案主题的标题（“Arataki.br’s Base”）使用 FONTDASU 的 Mochiy Pop One（Copyright 2020 The MochiyPop Project Authors），通过 npm 包 `@fontsource/mochiy-pop-one` 随站点自托管，只引入拉丁字母子集；许可为 SIL Open Font License 1.1，全文保存在 `public/licenses/mochiy-pop-one-OFL.txt`。
- 页面不从外部服务器加载字体；除上述标题字体外，文字使用访客设备的系统字体。

## 不发布的历史文件

`assets/branding/sakura-pixel-master.png` 与 `SAKURA_HISTORY.md` 保存历史 AI 图标及其生成记录。当前页面不引用它们，`public/` 不含旧樱花图标，构建产物不包含这张历史原图。AI 首页效果图也不是网站资产，不应被放入 `public/` 或作为页面截图背景加载。
