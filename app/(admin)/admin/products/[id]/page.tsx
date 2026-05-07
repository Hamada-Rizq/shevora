'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { Save, ArrowLeft, ImagePlus, Trash2, X } from 'lucide-react'
import { Inventory, Category } from '@/lib/types'
import { createClient } from '@/lib/supabase'

const OFFER_TYPES = [
  { value: '', label: 'بدون عرض' },
  { value: 'buy_1_get_1', label: 'اشترِ 1 واحصل على 1 مجاناً' },
  { value: 'discount_percent', label: 'خصم %' },
  { value: 'bundle_deal', label: 'عرض باقة' },
  { value: 'limited_offer', label: 'عرض محدود' },
]

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [product, setProduct] = useState<Inventory | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [images, setImages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newImages, setNewImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])

  const [form, setForm] = useState<any>({})

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/products/${id}`).then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
    ]).then(([{ data: prod }, { data: cats }]) => {
      if (prod) {
        setProduct(prod)
        setImages(prod.images || [])
        setForm({
          name: prod.name || '',
          description: prod.description || '',
          sku: prod.sku || '',
          category_id: prod.category_id || '',
          cost_price: String(prod.cost_price || ''),
          wholesale_price: String(prod.wholesale_price || ''),
          selling_price: String(prod.selling_price || ''),
          stock_quantity: String(prod.stock_quantity || '0'),
          has_price_drop: prod.has_price_drop || false,
          old_price: String(prod.old_price || ''),
          new_price: String(prod.new_price || ''),
          offer_type: prod.offer_type || '',
          offer_value: String(prod.offer_value || ''),
          offer_label: prod.offer_label || '',
          is_published: prod.is_published || false,
          is_featured: prod.is_featured || false,
          tags: (prod.tags || []).join(', '),
        })
      }
      setCategories(cats || [])
      setLoading(false)
    })
  }, [id])

  const handleNewImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setNewImages((prev) => [...prev, ...files])
    files.forEach((f) => {
      const reader = new FileReader()
      reader.onload = (ev) => setPreviews((prev) => [...prev, ev.target?.result as string])
      reader.readAsDataURL(f)
    })
  }

  const deleteImage = async (imgId: string) => {
    const supabase = createClient()
    await supabase.from('product_images').delete().eq('id', imgId)
    setImages((prev) => prev.filter((i) => i.id !== imgId))
    toast.success('تم حذف الصورة')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        cost_price: Number(form.cost_price) || 0,
        wholesale_price: Number(form.wholesale_price) || 0,
        selling_price: form.selling_price ? Number(form.selling_price) : null,
        stock_quantity: Number(form.stock_quantity) || 0,
        old_price: form.old_price ? Number(form.old_price) : null,
        new_price: form.new_price ? Number(form.new_price) : null,
        offer_value: form.offer_value ? Number(form.offer_value) : null,
        offer_type: form.offer_type || null,
        tags: form.tags ? form.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      }),
    })

    if (!res.ok) { toast.error('فشل التحديث'); setSaving(false); return }

    // Upload new images via server route (uses service role key)
    if (newImages.length > 0) {
      for (let i = 0; i < newImages.length; i++) {
        const file = newImages[i]
        const fd = new FormData()
        fd.append('file', file)
        fd.append('product_id', id)
        fd.append('is_primary', String(images.length === 0 && i === 0))
        const uploadRes = await fetch('/api/admin/upload-image', { method: 'POST', body: fd })
        if (!uploadRes.ok) {
          const err = await uploadRes.json()
          toast.error(`فشل رفع الصورة: ${err.error}`)
        }
      }
    }

    toast.success('تم تحديث المنتج ✅')
    setSaving(false)
    router.push('/admin/products')
  }

  const set = (key: string, value: any) => setForm((f: any) => ({ ...f, [key]: value }))

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" /></div>
  if (!product) return <div className="text-center py-16 text-charcoal-600/40">المنتج غير موجود</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in" dir="rtl">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-charcoal-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-charcoal-800">تعديل: {product.name}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="admin-card space-y-5">
          <h2 className="font-bold text-charcoal-800 border-b border-gray-100 pb-3">المعلومات الأساسية</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="label">اسم المنتج *</label>
              <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} className="input" required />
            </div>
            <div>
              <label className="label">SKU</label>
              <input type="text" value={form.sku} onChange={(e) => set('sku', e.target.value)} className="input" dir="ltr" />
            </div>
            <div>
              <label className="label">التصنيف</label>
              <select value={form.category_id} onChange={(e) => set('category_id', e.target.value)} className="input">
                <option value="">اختر تصنيف</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label">الوصف</label>
              <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} className="input resize-none" />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="admin-card space-y-5">
          <h2 className="font-bold text-charcoal-800 border-b border-gray-100 pb-3">التسعير</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div><label className="label">التكلفة (EGP)</label><input type="number" value={form.cost_price} onChange={(e) => set('cost_price', e.target.value)} className="input" dir="ltr" /></div>
            <div><label className="label">الجملة (EGP)</label><input type="number" value={form.wholesale_price} onChange={(e) => set('wholesale_price', e.target.value)} className="input" dir="ltr" /></div>
            <div><label className="label">البيع (EGP) *</label><input type="number" value={form.selling_price} onChange={(e) => set('selling_price', e.target.value)} className="input border-primary-300" dir="ltr" /></div>
            <div><label className="label">المخزون</label><input type="number" value={form.stock_quantity} onChange={(e) => set('stock_quantity', e.target.value)} className="input" dir="ltr" /></div>
          </div>
        </div>

        {/* Offers */}
        <div className="admin-card space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="font-bold text-charcoal-800">العروض</h2>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => set('has_price_drop', !form.has_price_drop)}>
              <span className="text-sm text-charcoal-600">تفعيل</span>
              <div className={`relative w-10 h-5 rounded-full transition-colors ${form.has_price_drop ? 'bg-primary-500' : 'bg-gray-200'}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.has_price_drop ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
            </div>
          </div>
          {form.has_price_drop && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in">
              <div><label className="label">السعر القديم</label><input type="number" value={form.old_price} onChange={(e) => set('old_price', e.target.value)} className="input" dir="ltr" /></div>
              <div><label className="label">السعر الجديد</label><input type="number" value={form.new_price} onChange={(e) => set('new_price', e.target.value)} className="input" dir="ltr" /></div>
              <div><label className="label">نوع العرض</label>
                <select value={form.offer_type} onChange={(e) => set('offer_type', e.target.value)} className="input">
                  {OFFER_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div><label className="label">نص الشارة</label><input type="text" value={form.offer_label} onChange={(e) => set('offer_label', e.target.value)} className="input" /></div>
            </div>
          )}
        </div>

        {/* Images */}
        <div className="admin-card space-y-4">
          <h2 className="font-bold text-charcoal-800 border-b border-gray-100 pb-3">الصور</h2>
          <div className="flex flex-wrap gap-3">
            {images.map((img) => (
              <div key={img.id} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-primary-200">
                <img src={img.url} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => deleteImage(img.id)} className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-white/90 text-red-400">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
            {previews.map((src, i) => (
              <div key={`new-${i}`} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-green-300">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => { setNewImages(p => p.filter((_, idx) => idx !== i)); setPreviews(p => p.filter((_, idx) => idx !== i)) }} className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-white/90 text-red-400">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <label className="w-20 h-20 rounded-xl border-2 border-dashed border-primary-300 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-primary-50 transition-colors">
              <ImagePlus className="w-5 h-5 text-primary-400" />
              <span className="text-[10px] text-primary-400">إضافة</span>
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleNewImages} />
            </label>
          </div>
        </div>

        {/* Settings */}
        <div className="admin-card">
          <h2 className="font-bold text-charcoal-800 border-b border-gray-100 pb-3 mb-4">الإعدادات</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center justify-between p-3 rounded-xl border border-gray-200 cursor-pointer hover:border-primary-300 transition-colors">
              <span className="text-sm font-medium text-charcoal-700">نشر المنتج</span>
              <div className={`relative w-10 h-5 rounded-full transition-colors ${form.is_published ? 'bg-primary-500' : 'bg-gray-200'}`} onClick={() => set('is_published', !form.is_published)}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.is_published ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
            </label>
            <label className="flex items-center justify-between p-3 rounded-xl border border-gray-200 cursor-pointer hover:border-primary-300 transition-colors">
              <span className="text-sm font-medium text-charcoal-700">منتج مميز</span>
              <div className={`relative w-10 h-5 rounded-full transition-colors ${form.is_featured ? 'bg-rosegold-400' : 'bg-gray-200'}`} onClick={() => set('is_featured', !form.is_featured)}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.is_featured ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary flex-1 py-3.5 disabled:opacity-50">
            {saving ? '⏳ جارٍ الحفظ...' : <><Save className="w-5 h-5" /> حفظ التعديلات</>}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary px-6">إلغاء</button>
        </div>
      </form>
    </div>
  )
}
