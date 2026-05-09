'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ShoppingBag, Menu, X, Instagram, Globe, ChevronDown } from 'lucide-react'
import { useCartStore } from '@/context/cart-store'
import { useLanguageStore } from '@/context/language-store'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { Category } from '@/lib/types'

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
  </svg>
)

const CATEGORY_ICONS: Record<string, string> = {
  all: '🌸', skincare: '✨', haircare: '💆', 'body-care': '🛁',
  makeup: '💄', tools: '🪥', bundles: '🎁', 'hot-offers': '🔥',
  kids: '🍼', 'men-care': '🧔', 'mixed-sets': '🎀',
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [megaOpen, setMegaOpen] = useState<string | null>(null)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const megaRef = useRef<HTMLDivElement>(null)
  const megaTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { count, openCart } = useCartStore()
  const cartCount = count()
  const lang = useLanguageStore((s) => s.lang)
  const setLang = useLanguageStore((s) => s.setLang)
  const t = useT()
  const router = useRouter()
  const isAr = lang === 'ar'

  const toggleLang = () => {
    setLang(lang === 'ar' ? 'en' : 'ar')
    router.refresh()
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then(({ data }) => setCategories(data || []))
  }, [])

  const getCatName = (cat: Category) => (isAr ? cat.name_ar || cat.name : cat.name_en || cat.name)

  const openMega = (id: string) => {
    if (megaTimer.current) clearTimeout(megaTimer.current)
    setMegaOpen(id)
  }
  const closeMega = () => {
    megaTimer.current = setTimeout(() => setMegaOpen(null), 120)
  }
  const keepMegaOpen = () => {
    if (megaTimer.current) clearTimeout(megaTimer.current)
  }

  // Static nav items (without mega menu)
  const staticLinks = [
    { href: '/products?cat=hot-offers', label: t('offers'), accent: true },
    { href: '/products?cat=bundles', label: t('bundles') },
  ]

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-pink border-b border-nude-200'
            : 'bg-[#FFF7F4]/90 backdrop-blur-sm'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-24 md:h-28">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 flex-shrink-0">
              <div className="relative w-24 h-24 md:w-28 md:h-28">
                <Image src="/logo.png" alt="Shevora" fill className="object-contain" priority />
              </div>
              <div className="hidden sm:block">
                <p className="font-display text-xl font-bold text-cocoa-800 leading-none">Shevora</p>
                <p className="text-xs text-taupe-500 font-medium tracking-widest uppercase">{t('tagline')}</p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {/* Home */}
              <Link
                href="/"
                className="px-4 py-2 text-sm font-medium text-taupe-500 hover:text-primary-400 transition-colors rounded-lg hover:bg-primary-50"
              >
                {t('home')}
              </Link>

              {/* All Products with mega menu */}
              <Link
                href="/products"
                className="px-4 py-2 text-sm font-medium text-taupe-500 hover:text-primary-400 transition-colors rounded-lg hover:bg-primary-50"
              >
                {t('products')}
              </Link>

              {/* Dynamic category mega menu items */}
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="relative"
                  onMouseEnter={() => cat.subcategories?.length ? openMega(cat.id) : undefined}
                  onMouseLeave={() => cat.subcategories?.length ? closeMega() : undefined}
                >
                  <Link
                    href={`/products?cat=${cat.slug}`}
                    className={cn(
                      'flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                      megaOpen === cat.id
                        ? 'text-primary-500 bg-primary-50'
                        : 'text-taupe-500 hover:text-primary-400 hover:bg-primary-50'
                    )}
                  >
                    <span className="text-sm">{CATEGORY_ICONS[cat.slug] || '📦'}</span>
                    {getCatName(cat)}
                    {cat.subcategories && cat.subcategories.length > 0 && (
                      <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', megaOpen === cat.id && 'rotate-180')} />
                    )}
                  </Link>

                  {/* Mega dropdown */}
                  {cat.subcategories && cat.subcategories.length > 0 && megaOpen === cat.id && (
                    <div
                      ref={megaRef}
                      onMouseEnter={keepMegaOpen}
                      onMouseLeave={closeMega}
                      className="absolute top-full mt-1 bg-white rounded-2xl shadow-card border border-primary-100 p-4 z-40 min-w-[200px] animate-fade-in"
                      style={{ [isAr ? 'right' : 'left']: 0 }}
                    >
                      <p className="text-xs font-bold text-primary-400 uppercase tracking-widest mb-3 pb-2 border-b border-primary-50">
                        {getCatName(cat)}
                      </p>
                      <ul className="space-y-1">
                        {cat.subcategories.map((sub) => (
                          <li key={sub.id}>
                            <Link
                              href={`/products?cat=${sub.slug}`}
                              onClick={() => setMegaOpen(null)}
                              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-charcoal-700 hover:bg-primary-50 hover:text-primary-500 transition-colors"
                            >
                              <span className="text-sm">{CATEGORY_ICONS[sub.slug] || '•'}</span>
                              {getCatName(sub)}
                            </Link>
                          </li>
                        ))}
                        <li className="pt-1 border-t border-primary-50">
                          <Link
                            href={`/products?cat=${cat.slug}`}
                            onClick={() => setMegaOpen(null)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-primary-500 font-semibold hover:bg-primary-50 transition-colors"
                          >
                            {isAr ? `عرض كل ${getCatName(cat)}` : `View all ${getCatName(cat)}`} →
                          </Link>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              ))}

              {/* Offers + Bundles */}
              {staticLinks.map(({ href, label, accent }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    accent
                      ? 'font-semibold text-terracotta-400 hover:text-terracotta-500 hover:bg-terracotta-50'
                      : 'text-taupe-500 hover:text-primary-400 hover:bg-primary-50'
                  )}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={toggleLang}
                className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-full border border-nude-200 text-xs font-semibold text-taupe-500 hover:border-primary-300 hover:text-primary-400 transition-all"
                aria-label="Switch language"
              >
                <Globe className="w-3.5 h-3.5" />
                {lang === 'ar' ? 'EN' : 'عر'}
              </button>

              <div className="hidden md:flex items-center gap-2">
                <a href="https://www.instagram.com/cosmeticano1" target="_blank" rel="noopener noreferrer"
                  className="p-2 rounded-full text-taupe-500 hover:text-primary-400 hover:bg-primary-50 transition-all" aria-label="Instagram">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="https://www.tiktok.com/@cosmeticano1" target="_blank" rel="noopener noreferrer"
                  className="p-2 rounded-full text-taupe-500 hover:text-primary-400 hover:bg-primary-50 transition-all" aria-label="TikTok">
                  <TikTokIcon />
                </a>
              </div>

              <button onClick={openCart}
                className="relative p-2 md:p-2.5 rounded-full bg-primary-100 hover:bg-primary-200 text-cocoa-800 transition-all"
                aria-label={t('cart')}>
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-terracotta-400 text-white text-xs font-bold flex items-center justify-center animate-fade-in">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>

              <button onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-full hover:bg-primary-50 text-cocoa-800 transition-all">
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        {mobileOpen && (
          <div className="md:hidden bg-[#FFF7F4] border-t border-nude-200 max-h-[80vh] overflow-y-auto">
            <nav className="px-4 py-3 space-y-1">

              {/* Home + All products */}
              <Link href="/" className="block px-4 py-3 rounded-xl text-cocoa-800 hover:bg-primary-50 font-medium transition-all"
                onClick={() => setMobileOpen(false)}>{t('home')}</Link>
              <Link href="/products" className="block px-4 py-3 rounded-xl text-cocoa-800 hover:bg-primary-50 font-medium transition-all"
                onClick={() => setMobileOpen(false)}>{t('allProducts')}</Link>

              {/* Dynamic categories with accordion */}
              {categories.map((cat) => (
                <div key={cat.id}>
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/products?cat=${cat.slug}`}
                      className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl text-cocoa-800 hover:bg-primary-50 font-medium transition-all"
                      onClick={() => setMobileOpen(false)}
                    >
                      <span>{CATEGORY_ICONS[cat.slug] || '📦'}</span>
                      {getCatName(cat)}
                    </Link>
                    {cat.subcategories && cat.subcategories.length > 0 && (
                      <button
                        onClick={() => setMobileExpanded(mobileExpanded === cat.id ? null : cat.id)}
                        className="p-3 text-charcoal-500"
                      >
                        <ChevronDown className={cn('w-4 h-4 transition-transform', mobileExpanded === cat.id && 'rotate-180')} />
                      </button>
                    )}
                  </div>
                  {/* Subcategories accordion */}
                  {cat.subcategories && cat.subcategories.length > 0 && mobileExpanded === cat.id && (
                    <div className={cn('pl-6 space-y-0.5 pb-1', isAr && 'pl-0 pr-6')}>
                      {cat.subcategories.map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/products?cat=${sub.slug}`}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-charcoal-600 hover:bg-primary-50 hover:text-primary-500 transition-all"
                          onClick={() => setMobileOpen(false)}
                        >
                          <span className="text-xs">{CATEGORY_ICONS[sub.slug] || '•'}</span>
                          {getCatName(sub)}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Static links */}
              <Link href="/products?cat=hot-offers" className="flex items-center gap-2 px-4 py-3 rounded-xl text-terracotta-400 hover:bg-primary-50 font-semibold transition-all"
                onClick={() => setMobileOpen(false)}>{t('offers')}</Link>
              <Link href="/products?cat=bundles" className="block px-4 py-3 rounded-xl text-cocoa-800 hover:bg-primary-50 font-medium transition-all"
                onClick={() => setMobileOpen(false)}>{t('bundles')}</Link>

              {/* Bottom row */}
              <div className="flex items-center justify-between px-4 pt-3 pb-1 border-t border-nude-200 mt-2">
                <div className="flex items-center gap-4">
                  <a href="https://www.instagram.com/cosmeticano1" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-taupe-500 hover:text-primary-400">
                    <Instagram className="w-4 h-4" /> Instagram
                  </a>
                  <a href="https://www.tiktok.com/@cosmeticano1" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-taupe-500 hover:text-primary-400">
                    <TikTokIcon /> TikTok
                  </a>
                </div>
                <button
                  onClick={() => { toggleLang(); setMobileOpen(false) }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-nude-200 text-xs font-semibold text-taupe-500 hover:border-primary-300 hover:text-primary-400 transition-all"
                >
                  <Globe className="w-3.5 h-3.5" />
                  {lang === 'ar' ? 'English' : 'عربي'}
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>

      <div className="h-24 md:h-28" />
    </>
  )
}
