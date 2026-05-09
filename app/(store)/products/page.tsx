'use client'

import { useEffect, useState, useMemo, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, LayoutGrid, List, ChevronDown, X, Menu, SlidersHorizontal } from 'lucide-react'
import ProductCard from '@/components/store/ProductCard'
import { PublicProduct, Category } from '@/lib/types'
import { useLanguageStore } from '@/context/language-store'
import { cn } from '@/lib/utils'

const CATEGORY_ICONS: Record<string, string> = {
  all: '🌸', skincare: '✨', haircare: '💆', 'body-care': '🛁',
  makeup: '💄', tools: '🪥', bundles: '🎁', 'hot-offers': '🔥',
  kids: '🍼', 'men-care': '🧔', 'mixed-sets': '🎀',
}

const SORT_OPTIONS = [
  { value: 'date-new', ar: 'التاريخ: الأحدث أولاً', en: 'Date: New to Old' },
  { value: 'best-selling', ar: 'الأكثر مبيعاً', en: 'Best Selling' },
  { value: 'relevant', ar: 'الأكثر صلة', en: 'Most Relevant' },
  { value: 'az', ar: 'أبجدياً أ-ي', en: 'Alphabetically, A-Z' },
  { value: 'za', ar: 'أبجدياً ي-أ', en: 'Alphabetically, Z-A' },
  { value: 'price-low', ar: 'السعر: من الأقل للأعلى', en: 'Price, Low to High' },
  { value: 'price-high', ar: 'السعر: من الأعلى للأقل', en: 'Price, High to Low' },
  { value: 'date-old', ar: 'التاريخ: الأقدم أولاً', en: 'Date, Old to New' },
]

type ViewMode = 'grid' | 'list'

// Wrap in Suspense because useSearchParams() requires it in Next.js App Router
export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream-100 flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" /></div>}>
      <ProductsContent />
    </Suspense>
  )
}

