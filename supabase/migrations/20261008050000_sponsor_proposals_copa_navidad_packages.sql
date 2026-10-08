alter table public.sponsor_proposals
  drop constraint sponsor_proposals_package_id_check;

alter table public.sponsor_proposals
  add constraint sponsor_proposals_package_id_check check (
    package_id in ('suma-cum-laudem', 'cum-laudem', 'aprobado', 'titulo', 'oficial', 'categoria', 'digital')
  );
