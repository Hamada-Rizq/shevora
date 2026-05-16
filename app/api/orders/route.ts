import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).slice(2, 5).toUpperCase()
  return `SHV-${ts}-${rand}`
}

function sanitize(value: unknown): string {
  return String(value ?? '').replace(/[<>"'`]/g, '').trim().slice(0, 500)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { customer_name, customer_phone, customer_address, items, subtotal, total, source } = body

  if (!customer_name || !customer_phone || !customer_address || !items?.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const cleanName    = sanitize(customer_name)
  const cleanPhone   = sanitize(customer_phone).replace(/[^0-9+ ()-]/g, '')
  const cleanAddress = sanitize(customer_address)

  if (!cleanName || !cleanPhone || !cleanAddress) {
    return NextResponse.json({ error: 'Invalid field values' }, { status: 400 })
  }

  const supabase = createServiceClient()
  const orderNumber = generateOrderNumber()

  // ── Detect returning customer ────────────────────────
  let isReturningCustomer = false
  let previousOrderCount = 0

  try {
    const { data: previousOrders, error: prevErr } = await supabase
      .from('orders')
      .select('id')
      .eq('customer_phone', cleanPhone)

    if (!prevErr && previousOrders) {
      previousOrderCount = previousOrders.length
      isReturningCustomer = previousOrderCount > 0
    }
  } catch {
    // Non-critical — continue even if lookup fails
  }

  // ── Fetch category names for the ordered products ────
  let categoryNames: string[] = []
  try {
    const productIds = items.map((i: { id: string }) => i.id).filter(Boolean)
    if (productIds.length > 0) {
      const { data: products } = await supabase
        .from('public_products')
        .select('category_name')
        .in('id', productIds)

      if (products) {
        categoryNames = [...new Set(products.map((p) => p.category_name).filter(Boolean))]
      }
    }
  } catch {
    // Non-critical
  }

  // ── Save order ───────────────────────────────────────
  const { data, error } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      customer_name: cleanName,
      customer_phone: cleanPhone,
      customer_address: cleanAddress,
      items,
      subtotal: subtotal ?? total,
      total,
      status: 'pending',
      source: source || 'website',
      whatsapp_sent: true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // ── Send email notification to store owner (if configured) ──
  try {
    const resendKey = process.env.RESEND_API_KEY
    const notifyEmail = process.env.NOTIFY_EMAIL

    if (resendKey && notifyEmail) {
      const itemLines = items
        .map((i: { name: string; qty: number; price: number }) => `• ${i.name} × ${i.qty} — ${i.price} EGP`)
        .join('\n')

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Shevora Orders <onboarding@resend.dev>',
          to: notifyEmail,
          subject: `🛍️ New Order ${orderNumber} — ${cleanName} — ${total} EGP`,
          text: [
            `New order received!`,
            ``,
            `Order: ${orderNumber}`,
            `Customer: ${cleanName}`,
            `Phone: ${cleanPhone}`,
            `Address: ${cleanAddress}`,
            ``,
            `Products:`,
            itemLines,
            ``,
            `Total: ${total} EGP`,
            `Returning customer: ${isReturningCustomer ? `Yes (${previousOrderCount} previous orders)` : 'No — first order!'}`,
            `Categories: ${categoryNames.join(', ') || 'N/A'}`,
            ``,
            `View in admin: https://shevora-app.vercel.app/admin/orders`,
          ].join('\n'),
        }),
      })
    }
  } catch {
    // Email is non-critical — don't fail the order
  }

  return NextResponse.json({
    data,
    orderNumber,
    isReturningCustomer,
    previousOrderCount,
    categoryNames,
  }, { status: 201 })
}
