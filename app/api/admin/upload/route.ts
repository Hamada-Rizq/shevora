import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { requireAdminAuth } from '@/lib/auth'

export async function POST(req: Request) {
  const unauth = await requireAdminAuth()
  if (unauth) return unauth
  const { product_id, url, is_primary = false, alt_text, sort_order = 0 } = await req.json()

  if (!product_id || !url) {
    return NextResponse.json({ error: 'product_id and url are required' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // If primary, unset existing primary
  if (is_primary) {
    await supabase
      .from('product_images')
      .update({ is_primary: false })
      .eq('product_id', product_id)
  }

  const { data, error } = await supabase
    .from('product_images')
    .insert({ product_id, url, is_primary, alt_text, sort_order })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}

export async function DELETE(req: Request) {
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const supabase = createServiceClient()
  const { error } = await supabase.from('product_images').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
