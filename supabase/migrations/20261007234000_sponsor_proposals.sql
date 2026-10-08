-- Sponsorship proposals. The public link is an unguessable token.
-- Narrative, packages and layout live in the app so every deck keeps the same DNA.

create table public.sponsor_proposals (
  id uuid primary key default gen_random_uuid(),
  token text not null unique check (token ~ '^[A-Za-z0-9_-]{16,64}$'),
  company_name text not null check (length(trim(company_name)) between 1 and 80),
  logo_url text,
  brand_color text check (brand_color is null or brand_color ~ '^#[0-9A-Fa-f]{6}$'),
  contact_name text check (contact_name is null or length(trim(contact_name)) between 1 and 80),
  note text check (note is null or length(note) <= 400),
  package_id text not null check (package_id in ('titulo', 'oficial', 'categoria', 'digital')),
  price_amount integer not null check (price_amount >= 0 and price_amount <= 10000000),
  price_caption text not null default 'Temporada 2026' check (length(trim(price_caption)) between 1 and 60),
  include_upass boolean not null default false,
  upass_price_amount integer check (
    upass_price_amount is null
    or (upass_price_amount >= 0 and upass_price_amount <= 10000000)
  ),
  valid_until date,
  status text not null default 'draft' check (status in ('draft', 'sent', 'accepted', 'archived')),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.sponsor_proposals is
  'Propuestas de patrocinio. El link público usa el token; el relato y los paquetes viven en la app.';

create trigger sponsor_proposals_set_updated_at
  before update on public.sponsor_proposals
  for each row execute function private.set_updated_at();

alter table public.sponsor_proposals enable row level security;

create policy sponsor_proposals_select_superadmin on public.sponsor_proposals
  for select to authenticated
  using ((select private.is_superadmin()));

create policy sponsor_proposals_insert_superadmin on public.sponsor_proposals
  for insert to authenticated
  with check ((select private.is_superadmin()));

create policy sponsor_proposals_update_superadmin on public.sponsor_proposals
  for update to authenticated
  using ((select private.is_superadmin()))
  with check ((select private.is_superadmin()));

create policy sponsor_proposals_delete_superadmin on public.sponsor_proposals
  for delete to authenticated
  using ((select private.is_superadmin()));

grant select, insert, update, delete on public.sponsor_proposals to authenticated;
grant all on public.sponsor_proposals to service_role;

-- One row by token. Callers cannot list the table.
create or replace function public.get_sponsor_proposal(lookup text)
returns setof public.sponsor_proposals
language sql
stable
security definer
set search_path to 'public'
as $$
  select *
  from public.sponsor_proposals
  where token = lookup
  limit 1;
$$;

revoke all on function public.get_sponsor_proposal(text) from public;
grant execute on function public.get_sponsor_proposal(text) to anon, authenticated;

comment on function public.get_sponsor_proposal(text) is
  'Devuelve una propuesta por su token. No lista la tabla.';
