-- Run this SQL script in your Supabase SQL Editor (Dashboard > SQL Editor > New Query) 
-- to add the required columns for the featured marquee bar and wholesale bulk pricing features:

ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS wholesale_price NUMERIC;
ALTER TABLE products ADD COLUMN IF NOT EXISTS wholesale_qty NUMERIC;

-- Run this to add the maximum products limit per shop:
ALTER TABLE shops ADD COLUMN IF NOT EXISTS max_products_limit INTEGER DEFAULT 50;

-- Run this to add the toggle to activate/deactivate shops:
ALTER TABLE shops ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Run this to add subscription plan details:
ALTER TABLE shops ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'monthly';
ALTER TABLE shops ADD COLUMN IF NOT EXISTS subscription_expiry TIMESTAMP WITH TIME ZONE;

