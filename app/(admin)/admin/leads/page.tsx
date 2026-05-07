'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Search, ExternalLink, Filter } from 'lucide-react'
import { SocialLead, LeadSource, LeadStatus } from '@/lib/types'

const SOURCE_LABELS: Record<LeadSource, string> = {
  tiktok:    '🎵 TikTok',
  instagram: '📸 Instagram',
  meta_ads:  '📢 Meta Ads',
  whatsapp:  '💬 WhatsApp',
  other:     '🔗 أخرى',
}

const STATUS_LABELS: Record<LeadStatus, string> = {
  new:       'جديد',
  contacted: 'تم التواصل',
  converted: 'تحويل',
  lost:      'خسارة',
}

const STATUS_COLORS: Record<LeadStatus, string> = {
  new:       'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  converted: 'bg-green-100 text-green-700',
  lost:      'bg-red-100 text-red-700',
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<SocialLead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ source: 'instagram' as LeadSource, name: '', phone: '', message: '', campaign: '' })

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/leads')
    const { data } = await res.json()
    setLeads(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const addLead = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/admin/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      toast.success('تم إضافة العميل المحتمل ✅')
      setShowAdd(false)
      setForm({ source: 'instagram', name: '', phone: '', message: '', campaign: '' })
      load()
    }
  }

  const updateStatus = async (id: string, status: LeadStatus) => {
    const res = await fetch(`/api/admin/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status } : l))
      toast.success('تم التحديث')
    }
  }

  const filtered = leads.filter((l) => {
    const matchSearch =
      (l.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.phone || '').includes(search) ||
      (l.campaign || '').toLowerCase().includes(search.toLowerCase())
    const matchSource = sourceFilter === 'all' || l.source === sourceFilter
    return matchSearch && matchSource
  })

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-800">العملاء المحتملون (CRM)</h1>
          <p className="text-sm text-charcoal-600/60 mt-1">{filtered.length} عميل محتمل</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary text-sm py-2 px-4">
          <Plus className="w-4 h-4" /> إضافة عميل
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="admin-card animate-slide-up">
          <h2 className="font-bold text-charcoal-800 mb-4">إضافة عميل محتمل جديد</h2>
          <form onSubmit={addLead} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">المصدر</label>
              <select value={form.source} onChange={(e) => setForm(f => ({ ...f, source: e.target.value as LeadSource }))} className="input">
                {Object.entries(SOURCE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">الاسم</label>
              <input type="text" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="label">الهاتف</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} className="input" dir="ltr" />
            </div>
            <div>
              <label className="label">الحملة</label>
              <input type="text" value={form.campaign} onChange={(e) => setForm(f => ({ ...f, campaign: e.target.value }))} placeholder="مثال: رمضان 2025" className="input" />
            </div>
            <div className="md:col-span-2">
              <label className="label">الرسالة</label>
              <textarea value={form.message} onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))} rows={2} className="input resize-none" />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="btn-primary text-sm px-5">حفظ</button>
              <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary text-sm px-5">إلغاء</button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو الهاتف..."
            className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white"
          />
        </div>
        <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-400">
          <option value="all">كل المصادر</option>
          {Object.entries(SOURCE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="admin-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-right">
              <tr className="text-charcoal-600/60 text-xs font-semibold uppercase tracking-wider">
                <th className="px-4 py-3">الاسم</th>
                <th className="px-4 py-3">المصدر</th>
                <th className="px-4 py-3">الهاتف</th>
                <th className="px-4 py-3">الحملة</th>
                <th className="px-4 py-3">الحالة</th>
                <th className="px-4 py-3">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-charcoal-600/40">جارٍ التحميل...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-charcoal-600/40">لا توجد بيانات</td></tr>
              ) : (
                filtered.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-charcoal-800">{lead.name || '—'}</td>
                    <td className="px-4 py-3 text-xs">{SOURCE_LABELS[lead.source]}</td>
                    <td className="px-4 py-3">
                      {lead.phone ? (
                        <a href={`https://wa.me/${lead.phone.replace(/^0/, '20')}`} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-green-600 hover:underline font-medium text-xs">
                          {lead.phone} <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-charcoal-600/60">{lead.campaign || '—'}</td>
                    <td className="px-4 py-3">
                      <select
                        value={lead.status}
                        onChange={(e) => updateStatus(lead.id, e.target.value as LeadStatus)}
                        className={`px-2 py-1 rounded-full text-xs font-semibold border-0 cursor-pointer focus:outline-none ${STATUS_COLORS[lead.status]}`}
                      >
                        {Object.entries(STATUS_LABELS).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-charcoal-600/40">
                      {new Date(lead.created_at).toLocaleDateString('ar-EG')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
