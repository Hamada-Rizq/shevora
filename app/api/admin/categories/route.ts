import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { slugify } from '@/lib/utils'
import { requireAdminAuth } from '@/lib/auth'

export async function GET() {
  const unauth = await requireAdminAuth()
  if (unauth) return unauth

  const supabase = createServiceClient()
  const { data, error } = await supabase.from('categories').select('*').order('sort_order')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: Request) {
  const unauth = await requireAdminAuth()
  if (unauth) return unauth

  const { name, description, icon, sort_order } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })

  const supabase = createServiceClient()
  const { data: existing } = await supabase.from('categories').select('sort_order').order('sort_order', { ascending: false }).limit(1)
  const nextOrder = (existing?.[0]?.sort_order || 0) + 1

  const { data, error } = await supabase
    .from('categories')
    .insert({ name: name.trim(), slug: slugify(name.trim()), description, icon, sort_order: sort_order || nextOrder })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
