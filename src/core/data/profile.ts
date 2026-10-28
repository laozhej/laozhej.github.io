// Adapted from the owner's public Steam introduction, with permission on 2026-10-28.
// Source: https://steamcommunity.com/id/asahiarataki
export const profileIdentity = {
  displayName: "荒泷旭",
  handle: "PROFILE / 个人档案",
  siteName: "Blank Space",
  bio: "我是荒泷旭，也可以叫我 Nero。喜欢收集动漫与游戏周边，关注 AI 和电脑技术；平时学习编程，钻研动画、建模与不同的游戏引擎。"
} as const;

export const profileStatus = [
  "使用语言：中文普通话、日语、英语、西班牙语",
  "准备进入 AI Agent 时代"
] as const;

export const profileTech = [
  { key: "ai", name: "AI 与编程", note: "关注 AI 和电脑技术，学习不同的编程语言。" },
  { key: "animation", name: "动画与建模", note: "钻研动画与建模，常用 Blender、Live2D 等工具。" },
  { key: "engines", name: "游戏引擎", note: "探索 Godot、Unreal Engine 和 Unity。" }
] as const;

export const favoriteGames = [
  { key: "rdr2", title: "荒野大镖客：救赎 2", subtitle: "Red Dead Redemption 2" },
  { key: "tsushima", title: "对马岛之魂", subtitle: "Ghost of Tsushima" },
  { key: "yotei", title: "羊蹄山之魂", subtitle: "Ghost of Yōtei" },
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
  { label: "正在做", text: "准备进入 AI Agent 时代，也在慢慢完善自己的个人网站。" },
  { label: "接下来", text: "一点点写下文章和项目记录。" },
  { label: "视觉方向", text: "喜欢樱羽艾玛的风格，未来想从中寻找网站主题的灵感。" }
] as const;
