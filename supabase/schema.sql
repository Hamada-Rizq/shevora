-- ============================================================
-- SHEVORA E-COMMERCE PLATFORM — SUPABASE SCHEMA (idempotent)
-- Safe to run multiple times — uses IF NOT EXISTS throughout
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  icon        TEXT,
  sort_order  INTEGER DEFAULT 0,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default categories (skip if already present)
INSERT INTO categories (name, slug, sort_order) VALUES
  ('All',         'all',        0),
  ('Skincare',    'skincare',   1),
  ('Haircare',    'haircare',   2),
  ('Body Care',   'body-care',  3),
  ('Makeup',      'makeup',     4),
  ('Tools',       'tools',      5),
  ('Bundles',     'bundles',    6),
  ('Hot Offers',  'hot-offers', 7),
  ('Kids',        'kids',       8),
  ('Men Care',    'men-care',   9),
  ('Mixed Sets',  'mixed-sets', 10)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- INVENTORY (master product table)
-- ============================================================
CREATE TABLE IF NOT EXISTS inventory (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             TEXT NOT NULL,
  slug             TEXT UNIQUE,
  description      TEXT,
  sku              TEXT UNIQUE,
  barcode          TEXT,
  category_id      UUID REFERENCES categories(id) ON DELETE SET NULL,
  cost_price       NUMERIC(10,2) DEFAULT 0,
  wholesale_price  NUMERIC(10,2) DEFAULT 0,
  selling_price    NUMERIC(10,2),
  stock_quantity   INTEGER DEFAULT 0,
  low_stock_alert  INTEGER DEFAULT 5,
  has_price_drop   BOOLEAN DEFAULT FALSE,
  old_price        NUMERIC(10,2),
  new_price        NUMERIC(10,2),
  offer_type       TEXT CHECK (offer_type IN ('buy_1_get_1','discount_percent','bundle_deal','limited_offer', NULL)),
  offer_value      NUMERIC(5,2),
  offer_label      TEXT,
  is_published     BOOLEAN DEFAULT FALSE,
  is_featured      BOOLEAN DEFAULT FALSE,
  weight_grams     INTEGER,
  tags             TEXT[],
  qr_code          TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION generate_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := LOWER(REGEXP_REPLACE(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'))
                || '-' || SUBSTRING(uuid_generate_v4()::TEXT, 1, 6);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- inventory + categories triggers
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'inventory') THEN
    DROP TRIGGER IF EXISTS set_inventory_slug   ON inventory;
    DROP TRIGGER IF EXISTS inventory_updated_at ON inventory;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'categories') THEN
    DROP TRIGGER IF EXISTS categories_updated_at ON categories;
  END IF;
END $$;

CREATE TRIGGER set_inventory_slug
  BEFORE INSERT ON inventory
  FOR EACH ROW EXECUTE FUNCTION generate_slug();

CREATE TRIGGER inventory_updated_at
  BEFORE UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- PRODUCT IMAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS product_images (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  alt_text    TEXT,
  sort_order  INTEGER DEFAULT 0,
  is_primary  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BUNDLES
-- ============================================================
CREATE TABLE IF NOT EXISTS bundles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE,
  description     TEXT,
  original_price  NUMERIC(10,2),
  bundle_price    NUMERIC(10,2),
  discount_pct    NUMERIC(5,2),
  is_published    BOOLEAN DEFAULT FALSE,
  is_featured     BOOLEAN DEFAULT FALSE,
  cover_image_url TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bundle_items (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bundle_id  UUID NOT NULL REFERENCES bundles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  quantity   INTEGER DEFAULT 1
);

-- ============================================================
-- ORDERS
-- ============================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'orders') THEN
    DROP TRIGGER IF EXISTS orders_updated_at ON orders;
  END IF;
END $$;
CREATE TABLE IF NOT EXISTS orders (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number     TEXT UNIQUE NOT NULL DEFAULT 'ORD-' || UPPER(SUBSTRING(uuid_generate_v4()::TEXT,1,8)),
  customer_name    TEXT NOT NULL,
  customer_phone   TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  items            JSONB NOT NULL,
  subtotal         NUMERIC(10,2),
  total            NUMERIC(10,2),
  status           TEXT DEFAULT 'pending' CHECK (
                     status IN ('pending','confirmed','shipped','delivered','cancelled')
                   ),
  notes            TEXT,
  source           TEXT DEFAULT 'website' CHECK (
                     source IN ('website','instagram','tiktok','whatsapp','referral')
                   ),
  whatsapp_sent    BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id  UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body        TEXT,
  image_url   TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SOCIAL LEADS (CRM)
-- ============================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'social_leads') THEN
    DROP TRIGGER IF EXISTS social_leads_updated_at ON social_leads;
  END IF;
END $$;
CREATE TABLE IF NOT EXISTS social_leads (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source      TEXT NOT NULL CHECK (source IN ('tiktok','instagram','meta_ads','whatsapp','other')),
  name        TEXT,
  phone       TEXT,
  email       TEXT,
  message     TEXT,
  campaign    TEXT,
  status      TEXT DEFAULT 'new' CHECK (status IN ('new','contacted','converted','lost')),
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER social_leads_updated_at
  BEFORE UPDATE ON social_leads
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- ANALYTICS SNAPSHOTS
-- ============================================================
CREATE TABLE IF NOT EXISTS analytics_daily (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date            DATE NOT NULL UNIQUE,
  orders_count    INTEGER DEFAULT 0,
  revenue         NUMERIC(12,2) DEFAULT 0,
  profit          NUMERIC(12,2) DEFAULT 0,
  new_leads       INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PUBLIC VIEW — strips cost / wholesale prices
-- ============================================================
DROP VIEW IF EXISTS public_products;
CREATE VIEW public_products AS
SELECT
  i.id,
  i.name,
  i.slug,
  i.description,
  i.selling_price,
  i.has_price_drop,
  i.old_price,
  i.new_price,
  i.offer_type,
  i.offer_value,
  i.offer_label,
  i.is_featured,
  i.stock_quantity,
  i.tags,
  i.category_id,
  c.name   AS category_name,
  c.slug   AS category_slug,
  (SELECT url  FROM product_images pi WHERE pi.product_id = i.id AND pi.is_primary = TRUE LIMIT 1) AS primary_image,
  (SELECT JSON_AGG(
            JSON_BUILD_OBJECT('id', pi.id, 'url', pi.url, 'alt_text', pi.alt_text, 'sort_order', pi.sort_order)
            ORDER BY pi.sort_order
          )
   FROM product_images pi WHERE pi.product_id = i.id) AS images,
  (SELECT ROUND(AVG(r.rating)::NUMERIC, 1) FROM reviews r WHERE r.product_id = i.id AND r.is_approved = TRUE) AS avg_rating,
  (SELECT COUNT(*)                          FROM reviews r WHERE r.product_id = i.id AND r.is_approved = TRUE) AS review_count,
  i.created_at
FROM inventory i
LEFT JOIN categories c ON c.id = i.category_id
WHERE i.is_published = TRUE
  AND i.stock_quantity > 0;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE inventory     ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews       ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders        ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundle_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_leads  ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before recreating
DROP POLICY IF EXISTS "public read published"        ON inventory;
DROP POLICY IF EXISTS "public read images"           ON product_images;
DROP POLICY IF EXISTS "public read categories"       ON categories;
DROP POLICY IF EXISTS "public read approved reviews" ON reviews;
DROP POLICY IF EXISTS "anyone can insert review"     ON reviews;
DROP POLICY IF EXISTS "anyone can insert order"      ON orders;
DROP POLICY IF EXISTS "public read bundles"          ON bundles;
DROP POLICY IF EXISTS "public read bundle items"     ON bundle_items;
DROP POLICY IF EXISTS "anyone can insert lead"       ON social_leads;

CREATE POLICY "public read published"        ON inventory       FOR SELECT USING (is_published = TRUE AND stock_quantity > 0);
CREATE POLICY "public read images"           ON product_images  FOR SELECT USING (TRUE);
CREATE POLICY "public read categories"       ON categories      FOR SELECT USING (is_active = TRUE);
CREATE POLICY "public read approved reviews" ON reviews         FOR SELECT USING (is_approved = TRUE);
CREATE POLICY "anyone can insert review"     ON reviews         FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "anyone can insert order"      ON orders          FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "public read bundles"          ON bundles         FOR SELECT USING (is_published = TRUE);
CREATE POLICY "public read bundle items"     ON bundle_items    FOR SELECT USING (TRUE);
CREATE POLICY "anyone can insert lead"       ON social_leads    FOR INSERT WITH CHECK (TRUE);

-- ============================================================
-- INDEXES (IF NOT EXISTS)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_inventory_category   ON inventory(category_id);
CREATE INDEX IF NOT EXISTS idx_inventory_published  ON inventory(is_published, stock_quantity);
CREATE INDEX IF NOT EXISTS idx_inventory_featured   ON inventory(is_featured);
CREATE INDEX IF NOT EXISTS idx_product_images_pid   ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product      ON reviews(product_id, is_approved);
CREATE INDEX IF NOT EXISTS idx_orders_status        ON orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_leads_source  ON social_leads(source, created_at DESC);
