'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Category } from '@/lib/types'
import { cn } from '@/lib/utils'

const CATEGORY_ICONS: Record<string, string> = {
  all:        '🌸',
  skincare:   '✨',
  haircare:   '💆',
  'body-care':'🛁',
  makeup:     '💄',
  tools:      '🪥',
  bundles:    '🎁',
  'hot-offers':'🔥',
  kids:       '🍼',
  'men-care': '🧔',
  'mixed-sets':'🎀',
}

interface Props {
  categories: Category[]
  activeSlug: string
}

export default function CategoryTabs({ categories, activeSlug }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const navigate = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (slug === 'all') params.delete('cat')
    else params.set('cat', slug)
    params.delete('page')
    router.push(`/products?${params.toString()}`)
  }

  const allCats = [
    { id: 'all', slug: 'all', name: 'الكل', sort_order: 0 } as Category,
    ...categories,
  ]

  return (
    <div className="relative">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
        {allCats.map((cat) => {
          const isActive = cat.slug === activeSlug || (activeSlug === '' && cat.slug === 'all')
          return (
            <button
              key={cat.id}
              onClick={() => navigate(cat.slug)}
              className={cn(
                'flex-shrink-0 snap-start flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap',
                isActive
                  ? 'bg-primary-500 text-white shadow-pink'
                  : 'bg-white text-charcoal-700 border border-primary-200 hover:border-primary-400 hover:text-primary-600'
              )}
            >
              <span>{CATEGORY_ICONS[cat.slug] || '📦'}</span>
              {cat.name}
            </button>
          )
        })}
      </div>
      {/* Fade right edge */}
      <div className="absolute top-0 left-0 w-8 h-full bg-gradient-to-r from-cream-100 to-transparent pointer-events-none" />
    </div>
  )
}
