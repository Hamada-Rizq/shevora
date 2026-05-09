import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createClient()

  // Get active root categories (no parent)
  const { data: cats } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .is('parent_id', null)
    .not('slug', 'in', '("all","hot-offers")')
    .order('sort_order')

  if (!cats || cats.length === 0) return NextResponse.json({ data: [] })

  // For each category, get product count + up to 4 preview images
  const collections = await Promise.all(
    cats.map(async (cat) => {
      const [countRes, previewRes] = await Promise.all([
        supabase
          .from('public_products')
          .select('id', { count: 'exact', head: true })
          .eq('category_slug', cat.slug),
        supabase
          .from('public_products')
          .select('primary_image')
          .eq('category_slug', cat.slug)
          .not('primary_image', 'is', null)
          .limit(4),
      ])

      return {
        id: cat.id,
        name: cat.name,
        name_ar: cat.name_ar || cat.name,
        name_en: cat.name_en || cat.name,
        slug: cat.slug,
        icon: cat.icon,
        product_count: countRes.count || 0,
        preview_images: (previewRes.data || [])
          .map((p: any) => p.primary_image)
          .filter(Boolean),
      }
    })
  )

  // Only return categories that have at least 1 product
  const withProducts = collections.filter((c) => c.product_count > 0)

  return NextResponse.json({ data: withProducts })
}
