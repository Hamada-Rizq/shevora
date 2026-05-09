'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag, Star, Heart, Eye } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { PublicProduct } from '@/lib/types'
import { formatPriceSimple, getOfferBadgeLabel, calcDiscount } from '@/lib/utils'
import { useCartStore } from '@/context/cart-store'
import { useLanguageStore } from '@/context/language-store'

interface Props {
  product: PublicProduct
  listView?: boolean
}

export default function ProductCard({ product, listView = false }: Props) {
  const [liked, setLiked] = useState(false)
  const [imgError, setImgError] = useState(false)
  const addItem = useCartStore((s) => s.addItem)
  const lang = useLanguageStore((s) => s.lang)
  const isAr = lang === 'ar'

  const effectivePrice = product.has_price_drop && product.new_price
    ? product.new_price
    : product.selling_price

  const badge = getOfferBadgeLabel(product.offer_type, product.offer_value, product.offer_label)
  const discountPct = product.has_price_drop && product.old_price && product.new_price
    ? calcDiscount(product.old_price, product.new_price)
    : null

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      id: product.id,
      name: product.name,
      price: effectivePrice,
      image: product.primary_image,
      slug: product.slug,
    })
    toast.success(isAr ? `أُضيف ${product.name} إلى السلة 💕` : `Added to cart 💕`)
  }

  // ── LIST VIEW ──────────────────────────────────────────────
  if (listView) {
    return (
      <div className="bg-white rounded-2xl border border-primary-100 shadow-sm hover:shadow-pink transition-all overflow-hidden flex gap-0">
        {/* Image */}
        <div className="relative w-36 h-36 flex-shrink-0 bg-primary-50">
          {product.primary_image && !imgError ? (
            <Image
              src={product.primary_image}
              alt={product.name}
              fill
              className="object-cover"
              onError={() => setImgError(true)}
              sizes="144px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-hero-gradient">
              <span className="text-4xl">🧴</span>
            </div>
          )}
          {discountPct && (
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white">
              -{discountPct}%
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
          <div>
            {product.category_name && (
              <p className="text-[10px] text-primary-400 font-semibold uppercase tracking-widest mb-1">
                {product.category_name}
              </p>
            )}
            <h3 className="text-sm md:text-base font-semibold text-charcoal-800 leading-tight line-clamp-2 mb-1">
              {product.name}
            </h3>
            {product.avg_rating && (
              <div className="flex items-center gap-1 mb-2">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="text-xs text-charcoal-600 font-medium">{product.avg_rating}</span>
                <span className="text-xs text-charcoal-600/50">({product.review_count})</span>
              </div>
            )}
            {badge && <span className="badge-offer text-[10px] mb-2 inline-block">{badge}</span>}
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-base md:text-lg font-bold text-charcoal-800">
                {formatPriceSimple(effectivePrice)}
              </span>
              {product.has_price_drop && product.old_price && (
                <span className="text-xs text-charcoal-600/50 line-through">
                  {formatPriceSimple(product.old_price)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/products/${product.slug}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-primary-300 text-primary-600 text-xs font-semibold hover:bg-primary-50 transition-all"
              >
                <Eye className="w-3.5 h-3.5" />
                {isAr ? 'عرض التفاصيل' : 'View Details'}
              </Link>
              <button
                onClick={handleAddToCart}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 transition-all"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                {isAr ? 'أضف' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── GRID VIEW ──────────────────────────────────────────────
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="card-hover relative overflow-hidden">

        {/* Image */}
        <div className="relative aspect-square bg-primary-50 overflow-hidden">
          {product.primary_image && !imgError ? (
            <Image
              src={product.primary_image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setImgError(true)}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-hero-gradient">
              <span className="text-4xl">🧴</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {product.is_featured && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rosegold-400 text-white">
                {isAr ? 'مميز ⭐' : 'Featured ⭐'}
              </span>
            )}
            {badge && <span className="badge-offer text-[10px]">{badge}</span>}
            {discountPct && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white">
                -{discountPct}%
              </span>
            )}
          </div>

          {/* Like */}
          <button
            onClick={(e) => { e.preventDefault(); setLiked(!liked) }}
            className="absolute top-2 ltr:left-2 rtl:left-2 p-1.5 rounded-full bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Heart className={`w-4 h-4 transition-colors ${liked ? 'fill-primary-500 text-primary-500' : 'text-charcoal-600'}`} />
          </button>

          {/* Quick Add */}
          <button
            onClick={handleAddToCart}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary-500 text-white text-xs font-semibold shadow-pink opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 whitespace-nowrap"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            {isAr ? 'أضف للسلة' : 'Add to Cart'}
          </button>

          {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
            <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-semibold group-hover:opacity-0 transition-opacity">
              {isAr ? `آخر ${product.stock_quantity} قطع` : `${product.stock_quantity} left`}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3 md:p-4">
          {product.category_name && (
            <p className="text-[10px] text-primary-400 font-semibold uppercase tracking-widest mb-1">
              {product.category_name}
            </p>
          )}
          <h3 className="text-sm md:text-base font-semibold text-charcoal-800 leading-tight line-clamp-2 mb-2">
            {product.name}
          </h3>

          {product.avg_rating && (
            <div className="flex items-center gap-1 mb-2">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-xs text-charcoal-600 font-medium">{product.avg_rating}</span>
              <span className="text-xs text-charcoal-600/60">({product.review_count})</span>
            </div>
          )}

          {/* Price + View Details */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base md:text-lg font-bold text-charcoal-800">
                {formatPriceSimple(effectivePrice)}
              </span>
              {product.has_price_drop && product.old_price && (
                <span className="text-xs text-charcoal-600/50 line-through">
                  {formatPriceSimple(product.old_price)}
                </span>
              )}
            </div>
          </div>

          {/* View Details button */}
          <div className="mt-2">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary-500 group-hover:underline transition-all">
              <Eye className="w-3 h-3" />
              {isAr ? 'عرض التفاصيل' : 'View Details'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
