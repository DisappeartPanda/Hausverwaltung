export const THEMES = [
  {
    key: "dark-green",
    label: "Dark Green",
    description: "Dunkles Theme mit grünen Akzenten und Glow-Effekt.",
  },
  {
    key: "dark-blue",
    label: "Dark Blue",
    description: "Dunkles Theme mit kühleren blauen Akzenten.",
  },
  {
    key: "light",
    label: "Light",
    description: "Helle Oberfläche für ein ruhigeres, neutrales Arbeitsbild.",
  },
] as const;

export type ThemeDefinition = (typeof THEMES)[number];
export type ThemeKey = ThemeDefinition["key"];

export const DEFAULT_THEME: ThemeKey = "dark-green";