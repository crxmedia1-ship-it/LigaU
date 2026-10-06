alter table public.pass_sponsors add column if not exists brand_color text check (brand_color is null or brand_color ~ '^#[0-9A-Fa-f]{6}$');
update public.pass_sponsors set brand_color = v.c from (values ('Mizuno','#001E96'),('Wilson','#D50032'),('Champion','#1B2A6B'),('New Balance','#CF0A2C'),('CarnetX','#18181B')) v(n,c) where name = v.n;
