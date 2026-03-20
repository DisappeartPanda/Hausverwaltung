alter table public.profiles
add column if not exists full_name text;

update public.profiles
set full_name = coalesce(nullif(full_name, ''), email, '')
where full_name is null or full_name = '';