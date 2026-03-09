-- ============================================================
-- PetMart Database Schema — Run in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) NOT NULL UNIQUE,
  full_name VARCHAR(100) NOT NULL,
  mobile_number VARCHAR(15),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  email VARCHAR(255),
  event_type VARCHAR(50) NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  device_type VARCHAR(50),
  browser VARCHAR(100),
  os VARCHAR(100),
  auth_provider VARCHAR(50),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  icon_url TEXT,
  pet_type VARCHAR(20) CHECK (pet_type IN ('dog','cat','both','other')),
  parent_id INTEGER REFERENCES categories(id),
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS brands (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  original_price NUMERIC(10,2),
  stock INTEGER NOT NULL DEFAULT 0,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  brand_id INTEGER REFERENCES brands(id) ON DELETE SET NULL,
  sku VARCHAR(100) NOT NULL UNIQUE,
  image_url TEXT,
  pet_type VARCHAR(20) CHECK (pet_type IN ('dog','cat','both','other')),
  rating NUMERIC(3,2) DEFAULT 0 CHECK (rating BETWEEN 0 AND 5),
  review_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status VARCHAR(30) DEFAULT 'pending'
    CHECK (status IN ('pending','confirmed','shipped','delivered','cancelled')),
  total_amount NUMERIC(10,2) NOT NULL,
  shipping_address JSONB DEFAULT '{}',
  payment_method VARCHAR(50) DEFAULT 'cod',
  payment_status VARCHAR(30) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(255),
  product_image TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_category    ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand       ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_pet_type    ON products(pet_type);
CREATE INDEX IF NOT EXISTS idx_products_price       ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_rating      ON products(rating DESC);
CREATE INDEX IF NOT EXISTS idx_products_active      ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured    ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_created     ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_search      ON products USING GIN(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_orders_user          ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_user            ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_user            ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_time            ON activity_logs(created_at DESC);

-- Auto update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_ts BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_orders_ts   BEFORE UPDATE ON orders   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_profiles_ts BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders        ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_profile_select" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "own_profile_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "own_profile_update" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "own_cart"           ON cart_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_orders_select"  ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own_orders_insert"  ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_order_items"    ON order_items FOR SELECT
  USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));
CREATE POLICY "public_products"    ON products FOR SELECT USING (is_active = true);
CREATE POLICY "public_categories"  ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "public_brands"      ON brands FOR SELECT USING (is_active = true);
CREATE POLICY "service_logs"       ON activity_logs FOR INSERT WITH CHECK (true);

-- Seed Categories
INSERT INTO categories (name, slug, pet_type, sort_order) VALUES
  ('Dog Food','dog-food','dog',1),('Dog Treats','dog-treats','dog',2),
  ('Dog Toys','dog-toys','dog',3),('Dog Grooming','dog-grooming','dog',4),
  ('Dog Accessories','dog-accessories','dog',5),('Dog Health','dog-health','dog',6),
  ('Cat Food','cat-food','cat',7),('Cat Treats','cat-treats','cat',8),
  ('Cat Toys','cat-toys','cat',9),('Cat Litter','cat-litter','cat',10),
  ('Cat Grooming','cat-grooming','cat',11),('Cat Health','cat-health','cat',12)
ON CONFLICT DO NOTHING;

-- Seed Brands
INSERT INTO brands (name, slug) VALUES
  ('Royal Canin','royal-canin'),('Pedigree','pedigree'),('Whiskas','whiskas'),
  ('Drools','drools'),('Farmina','farmina'),('Henlo','henlo'),
  ('Sheba','sheba'),('Felix','felix'),('Purepet','purepet'),('Kennel Kitchen','kennel-kitchen')
ON CONFLICT DO NOTHING;
