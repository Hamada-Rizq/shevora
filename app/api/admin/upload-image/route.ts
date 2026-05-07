import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'

export const maxDuration = 60

export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get('file') as File
  const product_id = formData.get('product_id') as string
  const is_primary = formData.get('is_primary') === 'true'

  if (!file || !product_id) {
    return NextResponse.json({ error: 'Missing file or product_id' }, { status: 400 })
  }

  const supabase = createServiceClient()

  const ext = file.name.split('.').pop()
  const path = `products/${product_id}/${Date.now()}.${ext}`
  const buffer = await file.arrayBuffer()

  const { data: uploaded, error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(path, buffer, { contentType: file.type, upsert: false })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(path)

  const { data, error } = await supabase
    .from('product_images')
    .insert({ product_id, url: publicUrl, is_primary, sort_order: 0 })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data, url: publicUrl }, { status: 201 })
}
