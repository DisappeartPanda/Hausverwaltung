-- ============================================================
-- IMMOBILIENPRO - KORRIGIERTES SCHEMA
-- ============================================================

-- Extensions
create extension if not exists "pgcrypto";

-- ============================================================
-- ENUMS (Typ-Sicherheit)
-- ============================================================

create type org_role as enum ('owner', 'admin', 'member', 'viewer', 'tenant');
create type unit_status as enum ('frei', 'vermietet', 'reserviert', 'renovierung');
create type task_status as enum ('offen', 'in_bearbeitung', 'wartend', 'erledigt', 'abgebrochen');
create type priority_level as enum ('niedrig', 'mittel', 'hoch', 'kritisch');
create type document_target_type as enum ('object', 'unit', 'tenant', 'maintenance', 'defect', 'organization');

-- ============================================================
-- TABELLEN
-- ============================================================

-- Organisationen
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) >= 2 and length(name) <= 100),
  billing_email text,
  theme text default 'dark-green',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz  -- Soft Delete
);

-- Profile (erweiterte User-Daten)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text check (length(full_name) <= 100),
  phone text check (phone is null or length(phone) between 8 and 20),
  avatar_url text,
  email_verified boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Organisations-Mitgliedschaften
create table organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role org_role not null default 'member',
  is_default boolean default false,
  invited_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  unique(organization_id, user_id)  -- Ein User = Einmal pro Org
);

-- Objekte (Gebäude)
create table objects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null check (length(name) >= 2 and length(name) <= 100),
  city text not null check (length(city) >= 2),
  street text check (street is null or length(street) >= 2),
  postal_code text check (postal_code is null or length(postal_code) >= 4),
  construction_year integer check (construction_year between 1800 and 2100),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

