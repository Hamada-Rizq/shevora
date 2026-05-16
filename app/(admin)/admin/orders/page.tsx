'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Search, ChevronDown, Phone, MapPin, Package, Trash2, Pencil, X, Save } from 'lucide-react'
import { Order, OrderStatus } from '@/lib/types'
import { formatPriceSimple } from '@/lib/utils'
import { useT } from '@/lib/i18n'

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped:   'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function OrdersPage() {
  const t = useT()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ customer_name: '', customer_phone: '', customer_address: '', notes: '' })
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const STATUS_LABELS: Record<OrderStatus, string> = {
    pending:   t('statusPending'),
    confirmed: t('statusConfirmed'),
    shipped:   t('statusShipped'),
    delivered: t('statusDelivered'),
    cancelled: t('statusCancelled'),
  }

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/orders')
    const { data } = await res.json()
    setOrders(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const updateStatus = async (id: string, status: OrderStatus) => {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o))
      toast.success(t('orderUpdated'))
    }
  }

  const startEdit = (order: Order) => {
    setEditingId(order.id)
    setEditForm({
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      customer_address: order.customer_address,
      notes: order.notes || '',
    })
    setExpanded(order.id)
  }

  const saveEdit = async (id: string) => {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
    if (res.ok) {
      const { data } = await res.json()
      setOrders((prev) => prev.map((o) => o.id === id ? { ...o, ...data } : o))
      setEditingId(null)
      toast.success(t('orderUpdated'))
    } else {
      toast.error('Failed to update order')
    }
  }

  const deleteOrder = async (id: string) => {
    const res = await fetch(`/api/admin/orders/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setOrders((prev) => prev.filter((o) => o.id !== id))
      setDeleteConfirm(null)
      setExpanded(null)
      toast.success('Order deleted')
    } else {
      toast.error('Failed to delete order')
    }
  }

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_phone.includes(search)
    const matchStatus = statusFilter === 'all' || o.status === statusFilter
    return matchSearch && matchStatus
  })

  const total = filtered.reduce((s, o) => s + (o.total || 0), 0)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-cocoa-800">{t('ordersTitle')}</h1>
          <p className="text-sm text-cocoa-800/60 mt-1">{filtered.length} · {formatPriceSimple(total)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchOrders')}
            className="w-full ps-10 pe-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-400">
          <option value="all">{t('allStatuses')}</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
        {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((status) => {
          const count = orders.filter((o) => o.status === status).length
          return (
            <button key={status}
              onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
              className={`admin-card text-center py-3 px-2 cursor-pointer hover:shadow-card-hover transition-all ${statusFilter === status ? 'ring-2 ring-primary-400' : ''}`}>
              <p className="text-2xl font-bold text-cocoa-800">{count}</p>
              <p className={`text-xs font-semibold px-1 py-0.5 rounded-full mt-1 ${STATUS_COLORS[status]}`}>{STATUS_LABELS[status]}</p>
            </button>
          )
        })}
      </div>

      {/* Orders list */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="admin-card h-20 animate-pulse bg-gray-50" />
          ))
        ) : filtered.length === 0 ? (
          <div className="admin-card text-center py-16 text-cocoa-800/40">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-200" />
            {t('noOrders')}
          </div>
        ) : (
          filtered.map((order) => (
            <div key={order.id} className="admin-card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-500 font-bold text-sm flex-shrink-0">
                    {order.customer_name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-cocoa-800">{order.customer_name}</p>
                      <span className="text-xs font-mono text-cocoa-800/40">{order.order_number}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-cocoa-800/60">
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{order.customer_phone}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{order.customer_address.slice(0, 30)}...</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-cocoa-800">{formatPriceSimple(order.total)}</p>
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary-400 ${STATUS_COLORS[order.status]}`}
                  >
                    {Object.entries(STATUS_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => startEdit(order)}
                    className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
                    title="Edit order"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(deleteConfirm === order.id ? null : order.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
                    title="Delete order"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { setExpanded(expanded === order.id ? null : order.id); setEditingId(null) }}
                    className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform ${expanded === order.id ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Delete confirmation */}
              {deleteConfirm === order.id && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between animate-fade-in">
                  <p className="text-sm text-red-700">Delete this order permanently?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-3 py-1.5 text-xs rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => deleteOrder(order.id)}
                      className="px-3 py-1.5 text-xs rounded-lg bg-red-500 text-white hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}

              {/* Expanded: Edit or View */}
              {expanded === order.id && (
                <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in">

                  {/* Edit mode */}
                  {editingId === order.id ? (
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide flex items-center gap-1">
                        <Pencil className="w-3 h-3" /> Edit Order
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-cocoa-800/60 mb-1 block">Customer Name</label>
                          <input
                            type="text"
                            value={editForm.customer_name}
                            onChange={(e) => setEditForm(f => ({ ...f, customer_name: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-cocoa-800/60 mb-1 block">Phone</label>
                          <input
                            type="text"
                            value={editForm.customer_phone}
                            onChange={(e) => setEditForm(f => ({ ...f, customer_phone: e.target.value }))}
                            dir="ltr"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-cocoa-800/60 mb-1 block">Address</label>
                        <textarea
                          value={editForm.customer_address}
                          onChange={(e) => setEditForm(f => ({ ...f, customer_address: e.target.value }))}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-cocoa-800/60 mb-1 block">Notes</label>
                        <textarea
                          value={editForm.notes}
                          onChange={(e) => setEditForm(f => ({ ...f, notes: e.target.value }))}
                          rows={2}
                          placeholder="Add internal notes about this order..."
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
                        />
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => saveEdit(order.id)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                        >
                          <Save className="w-4 h-4" /> Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                        >
                          <X className="w-4 h-4" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* View mode */
                    <>
                      {order.notes && (
                        <div className="mb-3 p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                          <p className="text-xs font-semibold text-amber-700 mb-0.5">Notes</p>
                          <p className="text-sm text-amber-800">{order.notes}</p>
                        </div>
                      )}
                      <p className="text-xs font-semibold text-cocoa-800/60 mb-2 uppercase tracking-wide">{t('orderItems')}</p>
                      <ul className="space-y-1.5">
                        {(order.items || []).map((item: any, i: number) => (
                          <li key={i} className="flex items-center justify-between text-sm">
                            <span className="text-cocoa-800">{item.name} × {item.qty}</span>
                            <span className="font-semibold text-cocoa-800">{formatPriceSimple(item.price * item.qty)}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="flex items-center gap-3 mt-3 pt-2 border-t border-gray-50">
                        <a
                          href={`https://wa.me/${order.customer_phone.replace(/^0/, '20')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-green-600 hover:underline font-medium"
                        >
                          {t('contactWhatsapp')}
                        </a>
                        <span className="text-xs text-cocoa-800/40">
                          {new Date(order.created_at).toLocaleString()}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
