import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Es fehlen PUBLIC_SUPABASE_URL oder SUPABASE_SERVICE_ROLE_KEY in den Umgebungsvariablen."
  );
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

type TestTenantSeed = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName: string;
};

const tenants: TestTenantSeed[] = [
  {
    email: "mieter1@example.com",
    password: "Test1234!",
    firstName: "Max",
    lastName: "Mieter",
    organizationName: "Demo Hausverwaltung"
  },
  {
    email: "mieter2@example.com",
    password: "Test1234!",
    firstName: "Sofia",
    lastName: "Beispiel",
    organizationName: "Demo Hausverwaltung"
  }
];

async function seedTenant(tenant: TestTenantSeed): Promise<void> {
  const { data, error } = await supabase.auth.admin.createUser({
    email: tenant.email,
    password: tenant.password,
    email_confirm: true,
    user_metadata: {
      first_name: tenant.firstName,
      last_name: tenant.lastName,
      role: "tenant",
      organization_name: tenant.organizationName
    }
  });

  if (error) {
    console.error(`Fehler bei ${tenant.email}:`, error.message);
    return;
  }

  console.log(`Tenant erstellt: ${tenant.email}`, data.user?.id ?? "");
}

async function main(): Promise<void> {
  for (const tenant of tenants) {
    await seedTenant(tenant);
  }

  console.log("Seed abgeschlossen.");
}

main().catch((error) => {
  console.error("Seed fehlgeschlagen:", error);
  process.exit(1);
});