alter table organizations enable row level security;
alter table profiles enable row level security;
alter table organization_members enable row level security;
alter table objects enable row level security;
alter table units enable row level security;
alter table tenants enable row level security;
alter table maintenance enable row level security;
alter table defects enable row level security;
alter table documents enable row level security;

create policy "profiles_select_own"
on profiles
for select
to authenticated
using (auth.uid() = id);

create policy "profiles_update_own"
on profiles
for update
to authenticated
using (auth.uid() = id);

create policy "organization_members_select_own"
on organization_members
for select
to authenticated
using (auth.uid() = user_id);

create policy "organizations_select_member"
on organizations
for select
to authenticated
using (
  exists (
    select 1
    from organization_members m
    where m.organization_id = organizations.id
      and m.user_id = auth.uid()
  )
);

create policy "objects_org_member"
on objects
for all
to authenticated
using (
  exists (
    select 1
    from organization_members m
    where m.organization_id = objects.organization_id
      and m.user_id = auth.uid()
  )
);

create policy "units_org_member"
on units
for all
to authenticated
using (
  exists (
    select 1
    from organization_members m
    where m.organization_id = units.organization_id
      and m.user_id = auth.uid()
  )
);

create policy "tenants_org_member"
on tenants
for all
to authenticated
using (
  exists (
    select 1
    from organization_members m
    where m.organization_id = tenants.organization_id
      and m.user_id = auth.uid()
  )
);

create policy "maintenance_org_member"
on maintenance
for all
to authenticated
using (
  exists (
    select 1
    from organization_members m
    where m.organization_id = maintenance.organization_id
      and m.user_id = auth.uid()
  )
);

create policy "defects_org_member"
on defects
for all
to authenticated
using (
  exists (
    select 1
    from organization_members m
    where m.organization_id = defects.organization_id
      and m.user_id = auth.uid()
  )
);

create policy "documents_org_member"
on documents
for all
to authenticated
using (
  exists (
    select 1
    from organization_members m
    where m.organization_id = documents.organization_id
      and m.user_id = auth.uid()
  )
);