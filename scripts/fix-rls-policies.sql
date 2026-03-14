begin;

alter table public.applications enable row level security;
alter table public.offers enable row level security;

do $$
declare
  policy_name text;
begin
  for policy_name in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'applications'
  loop
    execute format('drop policy if exists %I on public.applications', policy_name);
  end loop;

  for policy_name in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'offers'
  loop
    execute format('drop policy if exists %I on public.offers', policy_name);
  end loop;
end
$$;

create policy "applications_insert_anon"
  on public.applications
  for insert
  to anon
  with check (true);

create policy "applications_select_own_authenticated"
  on public.applications
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "offers_select_for_application_owner"
  on public.offers
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.applications
      where applications.id = offers.application_id
        and applications.user_id = auth.uid()
    )
  );

commit;
