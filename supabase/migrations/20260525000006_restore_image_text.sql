-- Restore ?text= labels now that unoptimized: true is set in next.config.ts
-- query strings are safe with next/image when optimization is disabled

-- MLBB (violet theme)
update public.products set image_url = 'https://placehold.co/400x400/1a0a2e/c084fc?text=Akun+MLBB'
  where name ilike '%Mythic%';
update public.products set image_url = 'https://placehold.co/400x400/0f0a1e/818cf8?text=86+Diamond'
  where name ilike '%86 DM%';
update public.products set image_url = 'https://placehold.co/400x400/0f0a1e/818cf8?text=172+Diamond'
  where name ilike '%172 DM%';

-- PUBG Mobile (blue theme)
update public.products set image_url = 'https://placehold.co/400x400/0a0f1e/60a5fa?text=Akun+PUBG'
  where name ilike '%Conqueror%';
update public.products set image_url = 'https://placehold.co/400x400/0a0f1e/93c5fd?text=60+UC'
  where name ilike '%UC PUBG 60%';
update public.products set image_url = 'https://placehold.co/400x400/0a0f1e/93c5fd?text=325+UC'
  where name ilike '%UC PUBG 325%';

-- Free Fire (red theme)
update public.products set image_url = 'https://placehold.co/400x400/1a0a0a/f87171?text=Akun+FF'
  where name ilike '%Grandmaster%';
update public.products set image_url = 'https://placehold.co/400x400/1a0a0a/fca5a5?text=100+Diamond'
  where name ilike '%Diamond FF%';

-- Genshin Impact (green theme)
update public.products set image_url = 'https://placehold.co/400x400/0a1a0f/86efac?text=Akun+Genshin'
  where name ilike '%AR 60%';
update public.products set image_url = 'https://placehold.co/400x400/0a1a0f/6ee7b7?text=Genesis+Crystal'
  where name ilike '%Genesis Crystal%';