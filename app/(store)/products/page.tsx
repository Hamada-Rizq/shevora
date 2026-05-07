import { Suspense } from 'react'
import { createClient } from '@/lib/supabase-server'
import ProductCard from '@/components/store/ProductCard'
import CategoryTabs from '@/components/store/CategoryTabs'
import SearchBar from '@/components/store/SearchBar'
import { PublicProduct, Category } from '@/lib/types'
import { SlidersHorizontal } from 'lucide-react'

interface SearchParams { cat?: string; q?: string; featured?: string; page?: string }

async function getProducts(params: SearchParams): Promise<PublicProduct[]> {
  const supabase = await createClient()
  let query = supabase.from('public_products').select('*')

  if (params.cat && params.cat !== 'all') {
    query = query.eq('category_slug', params.cat)
  }
  if (params.q) {
    query = query.ilike('name', `%${params.q}%`)
  }
  if (params.featured === 'true') {
    query = query.eq('is_featured', true)
  }
  if (params.cat === 'hot-offers') {
    query = query.eq('has_price_drop', true)
  }

  const { data } = await query.order('created_at', { ascending: false }).limit(60)
  return data || []
}

async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .neq('slug', 'all')
    .order('sort_order')
  return data || []
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const [products, categories] = await Promise.all([
    getProducts(params),
    getCategories(),
  ])

  const activeCategory = params.cat || 'all'
  const searchQuery = params.q || ''

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Page header */}
      <div className="bg-hero-gradient py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-charcoal-800 mb-2">
            متجرنا 🛍️
          </h1>
          <p className="text-charcoal-700/70 text-lg">اكتشفي كل منتجاتنا المميزة</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Search + Filter row */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Suspense fallback={<div className="input bg-white/60 animate-pulse h-12 rounded-xl" />}>
            <SearchBar className="flex-1" />
          </Suspense>
          <div className="flex items-center gap-2 text-sm text-charcoal-600 bg-white px-4 py-3 rounded-xl border border-primary-200">
            <SlidersHorizontal className="w-4 h-4 text-primary-400" />
            <span>{products.length} منتج</span>
          </div>
        </div>

        {/* Category tabs */}
        <Suspense fallback={<div className="h-10 bg-white/60 rounded-full animate-pulse" />}>
          <CategoryTabs categories={categories} activeSlug={activeCategory} />
        </Suspense>

        {/* Results */}
        <div className="mt-8">
          {searchQuery && (
            <p className="text-sm text-charcoal-600 mb-4">
              نتائج البحث عن: <strong className="text-primary-500">"{searchQuery}"</strong>
              {' '}— {products.length} نتيجة
            </p>
          )}

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <span className="text-6xl">🧴</span>
              <p className="text-xl font-semibold text-charcoal-700">لا توجد منتجات حالياً</p>
              <p className="text-charcoal-600/60">جرّبي تصنيفاً آخر أو ابحثي بكلمة مختلفة</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
