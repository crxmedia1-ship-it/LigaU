alter table public.athletes
  add column if not exists person_id uuid not null default gen_random_uuid(),
  add column if not exists dominant_side text check (dominant_side in ('right','left','both'));
create index if not exists athletes_person_id_idx on public.athletes(person_id);
create unique index if not exists athletes_person_team_uniq on public.athletes(person_id, team_id);
