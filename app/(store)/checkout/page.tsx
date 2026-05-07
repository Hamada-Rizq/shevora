'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useCartStore } from '@/context/cart-store'
import { CheckoutForm } from '@/lib/types'
import { formatPriceSimple, buildWhatsAppMessage } from '@/lib/utils'
import { ShoppingBag, User, Phone, MapPin, ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore()
  const cartTotal = total()

  const [form, setForm] = useState<CheckoutForm>({ name: '', phone: '', address: '' })
  const [errors, setErrors] = useState<Partial<CheckoutForm>>({})
  const [submitted, setSubmitted] = useState(false)

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

    const orderItems = items.map((i) => ({ id: i.id, name: i.name, qty: i.quantity, price: i.price }))
    const whatsappUrl = buildWhatsAppMessage(form, items, cartTotal)

    // Save order to Supabase (service client bypasses RLS)
    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: form.name,
        customer_phone: form.phone,
        customer_address: form.address,
        items: orderItems,
        subtotal: cartTotal,
        total: cartTotal,
        source: 'website',
      }),
    })

    // Clear cart and redirect to WhatsApp
    clearCart()
    setSubmitted(true)
    window.open(whatsappUrl, '_blank')
  }

  if (items.length === 0 && !submitted) {
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

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-100 px-4">
        <div className="max-w-md w-full text-center space-y-6 animate-slide-up">
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="font-display text-3xl font-bold text-charcoal-800">تم إرسال طلبك! 🎉</h1>
          <p className="text-charcoal-600 leading-relaxed">
            سيتم فتح واتساب تلقائياً لتأكيد طلبك. إذا لم يفتح،{' '}
            <a
              href={buildWhatsAppMessage(form, [], 0)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 font-semibold underline"
            >
              اضغطي هنا
            </a>
          </p>
          <a href="/" className="btn-primary inline-flex">
            العودة للمتجر
          </a>
        </div>
      </div>
    )
  }

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
                    <p className="text-xs text-green-600 mt-0.5">بعد الضغط على "أرسل الطلب" سيتم فتح واتساب بتفاصيل طلبك تلقائياً</p>
                  </div>
                </div>

                <button type="submit" className="btn-primary w-full py-4 text-base">
                  أرسل الطلب عبر واتساب 💬
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
                  <span className="text-green-600 font-medium">يُحدد عبر واتساب</span>
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
