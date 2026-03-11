import { MODULE_KEYS, type ModuleKey } from "../constants/module-keys";
import type { FeatureKey } from "../billing/modules";

export type DashboardWidgetKey =
  | "object-overview"
  | "reserve"
  | "maintenance"
  | "building-defects"
  | "unit-overview"
  | "tenant-overview"
  | "tenant-communication"
  | "tenant-documents"
  | "rental-pool"
  | "payout"
  | "pool-reserves";

export type DashboardWidgetDefinition = {
  key: DashboardWidgetKey;
  title: string;
  description: string;
  module: ModuleKey;
  requiredFeature: FeatureKey;
};

export const DASHBOARD_WIDGETS: DashboardWidgetDefinition[] = [
  {
    key: "object-overview",
    title: "Objektübersicht",
    description: "Alle relevanten Gebäudedaten und Objekte im Überblick.",
    module: MODULE_KEYS.HAUSVERWALTUNG,
    requiredFeature: "object_overview",
  },
  {
    key: "reserve",
    title: "Rücklagen",
    description: "Aktuelle Rücklagen und Entwicklung auf einen Blick.",
    module: MODULE_KEYS.HAUSVERWALTUNG,
    requiredFeature: "building_reserves",
  },
  {
    key: "maintenance",
    title: "Wartungen",
    description: "Offene und anstehende Wartungen für Gebäude.",
    module: MODULE_KEYS.HAUSVERWALTUNG,
    requiredFeature: "building_maintenance",
  },
  {
    key: "building-defects",
    title: "Gebäudemängel",
    description: "Gemeldete Mängel auf Gebäudeebene.",
    module: MODULE_KEYS.HAUSVERWALTUNG,
    requiredFeature: "building_defects",
  },
  {
    key: "unit-overview",
    title: "Wohneinheiten",
    description: "Status und Struktur aller verwalteten Wohneinheiten.",
    module: MODULE_KEYS.SONDEREIGENTUM,
    requiredFeature: "unit_management",
  },
  {
    key: "tenant-overview",
    title: "Mieter",
    description: "Aktive Mietverhältnisse, Wechsel und Übersicht.",
    module: MODULE_KEYS.SONDEREIGENTUM,
    requiredFeature: "tenant_management",
  },
  {
    key: "tenant-communication",
    title: "Kommunikation",
    description: "Nachrichten, Rückfragen und Kontakt mit Mietern.",
    module: MODULE_KEYS.SONDEREIGENTUM,
    requiredFeature: "tenant_communication",
  },
  {
    key: "tenant-documents",
    title: "Dokumente",
    description: "Bereitgestellte und neue Mieter-Dokumente.",
    module: MODULE_KEYS.SONDEREIGENTUM,
    requiredFeature: "tenant_documents",
  },
  {
    key: "rental-pool",
    title: "Mietpool",
    description: "Status, Übersicht und aktueller Stand des Mietpools.",
    module: MODULE_KEYS.MIETPOOL,
    requiredFeature: "rental_pool_dashboard",
  },
  {
    key: "payout",
    title: "Auszahlungen",
    description: "Letzte und nächste Ausschüttungen im Überblick.",
    module: MODULE_KEYS.MIETPOOL,
    requiredFeature: "payout_overview",
  },
  {
    key: "pool-reserves",
    title: "Poolrücklagen",
    description: "Rücklagen und Bewegungen innerhalb des Mietpools.",
    module: MODULE_KEYS.MIETPOOL,
    requiredFeature: "pool_reserves",
  },
];