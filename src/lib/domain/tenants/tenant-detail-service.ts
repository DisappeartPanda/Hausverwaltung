import { createServerSupabaseClient } from "../../../lib/supabase/server";
import { listUnitsByOrganization } from "../units/unit-repository";

export type TenantDetailViewModel = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string | null;
  phoneLabel: string;
  unitId: string | null;
  unitLabel: string;
  statusLabel: string;
  moveInDate: string | null;
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

export async function getTenantDetailViewModel(
  organizationId: string,
  tenantId: string,
): Promise<TenantDetailViewModel | null> {
  const supabase = createServerSupabaseClient();

  const { data: tenant, error } = await supabase
    .from("tenants")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("id", tenantId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message || "Mieter konnte nicht geladen werden.");
  }

  const units = await listUnitsByOrganization(organizationId);
  const unit = tenant.unit_id
    ? units.find((item) => item.id === tenant.unit_id)
    : null;

  return {
    id: tenant.id,
    firstName: tenant.first_name,
    lastName: tenant.last_name,
    fullName: `${tenant.first_name} ${tenant.last_name}`,
    email: tenant.email,
    phone: tenant.phone ?? null,
    phoneLabel: tenant.phone ?? "Keine Telefonnummer hinterlegt",
    unitId: tenant.unit_id ?? null,
    unitLabel: unit?.title ?? "Keine Einheit zugeordnet",
    statusLabel: "Aktiv",
    moveInDate: tenant.move_in_date ?? null,
    moveInDateLabel: formatDate(tenant.move_in_date),
  };
}