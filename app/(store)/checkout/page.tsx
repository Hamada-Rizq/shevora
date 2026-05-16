'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useCartStore } from '@/context/cart-store'
import { CheckoutForm } from '@/lib/types'
import { formatPriceSimple } from '@/lib/utils'
import { buildSmartWhatsAppMessage, buildSimpleWhatsAppUrl } from '@/lib/whatsapp-smart'
import { ShoppingBag, User, Phone, MapPin, ArrowLeft, CheckCircle2, Copy, Package, CreditCard, Truck } from 'lucide-react'

interface OrderResult {
  orderNumber: string
  isReturningCustomer: boolean
  previousOrderCount: number
  categoryNames: string[]
  whatsappUrl: string
  total: number
  itemCount: number
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore()
  const cartTotal = total()

  const [form, setForm] = useState<CheckoutForm>({ name: '', phone: '', address: '' })
  const [errors, setErrors] = useState<Partial<CheckoutForm>>({})
  const [submitting, setSubmitting] = useState(false)
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null)
  const [copied, setCopied] = useState(false)

  const validate = (): boolean => {
    const e: Partial<CheckoutForm> = {}
    if (!form.name.trim()) e.name = 'الاسم مطلوب'
    if (!form.phone.trim() || !/^[0-9]{10,15}$/.test(form.phone.replace(/\s/g, ''))) {
      e.phone = 'رقم هاتف صحيح مطلوب'
    }
    if (!form.address.trim()) e.address = 'العنوان مطلوب'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)

    const orderItems = items.map((i) => ({ id: i.id, name: i.name, qty: i.quantity, price: i.price }))
    const savedItems = [...items] // Save before clearing
    const savedTotal = cartTotal

    try {
      // Save order and get smart context
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: form.name,
          customer_phone: form.phone,
          customer_address: form.address,
          items: orderItems,
          subtotal: savedTotal,
          total: savedTotal,
          source: 'website',
        }),
      })

      const result = await res.json()

      // Build smart WhatsApp message
      let whatsappUrl: string
      try {
        whatsappUrl = buildSmartWhatsAppMessage({
          form,
          items: savedItems,
          total: savedTotal,
          orderNumber: result.orderNumber || 'SHV-PENDING',
          isReturningCustomer: result.isReturningCustomer || false,
          previousOrderCount: result.previousOrderCount || 0,
          categoryNames: result.categoryNames || [],
        })
      } catch {
        // Fallback to simple message
        whatsappUrl = buildSimpleWhatsAppUrl(form, savedItems, savedTotal, result.orderNumber || '')
      }

      setOrderResult({
        orderNumber: result.orderNumber || 'SHV-PENDING',
        isReturningCustomer: result.isReturningCustomer || false,
        previousOrderCount: result.previousOrderCount || 0,
        categoryNames: result.categoryNames || [],
        whatsappUrl,
        total: savedTotal,
        itemCount: savedItems.reduce((sum, i) => sum + i.quantity, 0),
      })

      clearCart()
      window.open(whatsappUrl, '_blank')
    } catch {
      // Fallback — still redirect to WhatsApp even if API fails
      const fallbackUrl = buildSimpleWhatsAppUrl(form, savedItems, savedTotal, '')
      setOrderResult({
        orderNumber: 'SHV-PENDING',
        isReturningCustomer: false,
        previousOrderCount: 0,
        categoryNames: [],
        whatsappUrl: fallbackUrl,
        total: savedTotal,
        itemCount: savedItems.reduce((sum, i) => sum + i.quantity, 0),
      })
      clearCart()
      window.open(fallbackUrl, '_blank')
    } finally {
      setSubmitting(false)
    }
  }

  const copyOrderNumber = () => {
    if (orderResult?.orderNumber) {
      navigator.clipboard.writeText(orderResult.orderNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // ── Empty cart ─────────────────────────────────────────
  if (items.length === 0 && !orderResult) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-100">
        <div className="text-center space-y-4">
          <ShoppingBag className="w-16 h-16 text-primary-300 mx-auto" />
          <p className="text-xl font-semibold text-charcoal-700">السلة فارغة</p>
          <a href="/products" className="btn-primary">تسوقي الآن</a>
        </div>
      </div>
    )
  }

  // ── Order Confirmation (Enhanced) ──────────────────────
  if (orderResult) {
    return (
      <div className="min-h-screen bg-cream-100 py-8 px-4">
        <div className="max-w-lg mx-auto space-y-6 animate-slide-up">

          {/* Success Header */}
          <div className="text-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
            <h1 className="font-display text-3xl font-bold text-charcoal-800">
              {orderResult.isReturningCustomer ? 'أهلاً بيكِ تاني! 💕' : 'تم إرسال طلبك! 🎉'}
            </h1>
            {orderResult.isReturningCustomer && (
              <p className="text-sm text-primary-500 font-medium">
                {orderResult.previousOrderCount >= 5 ? '👑 عميلة VIP — شكراً لولائك!' :
                 orderResult.previousOrderCount >= 2 ? '💎 عميلة مميزة — نحبك!' :
                 '🔄 أهلاً بعودتك!'}
              </p>
            )}
          </div>

          {/* Order Number Card */}
          <div className="bg-white rounded-2xl border border-primary-100 p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-charcoal-600/60 mb-1">رقم الطلب</p>
                <p className="font-mono text-lg font-bold text-charcoal-800">{orderResult.orderNumber}</p>
              </div>
              <button
                onClick={copyOrderNumber}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-50 text-primary-600 text-sm font-medium hover:bg-primary-100 transition-colors"
              >
                <Copy className="w-4 h-4" />
                {copied ? 'تم النسخ!' : 'نسخ'}
              </button>
            </div>
          </div>

          {/* WhatsApp CTA */}
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
            <p className="text-sm text-green-700 leading-relaxed mb-3">
              سيتم فتح واتساب تلقائياً لتأكيد طلبك. إذا لم يفتح:
            </p>
            <a
              href={orderResult.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-green-500 text-white font-semibold hover:bg-green-600 transition-all"
            >
              <span>💬</span> افتحي واتساب لتأكيد الطلب
            </a>
          </div>

          {/* Next Steps */}
          <div className="bg-white rounded-2xl border border-primary-100 p-5 shadow-card space-y-4">
            <h3 className="font-semibold text-charcoal-800 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary-500" /> الخطوات التالية
            </h3>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 text-sm font-bold text-green-600">1</div>
                <div>
                  <p className="text-sm font-semibold text-charcoal-800">أرسلي الرسالة على واتساب</p>
                  <p className="text-xs text-charcoal-600/60">اضغطي إرسال في واتساب لتأكيد الطلب</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-sm font-bold text-blue-600">2</div>
                <div>
                  <p className="text-sm font-semibold text-charcoal-800">سنتواصل معكِ</p>
                  <p className="text-xs text-charcoal-600/60">سنؤكد الطلب ونحدد موعد التسليم والشحن</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 text-sm font-bold text-purple-600">3</div>
                <div>
                  <p className="text-sm font-semibold text-charcoal-800">الدفع عند الاستلام</p>
                  <p className="text-xs text-charcoal-600/60">أو تحويل بنكي / فودافون كاش / InstaPay</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary-600">4</div>
                <div>
                  <p className="text-sm font-semibold text-charcoal-800">التوصيل</p>
                  <p className="text-xs text-charcoal-600/60">خلال 2-5 أيام عمل حسب المحافظة</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Mini */}
          <div className="bg-white rounded-2xl border border-primary-100 p-5 shadow-card">
            <div className="flex items-center justify-between text-sm">
              <span className="text-charcoal-600">{orderResult.itemCount} منتج</span>
              <span className="font-bold text-charcoal-800">{formatPriceSimple(orderResult.total)}</span>
            </div>
            {orderResult.total >= 500 && (
              <p className="text-xs text-green-600 font-medium mt-2">🚚 مؤهل للشحن المجاني!</p>
            )}
          </div>

          {/* Back to Store */}
          <div className="text-center pt-2">
            <a href="/" className="btn-primary inline-flex">
              العودة للمتجر 🛍️
            </a>
          </div>
        </div>
      </div>
    )
  }

  // ── Checkout Form ──────────────────────────────────────
  return (
    <div className="min-h-screen bg-cream-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <a href="/products" className="inline-flex items-center gap-2 text-sm text-charcoal-600 hover:text-primary-500 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> متابعة التسوق
          </a>
          <h1 className="font-display text-3xl font-bold text-charcoal-800">إتمام الطلب 🛍️</h1>
          <p className="text-charcoal-600/70 mt-1">أدخلي بياناتك وسيتم توجيهك لواتساب لتأكيد الطلب</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Form */}
          <div className="lg:col-span-3">
            <div className="admin-card">
              <h2 className="font-semibold text-charcoal-800 text-lg mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-primary-500" /> بياناتك
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div>
                  <label className="label">الاسم الكامل *</label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="اكتبي اسمك الكامل"
                      className={`input pr-10 ${errors.name ? 'border-red-400 ring-red-200' : ''}`}
                    />
                  </div>
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="label">رقم الهاتف *</label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                      placeholder="01XXXXXXXXX"
                      dir="ltr"
                      className={`input pr-10 text-left ${errors.phone ? 'border-red-400 ring-red-200' : ''}`}
                    />
                  </div>
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="label">عنوان التوصيل *</label>
                  <div className="relative">
                    <MapPin className="absolute right-3 top-4 w-4 h-4 text-primary-400" />
                    <textarea
                      value={form.address}
                      onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                      placeholder="المحافظة، المدينة، الحي، الشارع، رقم المبنى"
                      rows={3}
                      className={`input pr-10 resize-none ${errors.address ? 'border-red-400 ring-red-200' : ''}`}
                    />
                  </div>
                  {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                </div>

                {/* WhatsApp note */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">💬</span>
                  <div>
                    <p className="text-sm font-semibold text-green-700">سيتم التأكيد عبر واتساب</p>
                    <p className="text-xs text-green-600 mt-0.5">بعد الضغط على &quot;أرسل الطلب&quot; سيتم فتح واتساب بتفاصيل طلبك تلقائياً</p>
                  </div>
                </div>

                {/* Free shipping indicator */}
                {cartTotal < 2500 && (
                  <div className="bg-primary-50 border border-primary-200 rounded-xl p-3 text-center">
                    <p className="text-xs text-primary-600 font-medium">
                      🚚 أضيفي {formatPriceSimple(2500 - cartTotal)} للحصول على شحن مجاني!
                    </p>
                  </div>
                )}
                {cartTotal >= 2500 && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                    <p className="text-xs text-green-600 font-medium">
                      🚚 مبروك! طلبك مؤهل للشحن المجاني! ✨
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      جاري إرسال الطلب...
                    </span>
                  ) : (
                    'أرسل الطلب عبر واتساب 💬'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="admin-card sticky top-24">
              <h2 className="font-semibold text-charcoal-800 text-lg mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary-500" /> ملخص الطلب
              </h2>

              <ul className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <li key={item.id} className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-primary-50 flex-shrink-0">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">🧴</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-charcoal-800 line-clamp-1">{item.name}</p>
                      <p className="text-xs text-charcoal-600/60">{item.quantity} × {formatPriceSimple(item.price)}</p>
                    </div>
                    <p className="text-sm font-bold text-charcoal-800 flex-shrink-0">
                      {formatPriceSimple(item.price * item.quantity)}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="border-t border-primary-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-charcoal-600">
                  <span>المجموع الفرعي</span>
                  <span>{formatPriceSimple(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-charcoal-600">
                  <span>الشحن</span>
                  <span className={cartTotal >= 2500 ? 'text-green-600 font-medium' : 'text-charcoal-600'}>
                    {cartTotal >= 2500 ? 'مجاني! ✨' : 'يُحدد عبر واتساب'}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-charcoal-800 text-lg border-t border-primary-100 pt-2 mt-2">
                  <span>الإجمالي</span>
                  <span className="text-primary-600">{formatPriceSimple(cartTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
