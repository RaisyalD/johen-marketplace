-- Add delivery_info column to products table
-- Admin fills this with credentials/codes/instructions to be emailed to buyer after purchase
ALTER TABLE products ADD COLUMN IF NOT EXISTS delivery_info text;