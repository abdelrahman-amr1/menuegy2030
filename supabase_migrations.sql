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

-- Run this to add granular user permissions and Sahl ERP system settings:
ALTER TABLE shops ADD COLUMN IF NOT EXISTS user_permissions JSONB DEFAULT '{}'::jsonb;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS system_settings JSONB DEFAULT '{}'::jsonb;

-- Run this to add stock quantity, cost price, barcode, min stock alert, and main store to products:
ALTER TABLE products ADD COLUMN IF NOT EXISTS quantity NUMERIC DEFAULT 100;
ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_price NUMERIC DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS min_stock NUMERIC DEFAULT 5;
ALTER TABLE products ADD COLUMN IF NOT EXISTS store_name TEXT DEFAULT 'المخزن الرئيسي';

-- Run this to add POS module toggle per shop and cashier sub-users quota limits:
ALTER TABLE shops ADD COLUMN IF NOT EXISTS pos_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS max_main_users INTEGER DEFAULT 1;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS max_sub_users INTEGER DEFAULT 3;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS sub_users JSONB DEFAULT '[]'::jsonb;

