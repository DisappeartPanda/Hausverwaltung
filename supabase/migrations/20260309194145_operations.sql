create table maintenance (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  object_id uuid references objects(id) on delete set null,
  title text not null,
  scheduled_date date,
  status text not null default 'offen',
  note text,
  created_at timestamptz default now()
);

create table defects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  object_id uuid references objects(id) on delete set null,
  unit_id uuid references units(id) on delete set null,
  title text not null,
  level text not null,
  status text not null default 'offen',
  description text,
  created_at timestamptz default now()
);