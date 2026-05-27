-- Enable Supabase Realtime for orders table
-- Required for admin live order notifications
alter publication supabase_realtime add table public.orders;