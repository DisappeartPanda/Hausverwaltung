import { createServiceRoleSupabaseClient } from "../../supabase/server";

export type ObjectListItem = {
  id: string;
  title: string;
  city: string;
  street: string | null;
  postalCode: string | null;
  unitCount: number;
};

type ObjectRow = {
  id: string;
  name: string;
  city: string;
  street: string | null;
  postal_code: string | null;
  unit_count: number | null;
  organization_id: string;
};

export async function listObjectsByOrganization(
  organizationId: string
): Promise<ObjectListItem[]> {
  const supabase = createServiceRoleSupabaseClient();

  const { data, error } = await supabase
    .from("objects")
    .select("id, name, city, street, postal_code, unit_count, organization_id")
    .eq("organization_id", organizationId)
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return ((data ?? []) as ObjectRow[]).map((item) => ({
    id: item.id,
    title: item.name,
    city: item.city,
    street: item.street ?? null,
    postalCode: item.postal_code ?? null,
    unitCount: item.unit_count ?? 0,
  }));
}

export const getObjectListViewModel = listObjectsByOrganization;