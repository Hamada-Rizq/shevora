// One-time inventory import script
// Run: node scripts/import-inventory.mjs

import { createClient } from '@supabase/supabase-js'
import XLSX from 'xlsx'
import { readFileSync } from 'fs'

const SUPABASE_URL = 'https://egpmrmchhqnmsttpccsg.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVncG1ybWNoaHFubXN0dHBjY3NnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzczMDAxMSwiZXhwIjoyMDkzMzA2MDExfQ.k8_xZ3yODGzHdGiDVDzd52HKiwuK_jF09wO5h6HKEss'
const EXCEL_PATH = '/Users/hamadarizq/Documents/Hamada/Cosmeticano/all/H_A_Beauty_Quotation_Full_Images.xlsx'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

function parseExcel() {
  const wb = XLSX.read(readFileSync(EXCEL_PATH))
  const sheet = wb.Sheets[wb.SheetNames[0]]
  return XLSX.utils.sheet_to_json(sheet, { defval: '' })
}

function mapRow(row) {
  const name = String(row['أسم الصنف'] || '').trim()
  if (!name) return null

  const barcode = row['الباركود'] ? String(row['الباركود']).trim() : null
  // سعر البيع = wholesale/cost price (lower — what admin pays supplier)
  // سعرالمستهلك = consumer selling price (higher — what customer pays)
  const costPrice    = parseFloat(row['سعر البيع'])     || 0
  const sellingPrice = parseFloat(row['سعرالمستهلك'])   || 0

  return {
    name,
    barcode,
    cost_price:      costPrice,
    wholesale_price: costPrice,
    selling_price:   sellingPrice > 0 ? sellingPrice : null,
    stock_quantity:  0,
    is_published:    false,
    is_featured:     false,
  }
}

async function run() {
  console.log('📊 Reading Excel file...')
  const rows = parseExcel()
  console.log(`✅ Found ${rows.length} rows`)

  const products = rows.map(mapRow).filter(Boolean)
  console.log(`✅ Valid products: ${products.length}`)

  const BATCH = 100
  let inserted = 0
  let skipped = 0

  for (let i = 0; i < products.length; i += BATCH) {
    const batch = products.slice(i, i + BATCH)

    // Use upsert on barcode — if barcode exists update, otherwise insert
    // Products with no barcode (null) always insert (nulls are distinct in UNIQUE)
    const { data, error } = await supabase
      .from('inventory')
      .upsert(batch, {
        onConflict: 'barcode',
        ignoreDuplicates: true,
      })

    if (error) {
      console.error(`❌ Batch ${i}–${i + BATCH} error:`, error.message)
      // Try inserting row-by-row to skip individual failures
      for (const p of batch) {
        const { error: e2 } = await supabase.from('inventory').insert(p)
        if (e2) skipped++
        else inserted++
      }
    } else {
      inserted += batch.length
    }

    process.stdout.write(`\r⬆️  Imported ${Math.min(i + BATCH, products.length)} / ${products.length}`)
  }

  console.log(`\n\n🎉 Done! Inserted: ${inserted}, Skipped: ${skipped}`)
}

run().catch(console.error)
