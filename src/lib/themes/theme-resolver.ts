import {
  DEFAULT_THEME,
  THEMES,
  type ThemeDefinition,
  type ThemeKey,
} from "./theme-definitions";

export function isValidThemeKey(value: string): value is ThemeKey {
  return THEMES.some((theme) => theme.key === value);
}

export function resolveThemeKey(value?: string | null): ThemeKey {
  if (!value) {
    return DEFAULT_THEME;
  }

  return isValidThemeKey(value) ? value : DEFAULT_THEME;
}

export function getThemeDefinition(themeKey: ThemeKey): ThemeDefinition {
  return THEMES.find((theme) => theme.key === themeKey) ?? THEMES[0];
}