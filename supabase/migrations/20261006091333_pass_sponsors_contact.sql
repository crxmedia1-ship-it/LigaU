alter table public.pass_sponsors add column if not exists contact jsonb not null default '{}'::jsonb;
