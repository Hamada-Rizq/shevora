import * as XLSX from 'xlsx'
import { ExcelImportRow } from './types'

export function parseExcelFile(buffer: ArrayBuffer): ExcelImportRow[] {
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })

  return raw.map((row) => ({
    name:            String(row['name'] || row['اسم المنتج'] || row['Name'] || '').trim(),
    description:     String(row['description'] || row['الوصف'] || row['Description'] || '').trim() || undefined,
    cost_price:      parseNum(row['cost_price'] || row['سعر التكلفة'] || row['Cost Price']),
    wholesale_price: parseNum(row['wholesale_price'] || row['سعر الجملة'] || row['Wholesale Price']),
    selling_price:   parseNum(row['selling_price'] || row['سعر البيع'] || row['Selling Price']),
    stock_quantity:  parseNum(row['stock_quantity'] || row['الكمية'] || row['Stock']) ?? 0,
    sku:             String(row['sku'] || row['SKU'] || '').trim() || undefined,
    barcode:         String(row['barcode'] || row['باركود'] || row['Barcode'] || '').trim() || undefined,
    category:        String(row['category'] || row['الفئة'] || row['Category'] || '').trim() || undefined,
    qr_code:         String(row['qr_code'] || row['QR'] || '').trim() || undefined,
  })).filter((r) => r.name)
}

function parseNum(val: unknown): number | undefined {
  const n = Number(val)
  return isNaN(n) ? undefined : n
}
