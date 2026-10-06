-- Auth calls wrapped in (select …) run once per query instead of once per row, and each
-- role gets a single permissive policy per action. anon has no execute on private.*.

drop policy if exists profiles_select_own_or_staff on public.profiles;
create policy profiles_select_own_or_staff on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select private.is_staff()));

drop policy if exists profiles_update_own on public.profiles;
drop policy if exists profiles_update_superadmin on public.profiles;
create policy profiles_update_own_or_superadmin on public.profiles for update to authenticated
  using (id = (select auth.uid()) or (select private.is_superadmin()))
  with check (
    (id = (select auth.uid()) and role is not distinct from (select private.current_user_role()))
    or (select private.is_superadmin())
  );

drop policy if exists pass_benefits_select_public on public.pass_benefits;
drop policy if exists pass_benefits_select_superadmin on public.pass_benefits;
create policy pass_benefits_select_anon on public.pass_benefits for select to anon
  using (status in ('active','coming_soon','raffle'));
create policy pass_benefits_select_authenticated on public.pass_benefits for select to authenticated
  using (status in ('active','coming_soon','raffle') or (select private.is_superadmin()));

drop policy if exists pass_sponsors_select_public on public.pass_sponsors;
drop policy if exists pass_sponsors_select_superadmin on public.pass_sponsors;
create policy pass_sponsors_select_anon on public.pass_sponsors for select to anon
  using (is_active = true);
create policy pass_sponsors_select_authenticated on public.pass_sponsors for select to authenticated
  using (is_active = true or (select private.is_superadmin()));
