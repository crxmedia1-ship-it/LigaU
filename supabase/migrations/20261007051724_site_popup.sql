create table public.site_popup (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  title text check (char_length(title) <= 80),
  link_url text,
  is_active boolean not null default true,
  starts_on date,
  ends_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_popup_dates check (starts_on is null or ends_on is null or ends_on >= starts_on)
);

comment on table public.site_popup is 'Pop-up que se muestra al abrir el sitio público. Solo se usa la fila más reciente.';

create trigger site_popup_set_updated_at before update on public.site_popup
  for each row execute function private.set_updated_at();

alter table public.site_popup enable row level security;

create policy site_popup_select_public on public.site_popup for select to anon, authenticated using (true);
create policy site_popup_insert_staff on public.site_popup for insert to authenticated with check ((select private.is_staff()));
create policy site_popup_update_staff on public.site_popup for update to authenticated using ((select private.is_staff())) with check ((select private.is_staff()));
create policy site_popup_delete_staff on public.site_popup for delete to authenticated using ((select private.is_staff()));

grant select on public.site_popup to anon, authenticated;
grant insert, update, delete on public.site_popup to authenticated;
grant all on public.site_popup to service_role;
