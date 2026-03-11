import { createServerSupabaseClient } from "../../../lib/supabase/server";
import { listObjectsByOrganization } from "../objects/object-repository";
import { listTenantsByOrganization } from "../tenants/tenant-repository";
import { listDefectsByOrganization } from "../defects/defect-repository";

export type UnitDetailViewModel = {
  id: string;
  title: string;
  status: string | null;
  statusLabel: string;
  objectId: string | null;
  objectLabel: string;
  tenantLabel: string;
  openDefectsCount: number;
};

function mapStatusLabel(status: string | null): string {
  if (!status) return "Unbekannt";

  switch (status) {
    case "frei":
      return "Frei";
    case "vermietet":
      return "Vermietet";
    case "reserviert":
      return "Reserviert";
    default:
      return status;
  }
}

export async function getUnitDetailViewModel(
  organizationId: string,
  unitId: string,
): Promise<UnitDetailViewModel | null> {
  const supabase = createServerSupabaseClient();

  const { data: unit, error } = await supabase
    .from("units")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("id", unitId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message || "Wohneinheit konnte nicht geladen werden.");
  }

  const [objects, tenants, defects] = await Promise.all([
    listObjectsByOrganization(organizationId),
    listTenantsByOrganization(organizationId),
    listDefectsByOrganization(organizationId),
  ]);

  const object = unit.object_id
    ? objects.find((item) => item.id === unit.object_id)
    : null;

  const tenant = tenants.find((item) => item.unit_id === unit.id);
  const relatedDefects = defects.filter((item) => item.unit_id === unit.id);

  return {
    id: unit.id,
    title: unit.title,
    status: unit.status ?? null,
    statusLabel: mapStatusLabel(unit.status),
    objectId: unit.object_id ?? null,
    objectLabel: object?.name ?? "Kein Objekt zugeordnet",
    tenantLabel: tenant
      ? `${tenant.first_name} ${tenant.last_name}`
      : "Kein Mieter zugeordnet",
    openDefectsCount: relatedDefects.filter((item) => item.status !== "geschlossen")
      .length,
  };
}