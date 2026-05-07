import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { parseExcelFile } from '@/lib/excel-import'
import { requireAdminAuth } from '@/lib/auth'

// Allow up to 5 minutes for large imports
export const maxDuration = 300

const BATCH_SIZE = 500

export async function POST(req: Request) {
  const unauth = await requireAdminAuth()
  if (unauth) return unauth
  const formData = await req.formData()
  const file = formData.get('file') as File

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv',
  ]
  if (!allowedTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
    return NextResponse.json({ error: 'Invalid file type. Only .xlsx, .xls, .csv allowed' }, { status: 400 })
  }

  const buffer = await file.arrayBuffer()
  let rows

  try {
    rows = parseExcelFile(buffer)
  } catch {
    return NextResponse.json({ error: 'Failed to parse file' }, { status: 400 })
  }

  if (rows.length === 0) {
    return NextResponse.json({ error: 'No valid rows found in file' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Resolve categories once
  const { data: cats } = await supabase.from('categories').select('id, name, slug')
  const catMap: Record<string, string> = {}
  cats?.forEach((c) => {
    catMap[c.name.toLowerCase()] = c.id
    catMap[c.slug.toLowerCase()] = c.id
  })

  const toInsert = rows.map((row) => ({
    name: row.name,
    description: row.description || null,
    sku: row.sku || null,
    barcode: row.barcode || null,
    cost_price: row.cost_price || 0,
    wholesale_price: row.wholesale_price || 0,
    selling_price: row.selling_price || null,
    stock_quantity: row.stock_quantity || 0,
    qr_code: row.qr_code || null,
    category_id: row.category ? catMap[row.category.toLowerCase()] || null : null,
    is_published: false,
  }))

  // Split into batches of BATCH_SIZE and upsert sequentially
  let totalInserted = 0
  for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
    const batch = toInsert.slice(i, i + BATCH_SIZE)
    const { data, error } = await supabase
      .from('inventory')
      .upsert(batch, { onConflict: 'sku', ignoreDuplicates: false })
      .select('id')

    if (error) {
      return NextResponse.json(
        { error: `Batch ${Math.floor(i / BATCH_SIZE) + 1} failed: ${error.message}`, imported: totalInserted },
        { status: 500 }
      )
    }
    totalInserted += data?.length ?? batch.length
  }

  return NextResponse.json({
    count: totalInserted,
    message: `Successfully imported ${totalInserted} products`,
  })
}
