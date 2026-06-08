-- Add game_id and game_server columns to orders for TOPUP products
ALTER TABLE orders ADD COLUMN IF NOT EXISTS game_id text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS game_server text;