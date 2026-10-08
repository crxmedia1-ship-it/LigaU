insert into public.sports (name, slug, category_type) values
  ('Pádel', 'padel', 'colectivo'),
  ('eSports', 'esports', 'colectivo')
on conflict (slug) do nothing;
