drop policy if exists pass_benefits_select_public on public.pass_benefits;
create policy pass_benefits_select_public on public.pass_benefits for select to anon, authenticated
  using (status in ('active','coming_soon','raffle'));
create policy pass_benefits_select_superadmin on public.pass_benefits for select to authenticated
  using (private.is_superadmin());

drop policy if exists pass_sponsors_select_public on public.pass_sponsors;
create policy pass_sponsors_select_public on public.pass_sponsors for select to anon, authenticated
  using (is_active = true);
create policy pass_sponsors_select_superadmin on public.pass_sponsors for select to authenticated
  using (private.is_superadmin());
