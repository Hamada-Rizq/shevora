import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { slugify } from '@/lib/utils'
import { requireAdminAuth } from '@/lib/auth'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauth = await requireAdminAuth()
  if (unauth) return unauth

  const { id } = await params
  const body = await req.json()
  const supabase = createServiceClient()

  const update: Record<string, unknown> = { ...body }
  if (body.name) update.slug = slugify(body.name)

  const { data, error } = await supabase.from('categories').update(update).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauth = await requireAdminAuth()
  if (unauth) return unauth

  const { id } = await params
  const supabase = createServiceClient()

  const { count } = await supabase.from('inventory').select('*', { count: 'exact', head: true }).eq('category_id', id)
  if ((count || 0) > 0) {
    return NextResponse.json({ error: 'Cannot delete category with products' }, { status: 400 })
  }

  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