function ProductsContent() {
  const lang = useLanguageStore((s) => s.lang)
  const isAr = lang === 'ar'
  const searchParams = useSearchParams()
  const router = useRouter()

  const [products, setProducts] = useState<PublicProduct[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  // Fix 4: read initial category from URL param (so navbar links work)
  const [activeCategory, setActiveCategory] = useState(searchParams.get('cat') || 'all')
  const [sort, setSort] = useState('date-new')
  const [view, setView] = useState<ViewMode>('grid')
  const [catMenuOpen, setCatMenuOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)

  // Sync URL → state when URL changes (e.g. user clicks navbar link)
  useEffect(() => {
    const cat = searchParams.get('cat') || 'all'
    setActiveCategory(cat)
  }, [searchParams])

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
    ]).then(([{ data: prods }, { flat }]) => {
      setProducts(prods || [])
      // Fix 1: exclude slug='all' from DB categories (we add it manually)
      setCategories((flat || []).filter((c: Category) => !c.parent_id && c.slug !== 'all'))
      setLoading(false)
    })
  }, [])

  // Fix 4: when user picks a category pill, also update URL
  const pickCategory = (slug: string) => {
    setActiveCategory(slug)
    const params = new URLSearchParams(searchParams.toString())
    if (slug === 'all') params.delete('cat')
    else params.set('cat', slug)
    router.replace(`/products?${params.toString()}`, { scroll: false })
  }

  const displayed = useMemo(() => {
    let result = [...products]

    if (activeCategory !== 'all') {
      if (activeCategory === 'hot-offers') result = result.filter((p) => p.has_price_drop)
      else result = result.filter((p) => p.category_slug === activeCategory)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      )
    }

    switch (sort) {
      case 'date-old':
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        break
      case 'az':
        result.sort((a, b) => a.name.localeCompare(b.name, isAr ? 'ar' : 'en'))
        break
      case 'za':
        result.sort((a, b) => b.name.localeCompare(a.name, isAr ? 'ar' : 'en'))
        break
      case 'price-low':
        result.sort((a, b) => (a.selling_price || 0) - (b.selling_price || 0))
        break
      case 'price-high':
        result.sort((a, b) => (b.selling_price || 0) - (a.selling_price || 0))
        break
      case 'best-selling':
        result.sort((a, b) => (b.review_count || 0) - (a.review_count || 0))
        break
      case 'relevant':
        result.sort((a, b) => (b.avg_rating ? Number(b.avg_rating) : 0) - (a.avg_rating ? Number(a.avg_rating) : 0))
        break
      default:
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }
    return result
  }, [products, activeCategory, search, sort, isAr])

  // Fix 1: "All" added once manually, DB categories already exclude slug='all'
  const allCats = [
    { id: 'all', slug: 'all', name: isAr ? 'الكل' : 'All', name_ar: 'الكل', name_en: 'All', sort_order: -1, is_active: true, created_at: '', updated_at: '' } as Category,
    ...categories,
  ]

  const activeSortLabel = SORT_OPTIONS.find((o) => o.value === sort)
  const activeCatName = allCats.find((c) => c.slug === activeCategory)

  return (
    <div className="min-h-screen bg-cream-100" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Page header */}
      <div className="bg-hero-gradient py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-charcoal-800 mb-2">
            {isAr ? 'متجرنا 🛍️' : 'Our Store 🛍️'}
          </h1>
          <p className="text-charcoal-700/70 text-lg">
            {isAr ? 'اكتشفي كل منتجاتنا المميزة' : 'Discover all our featured products'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Toolbar ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          {/* Categories menu icon */}
          <button
            onClick={() => setCatMenuOpen((o) => !o)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 rounded-xl border font-medium text-sm transition-all shrink-0',
              catMenuOpen
                ? 'bg-primary-500 text-white border-primary-500'
                : 'bg-white text-charcoal-700 border-primary-200 hover:border-primary-400'
            )}
          >
            <Menu className="w-4 h-4" />
            {isAr ? 'التصنيفات' : 'Categories'}
          </button>

          {/* Search */}
          <div className="relative flex-1">
            <Search className={cn('absolute top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400', isAr ? 'right-3' : 'left-3')} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isAr ? 'ابحث عن منتج...' : 'Search products...'}
              className={cn('input w-full', isAr ? 'pr-10 pl-8' : 'pl-10 pr-8')}
            />
            {search && (
              <button onClick={() => setSearch('')} className={cn('absolute top-1/2 -translate-y-1/2', isAr ? 'left-3' : 'right-3')}>
                <X className="w-4 h-4 text-charcoal-400 hover:text-charcoal-700" />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="relative">
            <button
              onClick={() => setSortOpen((o) => !o)}
              className="flex items-center gap-2 px-4 py-3 bg-white border border-primary-200 rounded-xl text-sm text-charcoal-700 hover:border-primary-400 transition-all min-w-[180px]"
            >
              <SlidersHorizontal className="w-4 h-4 text-primary-400 shrink-0" />
              <span className="flex-1 text-start truncate">{isAr ? activeSortLabel?.ar : activeSortLabel?.en}</span>
              <ChevronDown className={cn('w-4 h-4 text-primary-400 transition-transform', sortOpen && 'rotate-180')} />
            </button>
            {sortOpen && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-primary-100 rounded-xl shadow-card z-30 overflow-hidden min-w-[220px]">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setSort(opt.value); setSortOpen(false) }}
                    className={cn('w-full text-start px-4 py-2.5 text-sm transition-colors hover:bg-primary-50', sort === opt.value ? 'text-primary-600 font-semibold bg-primary-50' : 'text-charcoal-700')}
                  >
                    {isAr ? opt.ar : opt.en}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* View toggle */}
          <div className="flex items-center border border-primary-200 rounded-xl overflow-hidden bg-white shrink-0">
            <button onClick={() => setView('grid')} title={isAr ? 'عرض شبكي' : 'Grid View'}
              className={cn('p-3 transition-colors', view === 'grid' ? 'bg-primary-500 text-white' : 'text-charcoal-500 hover:bg-primary-50')}>
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setView('list')} title={isAr ? 'عرض قائمة' : 'List View'}
              className={cn('p-3 transition-colors', view === 'list' ? 'bg-primary-500 text-white' : 'text-charcoal-500 hover:bg-primary-50')}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Categories drawer ── */}
        {catMenuOpen && (
          <div className="bg-white rounded-2xl border border-primary-100 shadow-pink p-5 mb-5 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-charcoal-800">{isAr ? 'التصنيفات' : 'Categories'}</h3>
              <button onClick={() => setCatMenuOpen(false)}><X className="w-4 h-4 text-charcoal-400 hover:text-charcoal-700" /></button>
            </div>
            <div className="flex flex-wrap gap-2">
              {allCats.map((cat) => (
                <button key={cat.id} onClick={() => { pickCategory(cat.slug); setCatMenuOpen(false) }}
                  className={cn('flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all',
                    activeCategory === cat.slug ? 'bg-primary-500 text-white shadow-pink' : 'bg-primary-50 text-charcoal-700 hover:bg-primary-100 border border-primary-200')}>
                  <span>{CATEGORY_ICONS[cat.slug] || '📦'}</span>
                  {isAr ? (cat.name_ar || cat.name) : (cat.name_en || cat.name)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Category filter pills (Fix 2: scrollable) ── */}
        <div className="relative mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x touch-pan-x">
            {allCats.map((cat) => (
              <button key={cat.id} onClick={() => pickCategory(cat.slug)}
                className={cn('flex-shrink-0 snap-start flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap',
                  activeCategory === cat.slug ? 'bg-primary-500 text-white shadow-pink' : 'bg-white text-charcoal-700 border border-primary-200 hover:border-primary-400 hover:text-primary-600')}>
                <span>{CATEGORY_ICONS[cat.slug] || '📦'}</span>
                {isAr ? (cat.name_ar || cat.name) : (cat.name_en || cat.name)}
              </button>
            ))}
          </div>
        </div>

        {/* ── Results bar ── */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <p className="text-sm text-charcoal-600">
            {isAr ? `${displayed.length} منتج` : `${displayed.length} product${displayed.length !== 1 ? 's' : ''}`}
            {search && <span className="text-primary-500 font-medium mx-1">— &quot;{search}&quot;</span>}
            {activeCategory !== 'all' && activeCatName && (
              <span className="text-charcoal-500 mx-1">
                {isAr ? `في: ${activeCatName.name_ar || activeCatName.name}` : `in: ${activeCatName.name_en || activeCatName.name}`}
              </span>
            )}
          </p>
          {(activeCategory !== 'all' || search) && (
            <button onClick={() => { pickCategory('all'); setSearch('') }}
              className="flex items-center gap-1 text-xs text-primary-500 hover:underline">
              <X className="w-3 h-3" />
              {isAr ? 'مسح الفلاتر' : 'Clear filters'}
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl bg-white/60 animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && displayed.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <span className="text-6xl">🧴</span>
            <p className="text-xl font-semibold text-charcoal-700">{isAr ? 'لا توجد منتجات' : 'No products found'}</p>
            <p className="text-charcoal-600/60">{isAr ? 'جرّبي تصنيفاً آخر أو ابحثي بكلمة مختلفة' : 'Try a different category or search term'}</p>
            <button onClick={() => { pickCategory('all'); setSearch('') }} className="btn-primary mt-2">
              {isAr ? 'عرض كل المنتجات' : 'Show All Products'}
            </button>
          </div>
        )}

        {/* Grid */}
        {!loading && displayed.length > 0 && view === 'grid' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {displayed.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}

        {/* List */}
        {!loading && displayed.length > 0 && view === 'list' && (
          <div className="flex flex-col gap-3">
            {displayed.map((p) => <ProductCard key={p.id} product={p} listView />)}
          </div>
        )}
      </div>

      {sortOpen && <div className="fixed inset-0 z-20" onClick={() => setSortOpen(false)} />}
    </div>
  )
}
