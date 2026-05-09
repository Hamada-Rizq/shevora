import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase-server'
import { getServerT } from '@/lib/i18n-server'
import ProductCard from '@/components/store/ProductCard'
import CollectionsSection from '@/components/store/CollectionsSection'
import { PublicProduct } from '@/lib/types'
import { ArrowLeft, Sparkles, TrendingUp, Gift } from 'lucide-react'

async function getFeaturedProducts(): Promise<PublicProduct[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('public_products').select('*')
    .eq('is_featured', true).order('created_at', { ascending: false }).limit(8)
  return data || []
}

async function getNewArrivals(): Promise<PublicProduct[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('public_products').select('*')
    .order('created_at', { ascending: false }).limit(8)
  return data || []
}

async function getHotOffers(): Promise<PublicProduct[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('public_products').select('*')
    .eq('has_price_drop', true).order('created_at', { ascending: false }).limit(4)
  return data || []
}

export default async function HomePage() {
  const [featured, newArrivals, hotOffers, t] = await Promise.all([
    getFeaturedProducts(), getNewArrivals(), getHotOffers(), getServerT(),
  ])

  return (
    <div className="animate-fade-in">

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-hero-gradient min-h-[85vh] flex items-center">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary-200/40 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-nude-300/30 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center lg:text-right order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-sm border border-primary-200 text-taupe-500 text-sm font-medium">
              <Sparkles className="w-4 h-4 text-primary-400" />
              {t('heroLabel')}
            </div>

            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-cocoa-800 leading-tight">
              {t('heroTitle1')}
              <br />
              <span style={{ color: '#D97A6C' }}>{t('heroTitle2')}</span>
            </h1>

            <p className="text-lg text-taupe-500 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              {t('heroDesc')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-end">
              <Link href="/products" className="btn-primary text-base px-8 py-4">{t('shopNow')}</Link>
              <a href="https://wa.me/201550320776" target="_blank" rel="noopener noreferrer"
                className="btn-secondary text-base px-8 py-4">{t('contactUs')}</a>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 max-w-sm mx-auto lg:mx-0">
              {[
                { label: t('product'), value: '500+' },
                { label: t('happyClient'), value: '10k+' },
                { label: t('rating'), value: '4.9 ⭐' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="font-display text-2xl font-bold text-cocoa-800">{stat.value}</p>
                  <p className="text-xs text-taupe-500 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="order-1 lg:order-2 flex justify-center">
            <div className="relative w-72 h-72 md:w-96 md:h-96">
              <div className="absolute inset-0 rounded-full bg-white/50 backdrop-blur-sm border-4 border-white/70 shadow-2xl" />
              <div className="absolute inset-4 rounded-full overflow-hidden">
                <Image
                  src="/hero-product.jpg"
                  alt="Shevora Beauty"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              {[
                { label: t('naturalCare'), icon: '🌿', pos: '-top-4 -right-4' },
                { label: t('authentic100'), icon: '✨', pos: '-bottom-4 left-0' },
                { label: t('qualityGuarantee'), icon: '✅', pos: 'top-12 -left-8' },
              ].map((badge) => (
                <div key={badge.label}
                  className={`absolute ${badge.pos} bg-white rounded-2xl px-3 py-2 shadow-card border border-nude-200 flex items-center gap-1.5 text-xs font-semibold text-cocoa-800 whitespace-nowrap`}>
                  <span>{badge.icon}</span> {badge.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES STRIP ───────────────────────────── */}
      <section className="bg-white border-y border-nude-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: '🚚', title: t('fastShipping'), desc: t('fastShippingDesc') },
              { icon: '💯', title: t('authentic'), desc: t('authenticDesc') },
              { icon: '💬', title: t('support'), desc: t('supportDesc') },
              { icon: '🔄', title: t('easyOrder'), desc: t('easyOrderDesc') },
            ].map((f) => (
              <div key={f.title} className="flex items-center gap-3 p-3">
                <span className="text-2xl flex-shrink-0">{f.icon}</span>
                <div>
                  <p className="font-semibold text-sm text-cocoa-800">{f.title}</p>
                  <p className="text-xs text-taupe-500 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COLLECTIONS ──────────────────────────────── */}
      <CollectionsSection />

      {/* ── HOT OFFERS ───────────────────────────────── */}
      {hotOffers.length > 0 && (
        <section className="py-14 bg-rose-gradient">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 font-semibold text-sm mb-1" style={{ color: '#D97A6C' }}>
                  <TrendingUp className="w-4 h-4" /> {t('currentOffers')}
                </div>
                <h2 className="section-title">{t('hotOffers')}</h2>
              </div>
              <Link href="/products?cat=hot-offers" className="btn-secondary text-sm hidden sm:inline-flex">
                {t('allOffers')} <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {hotOffers.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── FEATURED ─────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="py-14 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 text-mauve-300 font-semibold text-sm mb-1">
                  <Sparkles className="w-4 h-4" /> {t('mostRequested')}
                </div>
                <h2 className="section-title">{t('featuredProducts')}</h2>
              </div>
              <Link href="/products?featured=true" className="btn-secondary text-sm hidden sm:inline-flex">
                {t('viewAll')} <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {featured.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── NEW ARRIVALS ──────────────────────────────── */}
      {newArrivals.length > 0 && (
        <section className="py-14 bg-[#FFF7F4]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 text-primary-400 font-semibold text-sm mb-1">
                  <Gift className="w-4 h-4" /> {t('newArrivals')}
                </div>
                <h2 className="section-title">{t('newArrivalTitle')}</h2>
              </div>
              <Link href="/products" className="btn-secondary text-sm hidden sm:inline-flex">
                {t('allProductsBtn')} <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {newArrivals.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA BANNER ───────────────────────────────── */}
      <section className="py-16 bg-hero-gradient">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-6">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-cocoa-800">
            {t('ctaTitle')}
          </h2>
          <p className="text-taupe-500 text-lg">
            {t('ctaDesc')}
          </p>
          <a href="https://wa.me/201550320776" target="_blank" rel="noopener noreferrer"
            className="btn-primary text-lg px-10 py-4 inline-flex">
            {t('startShopping')}
          </a>
        </div>
      </section>
    </div>
  )
}
