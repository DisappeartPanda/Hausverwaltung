import { MODULE_KEYS, type ModuleKey } from "../constants/module-keys";

export type AppNavigationItem = {
  label: string;
  href: string;
  module?: ModuleKey;
};

type NavigationContext = {
  activeModules: ModuleKey[];
};

const BASE_ITEMS: AppNavigationItem[] = [
  {
    label: "Dashboard",
    href: "/app/dashboard",
  },
];

const MODULE_ITEMS: AppNavigationItem[] = [
  {
    label: "Objekte",
    href: "/app/objekte",
    module: MODULE_KEYS.HAUSVERWALTUNG,
  },
  {
    label: "Eigentümer",
    href: "/app/objekte",
    module: MODULE_KEYS.HAUSVERWALTUNG,
  },
  {
    label: "Wartungen",
    href: "/app/wartungen",
    module: MODULE_KEYS.HAUSVERWALTUNG,
  },
  {
    label: "Rücklagen",
    href: "/app/ruecklagen",
    module: MODULE_KEYS.HAUSVERWALTUNG,
  },
  {
    label: "Handwerker",
    href: "/app/handwerker",
    module: MODULE_KEYS.HAUSVERWALTUNG,
  },
  {
    label: "Wohneinheiten",
    href: "/app/wohneinheiten",
    module: MODULE_KEYS.SONDEREIGENTUM,
  },
  {
    label: "Mieter",
    href: "/app/mieter",
    module: MODULE_KEYS.SONDEREIGENTUM,
  },
  {
    label: "Dokumente",
    href: "/app/dokumente",
    module: MODULE_KEYS.SONDEREIGENTUM,
  },
  {
    label: "Mängel",
    href: "/app/maengel",
    module: MODULE_KEYS.SONDEREIGENTUM,
  },
  {
    label: "Mietpool",
    href: "/app/mietpool",
    module: MODULE_KEYS.MIETPOOL,
  },
  {
    label: "Auszahlungen",
    href: "/app/mietpool",
    module: MODULE_KEYS.MIETPOOL,
  },
];

const SETTINGS_ITEMS: AppNavigationItem[] = [
  {
    label: "Einstellungen",
    href: "/settings",
  },
];

export function hasModule(
  activeModules: ModuleKey[],
  targetModule: ModuleKey,
): boolean {
  return activeModules.includes(targetModule);
}

export function getAppNavigation(
  context: NavigationContext,
): AppNavigationItem[] {
  const moduleItems = MODULE_ITEMS.filter((item) => {
    if (!item.module) return true;
    return hasModule(context.activeModules, item.module);
  });

  return [...BASE_ITEMS, ...moduleItems, ...SETTINGS_ITEMS];
}

export function isNavigationItemActive(
  currentPath: string,
  itemHref: string,
): boolean {
  if (itemHref === "/") return currentPath === "/";
  return currentPath === itemHref || currentPath.startsWith(`${itemHref}/`);
}