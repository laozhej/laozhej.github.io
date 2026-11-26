// Public server/client contract; the dependency-free implementation is also tested in Node.
export { themes, themePreferenceKey, canonicalTheme, isTheme, isIndexedPath, getTheme, stripTheme, getThemePath } from "./routing.mjs";
export type ThemeId = "blank" | "ema" | "endfield" | "arknights";
