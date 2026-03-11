export const MODULE_KEYS = {
  HAUSVERWALTUNG: "hausverwaltung",
  SONDEREIGENTUM: "sondereigentum",
  MIETPOOL: "mietpool",
} as const;

export type ModuleKey = (typeof MODULE_KEYS)[keyof typeof MODULE_KEYS];

export const ALL_MODULE_KEYS: ModuleKey[] = [
  MODULE_KEYS.HAUSVERWALTUNG,
  MODULE_KEYS.SONDEREIGENTUM,
  MODULE_KEYS.MIETPOOL,
];