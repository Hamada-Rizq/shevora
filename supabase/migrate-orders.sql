-- Run this in Supabase SQL Editor → https://supabase.com/dashboard/project/egpmrmchhqnmsttpccsg/sql

-- 1. Rename total_price → total (the column the app expects)
ALTER TABLE orders RENAME COLUMN total_price TO total;

-- 2. Add all missing columns
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS order_number     TEXT UNIQUE DEFAULT 'SHV-' || UPPER(SUBSTRING(uuid_generate_v4()::TEXT,1,8)),
  ADD COLUMN IF NOT EXISTS customer_name    TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS customer_phone   TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS customer_address TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS subtotal         NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS notes            TEXT,
  ADD COLUMN IF NOT EXISTS source           TEXT DEFAULT 'website' CHECK (source IN ('website','instagram','tiktok','whatsapp','referral')),
  ADD COLUMN IF NOT EXISTS whatsapp_sent    BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS updated_at       TIMESTAMPTZ DEFAULT NOW();

-- 3. Add status constraint if not present
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending','confirmed','shipped','delivered','cancelled'));

-- 4. Set default status
ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'pending';

-- 5. Auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 6. Allow public inserts (in case RLS policy is missing)
DROP POLICY IF EXISTS "anyone can insert order" ON orders;
CREATE POLICY "anyone can insert order" ON orders FOR INSERT WITH CHECK (TRUE);
