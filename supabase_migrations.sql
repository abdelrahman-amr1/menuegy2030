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


-- Run this to create the treasury and expenses tracking table:
CREATE TABLE IF NOT EXISTS treasury_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id TEXT NOT NULL,
    type TEXT NOT NULL, -- 'income' or 'expense'
    amount NUMERIC NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    user_id TEXT NOT NULL,
    shift_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Run this to create the shifts management table:
CREATE TABLE IF NOT EXISTS shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    end_time TIMESTAMP WITH TIME ZONE,
    starting_balance NUMERIC DEFAULT 0,
    expected_amount NUMERIC DEFAULT 0,
    actual_amount NUMERIC DEFAULT 0,
    variance NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'open' -- 'open' or 'closed'
);

-- Run this to create the invoices table for tracking sales and calculating profit:
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id TEXT NOT NULL,
    invoice_num TEXT NOT NULL,
    type TEXT DEFAULT 'sales', -- 'sales' or 'purchases' or 'returns'
    payment_method TEXT DEFAULT 'cash',
    subtotal NUMERIC DEFAULT 0,
    discount NUMERIC DEFAULT 0,
    vat NUMERIC DEFAULT 0,
    final_total NUMERIC DEFAULT 0,
    user_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Run this to create the invoice items table to track exact cost/sale prices per item:
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    qty NUMERIC NOT NULL,
    cost_price NUMERIC DEFAULT 0,
    sale_price NUMERIC NOT NULL,
    total_price NUMERIC NOT NULL
);

-- Run this to create the money_transfers table for InstaPay/Vodafone Cash services:
CREATE TABLE IF NOT EXISTS money_transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id TEXT NOT NULL,
    type TEXT NOT NULL, -- 'send' (إرسال) or 'receive' (استقبال)
    phone_number TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    fee NUMERIC DEFAULT 0,
    net_amount NUMERIC NOT NULL,
    user_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
