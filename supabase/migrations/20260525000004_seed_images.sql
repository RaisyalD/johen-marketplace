-- Seed product & category images
-- SDLC note: dev env uses styled placeholders; production flow = admin upload to Supabase Storage
-- Replace placeholder URLs with real uploads via admin panel before presentation

-- ============================================================
-- CATEGORIES — Wikimedia Commons (CC license, stable CDN)
-- ============================================================
update public.categories set icon_url =
  'https://upload.wikimedia.org/wikipedia/en/thumb/4/4b/Mobile_Legends_Bang_Bang.png/120px-Mobile_Legends_Bang_Bang.png'
  where slug = 'mobile-legends';

update public.categories set icon_url =
  'https://upload.wikimedia.org/wikipedia/en/thumb/4/44/PUBG_Mobile_icon.png/120px-PUBG_Mobile_icon.png'
  where slug = 'pubg-mobile';

update public.categories set icon_url =
  'https://upload.wikimedia.org/wikipedia/en/thumb/4/4a/Free_Fire_logo.png/120px-Free_Fire_logo.png'
  where slug = 'free-fire';

update public.categories set icon_url =
  'https://upload.wikimedia.org/wikipedia/en/thumb/b/b9/Genshin_Impact_cover.jpeg/120px-Genshin_Impact_cover.jpeg'
  where slug = 'genshin-impact';

update public.categories set icon_url =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Valorant_logo_-_pink_color_version.svg/160px-Valorant_logo_-_pink_color_version.svg.png'
  where slug = 'valorant';

-- ============================================================
-- PRODUCTS — Branded placeholders (reliable, consistent look)
-- Replace with real images via admin panel upload before demo
-- ============================================================

-- MLBB
update public.products set image_url = 'https://placehold.co/400x400/0f0a1e/c084fc?text=Akun+MLBB&font=montserrat'
  where name ilike '%Mythic%';

update public.products set image_url = 'https://placehold.co/400x400/0f0a1e/818cf8?text=86+Diamond&font=montserrat'
  where name ilike '%86 DM%';

update public.products set image_url = 'https://placehold.co/400x400/0f0a1e/818cf8?text=172+Diamond&font=montserrat'
  where name ilike '%172 DM%';

-- PUBG Mobile
update public.products set image_url = 'https://placehold.co/400x400/0a0f1e/60a5fa?text=Akun+PUBG&font=montserrat'
  where name ilike '%Conqueror%';

update public.products set image_url = 'https://placehold.co/400x400/0a0f1e/93c5fd?text=60+UC&font=montserrat'
  where name ilike '%UC PUBG 60%';

update public.products set image_url = 'https://placehold.co/400x400/0a0f1e/93c5fd?text=325+UC&font=montserrat'
  where name ilike '%UC PUBG 325%';

-- Free Fire
update public.products set image_url = 'https://placehold.co/400x400/1a0a0a/f87171?text=Akun+FF&font=montserrat'
  where name ilike '%Grandmaster%';

update public.products set image_url = 'https://placehold.co/400x400/1a0a0a/fca5a5?text=100+Diamond&font=montserrat'
  where name ilike '%Diamond FF%';

-- Genshin Impact
update public.products set image_url = 'https://placehold.co/400x400/0a1a0f/86efac?text=Akun+Genshin&font=montserrat'
  where name ilike '%AR 60%';

update public.products set image_url = 'https://placehold.co/400x400/0a1a0f/6ee7b7?text=Genesis+Crystal&font=montserrat'
  where name ilike '%Genesis Crystal%';