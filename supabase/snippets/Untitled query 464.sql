insert into public.organization_members (organization_id, user_id, role)
select 
  '4b33259d-48b1-4989-8510-5c4ac16f00d3',
  id,
  'owner'
from auth.users
where email = 'test@vermieter.de';