alter table public.official_sponsors add column tagline text check (tagline is null or length(tagline) <= 40);
update public.official_sponsors set tagline = 'Indumentaria oficial' where name = 'Champion';
update public.official_sponsors set tagline = 'Hidratación oficial' where name = 'Gatorade';
update public.official_sponsors set tagline = 'Cine oficial' where name = 'Cinex';
update public.official_sponsors set tagline = 'Bebida oficial' where name = 'Maltín Polar';
