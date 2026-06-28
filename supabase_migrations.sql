-- Run this SQL script in your Supabase SQL Editor (Dashboard > SQL Editor > New Query) 
-- to add the required columns for the featured marquee bar and wholesale bulk pricing features:

ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS wholesale_price NUMERIC;
ALTER TABLE products ADD COLUMN IF NOT EXISTS wholesale_qty NUMERIC;
