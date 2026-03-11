insert into organizations (id, name)
values ('11111111-1111-1111-1111-111111111111', 'Musterverwaltung GmbH')
on conflict (id) do nothing;

insert into objects (
  id,
  organization_id,
  name,
  city,
  street,
  postal_code,
  unit_count
)
values (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'Musterstraße 12',
  'Berlin',
  'Musterstraße 12',
  '10115',
  3
)
on conflict (id) do nothing;

insert into units (
  id,
  organization_id,
  object_id,
  title,
  status
)
values
(
  '33333333-3333-3333-3333-333333333331',
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'WE 1.1',
  'vermietet'
),
(
  '33333333-3333-3333-3333-333333333332',
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'WE 1.2',
  'frei'
),
(
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'WE 2.1',
  'reserviert'
)
on conflict (id) do nothing;

insert into tenants (
  id,
  organization_id,
  unit_id,
  first_name,
  last_name,
  email,
  phone,
  move_in_date
)
values (
  '44444444-4444-4444-4444-444444444444',
  '11111111-1111-1111-1111-111111111111',
  '33333333-3333-3333-3333-333333333331',
  'Anna',
  'Becker',
  'anna.becker@example.com',
  '+49 151 12345678',
  '2025-01-01'
)
on conflict (id) do nothing;

insert into maintenance (
  id,
  organization_id,
  object_id,
  title,
  scheduled_date,
  status,
  note
)
values (
  '55555555-5555-5555-5555-555555555555',
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'Heizungswartung',
  '2026-04-15',
  'geplant',
  'Jährliche Wartung der Heizungsanlage'
)
on conflict (id) do nothing;

insert into defects (
  id,
  organization_id,
  object_id,
  unit_id,
  title,
  level,
  status,
  description
)
values (
  '66666666-6666-6666-6666-666666666666',
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333331',
  'Fenster zieht',
  'unit',
  'offen',
  'Im Schlafzimmer zieht es am Fenster.'
)
on conflict (id) do nothing;