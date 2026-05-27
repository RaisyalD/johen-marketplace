-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.vouchers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Helper: check if current user is admin
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'ADMIN'
  );
$$;

-- PROFILES
create policy "Users read own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Admins read all profiles" on public.profiles
  for select using (public.is_admin());
create policy "Users update own profile" on public.profiles
  for update using (auth.uid() = id);

-- CATEGORIES (publicly readable)
create policy "Anyone reads categories" on public.categories
  for select using (true);
create policy "Admins manage categories" on public.categories
  for all using (public.is_admin());

-- PRODUCTS
create policy "Anyone reads available products" on public.products
  for select using (status != 'INACTIVE' or public.is_admin());
create policy "Admins manage products" on public.products
  for all using (public.is_admin());

-- VOUCHERS
create policy "Anyone reads active vouchers" on public.vouchers
  for select using (is_active = true);
create policy "Admins manage vouchers" on public.vouchers
  for all using (public.is_admin());

-- ORDERS
-- Order CREATE is handled via service_role (admin client) to support guest checkout
create policy "Users read own orders" on public.orders
  for select using (auth.uid() = user_id or public.is_admin());
create policy "Admins manage orders" on public.orders
  for all using (public.is_admin());

-- ORDER ITEMS
create policy "Users read own order items" on public.order_items
  for select using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and (orders.user_id = auth.uid() or public.is_admin())
    )
  );