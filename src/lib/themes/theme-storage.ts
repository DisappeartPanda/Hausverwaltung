import { DEFAULT_THEME, type ThemeKey } from "./theme-definitions";
import { resolveThemeKey } from "./theme-resolver";

const STORAGE_KEY = "immobilienpro-theme";

export function getStoredTheme(): ThemeKey {
  if (typeof window === "undefined") {
    return DEFAULT_THEME;
  }

  const storedValue = window.localStorage.getItem(STORAGE_KEY);
  return resolveThemeKey(storedValue);
}

export function storeTheme(theme: ThemeKey): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, theme);
}

export function applyTheme(theme: ThemeKey): void {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.setAttribute("data-theme", theme);
}

export function initializeStoredTheme(): ThemeKey {
  const theme = getStoredTheme();
  applyTheme(theme);
  return theme;
}