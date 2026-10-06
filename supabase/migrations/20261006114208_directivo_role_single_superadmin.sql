alter type public.user_role rename value 'mesa_tecnica' to 'directivo';

update public.profiles p
set role = 'directivo'
from auth.users u
where u.id = p.id and u.email = 'crxmedia1+ligau@gmail.com';

create unique index profiles_single_superadmin on public.profiles ((role)) where role = 'superadmin';
