import { createServerSupabaseClient } from "../../../lib/supabase/server";
import { listUnitsByOrganization } from "../units/unit-repository";
import { listDefectsByOrganization } from "../defects/defect-repository";
import { listMaintenanceByOrganization } from "../maintenance/maintenance-repository";

export type ObjectDetailViewModel = {
  id: string;
  name: string;
  city: string;
  street: string | null;
  postalCode: string | null;
  streetLabel: string;
  postalCodeLabel: string;
  unitCount: number;
  unitCountLabel: string;
  unitsCount: number;
  openDefectsCount: number;
  maintenanceCount: number;
};

export async function getObjectDetailViewModel(
  organizationId: string,
  objectId: string,
): Promise<ObjectDetailViewModel | null> {
  const supabase = createServerSupabaseClient();

  const { data: object, error } = await supabase
    .from("objects")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("id", objectId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message || "Objekt konnte nicht geladen werden.");
  }

  const [units, defects, maintenance] = await Promise.all([
    listUnitsByOrganization(organizationId),
    listDefectsByOrganization(organizationId),
    listMaintenanceByOrganization(organizationId),
  ]);

  const relatedUnits = units.filter((unit) => unit.object_id === object.id);
  const relatedDefects = defects.filter((defect) => defect.object_id === object.id);
  const relatedMaintenance = maintenance.filter(
    (item) => item.object_id === object.id,
  );

  return {
    id: object.id,
    name: object.name,
    city: object.city,
    street: object.street ?? null,
    postalCode: object.postal_code ?? null,
    streetLabel: object.street ?? "Keine Straße hinterlegt",
    postalCodeLabel: object.postal_code ?? "Keine PLZ hinterlegt",
    unitCount: object.unit_count ?? 0,
    unitCountLabel: `${object.unit_count ?? 0} Einheiten`,
    unitsCount: relatedUnits.length,
    openDefectsCount: relatedDefects.filter((item) => item.status !== "geschlossen")
      .length,
    maintenanceCount: relatedMaintenance.length,
  };
}