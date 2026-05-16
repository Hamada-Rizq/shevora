/**
 * =========================================================
 * Shevora — Smart WhatsApp Message Builder
 * =========================================================
 *
 * Generates personalized WhatsApp checkout messages based on:
 * - New vs returning customer
 * - Cart total (free shipping threshold, bulk discount)
 * - Number of products
 * - Product categories
 * - Upsell / cross-sell recommendations
 * - Time of day greeting
 */

import { CartItem, CheckoutForm } from './types'
import { formatPriceSimple } from './utils'

// ── Config ──────────────────────────────────────────────
const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '201550320776'
const FREE_SHIPPING_THRESHOLD = 2500 // EGP
const BULK_DISCOUNT_THRESHOLD = 3   // items count

// ── Types ───────────────────────────────────────────────
export interface SmartMessageContext {
  form: CheckoutForm
  items: CartItem[]
  total: number
  orderNumber: string
  isReturningCustomer: boolean
  previousOrderCount: number
  categoryNames: string[]
}

// ── Greeting based on time ──────────────────────────────
function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'صباح الخير'
  if (hour < 17) return 'مساء النور'
  return 'مساء الخير'
}

// ── Customer type badge ─────────────────────────────────
function getCustomerBadge(isReturning: boolean, orderCount: number): string {
  if (!isReturning) return '🆕 عميل جديد'
  if (orderCount >= 5) return '👑 عميل VIP'
  if (orderCount >= 2) return '💎 عميل مميز'
  return '🔄 عميل عائد'
}

// ── Shipping note ───────────────────────────────────────
function getShippingNote(total: number): string {
  if (total >= FREE_SHIPPING_THRESHOLD) {
    return '🚚 *الشحن: مجاني!* ✨'
  }
  const remaining = FREE_SHIPPING_THRESHOLD - total
  return `🚚 الشحن: يُحدد عبر واتساب (اطلب بـ ${formatPriceSimple(remaining)} إضافية للشحن المجاني)`
}

// ── Upsell suggestions based on categories ──────────────
function getUpsellMessage(categoryNames: string[], items: CartItem[]): string {
  const cats = categoryNames.map(c => c?.toLowerCase() || '')
  const suggestions: string[] = []

  if (cats.includes('skincare') && !cats.includes('body care')) {
    suggestions.push('🧴 جربي منتجات العناية بالجسم لروتين كامل!')
  }
  if (cats.includes('haircare') && !cats.includes('skincare')) {
    suggestions.push('✨ أضيفي منتج عناية بالبشرة لعناية شاملة!')
  }
  if (cats.includes('makeup') && !cats.includes('skincare')) {
    suggestions.push('🧴 كريم مرطب أو واقي شمس يكمّل لوكك!')
  }
  if (items.length === 1) {
    suggestions.push('🎁 اطلبي أكثر من منتج واحصلي على عرض خاص!')
  }

  if (suggestions.length === 0) return ''
  return '\n💡 *اقتراح:*\n' + suggestions[0]
}

// ── Bulk order note ─────────────────────────────────────
function getBulkNote(itemCount: number): string {
  if (itemCount >= BULK_DISCOUNT_THRESHOLD) {
    return '\n🎉 *طلب كبير — اسألي عن خصم خاص!*'
  }
  return ''
}

// ── Payment instructions ────────────────────────────────
function getPaymentInstructions(): string {
  return [
    '💳 *طرق الدفع:*',
    '• الدفع عند الاستلام (COD)',
    '• تحويل بنكي / فودافون كاش',
    '• InstaPay',
  ].join('\n')
}

// ── Main smart message builder ──────────────────────────
export function buildSmartWhatsAppMessage(ctx: SmartMessageContext): string {
  const {
    form, items, total, orderNumber,
    isReturningCustomer, previousOrderCount, categoryNames,
  } = ctx

  const greeting = getGreeting()
  const badge = getCustomerBadge(isReturningCustomer, previousOrderCount)
  const shippingNote = getShippingNote(total)
  const upsell = getUpsellMessage(categoryNames, items)
  const bulkNote = getBulkNote(items.reduce((sum, i) => sum + i.quantity, 0))
  const payment = getPaymentInstructions()

  const itemLines = items
    .map((i) => `  • ${i.name} × ${i.quantity}  — ${formatPriceSimple(i.price * i.quantity)}`)
    .join('\n')

  const welcomeNote = isReturningCustomer
    ? `أهلاً بيكِ تاني يا ${form.name}! 💕 منورة كالعادة`
    : `أهلاً وسهلاً يا ${form.name}! 🌸 نورتينا لأول مرة`

  const message = [
    `${greeting} 🌸`,
    '',
    `🛍️ *طلب جديد — Shevora*`,
    `📋 رقم الطلب: *${orderNumber}*`,
    `${badge}`,
    '',
    `━━━━━━━━━━━━━━━━━`,
    '',
    `${welcomeNote}`,
    '',
    '👤 *بيانات العميل:*',
    `  الاسم: ${form.name}`,
    `  الهاتف: ${form.phone}`,
    `  العنوان: ${form.address}`,
    '',
    '🧴 *المنتجات:*',
    itemLines,
    '',
    `━━━━━━━━━━━━━━━━━`,
    `💰 *الإجمالي: ${formatPriceSimple(total)}*`,
    shippingNote,
    bulkNote,
    '',
    payment,
    upsell,
    '',
    '⚡ يرجى تأكيد الطلب وموعد التسليم.',
    'شكراً لاختياركم *Shevora*! 💕',
  ]
    .filter((l) => l !== undefined && l !== null)
    .join('\n')

  const encoded = encodeURIComponent(message)
  return `https://wa.me/${WA_NUMBER}?text=${encoded}`
}

// ── Build wa.me URL directly (simpler version for fallback) ──
export function buildSimpleWhatsAppUrl(
  form: CheckoutForm,
  items: CartItem[],
  total: number,
  orderNumber: string
): string {
  const itemLines = items
    .map((i) => `• ${i.name} × ${i.quantity}  — ${formatPriceSimple(i.price * i.quantity)}`)
    .join('\n')

  const message = [
    '🛍️ *طلب جديد — Shevora*',
    `رقم الطلب: ${orderNumber}`,
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
  ].join('\n')

  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`
}
