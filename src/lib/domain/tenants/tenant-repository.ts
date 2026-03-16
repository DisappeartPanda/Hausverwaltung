import { createServerSupabaseClient } from "../../../lib/supabase/server";
import type { Database } from "../../../types/database";

type TenantInsert = Database["public"]["Tables"]["tenants"]["Insert"];
type TenantRow = Database["public"]["Tables"]["tenants"]["Row"];

export async function createTenant(input: TenantInsert): Promise<TenantRow> {
  const supabase = createServerSupabaseClient();
  const tenantsTable = supabase.from("tenants") as any;

  const { data, error } = await tenantsTable
    .insert(input)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Mieter konnte nicht erstellt werden.");
  }

  return data as TenantRow;
}

export async function listTenantsByOrganization(
  organizationId: string
): Promise<TenantRow[]> {
  const supabase = createServerSupabaseClient();
  const tenantsTable = supabase.from("tenants") as any;

  const { data, error } = await tenantsTable
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "Mieter konnten nicht geladen werden.");
  }

  return (data ?? []) as TenantRow[];
}

export async function getTenantById(
  tenantId: string,
  organizationId: string
): Promise<TenantRow | null> {
  const supabase = createServerSupabaseClient();
  const tenantsTable = supabase.from("tenants") as any;

  const { data, error } = await tenantsTable
    .select("*")
    .eq("id", tenantId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || "Mieter konnte nicht geladen werden.");
  }

  return (data as TenantRow | null) ?? null;
}