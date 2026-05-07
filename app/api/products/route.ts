import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const cat = searchParams.get('cat')
  const q = searchParams.get('q')
  const featured = searchParams.get('featured')
  const limit = Number(searchParams.get('limit') || '60')

  const supabase = await createClient()
  let query = supabase.from('public_products').select('*')

  if (cat && cat !== 'all') {
    if (cat === 'hot-offers') query = query.eq('has_price_drop', true)
    else query = query.eq('category_slug', cat)
  }
  if (q) query = query.ilike('name', `%${q}%`)
  if (featured === 'true') query = query.eq('is_featured', true)

  const { data, error } = await query.order('created_at', { ascending: false }).limit(limit)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate' } })
}
