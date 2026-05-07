'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  Plus, Search, Upload, Pencil, Trash2, Eye, EyeOff,
  Package, RefreshCw, Download, ChevronLeft, ChevronRight
} from 'lucide-react'
import * as XLSX from 'xlsx'
import { Inventory } from '@/lib/types'
import { formatPriceSimple } from '@/lib/utils'
import { useT } from '@/lib/i18n'

export default function AdminProductsPage() {
  const t = useT()
  const [products, setProducts] = useState<Inventory[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const PAGE_SIZE = 50

  const load = async (p = page, q = search) => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(p) })
    if (q) params.set('q', q)
    const res = await fetch(`/api/admin/products?${params}`)
    const json = await res.json()
    setProducts(json.data || [])
    setTotal(json.total || 0)
    setLoading(false)
  }

  useEffect(() => { load(0, '') }, [])

  // Debounced server-side search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
      setPage(0)
      load(0, searchInput)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  const goToPage = (p: number) => {
    setPage(p)
    load(p, search)
  }

  const togglePublish = async (id: string, current: boolean) => {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: !current }),
    })
    if (res.ok) {
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, is_published: !current } : p))
      toast.success(!current ? t('publishSuccess') : t('hideSuccess'))
    }
  }

  const deleteProduct = async (id: string) => {
    if (!confirm(t('deleteProductConfirm'))) return
    setDeletingId(id)
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== id))
      setTotal((prev) => prev - 1)
      toast.success(t('productDeleted'))
    }
    setDeletingId(null)
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/admin/import', { method: 'POST', body: fd })
    const json = await res.json()
    if (res.ok) {
      toast.success(t('importSuccess', { count: json.count }))
      setPage(0)
      load(0, search)
    } else {
      toast.error(json.error || t('importFailed'))
    }
    setImporting(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleExport = () => {
    const rows = products.map((p) => ({
      name: p.name,
      sku: p.sku || '',
      category: (p as any).category_name || '',
      selling_price: p.selling_price ?? '',
      cost_price: p.cost_price ?? '',
      stock_quantity: p.stock_quantity,
      is_published: p.is_published ? 'yes' : 'no',
      description: (p as any).description || '',
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Products')
    XLSX.writeFile(wb, `shevora-products-${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const from = page * PAGE_SIZE + 1
  const to = Math.min((page + 1) * PAGE_SIZE, total)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-cocoa-800">{t('manageProducts')}</h1>
          <p className="text-sm text-cocoa-800/60 mt-1">
            {total.toLocaleString()} {t('productCol')} — {t('publishedStatus')}/{t('hiddenStatus')}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-sm font-semibold hover:bg-blue-100 transition-colors"
          >
            <Download className="w-4 h-4" />
            {t('exportExcel')}
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={importing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 text-green-700 border border-green-200 text-sm font-semibold hover:bg-green-100 transition-colors disabled:opacity-50"
          >
            {importing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {t('importExcel')}
          </button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImport} />
          <Link href="/admin/products/new" className="btn-primary text-sm py-2 px-4">
            <Plus className="w-4 h-4" /> {t('newProduct')}
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder={t('searchProduct')}
          className="w-full ps-10 pe-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white"
        />
      </div>

      {/* Table */}
      <div className="admin-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-cocoa-800/60 text-xs font-semibold uppercase tracking-wider">
                <th className="px-4 py-3 text-start">{t('productCol')}</th>
                <th className="px-4 py-3 text-start">{t('categoriesMenu')}</th>
                <th className="px-4 py-3 text-start">{t('sellingPriceCol')}</th>
                <th className="px-4 py-3 text-start">{t('costCol')}</th>
                <th className="px-4 py-3 text-start">{t('stockCol')}</th>
                <th className="px-4 py-3 text-start">{t('statusLabel')}</th>
                <th className="px-4 py-3 text-start">{t('actionsCol')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-4 py-4">
                      <div className="h-4 bg-gray-100 animate-pulse rounded w-full" />
                    </td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-cocoa-800/40">
                    <Package className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                    {t('noProducts')}
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                          🧴
                        </div>
                        <div>
                          <p className="font-semibold text-cocoa-800 line-clamp-1">{p.name}</p>
                          {p.sku && <p className="text-xs text-cocoa-800/40 font-mono">{p.sku}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-cocoa-800/60 text-xs">{(p as any).category_name || '—'}</td>
                    <td className="px-4 py-3 font-semibold text-cocoa-800">
                      {p.selling_price ? formatPriceSimple(p.selling_price) : <span className="text-amber-500 text-xs">{t('priceNotSet')}</span>}
                    </td>
                    <td className="px-4 py-3 text-cocoa-800/60 text-xs">{formatPriceSimple(p.cost_price)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        p.stock_quantity === 0 ? 'bg-red-100 text-red-600' :
                        p.stock_quantity <= 5 ? 'bg-amber-100 text-amber-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {p.stock_quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => togglePublish(p.id, p.is_published)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold transition-colors ${
                          p.is_published
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {p.is_published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {p.is_published ? t('publishedStatus') : t('hiddenStatus')}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link href={`/admin/products/${p.id}`}
                          className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-500 transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => deleteProduct(p.id)}
                          disabled={deletingId === p.id}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors disabled:opacity-40"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-cocoa-800/60">
            {from}–{to} / {total.toLocaleString()}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page === 0 || loading}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const p = totalPages <= 7 ? i : page < 4 ? i : page > totalPages - 4 ? totalPages - 7 + i : page - 3 + i
              return (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                    p === page ? 'bg-primary-500 text-white' : 'border border-gray-200 hover:bg-gray-50 text-cocoa-800'
                  }`}
                >
                  {p + 1}
                </button>
              )
            })}
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages - 1 || loading}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
