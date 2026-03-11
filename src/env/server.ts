function requireServerEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Fehlende Server-Umgebungsvariable: ${name}`);
  }

  return value;
}

export const SUPABASE_URL = requireServerEnv(
  "SUPABASE_URL",
  import.meta.env.SUPABASE_URL ?? import.meta.env.PUBLIC_SUPABASE_URL,
);

export const SUPABASE_ANON_KEY = requireServerEnv(
  "SUPABASE_ANON_KEY",
  import.meta.env.SUPABASE_ANON_KEY ?? import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
);

export const SUPABASE_SERVICE_ROLE_KEY =
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const SUPABASE_DOCUMENTS_BUCKET = requireServerEnv(
  "SUPABASE_DOCUMENTS_BUCKET",
  import.meta.env.SUPABASE_DOCUMENTS_BUCKET,
);