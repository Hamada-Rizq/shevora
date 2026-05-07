import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { requireAdminAuth } from '@/lib/auth'

const PAGE_SIZE = 50

export async function GET(req: Request) {
  const unauth = await requireAdminAuth()
  if (unauth) return unauth
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''
  const page = Math.max(0, Number(searchParams.get('page') || '0'))

  const supabase = createServiceClient()

  let baseQuery = supabase
    .from('inventory')
    .select(`*, category:categories(id, name, slug)`, { count: 'exact' })

  if (q) baseQuery = baseQuery.ilike('name', `%${q}%`)

  const from = page * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data, error, count } = await baseQuery
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const enriched = (data || []).map((p: any) => ({
    ...p,
    category_name: p.category?.name,
    category_slug: p.category?.slug,
  }))

  return NextResponse.json({ data: enriched, total: count ?? 0, page, pageSize: PAGE_SIZE })
}

export async function POST(req: Request) {
  const unauth = await requireAdminAuth()
  if (unauth) return unauth

  const body = await req.json()
  const supabase = createServiceClient()

  const {
    name, description, sku, category_id,
    cost_price, wholesale_price, selling_price, stock_quantity,
    has_price_drop, old_price, new_price, offer_type, offer_value, offer_label,
    is_published, is_featured, tags,
  } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Product name is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('inventory')
    .insert({
      name: name.trim(),
      description: description || null,
      sku: sku || null,
      category_id: category_id || null,
      cost_price: cost_price || 0,
      wholesale_price: wholesale_price || 0,
      selling_price: selling_price || null,
      stock_quantity: stock_quantity || 0,
      has_price_drop: has_price_drop || false,
      old_price: old_price || null,
      new_price: new_price || null,
      offer_type: offer_type || null,
      offer_value: offer_value || null,
      offer_label: offer_label || null,
      is_published: is_published || false,
      is_featured: is_featured || false,
      tags: tags || [],
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
