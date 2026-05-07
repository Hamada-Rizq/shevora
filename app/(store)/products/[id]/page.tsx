'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { ShoppingBag, Star, ChevronRight, ChevronLeft, Share2, Heart } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase'
import { PublicProduct, Review } from '@/lib/types'
import { formatPriceSimple, getOfferBadgeLabel, calcDiscount } from '@/lib/utils'
import { useCartStore } from '@/context/cart-store'
import ProductCard from '@/components/store/ProductCard'

export default function ProductDetailPage() {
  const params = useParams()
  const slug = params.id as string

  const [product, setProduct] = useState<PublicProduct | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [related, setRelated] = useState<PublicProduct[]>([])
  const [activeImg, setActiveImg] = useState(0)
  const [qty, setQty] = useState(1)
  const [loading, setLoading] = useState(true)
  const addItem = useCartStore((s) => s.addItem)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: prod } = await supabase
        .from('public_products')
        .select('*')
        .eq('slug', slug)
        .single()

      if (!prod) { setLoading(false); return }
      setProduct(prod)

      const [{ data: revs }, { data: rel }] = await Promise.all([
        supabase
          .from('reviews')
          .select('*')
          .eq('product_id', prod.id)
          .eq('is_approved', true)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('public_products')
          .select('*')
          .eq('category_id', prod.category_id)
          .neq('id', prod.id)
          .limit(4),
      ])

      setReviews(revs || [])
      setRelated(rel || [])
      setLoading(false)
    }
    load()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary-200 border-t-primary-500 animate-spin" />
          <p className="text-charcoal-600">جارٍ التحميل...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">😢</p>
          <p className="text-charcoal-600">المنتج غير موجود</p>
        </div>
      </div>
    )
  }

  const images = product.images || []
  const effectivePrice = product.has_price_drop && product.new_price ? product.new_price : product.selling_price
  const badge = getOfferBadgeLabel(product.offer_type, product.offer_value, product.offer_label)
  const discount = product.has_price_drop && product.old_price && product.new_price
    ? calcDiscount(product.old_price, product.new_price) : null

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) {
      addItem({ id: product.id, name: product.name, price: effectivePrice, image: product.primary_image, slug: product.slug })
    }
    toast.success(`أُضيف ${qty} × ${product.name} إلى السلة 💕`)
  }

  return (
    <div className="min-h-screen bg-cream-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-charcoal-600/60 mb-6">
          <a href="/" className="hover:text-primary-500">الرئيسية</a>
          <ChevronLeft className="w-4 h-4" />
          <a href="/products" className="hover:text-primary-500">المنتجات</a>
          <ChevronLeft className="w-4 h-4" />
          <span className="text-charcoal-800 font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">

          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-primary-50">
              {images[activeImg]?.url || product.primary_image ? (
                <Image
                  src={images[activeImg]?.url || product.primary_image || ''}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width:768px) 100vw, 50vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl bg-hero-gradient">🧴</div>
              )}
              {badge && <span className="absolute top-4 right-4 badge-offer">{badge}</span>}
              {discount && (
                <span className="absolute top-4 left-4 px-2 py-1 rounded-full bg-red-500 text-white text-sm font-bold">
                  -{discount}%
                </span>
              )}
              {/* Prev/Next */}
              {images.length > 1 && (
                <>
                  <button onClick={() => setActiveImg((i) => Math.max(0, i - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => setActiveImg((i) => Math.min(images.length - 1, i + 1))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button key={img.id} onClick={() => setActiveImg(i)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${i === activeImg ? 'border-primary-500' : 'border-transparent'}`}>
                    <Image src={img.url} alt={img.alt_text || ''} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            {product.category_name && (
              <p className="text-xs text-primary-400 font-semibold uppercase tracking-widest">{product.category_name}</p>
            )}
            <h1 className="font-display text-3xl md:text-4xl font-bold text-charcoal-800 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            {product.avg_rating && (
              <div className="flex items-center gap-2">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} className={`w-4 h-4 ${s <= Math.round(Number(product.avg_rating)) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                ))}
                <span className="text-sm font-semibold text-charcoal-700">{product.avg_rating}</span>
                <span className="text-sm text-charcoal-600/50">({product.review_count} تقييم)</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-end gap-4">
              <span className="font-display text-4xl font-bold text-charcoal-800">{formatPriceSimple(effectivePrice)}</span>
              {product.has_price_drop && product.old_price && (
                <span className="text-xl text-charcoal-600/40 line-through">{formatPriceSimple(product.old_price)}</span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-charcoal-600/80 leading-relaxed">{product.description}</p>
            )}

            {/* Stock */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${product.stock_quantity > 5 ? 'bg-green-400' : product.stock_quantity > 0 ? 'bg-amber-400' : 'bg-red-400'}`} />
              <span className="text-sm font-medium text-charcoal-700">
                {product.stock_quantity > 5 ? 'متوفر' : product.stock_quantity > 0 ? `آخر ${product.stock_quantity} قطع` : 'نفذ المخزون'}
              </span>
            </div>

            {/* Qty + Add */}
            <div className="flex items-center gap-4">
              <div className="flex items-center border-2 border-primary-200 rounded-full overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-4 py-3 text-primary-500 hover:bg-primary-50 font-bold text-lg transition-colors">-</button>
                <span className="px-4 font-bold text-charcoal-800 text-lg">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="px-4 py-3 text-primary-500 hover:bg-primary-50 font-bold text-lg transition-colors">+</button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0}
                className="btn-primary flex-1 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-5 h-5" />
                {product.stock_quantity === 0 ? 'نفذ المخزون' : 'أضف للسلة'}
              </button>
              <button className="p-4 rounded-full border-2 border-primary-200 hover:border-primary-400 text-primary-400 transition-all">
                <Heart className="w-5 h-5" />
              </button>
            </div>

            {/* WhatsApp direct */}
            <a
              href={`https://wa.me/201550320776?text=${encodeURIComponent(`أريد الاستفسار عن: ${product.name}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-full border-2 border-green-400 text-green-600 font-semibold hover:bg-green-50 transition-all"
            >
              <span>💬</span> استفسر عبر واتساب
            </a>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {product.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-primary-50 text-primary-600 text-xs font-medium border border-primary-200">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        {reviews.length > 0 && (
          <section className="mb-16">
            <h2 className="font-display text-2xl font-bold text-charcoal-800 mb-6">تقييمات العملاء ⭐</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((r) => (
                <div key={r.id} className="admin-card">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-charcoal-800">{r.author_name}</p>
                      {r.is_verified && <span className="text-xs text-green-600 font-medium">✅ مشترٍ موثق</span>}
                    </div>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} className={`w-4 h-4 ${s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                      ))}
                    </div>
                  </div>
                  {r.body && <p className="text-sm text-charcoal-600/80 leading-relaxed">{r.body}</p>}
                  {r.image_url && (
                    <div className="mt-3 relative w-20 h-20 rounded-xl overflow-hidden">
                      <Image src={r.image_url} alt="Review" fill className="object-cover" />
                    </div>
                  )}
                  <p className="text-xs text-charcoal-600/40 mt-3">{new Date(r.created_at).toLocaleDateString('ar-EG')}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related */}
        {related.length > 0 && (
          <section>
            <h2 className="font-display text-2xl font-bold text-charcoal-800 mb-6">منتجات مشابهة 💕</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
