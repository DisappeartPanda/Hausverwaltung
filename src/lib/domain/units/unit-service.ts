import { listUnitsByOrganization } from "./unit-repository";
import { listObjectsByOrganization } from "../objects/object-repository";
import { listTenantsByOrganization } from "../tenants/tenant-repository";

export type UnitListItemViewModel = {
  id: string;
  title: string;
  objectLabel: string;
  tenantLabel: string;
  statusLabel: string;
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

export async function getUnitListViewModel(organizationId: string) {
  const [units, objects, tenants] = await Promise.all([
    listUnitsByOrganization(organizationId),
    listObjectsByOrganization(organizationId),
    listTenantsByOrganization(organizationId),
  ]);

  const objectsById = new Map(objects.map((object) => [object.id, object]));

  const tenantByUnitId = new Map(
    tenants
      .filter((tenant) => tenant.unit_id)
      .map((tenant) => [tenant.unit_id as string, `${tenant.first_name} ${tenant.last_name}`]),
  );

  const items: UnitListItemViewModel[] = units.map((unit) => ({
    id: unit.id,
    title: unit.title,
    objectLabel: unit.object_id
      ? objectsById.get(unit.object_id)?.name ?? "Unbekanntes Objekt"
      : "Kein Objekt zugeordnet",
    tenantLabel: tenantByUnitId.get(unit.id) ?? "Kein Mieter zugeordnet",
    statusLabel: mapStatusLabel(unit.status),
  }));

  return items;
}