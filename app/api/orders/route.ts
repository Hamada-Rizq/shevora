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

  const { data, error } = await supabase
    .from('orders')
    .insert({
      order_number: generateOrderNumber(),
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
  return NextResponse.json({ data }, { status: 201 })
}
