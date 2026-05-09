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

  // Build tree
  const all = data || []
  const roots = all.filter((c: any) => !c.parent_id)
  const tree = roots.map((root: any) => ({
    ...root,
    subcategories: all.filter((c: any) => c.parent_id === root.id),
  }))

  return NextResponse.json({ data: tree, flat: all })
}

export async function POST(req: Request) {
  const unauth = await requireAdminAuth()
  if (unauth) return unauth

  const { name, name_ar, name_en, description, icon, sort_order, parent_id, link_type, link_url } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })

  const supabase = createServiceClient()
  const { data: existing } = await supabase
    .from('categories')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
  const nextOrder = (existing?.[0]?.sort_order || 0) + 1

  const { data, error } = await supabase
    .from('categories')
    .insert({
      name: name.trim(),
      name_ar: name_ar?.trim() || name.trim(),
      name_en: name_en?.trim() || name.trim(),
      slug: slugify(name.trim()),
      description,
      icon,
      sort_order: sort_order || nextOrder,
      parent_id: parent_id || null,
      link_type: link_type || 'category',
      link_url: link_url || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
