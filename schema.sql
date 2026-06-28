-- 1. Create the 'shops' table
CREATE TABLE IF NOT EXISTS shops (
    id TEXT PRIMARY KEY, -- Shop Slug
    name TEXT NOT NULL,
    slogan TEXT,
    logo_url TEXT,
    whatsapp_number TEXT,
    primary_color TEXT DEFAULT '#b24a27',
    secondary_color TEXT DEFAULT '#d48a37',
    free_shipping_limit NUMERIC DEFAULT 0,
    admin_username TEXT,
    admin_password TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create the 'products' table
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    shop_id TEXT REFERENCES shops(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT,
    price NUMERIC DEFAULT 0,
    unit TEXT,
    available BOOLEAN DEFAULT true,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Disable Row Level Security (RLS) to allow the frontend client-side app
-- to directly query and modify the tables using the public anon key.
ALTER TABLE shops DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- 4. Enable Storage by creating the 'images' bucket and setting public policies
-- Create storage bucket for images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist to avoid duplication errors
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Access" ON storage.objects;

-- Create policies for public access to 'images' bucket
CREATE POLICY "Public Read Access" ON storage.objects
    FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "Public Upload Access" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'images');

CREATE POLICY "Public Update Access" ON storage.objects
    FOR UPDATE USING (bucket_id = 'images') WITH CHECK (bucket_id = 'images');

CREATE POLICY "Public Delete Access" ON storage.objects
    FOR DELETE USING (bucket_id = 'images');
