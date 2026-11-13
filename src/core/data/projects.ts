export const projectTechLines = [
  { key: "web", label: "Web", note: "个人网站 / 页面与交互" }
] as const;

export const personalSiteShowcaseUrl = "https://github.com/laozhej/laozhej.github.io/tree/main/showcase";

// Screenshot provenance: public/projects/ASSETS.json. Each locale adds its own alt text.
// `darkSrc` is the same page captured in the dark colour mode; pages in dark mode show it instead.
export const personalSitePreview = { src: "/projects/personal-site-preview.jpg", darkSrc: "/projects/personal-site-preview-dark.jpg", width: 1440, height: 960 } as const;

// The screenshot viewer: byte-identical copies of showcase/gallery (captured 2026-10-31), provenance in
// public/projects/ASSETS.json. Each locale adds a label, a mode and size note, and alt text to every shot, in this order.
export const personalSiteGallery = [
  { src: "/projects/gallery/blank-desktop.png", width: 1440, height: 960 },
  { src: "/projects/gallery/blank-dark.png", width: 1440, height: 960 },
  { src: "/projects/gallery/projects-desktop.png", width: 1440, height: 960 },
  { src: "/projects/gallery/endfield-desktop.png", width: 1440, height: 960 },
  { src: "/projects/gallery/blank-mobile.png", width: 390, height: 844 },
  { src: "/projects/gallery/endfield-mobile.png", width: 390, height: 844 },
] as const;

export const projectEntries = [
  {
    id: "blank-personal-site",
    title: "个人网站 · 多主题与多语言",
    type: "Personal Website",
    line: "web",
    status: "持续更新",
    summary: "从 Blank 出发，让黑白阅读、樱色档案与工业风三套界面共用内容、语言和交互。项目案例记录设计取舍、共享架构与验证过程。",
    details: ["三套主题与四种语言", "共享内容、偏好与页面生命周期", "真实截图、源码导览与验证记录"],
    url: personalSiteShowcaseUrl,
    image: { ...personalSitePreview, alt: "个人网站樱色档案主题的首页截图：左侧是站点名称与终端文字，右侧是樱羽艾玛立绘与漫画分镜" },
    gallery: [
      { ...personalSiteGallery[0], label: "Blank 主题 · 首页", meta: "浅色 · 1440×960 · 2026-10-31 截图", alt: "Blank 主题首页截图：白底黑字的大标题 Blank Space、简介与文章入口" },
      { ...personalSiteGallery[1], label: "Blank 主题 · 首页（深色）", meta: "深色 · 1440×960 · 2026-10-31 截图", alt: "Blank 主题首页的深色模式截图：黑底白字的大标题 Blank Space" },
      { ...personalSiteGallery[2], label: "Blank 主题 · 作品页", meta: "浅色 · 1440×960 · 2026-10-31 截图", alt: "Blank 主题作品页截图：标题 Works 与个人网站项目条目" },
      { ...personalSiteGallery[3], label: "终末地工业风主题 · 首页", meta: "浅色 · 1440×960 · 2026-10-31 截图", alt: "终末地工业风主题首页截图：ARATAKI.BR 标题、黄色高亮标语与统计数字" },
      { ...personalSiteGallery[4], label: "Blank 主题 · 手机宽度", meta: "浅色 · 390×844 · 2026-10-31 截图", alt: "Blank 主题首页在手机宽度下的截图" },
      { ...personalSiteGallery[5], label: "终末地工业风主题 · 手机宽度", meta: "浅色 · 390×844 · 2026-10-31 截图", alt: "终末地工业风主题首页在手机宽度下的截图" },
    ],
  }
] as const;
