-- Categories
insert into public.categories (name, slug, icon_url) values
  ('Mobile Legends', 'mobile-legends', null),
  ('PUBG Mobile', 'pubg-mobile', null),
  ('Free Fire', 'free-fire', null),
  ('Genshin Impact', 'genshin-impact', null),
  ('Valorant', 'valorant', null);

-- Sample products
insert into public.products (name, description, price, stock, status, product_type, category_id, image_url)
select 'Akun MLBB Mythic Glory 100 Hero', 'Akun lengkap dengan 100+ hero, 50+ skin epic, rank Mythic Glory season ini.', 2500000, 1, 'AVAILABLE', 'ACCOUNT', id, null
from public.categories where slug = 'mobile-legends';

insert into public.products (name, description, price, stock, status, product_type, category_id, image_url)
select 'Top Up Diamond MLBB 86 DM', 'Top up langsung ke akun Anda. Cukup masukkan User ID & Server ID.', 22000, 999, 'AVAILABLE', 'TOPUP', id, null
from public.categories where slug = 'mobile-legends';

insert into public.products (name, description, price, stock, status, product_type, category_id, image_url)
select 'Top Up Diamond MLBB 172 DM', 'Top up langsung ke akun Anda.', 43000, 999, 'AVAILABLE', 'TOPUP', id, null
from public.categories where slug = 'mobile-legends';

insert into public.products (name, description, price, stock, status, product_type, category_id, image_url)
select 'Akun PUBG Conqueror Asia', 'Akun PUBG Mobile Conqueror Asia, 50+ skin senjata mythic.', 4500000, 1, 'AVAILABLE', 'ACCOUNT', id, null
from public.categories where slug = 'pubg-mobile';

insert into public.products (name, description, price, stock, status, product_type, category_id, image_url)
select 'Top Up UC PUBG 60 UC', 'UC PUBG Mobile langsung ke akun Anda.', 15000, 999, 'AVAILABLE', 'TOPUP', id, null
from public.categories where slug = 'pubg-mobile';

insert into public.products (name, description, price, stock, status, product_type, category_id, image_url)
select 'Top Up UC PUBG 325 UC', 'UC PUBG Mobile langsung ke akun Anda.', 75000, 999, 'AVAILABLE', 'TOPUP', id, null
from public.categories where slug = 'pubg-mobile';

insert into public.products (name, description, price, stock, status, product_type, category_id, image_url)
select 'Akun Free Fire Grandmaster', 'Akun Free Fire Grandmaster, bundle lengkap.', 1800000, 2, 'AVAILABLE', 'ACCOUNT', id, null
from public.categories where slug = 'free-fire';

insert into public.products (name, description, price, stock, status, product_type, category_id, image_url)
select 'Top Up Diamond FF 100 DM', 'Top up Diamond Free Fire.', 14000, 999, 'AVAILABLE', 'TOPUP', id, null
from public.categories where slug = 'free-fire';

insert into public.products (name, description, price, stock, status, product_type, category_id, image_url)
select 'Akun Genshin AR 60 Whale', 'Akun Genshin AR 60, 15+ karakter limited C6.', 8500000, 1, 'AVAILABLE', 'ACCOUNT', id, null
from public.categories where slug = 'genshin-impact';

insert into public.products (name, description, price, stock, status, product_type, category_id, image_url)
select 'Genesis Crystal Genshin 60', 'Top up Genesis Crystal.', 16000, 999, 'AVAILABLE', 'TOPUP', id, null
from public.categories where slug = 'genshin-impact';

-- Vouchers
insert into public.vouchers (code, discount_type, discount_value, min_purchase, max_discount, valid_until, is_active) values
  ('NEWUSER50', 'PERCENT', 50, 50000, 25000, now() + interval '30 days', true),
  ('DISKON10', 'PERCENT', 10, 100000, null, now() + interval '30 days', true),
  ('HEMAT25K', 'FIXED', 25000, 200000, null, now() + interval '30 days', true);

-- NOTE: Buat admin user via Supabase dashboard:
-- 1. Register lewat app atau Authentication > Add user
-- 2. Jalankan di SQL editor:
--    update public.profiles set role = 'ADMIN' where id = '<user-uuid>';