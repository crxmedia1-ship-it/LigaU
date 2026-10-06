create table public.media_videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  kind text not null default 'highlight' check (kind in ('highlight','entrevista','resumen','video')),
  video_url text not null,
  thumbnail_url text,
  sport_id uuid references public.sports(id) on delete set null,
  description text,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index media_videos_published_idx on public.media_videos (published_at desc);
create index media_videos_sport_idx on public.media_videos (sport_id);
alter table public.media_videos enable row level security;
create policy media_videos_select_public on public.media_videos for select to anon, authenticated using (true);
create policy media_videos_insert_staff on public.media_videos for insert to authenticated with check (private.is_staff());
create policy media_videos_update_staff on public.media_videos for update to authenticated using (private.is_staff()) with check (private.is_staff());
create policy media_videos_delete_staff on public.media_videos for delete to authenticated using (private.is_staff());
grant select on public.media_videos to anon, authenticated;
grant insert, update, delete on public.media_videos to authenticated;
grant all on public.media_videos to service_role;
insert into public.media_videos (title, kind, video_url, sport_id, description, published_at)
select 'UCV 2-1 UCAB · Resumen del partido', 'highlight', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', id, 'Los goles de Andrés Rivas y Carlos Mendoza en la Fase de grupos.', '2026-10-04T20:00:00Z' from public.sports where slug = 'futbol-campo';
