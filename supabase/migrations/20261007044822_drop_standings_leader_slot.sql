delete from public.sponsor_placements where slot = 'standings_leader';
alter table public.sponsor_placements drop constraint sponsor_placements_slot_check;
alter table public.sponsor_placements add constraint sponsor_placements_slot_check check (slot in (
  'home_flyer',
  'calendar_presenter',
  'calendar_matchday',
  'calendar_flyer',
  'standings_presenter',
  'standings_flyer'
));
