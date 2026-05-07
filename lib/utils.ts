import { clsx, type ClassValue } from 'clsx'
import { CartItem, CheckoutForm, OrderItem } from './types'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatPrice(amount: number, currency = 'EGP'): string {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatPriceSimple(amount: number): string {
  return `${amount.toLocaleString('en-EG')} EGP`
}

export function calcDiscount(oldPrice: number, newPrice: number): number {
  return Math.round(((oldPrice - newPrice) / oldPrice) * 100)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function truncate(text: string, len: number): string {
  return text.length <= len ? text : text.slice(0, len) + '…'
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0)
}

export function buildWhatsAppMessage(
  form: CheckoutForm,
  items: CartItem[],
  total: number,
  orderNumber?: string
): string {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '201550320776'

  const itemLines = items
    .map((i) => `• ${i.name} × ${i.quantity}  — ${formatPriceSimple(i.price * i.quantity)}`)
    .join('\n')

  const message = [
    '🛍️ *طلب جديد — Shevora*',
    orderNumber ? `رقم الطلب: ${orderNumber}` : '',
    '',
    '👤 *بيانات العميل:*',
    `الاسم: ${form.name}`,
    `الهاتف: ${form.phone}`,
    `العنوان: ${form.address}`,
    '',
    '🧴 *المنتجات:*',
    itemLines,
    '',
    `💰 *الإجمالي: ${formatPriceSimple(total)}*`,
    '',
    '⚡ يرجى تأكيد الطلب. شكراً لاختياركم Shevora! 💕',
  ]
    .filter((l) => l !== undefined)
    .join('\n')

  const encoded = encodeURIComponent(message)
  return `https://wa.me/${number}?text=${encoded}`
}

export function validateAdminKey(key: string | null): boolean {
  return key === process.env.ADMIN_SECRET_KEY
}

export function getOfferBadgeLabel(
  offerType?: string,
  offerValue?: number,
  offerLabel?: string
): string | null {
  if (offerLabel) return offerLabel
  switch (offerType) {
    case 'buy_1_get_1':     return 'اشترِ 1 واحصل على 1 مجاناً'
    case 'discount_percent': return `خصم ${offerValue}%`
    case 'bundle_deal':      return 'عرض باقة'
    case 'limited_offer':    return '⏰ عرض محدود'
    default:                 return null
  }
}
