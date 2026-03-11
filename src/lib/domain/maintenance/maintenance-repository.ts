import { createServerSupabaseClient } from "../../../lib/supabase/server";
import type { Database } from "../../../types/database";

type MaintenanceInsert = Database["public"]["Tables"]["maintenance"]["Insert"];
type MaintenanceRow = Database["public"]["Tables"]["maintenance"]["Row"];

export async function createMaintenance(
  input: MaintenanceInsert,
): Promise<MaintenanceRow> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("maintenance")
    .insert(input)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Wartung konnte nicht erstellt werden.");
  }

  return data;
}

export async function listMaintenanceByOrganization(
  organizationId: string,
): Promise<MaintenanceRow[]> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("maintenance")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "Wartungen konnten nicht geladen werden.");
  }

  return data ?? [];
}