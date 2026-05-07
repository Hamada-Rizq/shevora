'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, ShoppingBag, Trash2, Plus, Minus } from 'lucide-react'
import { useCartStore } from '@/context/cart-store'
import { useT } from '@/lib/i18n'
import { formatPriceSimple } from '@/lib/utils'

export default function CartSidebar() {
  const { items, isOpen, closeCart, removeItem, updateQty, total } = useCartStore()
  const t = useT()
  const cartTotal = total()

  // Lock scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-fade-in"
          onClick={closeCart}
        />
      )}

      {/* Drawer — slides from right in RTL, from left in LTR */}
      <div
        className={`fixed top-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col
          transition-transform duration-300 ease-out
          rtl:right-0 ltr:left-0
          ${isOpen ? 'translate-x-0' : 'rtl:translate-x-full ltr:-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-primary-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary-500" />
            <h2 className="font-display text-lg font-bold text-charcoal-800">{t('cart')}</h2>
            {items.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary-500 text-white text-xs font-bold flex items-center justify-center">
                {items.length}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-2 rounded-full hover:bg-primary-50 text-charcoal-600 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto py-4 px-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center">
                <ShoppingBag className="w-9 h-9 text-primary-300" />
              </div>
              <p className="text-charcoal-600 font-medium">{t('emptyCart')}</p>
              <p className="text-sm text-charcoal-600/60">{t('emptyCartSub')}</p>
              <button
                onClick={closeCart}
                className="btn-primary"
              >
                {t('shopNowBtn')}
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3 items-start animate-fade-in">
                  {/* Image */}
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-primary-50 flex-shrink-0">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">🧴</div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-charcoal-800 line-clamp-2 leading-snug">
                      {item.name}
                    </p>
                    <p className="text-sm text-primary-500 font-bold mt-1">
                      {formatPriceSimple(item.price)}
                    </p>

                    {/* Qty controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQty(item.id, item.quantity - 1)}
                        className="w-6 h-6 rounded-full bg-primary-100 hover:bg-primary-200 text-primary-600 flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-semibold text-charcoal-800 min-w-[1.5rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, item.quantity + 1)}
                        className="w-6 h-6 rounded-full bg-primary-100 hover:bg-primary-200 text-primary-600 flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Subtotal + delete */}
                  <div className="flex flex-col items-end gap-2">
                    <p className="text-sm font-bold text-charcoal-800">
                      {formatPriceSimple(item.price * item.quantity)}
                    </p>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-primary-100 px-5 py-5 space-y-4 bg-cream-100">
            <div className="flex items-center justify-between">
              <span className="text-charcoal-600 font-medium">{t('total')}</span>
              <span className="text-xl font-bold text-charcoal-800 font-display">
                {formatPriceSimple(cartTotal)}
              </span>
            </div>
            <Link
              href="/checkout"
              className="btn-primary w-full text-center"
              onClick={closeCart}
            >
              {t('checkout')}
            </Link>
            <button
              onClick={closeCart}
              className="w-full text-center text-sm text-charcoal-600/60 hover:text-charcoal-600 transition-colors"
            >
              {t('continueShopping')}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
