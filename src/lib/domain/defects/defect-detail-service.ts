import { createServerSupabaseClient } from "../../../lib/supabase/server";
import { listObjectsByOrganization } from "../objects/object-repository";
import { listUnitsByOrganization } from "../units/unit-repository";

export type DefectDetailViewModel = {
  id: string;
  title: string;
  level: string;
  levelLabel: string;
  status: string;
  statusLabel: string;
  objectId: string | null;
  unitId: string | null;
  locationLabel: string;
  description: string | null;
  descriptionLabel: string;
};

function mapStatusLabel(status: string): string {
  switch (status) {
    case "offen":
      return "Offen";
    case "in_bearbeitung":
      return "In Bearbeitung";
    case "geplant":
      return "Geplant";
    case "geschlossen":
      return "Geschlossen";
    default:
      return status;
  }
}

function mapLevelLabel(level: string): string {
  switch (level) {
    case "building":
      return "Gebäude";
    case "unit":
      return "Wohneinheit";
    default:
      return level;
  }
}

export async function getDefectDetailViewModel(
  organizationId: string,
  defectId: string,
): Promise<DefectDetailViewModel | null> {
  const supabase = createServerSupabaseClient();

  const { data: defect, error } = await supabase
    .from("defects")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("id", defectId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message || "Mangel konnte nicht geladen werden.");
  }

  const [objects, units] = await Promise.all([
    listObjectsByOrganization(organizationId),
    listUnitsByOrganization(organizationId),
  ]);

  const object = defect.object_id
    ? objects.find((item) => item.id === defect.object_id)
    : null;

  const unit = defect.unit_id
    ? units.find((item) => item.id === defect.unit_id)
    : null;

  return {
    id: defect.id,
    title: defect.title,
    level: defect.level,
    levelLabel: mapLevelLabel(defect.level),
    status: defect.status,
    statusLabel: mapStatusLabel(defect.status),
    objectId: defect.object_id ?? null,
    unitId: defect.unit_id ?? null,
    locationLabel: unit?.title ?? object?.name ?? "Keine Zuordnung",
    description: defect.description ?? null,
    descriptionLabel: defect.description ?? "Keine Beschreibung hinterlegt",
  };
}