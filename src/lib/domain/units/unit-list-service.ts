import { createServiceRoleSupabaseClient } from "../../supabase/server";

export type UnitListItem = {
  id: string;
  title: string;
  objectId: string | null;
  status: string | null;
};

type UnitRow = {
  id: string;
  title: string;
  object_id: string | null;
  status: string | null;
  organization_id: string;
};

export async function listUnitsByOrganization(
  organizationId: string
): Promise<UnitListItem[]> {
  const supabase = createServiceRoleSupabaseClient();

  const { data, error } = await supabase
    .from("units")
    .select("id, title, object_id, status, organization_id")
    .eq("organization_id", organizationId)
    .order("title", { ascending: true });

  if (error) {
    throw error;
  }

  return ((data ?? []) as UnitRow[]).map((item) => ({
    id: item.id,
    title: item.title,
    objectId: item.object_id ?? null,
    status: item.status ?? null,
  }));
}