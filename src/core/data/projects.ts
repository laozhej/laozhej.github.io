export const projectTechLines = [
  { key: "web", label: "Web", note: "个人网站 / 页面与交互" }
] as const;

export const personalSiteShowcaseUrl = "https://github.com/laozhej/laozhej.github.io/tree/main/showcase";

// Screenshot provenance: public/projects/ASSETS.json. Each locale adds its own alt text.
export const personalSitePreview = { src: "/projects/personal-site-preview.jpg", width: 1440, height: 960 } as const;

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
  }
] as const;
