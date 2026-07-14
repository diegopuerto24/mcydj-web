begin;

create or replace function public.can_manage_nomipaq_agenda()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = public.current_profile_id()
      and coalesce(p.activo, true) = true
      and lower(coalesce(p.rol, '')) in ('director', 'director_general', 'sistemas')
  );
$$;

commit;
