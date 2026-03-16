import { createServerSupabaseClient } from "../../../lib/supabase/server";
import type { Database } from "../../../types/database";

type DocumentInsert = Database["public"]["Tables"]["documents"]["Insert"];
type DocumentRow = Database["public"]["Tables"]["documents"]["Row"];

export async function createDocument(
  input: DocumentInsert
): Promise<DocumentRow> {
  const supabase = createServerSupabaseClient();
  const documentsTable = supabase.from("documents") as any;

  const { data, error } = await documentsTable
    .insert(input)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Dokument konnte nicht erstellt werden.");
  }

  return data as DocumentRow;
}

export async function listDocumentsByOrganization(
  organizationId: string
): Promise<DocumentRow[]> {
  const supabase = createServerSupabaseClient();
  const documentsTable = supabase.from("documents") as any;

  const { data, error } = await documentsTable
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "Dokumente konnten nicht geladen werden.");
  }

  return (data ?? []) as DocumentRow[];
}

export async function getDocumentById(
  documentId: string,
  organizationId: string
): Promise<DocumentRow | null> {
  const supabase = createServerSupabaseClient();
  const documentsTable = supabase.from("documents") as any;

  const { data, error } = await documentsTable
    .select("*")
    .eq("id", documentId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message || "Dokument konnte nicht geladen werden.");
  }

  return (data as DocumentRow | null) ?? null;
}