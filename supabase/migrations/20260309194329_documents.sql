create table documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  target_type text not null,
  target_id uuid not null,
  title text not null,
  category text,
  file_name text not null,
  file_path text,
  file_size bigint,
  created_at timestamptz default now()
);