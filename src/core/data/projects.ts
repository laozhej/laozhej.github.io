export const projectTechLines = [
  { key: "web", label: "Web", note: "个人网站 / 页面与交互" }
] as const;

export const personalSiteShowcaseUrl = "https://github.com/laozhej/laozhej.github.io/tree/main/showcase";

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
  }
] as const;
