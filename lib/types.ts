// ============================================================
// SHEVORA — Shared TypeScript types
// ============================================================

export type OfferType = 'buy_1_get_1' | 'discount_percent' | 'bundle_deal' | 'limited_offer'
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
export type LeadSource = 'tiktok' | 'instagram' | 'meta_ads' | 'whatsapp' | 'other'
export type LeadStatus = 'new' | 'contacted' | 'converted' | 'lost'
export type OrderSource = 'website' | 'instagram' | 'tiktok' | 'whatsapp' | 'referral'

// ============================================================
// DB Models (match Supabase tables)
// ============================================================

export interface Category {
  id: string
  name: string
  name_ar?: string
  name_en?: string
  slug: string
  description?: string
  icon?: string
  sort_order: number
  is_active: boolean
  parent_id?: string | null
  link_type?: string
  link_url?: string
  created_at: string
  updated_at: string
  subcategories?: Category[]
}

export interface ProductImage {
  id: string
  product_id: string
  url: string
  alt_text?: string
  sort_order: number
  is_primary: boolean
  created_at: string
}

export interface Inventory {
  id: string
  name: string
  slug?: string
  description?: string
  sku?: string
  barcode?: string
  category_id?: string
  cost_price: number
  wholesale_price: number
  selling_price?: number
  stock_quantity: number
  low_stock_alert: number
  has_price_drop: boolean
  old_price?: number
  new_price?: number
  offer_type?: OfferType
  offer_value?: number
  offer_label?: string
  is_published: boolean
  is_featured: boolean
  weight_grams?: number
  tags?: string[]
  qr_code?: string
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_phone: string
  customer_address: string
  items: OrderItem[]
  subtotal: number
  total: number
  status: OrderStatus
  notes?: string
  source: OrderSource
  whatsapp_sent: boolean
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  name: string
  qty: number
  price: number
}

export interface Review {
  id: string
  product_id: string
  author_name: string
  rating: number
  body?: string
  image_url?: string
  is_verified: boolean
  is_approved: boolean
  created_at: string
}

export interface Bundle {
  id: string
  name: string
  slug?: string
  description?: string
  original_price?: number
  bundle_price?: number
  discount_pct?: number
  is_published: boolean
  is_featured: boolean
  cover_image_url?: string
  items?: BundleItem[]
  created_at: string
  updated_at: string
}

export interface BundleItem {
  id: string
  bundle_id: string
  product_id: string
  quantity: number
  product?: PublicProduct
}

export interface SocialLead {
  id: string
  source: LeadSource
  name?: string
  phone?: string
  email?: string
  message?: string
  campaign?: string
  status: LeadStatus
  notes?: string
  created_at: string
  updated_at: string
}

// ============================================================
// Public view — safe shape (no cost/wholesale)
// ============================================================

export interface PublicProduct {
  id: string
  name: string
  slug: string
  description?: string
  selling_price: number
  has_price_drop: boolean
  old_price?: number
  new_price?: number
  offer_type?: OfferType
  offer_value?: number
  offer_label?: string
  is_featured: boolean
  stock_quantity: number
  tags?: string[]
  category_id?: string
  category_name?: string
  category_slug?: string
  primary_image?: string
  images?: { id: string; url: string; alt_text?: string; sort_order: number }[]
  avg_rating?: number
  review_count?: number
  created_at: string
}

// ============================================================
// Cart
// ============================================================

export interface CartItem {
  id: string
  name: string
  price: number
  image?: string
  quantity: number
  slug: string
}

export interface CheckoutForm {
  name: string
  phone: string
  address: string
}

// ============================================================
// Analytics
// ============================================================

export interface AnalyticsStats {
  totalRevenue: number
  totalProfit: number
  ordersCount: number
  newLeads: number
  topProducts: TopProduct[]
  recentOrders: Order[]
}

export interface TopProduct {
  id: string
  name: string
  sold_qty: number
  revenue: number
  profit: number
}

// ============================================================
// Excel Import
// ============================================================

export interface ExcelImportRow {
  name: string
  description?: string
  cost_price?: number
  wholesale_price?: number
  selling_price?: number
  stock_quantity?: number
  sku?: string
  barcode?: string
  category?: string
  qr_code?: string
}
