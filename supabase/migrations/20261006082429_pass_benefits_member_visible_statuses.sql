alter policy pass_benefits_select_public on public.pass_benefits
  using (status in ('active','coming_soon','raffle') or private.is_superadmin());
