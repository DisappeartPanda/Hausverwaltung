import { createServiceRoleSupabaseClient } from "../../supabase/server";

export type TenantListItem = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  unitId: string | null;
};

type TenantRow = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  unit_id: string | null;
  organization_id: string;
};

export async function listTenantsByOrganization(
  organizationId: string
): Promise<TenantListItem[]> {
  const supabase = createServiceRoleSupabaseClient();

  const { data, error } = await supabase
    .from("tenants")
    .select("id, first_name, last_name, email, unit_id, organization_id")
    .eq("organization_id", organizationId)
    .order("last_name", { ascending: true });

  if (error) {
    throw error;
  }

  return ((data ?? []) as TenantRow[]).map((item) => ({
    id: item.id,
    firstName: item.first_name,
    lastName: item.last_name,
    fullName: `${item.first_name} ${item.last_name}`,
    email: item.email,
    unitId: item.unit_id ?? null,
  }));
}