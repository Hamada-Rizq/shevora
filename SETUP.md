# 🧴 Shevora — Setup Guide

## 1. Supabase Project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Copy your **Project URL** and **anon key** from Settings → API
3. Copy the **service_role key** (keep secret)
4. Go to **SQL Editor** → paste contents of `supabase/schema.sql` → Run
5. Go to **Storage** → Create bucket named `product-images` → set to **Public**

## 2. Environment Variables

Copy `.env.local.example` → `.env.local` and fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ADMIN_SECRET_KEY=any-strong-random-string
```

## 3. Logo

Place your logo file at: `public/logo.png`

## 4. Install & Run

```bash
npm install
npm run dev        # http://localhost:3000
```

## 5. Deploy to Vercel

```bash
npm i -g vercel
vercel             # follow prompts, add env vars in Vercel dashboard
```

Or connect GitHub repo at [vercel.com/new](https://vercel.com/new)

## 6. Import Inventory (Excel)

1. Go to `/admin/products`
2. Click **استيراد Excel**
3. Upload `.xlsx` file with columns:
   - `name` / `اسم المنتج`
   - `cost_price` / `سعر التكلفة`
   - `wholesale_price` / `سعر الجملة`
   - `selling_price` / `سعر البيع`
   - `stock_quantity` / `الكمية`
   - `category` / `الفئة` (optional)
   - `sku`, `barcode`, `description` (optional)

## 7. Publish a Product

1. Go to `/admin/products` → Edit a product
2. Set **selling_price**
3. Toggle **نشر المنتج** → ON
4. Product appears instantly on the public store

## URLs

| Route | Description |
|-------|-------------|
| `/` | Public storefront homepage |
| `/products` | Full product catalog |
| `/products?cat=skincare` | Filtered by category |
| `/products?q=كريم` | Search |
| `/checkout` | WhatsApp checkout flow |
| `/admin` | Admin dashboard |
| `/admin/products` | Product management |
| `/admin/products/new` | Add product |
| `/admin/categories` | Category management |
| `/admin/orders` | Order management |
| `/admin/analytics` | Revenue & profit stats |
| `/admin/leads` | CRM / social leads |

## WhatsApp Integration

No payment gateway needed. When a customer places an order:
1. They fill Name + Phone + Address
2. Order is saved to Supabase `orders` table
3. WhatsApp opens with pre-formatted invoice to **+20 155 032 0776**

## Social Links (pre-configured)

- WhatsApp: `https://wa.me/201550320776`
- Instagram: `https://www.instagram.com/cosmeticano1`
- TikTok: `https://www.tiktok.com/@cosmeticano1`
