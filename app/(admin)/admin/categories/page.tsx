'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, Check, X, GripVertical } from 'lucide-react'
import { Category } from '@/lib/types'
import { useT } from '@/lib/i18n'

export default function CategoriesPage() {
  const t = useT()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/categories')
    const { data } = await res.json()
    setCategories(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const addCategory = async () => {
    if (!newName.trim()) return
    setAdding(true)
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() }),
    })
    if (res.ok) {
      toast.success(t('categoryAdded'))
      setNewName('')
      load()
    } else {
      toast.error(t('categoryAddFailed'))
    }
    setAdding(false)
  }

  const updateCategory = async (id: string) => {
    if (!editName.trim()) return
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName }),
    })
    if (res.ok) {
      toast.success(t('categoryUpdated'))
      setEditingId(null)
      load()
    }
  }

  const deleteCategory = async (id: string) => {
    if (!confirm(t('deleteConfirm'))) return
    const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success(t('categoryDeleted'))
      load()
    } else {
      toast.error(t('categoryDeleteFailed'))
    }
  }

  const CATEGORY_ICONS: Record<string, string> = {
    all:'🌸', skincare:'✨', haircare:'💆', 'body-care':'🛁',
    makeup:'💄', tools:'🪥', bundles:'🎁', 'hot-offers':'🔥',
    kids:'🍼', 'men-care':'🧔', 'mixed-sets':'🎀',
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-cocoa-800">{t('categoriesTitle')}</h1>
        <p className="text-sm text-cocoa-800/60 mt-1">{t('categoriesSubtitle')}</p>
      </div>

      {/* Add new */}
      <div className="admin-card">
        <h2 className="font-semibold text-cocoa-800 mb-4">{t('addNewCategory')}</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCategory()}
            placeholder={t('categoryName')}
            className="input flex-1"
          />
          <button
            onClick={addCategory}
            disabled={adding || !newName.trim()}
            className="btn-primary px-5 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {t('add')}
          </button>
        </div>
      </div>

      {/* List */}
      <div className="admin-card overflow-hidden p-0">
        {loading ? (
          <div className="p-8 text-center text-cocoa-800/40">{t('loadingText')}</div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {categories.map((cat) => (
              <li key={cat.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
                {editingId === cat.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') updateCategory(cat.id); if (e.key === 'Escape') setEditingId(null) }}
                      className="input text-sm py-1.5 flex-1"
                      autoFocus
                    />
                    <button onClick={() => updateCategory(cat.id)} className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-4 h-4 text-gray-300" />
                      <span className="text-lg">{CATEGORY_ICONS[cat.slug] || '📦'}</span>
                      <div>
                        <p className="font-semibold text-charcoal-800 text-sm">{cat.name}</p>
                        <p className="text-xs text-charcoal-600/40 font-mono">{cat.slug}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cat.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {cat.is_active ? t('activeStatus') : t('hiddenStatus')}
                      </span>
                      <button
                        onClick={() => { setEditingId(cat.id); setEditName(cat.name) }}
                        className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-500 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteCategory(cat.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
