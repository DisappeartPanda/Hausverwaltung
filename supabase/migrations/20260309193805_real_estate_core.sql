create table objects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  city text not null,
  street text,
  postal_code text,
  unit_count integer default 0,
  created_at timestamptz default now()
);

create table units (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  object_id uuid references objects(id) on delete set null,
  title text not null,
  status text default 'frei',
  created_at timestamptz default now()
);

create table tenants (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  unit_id uuid references units(id) on delete set null,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  move_in_date date,
  created_at timestamptz default now()
);