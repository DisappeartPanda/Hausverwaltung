import { createServiceRoleSupabaseClient } from "../../supabase/server";

export type CreateProfileInput = {
  userId: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  defaultRole?: "guest" | "tenant" | "landlord";
};

export async function createProfile(input: CreateProfileInput) {
  const supabase = createServiceRoleSupabaseClient();

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: input.userId,
      email: input.email ?? null,
      first_name: input.firstName ?? null,
      last_name: input.lastName ?? null,
      default_role: input.defaultRole ?? "guest",
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Profil konnte nicht erstellt werden.");
  }

  return data;
}