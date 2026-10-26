export const projectTechLines = [
  { key: "web", label: "Web", note: "个人网站 / 页面与交互" }
] as const;

export const projectEntries = [
  {
    id: "blank-personal-site",
    title: "个人网站 · 基础版",
    type: "Personal Website",
    line: "web",
    status: "搭建中",
    summary: "以 Blank 主题为起点，为文字、项目和喜欢的作品建立一个自己的空间。",
    details: ["首页与栏目导航", "文章列表与阅读页面", "项目、闲暇与关于页面"]
  }
] as const;
