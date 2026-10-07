-- Official league sponsors (not U Pass brands) and the site slots each one holds.
-- A slot has at most one sponsor: the slot is the primary key of sponsor_placements.

create table public.official_sponsors (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  logo_url text not null,
  logo_public_id text unique,
  brand_color text check (brand_color is null or brand_color ~ '^#[0-9A-Fa-f]{6}$'),
  link_url text,
  flyer_url text,
  starts_on date,
  ends_on date,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint official_sponsors_dates check (starts_on is null or ends_on is null or ends_on >= starts_on)
);

comment on table public.official_sponsors is 'Patrocinantes oficiales de la liga. Fuera de sus fechas no se muestran en el sitio.';

create trigger official_sponsors_set_updated_at before update on public.official_sponsors
  for each row execute function private.set_updated_at();

create table public.sponsor_placements (
  slot text primary key check (slot in (
    'home_flyer',
    'calendar_presenter',
    'calendar_matchday',
    'calendar_flyer',
    'standings_presenter',
    'standings_leader',
    'standings_flyer'
  )),
  sponsor_id uuid not null references public.official_sponsors (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index sponsor_placements_sponsor_idx on public.sponsor_placements (sponsor_id);

comment on table public.sponsor_placements is 'Espacio del sitio -> patrocinante. Un espacio es exclusivo de una marca.';

alter table public.official_sponsors enable row level security;
alter table public.sponsor_placements enable row level security;

create policy official_sponsors_select_anon on public.official_sponsors for select to anon
  using ((starts_on is null or starts_on <= current_date) and (ends_on is null or ends_on >= current_date));
create policy official_sponsors_select_authenticated on public.official_sponsors for select to authenticated
  using (
    ((starts_on is null or starts_on <= current_date) and (ends_on is null or ends_on >= current_date))
    or (select private.is_superadmin())
  );
create policy official_sponsors_insert_superadmin on public.official_sponsors for insert to authenticated
  with check ((select private.is_superadmin()));
create policy official_sponsors_update_superadmin on public.official_sponsors for update to authenticated
  using ((select private.is_superadmin())) with check ((select private.is_superadmin()));
create policy official_sponsors_delete_superadmin on public.official_sponsors for delete to authenticated
  using ((select private.is_superadmin()));

create policy sponsor_placements_select_public on public.sponsor_placements for select to anon, authenticated
  using (true);
create policy sponsor_placements_insert_superadmin on public.sponsor_placements for insert to authenticated
  with check ((select private.is_superadmin()));
create policy sponsor_placements_update_superadmin on public.sponsor_placements for update to authenticated
  using ((select private.is_superadmin())) with check ((select private.is_superadmin()));
create policy sponsor_placements_delete_superadmin on public.sponsor_placements for delete to authenticated
  using ((select private.is_superadmin()));

grant select on public.official_sponsors, public.sponsor_placements to anon;
grant select, insert, update, delete on public.official_sponsors, public.sponsor_placements to authenticated;
grant all on public.official_sponsors, public.sponsor_placements to service_role;

-- Existing logos from the Cloudinary sponsors folder, with the slots they held by list position.
insert into public.official_sponsors (name, logo_url, logo_public_id, brand_color, link_url, flyer_url, sort_order)
values
  ('Champion', 'https://res.cloudinary.com/pjhr5afk/image/upload/v1790823214/ligau/logo%20patrocinadores/champions.svg', 'ligau/logo patrocinadores/champions', '#1B2A6B', 'https://www.champion.com', '/flyers/champion.webp', 0),
  ('Cinex', 'https://res.cloudinary.com/pjhr5afk/image/upload/v1790823223/ligau/logo%20patrocinadores/cinex.svg', 'ligau/logo patrocinadores/cinex', '#6D89BE', null, null, 1),
  ('Gatorade', 'https://res.cloudinary.com/pjhr5afk/image/upload/v1790823226/ligau/logo%20patrocinadores/gatorade.svg', 'ligau/logo patrocinadores/gatorade', '#FE3C3F', null, null, 2),
  ('Maltín Polar', 'https://res.cloudinary.com/pjhr5afk/image/upload/v1790823218/ligau/logo%20patrocinadores/maltin-polar.svg', 'ligau/logo patrocinadores/maltin-polar', '#02A953', null, null, 3),
  ('Minalba', 'https://res.cloudinary.com/pjhr5afk/image/upload/v1790823217/ligau/logo%20patrocinadores/minalba.svg', 'ligau/logo patrocinadores/minalba', '#2F3193', null, null, 4),
  ('Movistar', 'https://res.cloudinary.com/pjhr5afk/image/upload/v1790823225/ligau/logo%20patrocinadores/movistar.svg', 'ligau/logo patrocinadores/movistar', '#009EF7', null, null, 5),
  ('PAN', 'https://res.cloudinary.com/pjhr5afk/image/upload/v1790823221/ligau/logo%20patrocinadores/pan.svg', 'ligau/logo patrocinadores/pan', '#0B2456', null, null, 6),
  ('Pepsi', 'https://res.cloudinary.com/pjhr5afk/image/upload/v1790823228/ligau/logo%20patrocinadores/pepsi.svg', 'ligau/logo patrocinadores/pepsi', '#040A3A', null, null, 7);

insert into public.sponsor_placements (slot, sponsor_id)
select v.slot, s.id
from (values
  ('home_flyer', 'Champion'),
  ('calendar_presenter', 'Cinex'),
  ('calendar_matchday', 'Gatorade'),
  ('calendar_flyer', 'Maltín Polar'),
  ('standings_presenter', 'Gatorade'),
  ('standings_leader', 'Maltín Polar'),
  ('standings_flyer', 'Cinex')
) as v(slot, name)
join public.official_sponsors s on s.name = v.name;
