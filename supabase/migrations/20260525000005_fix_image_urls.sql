-- Fix: gunakan placehold.co tanpa query string agar kompatibel dengan Next.js image loader
-- Format: /WxH/bgColor/fgColor (no ?text= query params)

-- MLBB (violet theme)
update public.products set image_url = 'https://placehold.co/400x400/1a0a2e/c084fc'
  where name ilike '%Mythic%';
update public.products set image_url = 'https://placehold.co/400x400/0f0a1e/818cf8'
  where name ilike '%86 DM%';
update public.products set image_url = 'https://placehold.co/400x400/0f0a1e/818cf8'
  where name ilike '%172 DM%';

-- PUBG Mobile (blue theme)
update public.products set image_url = 'https://placehold.co/400x400/0a0f1e/60a5fa'
  where name ilike '%Conqueror%';
update public.products set image_url = 'https://placehold.co/400x400/0a0f1e/93c5fd'
  where name ilike '%UC PUBG 60%';
update public.products set image_url = 'https://placehold.co/400x400/0a0f1e/93c5fd'
  where name ilike '%UC PUBG 325%';

-- Free Fire (red theme)
update public.products set image_url = 'https://placehold.co/400x400/1a0a0a/f87171'
  where name ilike '%Grandmaster%';
update public.products set image_url = 'https://placehold.co/400x400/1a0a0a/fca5a5'
  where name ilike '%Diamond FF%';

-- Genshin Impact (green theme)
update public.products set image_url = 'https://placehold.co/400x400/0a1a0f/86efac'
  where name ilike '%AR 60%';
update public.products set image_url = 'https://placehold.co/400x400/0a1a0f/6ee7b7'
  where name ilike '%Genesis Crystal%';