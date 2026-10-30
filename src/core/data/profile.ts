// Adapted from the owner's public Steam introduction, with permission on 2026-10-28.
// Source: https://steamcommunity.com/id/asahiarataki
import { getFavoriteCharacters } from "./characters.ts";
export const profileIdentity = {
  displayName: "荒泷旭",
  handle: "PROFILE / 个人档案",
  siteName: "Blank Space",
  bio: "我是荒泷旭，也可以叫我 Nero。喜欢收集动漫与游戏周边，关注 AI 和电脑技术；平时学习编程，钻研动画、建模与不同的游戏引擎。"
} as const;

export const profileStatus = [
  "使用语言：中文普通话、日语、英语、西班牙语",
  "掌握多种编程语言",
  "正在学习如何用AI协助开发",
  "了解未来的游戏趋势"
] as const;

export const profileTech = [
  { key: "unity", name: "Unity3D", note: "游戏制作/交互逻辑" },
  { key: "blender", name: "Blender", note: "动画制作/场景建模" },
  { key: "unreal", name: "UE5", note: "高阶游戏制作" },
  { key: "godot", name: "Godot", note: "小型游戏开发" },
  { key: "rpgmaker", name: "RPG Maker MZ", note: "传统RPG游戏制作" },
  { key: "vscode", name: "Visual Studio Code", note: "编程工具" }
] as const;

// Each key matches a game in games.ts; getSiteContent adds its link (official page, else Steam).
export const favoriteGames = [
  { key: "rdr2", title: "荒野大镖客：救赎 2", subtitle: "Red Dead Redemption 2" },
  { key: "tsushima", title: "对马岛之魂", subtitle: "Ghost of Tsushima" },
  { key: "yotei", title: "羊蹄山之魂", subtitle: "Ghost of Yōtei" },
  { key: "manosaba", title: "魔法少女的魔女审判", subtitle: "视觉小说 / 角色与视觉灵感" }
] as const;

export const xpFavorites = [
  { key: "emma", title: "樱羽艾玛", subtitle: "角色风格参考", portrait: "/themes/ema/assets/ema-avatar.webp" },
  { key: "yuki", title: "月代雪", subtitle: "现在的头像角色", portrait: "/themes/ema/assets/yuki.webp" },
  ...getFavoriteCharacters("zh-CN"),
] as const;

export const currentSignals = [
  { label: "正在做", text: "开始研究各种与AI, 软件开发和游戏制作相关的内容" },
  { label: "接下来", text: "将会慢慢记录我的研究进程和日常" },
  { label: "视觉方向", text: "此网站已做成多个主题，未来会慢慢打磨并增加新内容" }
] as const;
