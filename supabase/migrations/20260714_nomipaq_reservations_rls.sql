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

do $$
begin
  if to_regclass('public.reservations') is not null then
    alter table public.reservations enable row level security;
    execute 'create index if not exists idx_reservations_user_id on public.reservations(user_id)';

    drop policy if exists reservations_user_select on public.reservations;
    create policy reservations_user_select on public.reservations
      for select to authenticated
      using (
        public.can_manage_nomipaq_agenda()
        or user_id = auth.uid()
        or user_id = public.current_profile_id()
      );

    drop policy if exists reservations_user_insert on public.reservations;
    create policy reservations_user_insert on public.reservations
      for insert to authenticated
      with check (
        user_id = auth.uid()
        or user_id = public.current_profile_id()
      );

    drop policy if exists reservations_user_update on public.reservations;
    create policy reservations_user_update on public.reservations
      for update to authenticated
      using (
        public.can_manage_nomipaq_agenda()
        or user_id = auth.uid()
        or user_id = public.current_profile_id()
      )
      with check (
        public.can_manage_nomipaq_agenda()
        or user_id = auth.uid()
        or user_id = public.current_profile_id()
      );

    drop policy if exists reservations_user_delete on public.reservations;
    create policy reservations_user_delete on public.reservations
      for delete to authenticated
      using (
        public.can_manage_nomipaq_agenda()
        or user_id = auth.uid()
        or user_id = public.current_profile_id()
      );
  end if;
end $$;

do $$
begin
  if to_regclass('public.reservation_logs') is not null then
    alter table public.reservation_logs enable row level security;
    execute 'create index if not exists idx_reservation_logs_reservation_id on public.reservation_logs(reservation_id)';

    drop policy if exists reservation_logs_user_select on public.reservation_logs;
    create policy reservation_logs_user_select on public.reservation_logs
      for select to authenticated
      using (
        public.can_manage_nomipaq_agenda()
        or exists (
          select 1
          from public.reservations r
          where r.id = reservation_id
            and (
              r.user_id = auth.uid()
              or r.user_id = public.current_profile_id()
            )
        )
      );

    drop policy if exists reservation_logs_user_insert on public.reservation_logs;
    create policy reservation_logs_user_insert on public.reservation_logs
      for insert to authenticated
      with check (
        public.can_manage_nomipaq_agenda()
        or exists (
          select 1
          from public.reservations r
          where r.id = reservation_id
            and (
              r.user_id = auth.uid()
              or r.user_id = public.current_profile_id()
            )
        )
      );
  end if;
end $$;

commit;
