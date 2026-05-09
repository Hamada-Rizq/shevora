import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Build tree: top-level categories with subcategories nested
  const all = data || []
  const roots = all.filter((c: any) => !c.parent_id)
  const tree = roots.map((root: any) => ({
    ...root,
    subcategories: all.filter((c: any) => c.parent_id === root.id),
  }))

  return NextResponse.json({ data: tree, flat: all })
}
