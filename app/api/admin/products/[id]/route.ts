import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { requireAdminAuth } from '@/lib/auth'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauth = await requireAdminAuth()
  if (unauth) return unauth

  const { id } = await params
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('inventory')
    .select('*, category:categories(id,name,slug), images:product_images(*)')
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json({ data })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauth = await requireAdminAuth()
  if (unauth) return unauth

  const { id } = await params
  const body = await req.json()
  const supabase = createServiceClient()

  // Only pass known inventory columns to avoid Supabase rejecting unknown keys
  const {
    name, description, ingredients, how_to_use, sku, category_id,
    cost_price, wholesale_price, selling_price, stock_quantity,
    has_price_drop, old_price, new_price, offer_type, offer_value, offer_label,
    is_published, is_featured, tags,
  } = body

  const { data, error } = await supabase
    .from('inventory')
    .update({
      name, description: description || null,
      ingredients: ingredients || null,
      how_to_use: how_to_use || null,
      sku: sku || null, category_id: category_id || null,
      cost_price, wholesale_price, selling_price, stock_quantity,
      has_price_drop, old_price, new_price, offer_type, offer_value, offer_label,
      is_published, is_featured, tags,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauth = await requireAdminAuth()
  if (unauth) return unauth

  const { id } = await params
  const supabase = createServiceClient()

  const { error } = await supabase.from('inventory').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
