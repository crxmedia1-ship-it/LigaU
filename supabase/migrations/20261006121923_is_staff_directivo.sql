create or replace function private.is_staff()
 returns boolean
 language sql
 stable security definer
 set search_path to 'public'
as $function$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('superadmin'::public.user_role, 'directivo'::public.user_role)
  );
$function$;

comment on table public.profiles is 'Perfiles de usuarios autenticados. El rol staff (superadmin único / directivo) se asigna desde el panel; nunca desde user_metadata.';
