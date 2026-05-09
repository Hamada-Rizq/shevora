'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, Check, X, ChevronDown, ChevronRight, Eye, EyeOff } from 'lucide-react'
import { Category } from '@/lib/types'
import { cn } from '@/lib/utils'

const CATEGORY_ICONS: Record<string, string> = {
  all: '🌸', skincare: '✨', haircare: '💆', 'body-care': '🛁',
  makeup: '💄', tools: '🪥', bundles: '🎁', 'hot-offers': '🔥',
  kids: '🍼', 'men-care': '🧔', 'mixed-sets': '🎀',
}

interface FormState {
  name: string
  name_ar: string
  name_en: string
  parent_id: string
  sort_order: string
  link_type: string
  link_url: string
  icon: string
}

const emptyForm = (): FormState => ({
  name: '', name_ar: '', name_en: '', parent_id: '',
  sort_order: '', link_type: 'category', link_url: '', icon: '',
})

export default function CategoriesPage() {
  const [tree, setTree] = useState<Category[]>([])
  const [flat, setFlat] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<FormState>(emptyForm())

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/categories')
    const { data, flat: flatData } = await res.json()
    setTree(data || [])
    setFlat(flatData || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const addCategory = async () => {
    if (!form.name.trim() && !form.name_ar.trim()) { toast.error('الاسم مطلوب'); return }
    setSaving(true)
    const displayName = form.name_ar || form.name_en || form.name
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: displayName,
        name_ar: form.name_ar || displayName,
        name_en: form.name_en || displayName,
        parent_id: form.parent_id || null,
        sort_order: form.sort_order ? Number(form.sort_order) : undefined,
        link_type: form.link_type,
        link_url: form.link_url || null,
        icon: form.icon || null,
      }),
    })
    if (res.ok) {
      toast.success('تم إضافة التصنيف ✅')
      setForm(emptyForm())
      setShowAddForm(false)
      load()
    } else {
      const { error } = await res.json()
      toast.error(error || 'فشل الإضافة')
    }
    setSaving(false)
  }

  const startEdit = (cat: Category) => {
    setEditingId(cat.id)
    setEditForm({
      name: cat.name,
      name_ar: cat.name_ar || cat.name,
      name_en: cat.name_en || '',
      parent_id: cat.parent_id || '',
      sort_order: String(cat.sort_order || ''),
      link_type: cat.link_type || 'category',
      link_url: cat.link_url || '',
      icon: cat.icon || '',
    })
  }

  const saveEdit = async (id: string) => {
    const displayName = editForm.name_ar || editForm.name_en || editForm.name
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: displayName,
        name_ar: editForm.name_ar,
        name_en: editForm.name_en,
        parent_id: editForm.parent_id || null,
        sort_order: editForm.sort_order ? Number(editForm.sort_order) : undefined,
        link_type: editForm.link_type,
        link_url: editForm.link_url || null,
        icon: editForm.icon || null,
      }),
    })
    if (res.ok) {
      toast.success('تم التحديث ✅')
      setEditingId(null)
      load()
    } else {
      toast.error('فشل التحديث')
    }
  }

  const toggleVisibility = async (cat: Category) => {
    const res = await fetch(`/api/admin/categories/${cat.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !cat.is_active }),
    })
    if (res.ok) {
      toast.success(cat.is_active ? 'تم إخفاء التصنيف' : 'تم إظهار التصنيف')
      load()
    }
  }

  const deleteCategory = async (id: string, name: string) => {
    if (!confirm(`حذف التصنيف "${name}"؟`)) return
    const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('تم الحذف')
      load()
    } else {
      const { error } = await res.json()
      toast.error(error || 'فشل الحذف')
    }
  }

  const setF = (key: keyof FormState, value: string) => setForm((f) => ({ ...f, [key]: value }))
  const setEF = (key: keyof FormState, value: string) => setEditForm((f) => ({ ...f, [key]: value }))

  const rootCategories = flat.filter((c) => !c.parent_id)

  const renderCategoryRow = (cat: Category, depth = 0) => {
    const isEditing = editingId === cat.id
    const isExp = expanded.has(cat.id)
    const hasSubs = cat.subcategories && cat.subcategories.length > 0

    return (
      <div key={cat.id}>
        <div
          className={cn(
            'flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50',
            depth > 0 && 'bg-primary-50/30'
          )}
          style={{ paddingRight: depth > 0 ? `${16 + depth * 20}px` : undefined }}
        >
          {/* Expand toggle */}
          <button
            onClick={() => hasSubs && toggleExpand(cat.id)}
            className={cn('mt-1 p-0.5 rounded text-charcoal-400 transition-colors', hasSubs ? 'hover:text-primary-500 cursor-pointer' : 'cursor-default opacity-0')}
          >
            {isExp ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          {isEditing ? (
            /* ── Edit form inline ── */
            <div className="flex-1 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-charcoal-500 mb-0.5 block">الاسم بالعربي *</label>
                  <input value={editForm.name_ar} onChange={(e) => setEF('name_ar', e.target.value)} className="input text-sm py-2" placeholder="مثال: العناية بالشعر" dir="rtl" />
                </div>
                <div>
                  <label className="text-xs text-charcoal-500 mb-0.5 block">English Name</label>
                  <input value={editForm.name_en} onChange={(e) => setEF('name_en', e.target.value)} className="input text-sm py-2" placeholder="e.g. Hair Care" dir="ltr" />
                </div>
                <div>
                  <label className="text-xs text-charcoal-500 mb-0.5 block">التصنيف الأب</label>
                  <select value={editForm.parent_id} onChange={(e) => setEF('parent_id', e.target.value)} className="input text-sm py-2">
                    <option value="">تصنيف رئيسي</option>
                    {rootCategories.filter((c) => c.id !== cat.id).map((c) => (
                      <option key={c.id} value={c.id}>{c.name_ar || c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-charcoal-500 mb-0.5 block">ترتيب العرض</label>
                  <input type="number" value={editForm.sort_order} onChange={(e) => setEF('sort_order', e.target.value)} className="input text-sm py-2" dir="ltr" />
                </div>
                <div>
                  <label className="text-xs text-charcoal-500 mb-0.5 block">نوع الرابط</label>
                  <select value={editForm.link_type} onChange={(e) => setEF('link_type', e.target.value)} className="input text-sm py-2">
                    <option value="category">تصنيف</option>
                    <option value="collection">مجموعة</option>
                    <option value="brand">ماركة</option>
                    <option value="url">رابط مخصص</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-charcoal-500 mb-0.5 block">الرابط (اختياري)</label>
                  <input value={editForm.link_url} onChange={(e) => setEF('link_url', e.target.value)} className="input text-sm py-2" placeholder="/products?cat=..." dir="ltr" />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => saveEdit(cat.id)} className="btn-primary py-1.5 px-4 text-sm flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> حفظ
                </button>
                <button onClick={() => setEditingId(null)} className="btn-secondary py-1.5 px-4 text-sm flex items-center gap-1">
                  <X className="w-3.5 h-3.5" /> إلغاء
                </button>
              </div>
            </div>
          ) : (
            /* ── Display row ── */
            <>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base">{CATEGORY_ICONS[cat.slug] || cat.icon || '📦'}</span>
                  <div>
                    <p className="font-semibold text-charcoal-800 text-sm">
                      {cat.name_ar || cat.name}
                      {cat.name_en && <span className="text-charcoal-400 font-normal mx-1">/ {cat.name_en}</span>}
                    </p>
                    <p className="text-xs text-charcoal-600/40 font-mono">{cat.slug}</p>
                  </div>
                  {hasSubs && (
                    <span className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full font-medium">
                      {cat.subcategories!.length} فرعي
                    </span>
                  )}
                  {depth > 0 && (
                    <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">فرعي</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold', cat.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>
                  {cat.is_active ? 'نشط' : 'مخفي'}
                </span>
                <button onClick={() => toggleVisibility(cat)} title="تبديل الظهور"
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-charcoal-500 transition-colors">
                  {cat.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => startEdit(cat)}
                  className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-500 transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => deleteCategory(cat.id, cat.name_ar || cat.name)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Subcategories */}
        {hasSubs && isExp && cat.subcategories!.map((sub) => renderCategoryRow(sub, depth + 1))}
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-cocoa-800">إدارة التصنيفات</h1>
          <p className="text-sm text-cocoa-800/60 mt-1">أضف أو عدّل التصنيفات الرئيسية والفرعية مع دعم العربية والإنجليزية</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          إضافة تصنيف
        </button>
      </div>

      {/* ── Add Form ── */}
      {showAddForm && (
        <div className="admin-card animate-fade-in space-y-4">
          <h2 className="font-bold text-charcoal-800 border-b border-gray-100 pb-3">إضافة تصنيف جديد</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">الاسم بالعربي *</label>
              <input value={form.name_ar} onChange={(e) => setF('name_ar', e.target.value)} className="input" placeholder="مثال: العناية بالشعر" dir="rtl" />
            </div>
            <div>
              <label className="label">English Name</label>
              <input value={form.name_en} onChange={(e) => setF('name_en', e.target.value)} className="input" placeholder="e.g. Hair Care" dir="ltr" />
            </div>
            <div>
              <label className="label">التصنيف الأب (اختياري)</label>
              <select value={form.parent_id} onChange={(e) => setF('parent_id', e.target.value)} className="input">
                <option value="">تصنيف رئيسي (لا يوجد أب)</option>
                {rootCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name_ar || c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">ترتيب العرض</label>
              <input type="number" value={form.sort_order} onChange={(e) => setF('sort_order', e.target.value)} className="input" placeholder="تلقائي" dir="ltr" />
            </div>
            <div>
              <label className="label">نوع الرابط</label>
              <select value={form.link_type} onChange={(e) => setF('link_type', e.target.value)} className="input">
                <option value="category">تصنيف (category)</option>
                <option value="collection">مجموعة (collection)</option>
                <option value="brand">ماركة (brand)</option>
                <option value="url">رابط مخصص (URL)</option>
              </select>
            </div>
            <div>
              <label className="label">رابط مخصص (اختياري)</label>
              <input value={form.link_url} onChange={(e) => setF('link_url', e.target.value)} className="input" placeholder="/products?cat=..." dir="ltr" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={addCategory} disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-50">
              <Plus className="w-4 h-4" />
              {saving ? 'جارٍ الحفظ...' : 'إضافة التصنيف'}
            </button>
            <button onClick={() => { setShowAddForm(false); setForm(emptyForm()) }} className="btn-secondary">إلغاء</button>
          </div>
        </div>
      )}

      {/* ── Category Tree ── */}
      <div className="admin-card overflow-hidden p-0">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-charcoal-800">التصنيفات ({flat.length})</h2>
          <button
            onClick={() => setExpanded(new Set(tree.filter((c) => c.subcategories?.length).map((c) => c.id)))}
            className="text-xs text-primary-500 hover:underline"
          >
            توسيع الكل
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-charcoal-400">جارٍ التحميل...</div>
        ) : tree.length === 0 ? (
          <div className="p-8 text-center text-charcoal-400">لا توجد تصنيفات بعد</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {tree.map((cat) => renderCategoryRow(cat))}
          </div>
        )}
      </div>

      {/* ── Usage tip ── */}
      <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 text-sm text-charcoal-600 space-y-1">
        <p className="font-semibold text-charcoal-800">💡 كيفية الاستخدام</p>
        <p>• التصنيفات الرئيسية تظهر في شريط التنقل العلوي والـ Mega Menu</p>
        <p>• التصنيفات الفرعية تظهر كقائمة منسدلة عند تحريك الماوس على التصنيف الرئيسي (Desktop) أو بالضغط (Mobile)</p>
        <p>• الاسم بالعربي يُستخدم في النسخة العربية والاسم الإنجليزي في النسخة الإنجليزية</p>
        <p>• يمكن إخفاء أي تصنيف دون حذفه بالضغط على أيقونة العين</p>
      </div>
    </div>
  )
}
