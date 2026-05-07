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

  const { data, error } = await supabase
    .from('inventory')
    .update(body)
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