-- Wohneinheiten
create table units (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  object_id uuid references objects(id) on delete set null,
  title text not null check (length(title) >= 2 and length(title) <= 100),
  floor text,
  size_sqm numeric(10,2) check (size_sqm > 0),
  rooms numeric(3,1) check (rooms > 0),
  cold_rent numeric(10,2) check (cold_rent >= 0),
  nebenkosten numeric(10,2) check (nebenkosten >= 0),
  status unit_status default 'frei',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

-- Mieter
create table tenants (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  unit_id uuid references units(id) on delete set null,
  auth_user_id uuid references auth.users(id) on delete set null,  -- Für Mieter-Portal Login
  first_name text not null check (length(first_name) >= 2),
  last_name text not null check (length(last_name) >= 2),
  email text not null,
  phone text check (phone is null or length(phone) between 8 and 20),
  date_of_birth date,
  move_in_date date,
  move_out_date date,
  deposit_amount numeric(10,2) check (deposit_amount >= 0),
  deposit_paid boolean default false,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz,
  
  constraint valid_email check (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  constraint move_out_after_move_in check (move_out_date is null or move_out_date > move_in_date)
);

-- Wartungen
create table maintenance (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  object_id uuid references objects(id) on delete set null,
  unit_id uuid references units(id) on delete set null,
  title text not null check (length(title) >= 3),
  description text,
  scheduled_date date not null,
  completed_date date,
  status task_status default 'offen',
  priority priority_level default 'mittel',
  estimated_cost numeric(10,2) check (estimated_cost >= 0),
  actual_cost numeric(10,2) check (actual_cost >= 0),
  assigned_to uuid references profiles(id) on delete set null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz,
  
  constraint completed_after_scheduled check (completed_date is null or completed_date >= scheduled_date)
);

-- Mängel
create table defects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  object_id uuid references objects(id) on delete set null,
  unit_id uuid references units(id) on delete set null,
  title text not null check (length(title) >= 3),
  description text,
  level priority_level not null default 'mittel',
  status task_status default 'offen',
  reported_by uuid references auth.users(id) on delete set null,  -- Mieter oder Mitarbeiter
  reported_at timestamptz default now(),
  resolved_at timestamptz,
  resolved_by uuid references auth.users(id) on delete set null,
  assigned_to uuid references profiles(id) on delete set null,
  images text[],  -- Array von Storage-URLs
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timamazptz
);

-- Dokumente
create table documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  target_type document_target_type not null,
  target_id uuid not null,  -- Polymorphe Referenz (kein FK, geprüft via Trigger)
  uploaded_by uuid not null references auth.users(id),
  title text not null check (length(title) >= 2),
  category text,
  file_name text not null,
  file_path text not null,  -- Supabase Storage Pfad
  file_size bigint check (file_size > 0),
  mime_type text,
  is_public boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

-- ============================================================
-- INDEXE (Performance)
-- ============================================================

create index idx_organizations_name on organizations(name);
create index idx_profiles_email on profiles(email);
create index idx_organization_members_user_id on organization_members(user_id);
create index idx_organization_members_org_id on organization_members(organization_id);
create index idx_objects_org_id on objects(organization_id) where deleted_at is null;
create index idx_objects_city on objects(city);
create index idx_units_object_id on units(object_id) where deleted_at is null;
create index idx_units_org_id on units(organization_id) where deleted_at is null;
create index idx_units_status on units(status) where deleted_at is null;
create index idx_tenants_org_id on tenants(organization_id) where deleted_at is null;
create index idx_tenants_unit_id on tenants(unit_id) where deleted_at is null;
create index idx_tenants_auth_user_id on tenants(auth_user_id);
create index idx_maintenance_org_id on maintenance(organization_id) where deleted_at is null;
create index idx_maintenance_scheduled on maintenance(scheduled_date) where status != 'erledigt';
create index idx_defects_org_id on defects(organization_id) where deleted_at is null;
create index idx_defects_status on defects(status) where deleted_at is null;
create index idx_documents_org_id on documents(organization_id) where deleted_at is null;
create index idx_documents_target on documents(target_type, target_id) where deleted_at is null;

-- ============================================================
-- RLS AKTIVIEREN
-- ============================================================

alter table organizations enable row level security;
alter table profiles enable row level security;
alter table organization_members enable row level security;
alter table objects enable row level security;
alter table units enable row level security;
alter table tenants enable row level security;
alter table maintenance enable row level security;
alter table defects enable row level security;
alter table documents enable row level security;

-- ============================================================
-- RLS POLICIES - PROFILES
-- ============================================================

create policy "profiles_select_own"
on profiles
for select
to authenticated
using (auth.uid() = id);

create policy "profiles_select_org_member"
on profiles
for select
to authenticated
using (
  exists (
    select 1 from organization_members om
    join organization_members om2 on om.organization_id = om2.organization_id
    where om.user_id = profiles.id
    and om2.user_id = auth.uid()
  )
);

create policy "profiles_insert_self"
on profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "profiles_update_own"
on profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- ============================================================
-- RLS POLICIES - ORGANIZATIONS
-- ============================================================

create policy "organizations_select_member"
on organizations
for select
to authenticated
using (
  exists (
    select 1 from organization_members
    where organization_id = organizations.id
    and user_id = auth.uid()
    and deleted_at is null
  )
);

create policy "organizations_insert"
on organizations
for insert
to authenticated
with check (true);  -- Trigger prüft ob User bereits Owner ist

create policy "organizations_update_owner"
on organizations
for update
to authenticated
using (
  exists (
    select 1 from organization_members
    where organization_id = organizations.id
    and user_id = auth.uid()
    and role = 'owner'
    and deleted_at is null
  )
)
with check (
  exists (
    select 1 from organization_members
    where organization_id = organizations.id
    and user_id = auth.uid()
    and role = 'owner'
    and deleted_at is null
  )
);

create policy "organizations_delete_owner"
on organizations
for delete
to authenticated
using (
  exists (
    select 1 from organization_members
    where organization_id = organizations.id
    and user_id = auth.uid()
    and role = 'owner'
    and deleted_at is null
  )
);

-- ============================================================
-- RLS POLICIES - ORGANIZATION_MEMBERS
-- ============================================================

create policy "org_members_select_own_or_org"
on organization_members
for select
to authenticated
using (
  user_id = auth.uid() or
  exists (
    select 1 from organization_members om
    where om.organization_id = organization_members.organization_id
    and om.user_id = auth.uid()
    and om.deleted_at is null
  )
);

create policy "org_members_insert_owner"
on organization_members
for insert
to authenticated
with check (
  exists (
    select 1 from organization_members
    where organization_id = organization_members.organization_id
    and user_id = auth.uid()
    and role in ('owner', 'admin')
    and deleted_at is null
  )
);

create policy "org_members_update_owner"
on organization_members
for update
to authenticated
using (
  exists (
    select 1 from organization_members
    where organization_id = organization_members.organization_id
    and user_id = auth.uid()
    and role = 'owner'
    and deleted_at is null
  )
);

create policy "org_members_delete_owner"
on organization_members
for delete
to authenticated
using (
  exists (
    select 1 from organization_members
    where organization_id = organization_members.organization_id
    and user_id = auth.uid()
    and role = 'owner'
    and deleted_at is null
  ) or user_id = auth.uid()  -- Selbst austreten erlaubt
);

-- ============================================================
-- RLS POLICIES - OBJECTS
-- ============================================================

create policy "objects_select_member"
on objects
for select
to authenticated
using (
  exists (
    select 1 from organization_members
    where organization_id = objects.organization_id
    and user_id = auth.uid()
    and deleted_at is null
  )
  and deleted_at is null
);

create policy "objects_insert_member"
on objects
for insert
to authenticated
with check (
  exists (
    select 1 from organization_members
    where organization_id = objects.organization_id
    and user_id = auth.uid()
    and role in ('owner', 'admin')
    and deleted_at is null
  )
);

create policy "objects_update_member"
on objects
for update
to authenticated
using (
  exists (
    select 1 from organization_members
    where organization_id = objects.organization_id
    and user_id = auth.uid()
    and role in ('owner', 'admin')
    and deleted_at is null
  )
  and deleted_at is null
);

create policy "objects_delete_member"
on objects
for delete
to authenticated
using (
  exists (
    select 1 from organization_members
    where organization_id = objects.organization_id
    and user_id = auth.uid()
    and role in ('owner', 'admin')
    and deleted_at is null
  )
);

-- ============================================================
-- RLS POLICIES - UNITS (gleiches Pattern)
-- ============================================================

create policy "units_select_member"
on units
for select
to authenticated
using (
  exists (
    select 1 from organization_members
    where organization_id = units.organization_id
    and user_id = auth.uid()
    and deleted_at is null
  )
  and deleted_at is null
);

create policy "units_insert_member"
on units
for insert
to authenticated
with check (
  exists (
    select 1 from organization_members
    where organization_id = units.organization_id
    and user_id = auth.uid()
    and role in ('owner', 'admin')
    and deleted_at is null
  )
);

create policy "units_update_member"
on units
for update
to authenticated
using (
  exists (
    select 1 from organization_members
    where organization_id = units.organization_id
    and user_id = auth.uid()
    and role in ('owner', 'admin', 'member')
    and deleted_at is null
  )
  and deleted_at is null
);

create policy "units_delete_member"
on units
for delete
to authenticated
using (
  exists (
    select 1 from organization_members
    where organization_id = units.organization_id
    and user_id = auth.uid()
    and role in ('owner', 'admin')
    and deleted_at is null
  )
);

-- ============================================================
-- RLS POLICIES - TENANTS
-- ============================================================

create policy "tenants_select_member"
on tenants
for select
to authenticated
using (
  exists (
    select 1 from organization_members
    where organization_id = tenants.organization_id
    and user_id = auth.uid()
    and deleted_at is null
  )
  and deleted_at is null
);

create policy "tenants_select_own"
on tenants
for select
to authenticated
using (auth_user_id = auth.uid() and deleted_at is null);

create policy "tenants_insert_member"
on tenants
for insert
to authenticated
with check (
  exists (
    select 1 from organization_members
    where organization_id = tenants.organization_id
    and user_id = auth.uid()
    and role in ('owner', 'admin', 'member')
    and deleted_at is null
  )
);

create policy "tenants_update_member"
on tenants
for update
to authenticated
using (
  exists (
    select 1 from organization_members
    where organization_id = tenants.organization_id
    and user_id = auth.uid()
    and role in ('owner', 'admin', 'member')
    and deleted_at is null
  )
  and deleted_at is null
);

create policy "tenants_delete_member"
on tenants
for delete
to authenticated
using (
  exists (
    select 1 from organization_members
    where organization_id = tenants.organization_id
    and user_id = auth.uid()
    and role in ('owner', 'admin')
    and deleted_at is null
  )
);

-- ============================================================
-- RLS POLICIES - MAINTENANCE
-- ============================================================

create policy "maintenance_select_member"
on maintenance
for select
to authenticated
using (
  exists (
    select 1 from organization_members
    where organization_id = maintenance.organization_id
    and user_id = auth.uid()
    and deleted_at is null
  )
  and deleted_at is null
);

create policy "maintenance_insert_member"
on maintenance
for insert
to authenticated
with check (
  exists (
    select 1 from organization_members
    where organization_id = maintenance.organization_id
    and user_id = auth.uid()
    and role in ('owner', 'admin', 'member')
    and deleted_at is null
  )
);

create policy "maintenance_update_member"
on maintenance
for update
to authenticated
using (
  exists (
    select 1 from organization_members
    where organization_id = maintenance.organization_id
    and user_id = auth.uid()
    and role in ('owner', 'admin', 'member')
    and deleted_at is null
  )
  and deleted_at is null
);

create policy "maintenance_delete_member"
on maintenance
for delete
to authenticated
using (
  exists (
    select 1 from organization_members
    where organization_id = maintenance.organization_id
    and user_id = auth.uid()
    and role in ('owner', 'admin')
    and deleted_at is null
  )
);

-- ============================================================
-- RLS POLICIES - DEFECTS
-- ============================================================

create policy "defects_select_member"
on defects
for select
to authenticated
using (
  exists (
    select 1 from organization_members
    where organization_id = defects.organization_id
    and user_id = auth.uid()
    and deleted_at is null
  )
  and deleted_at is null
);

create policy "defects_select_own"
on defects
for select
to authenticated
using (reported_by = auth.uid() and deleted_at is null);

create policy "defects_insert_member"
on defects
for insert
to authenticated
with check (
  exists (
    select 1 from organization_members
    where organization_id = defects.organization_id
    and user_id = auth.uid()
    and deleted_at is null
  )
);

create policy "defects_update_member"
on defects
for update
to authenticated
using (
  exists (
    select 1 from organization_members
    where organization_id = defects.organization_id
    and user_id = auth.uid()
    and deleted_at is null
  )
  and deleted_at is null
);

create policy "defects_delete_member"
on defects
for delete
to authenticated
using (
  exists (
    select 1 from organization_members
    where organization_id = defects.organization_id
    and user_id = auth.uid()
    and role in ('owner', 'admin')
    and deleted_at is null
  )
);

-- ============================================================
-- RLS POLICIES - DOCUMENTS
-- ============================================================

create policy "documents_select_member"
on documents
for select
to authenticated
using (
  exists (
    select 1 from organization_members
    where organization_id = documents.organization_id
    and user_id = auth.uid()
    and deleted_at is null
  )
  and deleted_at is null
);

create policy "documents_insert_member"
on documents
for insert
to authenticated
with check (
  exists (
    select 1 from organization_members
    where organization_id = documents.organization_id
    and user_id = auth.uid()
    and deleted_at is null
  )
);

create policy "documents_update_member"
on documents
for update
to authenticated
using (
  exists (
    select 1 from organization_members
    where organization_id = documents.organization_id
    and user_id = auth.uid()
    and deleted_at is null
  )
  and deleted_at is null
);

create policy "documents_delete_member"
on documents
for delete
to authenticated
using (
  exists (
    select 1 from organization_members
    where organization_id = documents.organization_id
    and user_id = auth.uid()
    and role in ('owner', 'admin')
    and deleted_at is null
  )
);

-- ============================================================
-- TRIGGER FUNKTIONEN
-- ============================================================

-- Automatisches updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger für alle Tabellen mit updated_at
create trigger set_updated_at_organizations
  before update on organizations
  for each row execute function set_updated_at();

create trigger set_updated_at_profiles
  before update on profiles
  for each row execute function set_updated_at();

create trigger set_updated_at_organization_members
  before update on organization_members
  for each row execute function set_updated_at();

create trigger set_updated_at_objects
  before update on objects
  for each row execute function set_updated_at();

create trigger set_updated_at_units
  before update on units
  for each row execute function set_updated_at();

create trigger set_updated_at_tenants
  before update on tenants
  for each row execute function set_updated_at();

create trigger set_updated_at_maintenance
  before update on maintenance
  for each row execute function set_updated_at();

create trigger set_updated_at_defects
  before update on defects
  for each row execute function set_updated_at();

create trigger set_updated_at_documents
  before update on documents
  for each row execute function set_updated_at();

-- ============================================================
-- USER REGISTRATION HANDLER
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_org_id uuid;
  meta_full_name text;
  meta_role text;
  meta_org_name text;
begin
  -- Metadaten extrahieren
  meta_full_name := coalesce(new.raw_user_meta_data->>'full_name', '');
  meta_role := coalesce(new.raw_user_meta_data->>'role', 'landlord');
  meta_org_name := coalesce(new.raw_user_meta_data->>'organization_name', 'Meine Organisation');

  -- Profile erstellen
  insert into public.profiles (id, email, full_name, email_verified)
  values (
    new.id, 
    new.email, 
    case when length(meta_full_name) > 0 then meta_full_name end,
    coalesce(new.email_confirmed_at is not null, false)
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name);

  -- Rolle in app_metadata speichern (sicher, nicht manipulierbar)
  update auth.users
  set raw_app_meta_data = jsonb_build_object(
    'role', meta_role,
    'organization_name', meta_org_name
  )
  where id = new.id;

  -- Nur für Landlords: Organisation erstellen
  if meta_role = 'landlord' then
    -- Prüfe ob User bereits eine Org hat
    if not exists (
      select 1 from organization_members 
      where user_id = new.id and role = 'owner'
    ) then
      insert into public.organizations (name, billing_email)
      values (meta_org_name, new.email)
      returning id into new_org_id;

      insert into public.organization_members (
        organization_id, 
        user_id, 
        role, 
        is_default
      )
      values (new_org_id, new.id, 'owner', true);
    end if;
  end if;

  return new;
end;
$$;

-- Trigger registrieren
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ============================================================
-- SICHERHEITSFUNKTION: Prüfe ob User Owner ist
-- ============================================================

create or replace function public.user_is_org_owner(user_uuid uuid, org_uuid uuid)
returns boolean
language sql
security definer
as $$
  select exists (
    select 1 from organization_members
    where user_id = user_uuid
    and organization_id = org_uuid
    and role = 'owner'
    and deleted_at is null
  );
$$;

-- ============================================================
-- SICHERHEITSFUNKTION: Weiche Organisation für User
-- ============================================================

create or replace function public.get_user_default_org(user_uuid uuid)
returns uuid
language sql
security definer
as $$
  select organization_id from organization_members
  where user_id = user_uuid
  and is_default = true
  and deleted_at is null
  limit 1;
$$;