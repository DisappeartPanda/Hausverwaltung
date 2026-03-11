import { createServerSupabaseClient } from "../../../lib/supabase/server";
import type { Database } from "../../../types/database";

type DocumentInsert = Database["public"]["Tables"]["documents"]["Insert"];
type DocumentRow = Database["public"]["Tables"]["documents"]["Row"];

export async function createDocument(input: DocumentInsert): Promise<DocumentRow> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("documents")
    .insert(input)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Dokument konnte nicht erstellt werden.");
  }

  return data;
}

export async function listDocumentsByOrganization(
  organizationId: string,
): Promise<DocumentRow[]> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "Dokumente konnten nicht geladen werden.");
  }

  return data ?? [];
}