'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLanguageStore } from '@/context/language-store'
import { cn } from '@/lib/utils'

interface Collection {
  id: string
  name: string
  name_ar: string
  name_en: string
  slug: string
  icon?: string
  product_count: number
  preview_images: string[]
}

const CATEGORY_ICONS: Record<string, string> = {
  skincare: '✨', haircare: '💆', 'body-care': '🛁',
  makeup: '💄', tools: '🪥', bundles: '🎁',
  kids: '🍼', 'men-care': '🧔', 'mixed-sets': '🎀',
}

export default function CollectionsSection() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const lang = useLanguageStore((s) => s.lang)
  const isAr = lang === 'ar'

  useEffect(() => {
    fetch('/api/collections')
      .then((r) => r.json())
      .then(({ data }) => {
        setCollections(data || [])
        setLoading(false)
      })
  }, [])

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    const amount = 340
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  const getName = (c: Collection) => isAr ? c.name_ar : c.name_en

  if (!loading && collections.length === 0) return null

  return (
    <section className="py-14 bg-white" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm font-semibold text-primary-400 mb-1">
              {isAr ? '🗂️ تصفح حسب الفئة' : '🗂️ Browse by Category'}
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-charcoal-800">
              {isAr ? 'المجموعات' : 'Collections'}
            </h2>
          </div>

          {/* Scroll arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('right')}
              className="p-2.5 rounded-full border-2 border-primary-200 hover:border-primary-400 hover:bg-primary-50 text-charcoal-700 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('left')}
              className="p-2.5 rounded-full border-2 border-primary-200 hover:border-primary-400 hover:bg-primary-50 text-charcoal-700 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="flex gap-5 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-72 h-80 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        )}

        {/* Cards */}
        {!loading && (
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory touch-pan-x"
          >
            {collections.map((col) => (
              <CollectionCard key={col.id} collection={col} name={getName(col)} isAr={isAr} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function CollectionCard({ collection, name, isAr }: { collection: Collection; name: string; isAr: boolean }) {
  const imgs = collection.preview_images
  const icon = CATEGORY_ICONS[collection.slug] || collection.icon || '📦'

  return (
    <Link
      href={`/products?cat=${collection.slug}`}
      className="group flex-shrink-0 snap-start w-64 sm:w-72 rounded-2xl overflow-hidden border border-gray-100 bg-white hover:shadow-pink transition-all duration-300 hover:-translate-y-1"
    >
      {/* Image collage */}
      <div className="relative w-full h-52 bg-primary-50 overflow-hidden">
        {imgs.length === 0 && (
          <div className="w-full h-full flex items-center justify-center bg-hero-gradient">
            <span className="text-6xl">{icon}</span>
          </div>
        )}

        {imgs.length === 1 && (
          <Image src={imgs[0]} alt={name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        )}

        {imgs.length === 2 && (
          <div className="grid grid-cols-2 h-full gap-0.5">
            {imgs.map((src, i) => (
              <div key={i} className="relative overflow-hidden">
                <Image src={src} alt={name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
            ))}
          </div>
        )}

        {imgs.length === 3 && (
          <div className="grid grid-cols-2 h-full gap-0.5">
            <div className="relative overflow-hidden row-span-2">
              <Image src={imgs[0]} alt={name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="relative overflow-hidden">
              <Image src={imgs[1]} alt={name} fill className="object-cover" />
            </div>
            <div className="relative overflow-hidden">
              <Image src={imgs[2]} alt={name} fill className="object-cover" />
            </div>
          </div>
        )}

        {imgs.length >= 4 && (
          <div className="grid grid-cols-2 grid-rows-2 h-full gap-0.5">
            {imgs.slice(0, 4).map((src, i) => (
              <div key={i} className={cn('relative overflow-hidden', i === 0 && 'col-span-2')}>
                <Image src={src} alt={name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
            ))}
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      </div>

      {/* Info */}
      <div className="p-4 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-charcoal-800 text-base leading-tight">{name}</h3>
          <p className="text-sm text-charcoal-500 mt-0.5">
            {collection.product_count} {isAr ? 'منتج' : 'Items'}
          </p>
        </div>
        <span className="px-4 py-2 rounded-full bg-primary-500 text-white text-sm font-semibold group-hover:bg-primary-600 transition-colors shrink-0">
          {isAr ? 'تسوق' : 'Shop'}
        </span>
      </div>
    </Link>
  )
}
