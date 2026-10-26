export const profileIdentity = {
  displayName: "名字待填写",
  handle: "PROFILE / 个人档案",
  siteName: "Blank Space",
  bio: "这里会放下我的介绍、喜欢的事，以及正在做的尝试。先留一点空白，慢慢认识。"
} as const;

export const profileStatus = [
  "正在搭建个人网站",
  "先从 Blank 基础主题开始"
] as const;

export const profileTech = [
  { key: "website", name: "个人网站", note: "整理框架 / 慢慢完善" },
  { key: "journal", name: "文字记录", note: "给想法留一个位置" },
  { key: "visual", name: "视觉方向", note: "从喜欢的角色寻找灵感" }
] as const;

export const favoriteGames = [
  {
    key: "manosaba",
    title: "魔法少女的魔女审判",
    subtitle: "视觉小说 / 角色与视觉灵感",
    url: "https://manosaba.com/"
  }
] as const;

export const xpFavorites = [
  { key: "emma", title: "樱羽艾玛", subtitle: "角色风格参考" }
] as const;

export const currentSignals = [
  { label: "正在做", text: "搭建个人网站，先把首页、文章和各个栏目安放好。" },
  { label: "接下来", text: "补上自己的介绍，再一点点写下文章和项目记录。" },
  { label: "视觉方向", text: "喜欢樱羽艾玛的风格，未来想从中寻找网站主题的灵感。" }
] as const;
