-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  phone text,
  role text not null default 'CUSTOMER' check (role in ('CUSTOMER', 'ADMIN')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'CUSTOMER')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Categories
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  icon_url text,
  created_at timestamptz default now()
);

-- Products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(12,2) not null check (price >= 0),
  stock int not null default 0 check (stock >= 0),
  status text not null default 'AVAILABLE' check (status in ('AVAILABLE','SOLD','INACTIVE')),
  product_type text not null check (product_type in ('ACCOUNT','TOPUP','VOUCHER')),
  category_id uuid references public.categories(id) on delete set null,
  image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Vouchers
create table public.vouchers (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  discount_type text not null check (discount_type in ('PERCENT','FIXED')),
  discount_value numeric(12,2) not null check (discount_value > 0),
  min_purchase numeric(12,2) default 0,
  max_discount numeric(12,2),
  valid_until timestamptz,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Orders
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  user_id uuid references auth.users on delete set null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  subtotal numeric(12,2) not null check (subtotal >= 0),
  discount numeric(12,2) default 0 check (discount >= 0),
  total numeric(12,2) not null check (total >= 0),
  voucher_code text,
  status text not null default 'PENDING' check (status in ('PENDING','PAID','COMPLETED','FAILED','CANCELLED')),
  payment_method text check (payment_method in ('BANK_TRANSFER','EWALLET','QRIS')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Order Items (with snapshot)
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  price numeric(12,2) not null,
  quantity int not null default 1 check (quantity > 0),
  subtotal numeric(12,2) generated always as (price * quantity) stored
);

-- Indexes
create index idx_products_category on public.products(category_id);
create index idx_products_status on public.products(status);
create index idx_products_type on public.products(product_type);
create index idx_orders_user on public.orders(user_id);
create index idx_orders_status on public.orders(status);
create index idx_orders_created on public.orders(created_at desc);
create index idx_order_items_order on public.order_items(order_id);
create index idx_vouchers_code on public.vouchers(code) where is_active = true;

-- Updated_at trigger function
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();
create trigger orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Atomic checkout function
create or replace function public.create_order_atomic(
  p_order_number text,
  p_user_id uuid,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_items jsonb,
  p_voucher_code text,
  p_payment_method text
) returns uuid
language plpgsql
security definer
as $$
declare
  v_order_id uuid;
  v_subtotal numeric := 0;
  v_discount numeric := 0;
  v_total numeric := 0;
  v_item jsonb;
  v_product record;
  v_voucher record;
begin
  -- Calculate subtotal & lock products for update
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select * into v_product from public.products
      where id = (v_item->>'product_id')::uuid
      for update;
    if not found then
      raise exception 'PRODUCT_NOT_FOUND: %', v_item->>'product_id';
    end if;
    if v_product.stock < (v_item->>'quantity')::int then
      raise exception 'INSUFFICIENT_STOCK: %', v_product.name;
    end if;
    v_subtotal := v_subtotal + (v_product.price * (v_item->>'quantity')::int);
  end loop;

  -- Apply voucher if provided
  if p_voucher_code is not null then
    select * into v_voucher from public.vouchers
      where code = p_voucher_code and is_active = true
        and (valid_until is null or valid_until > now())
        and v_subtotal >= min_purchase;
    if found then
      if v_voucher.discount_type = 'PERCENT' then
        v_discount := v_subtotal * v_voucher.discount_value / 100;
        if v_voucher.max_discount is not null and v_discount > v_voucher.max_discount then
          v_discount := v_voucher.max_discount;
        end if;
      else
        v_discount := v_voucher.discount_value;
      end if;
    end if;
  end if;

  v_total := v_subtotal - v_discount;
  if v_total < 0 then v_total := 0; end if;

  -- Create order record
  insert into public.orders (
    order_number, user_id, customer_name, customer_email, customer_phone,
    subtotal, discount, total, voucher_code, payment_method, status
  ) values (
    p_order_number, p_user_id, p_customer_name, p_customer_email, p_customer_phone,
    v_subtotal, v_discount, v_total, p_voucher_code, p_payment_method, 'PAID'
  ) returning id into v_order_id;

  -- Create order items and decrement stock atomically
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select * into v_product from public.products
      where id = (v_item->>'product_id')::uuid;
    insert into public.order_items (order_id, product_id, product_name, price, quantity)
      values (v_order_id, v_product.id, v_product.name, v_product.price, (v_item->>'quantity')::int);
    update public.products
      set stock = stock - (v_item->>'quantity')::int,
          status = case when stock - (v_item->>'quantity')::int = 0 then 'SOLD' else status end
      where id = v_product.id;
  end loop;

  return v_order_id;
end;
$$;