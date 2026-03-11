function requireClientEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Fehlende Client-Umgebungsvariable: ${name}`);
  }

  return value;
}

export const PUBLIC_SUPABASE_URL = requireClientEnv(
  "PUBLIC_SUPABASE_URL",
  import.meta.env.PUBLIC_SUPABASE_URL,
);

export const PUBLIC_SUPABASE_ANON_KEY = requireClientEnv(
  "PUBLIC_SUPABASE_ANON_KEY",
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
);