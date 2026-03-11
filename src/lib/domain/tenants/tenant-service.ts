import { listTenantsByOrganization } from "./tenant-repository";
import { listUnitsByOrganization } from "../units/unit-repository";

export type TenantListItemViewModel = {
  id: string;
  fullName: string;
  email: string;
  phoneLabel: string;
  unitLabel: string;
  statusLabel: string;
  moveInDateLabel: string;
};

function formatDate(dateValue: string | null): string {
  if (!dateValue) return "Kein Einzugsdatum hinterlegt";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Ungültiges Datum";
  }

  return new Intl.DateTimeFormat("de-DE").format(date);
}

export async function getTenantListViewModel(organizationId: string) {
  const [tenants, units] = await Promise.all([
    listTenantsByOrganization(organizationId),
    listUnitsByOrganization(organizationId),
  ]);

  const unitsById = new Map(units.map((unit) => [unit.id, unit]));

  const items: TenantListItemViewModel[] = tenants.map((tenant) => {
    const unit = tenant.unit_id ? unitsById.get(tenant.unit_id) : null;

    return {
      id: tenant.id,
      fullName: `${tenant.first_name} ${tenant.last_name}`,
      email: tenant.email,
      phoneLabel: tenant.phone ?? "Keine Telefonnummer hinterlegt",
      unitLabel: unit?.title ?? "Keine Einheit zugeordnet",
      statusLabel: "Aktiv",
      moveInDateLabel: formatDate(tenant.move_in_date),
    };
  });

  return items;
}