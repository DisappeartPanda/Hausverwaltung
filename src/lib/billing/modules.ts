import { MODULE_KEYS, type ModuleKey } from "../constants/module-keys";

export type FeatureKey =
  | "object_overview"
  | "owner_management"
  | "building_maintenance"
  | "building_reserves"
  | "building_defects"
  | "building_accounting"
  | "contractors"
  | "unit_management"
  | "tenant_management"
  | "tenant_documents"
  | "tenant_communication"
  | "dashboard"
  | "rental_pool_dashboard"
  | "payout_overview"
  | "pool_reserves"
  | "pool_accounting";

export type LimitMap = {
  maxObjects?: number | null;
  maxOwners?: number | null;
  maxUnits?: number | null;
  maxTenants?: number | null;
  maxPools?: number | null;
  maxDocuments?: number | null;
};

export type BillingModuleDefinition = {
  key: ModuleKey;
  name: string;
  shortDescription: string;
  priceMonthly: number;
  priceYearly: number;
  highlight?: string;
  features: FeatureKey[];
  limits: LimitMap;
};

export const BILLING_MODULES: BillingModuleDefinition[] = [
  {
    key: MODULE_KEYS.HAUSVERWALTUNG,
    name: "Hausverwaltung",
    shortDescription:
      "Für Gebäude, Eigentümergemeinschaften und zentrale Hausdaten.",
    priceMonthly: 19,
    priceYearly: 190,
    features: [
      "object_overview",
      "owner_management",
      "building_maintenance",
      "building_reserves",
      "building_defects",
      "building_accounting",
      "contractors",
    ],
    limits: {
      maxObjects: 1,
      maxOwners: 20,
      maxDocuments: 500,
    },
  },
  {
    key: MODULE_KEYS.SONDEREIGENTUM,
    name: "Sondereigentum",
    shortDescription:
      "Für Wohneinheiten, Mieter, Dokumente und Vermietungsverwaltung.",
    priceMonthly: 39,
    priceYearly: 390,
    highlight: "Am häufigsten gewählt",
    features: [
      "object_overview",
      "unit_management",
      "tenant_management",
      "tenant_documents",
      "tenant_communication",
      "building_reserves",
      "building_defects",
      "dashboard",
    ],
    limits: {
      maxObjects: 10,
      maxUnits: 100,
      maxTenants: 100,
      maxDocuments: 2000,
    },
  },
  {
    key: MODULE_KEYS.MIETPOOL,
    name: "Mietpool",
    shortDescription:
      "Für Ausschüttungen, Poolrücklagen und zentrale Poolübersichten.",
    priceMonthly: 29,
    priceYearly: 290,
    features: [
      "rental_pool_dashboard",
      "payout_overview",
      "pool_reserves",
      "pool_accounting",
      "dashboard",
    ],
    limits: {
      maxPools: 1,
      maxDocuments: 1000,
    },
  },
];

export function getBillingModule(moduleKey: ModuleKey) {
  return BILLING_MODULES.find((module) => module.key === moduleKey) ?? null;
}

export function getBillingModules(moduleKeys: ModuleKey[]) {
  return BILLING_MODULES.filter((module) => moduleKeys.includes(module.key));
}

export function getAllFeaturesForModules(moduleKeys: ModuleKey[]): FeatureKey[] {
  const featureSet = new Set<FeatureKey>();

  for (const module of BILLING_MODULES) {
    if (!moduleKeys.includes(module.key)) continue;

    for (const feature of module.features) {
      featureSet.add(feature);
    }
  }

  return [...featureSet];
}

export function getMergedLimitsForModules(moduleKeys: ModuleKey[]): LimitMap {
  const modules = getBillingModules(moduleKeys);

  const merged: LimitMap = {};

  for (const module of modules) {
    for (const [key, value] of Object.entries(module.limits) as [
      keyof LimitMap,
      number | null | undefined,
    ][]) {
      if (value === undefined) continue;

      const current = merged[key];

      if (current === undefined) {
        merged[key] = value;
        continue;
      }

      if (current === null || value === null) {
        merged[key] = null;
        continue;
      }

      merged[key] = Math.max(current, value);
    }
  }

  return merged;
}