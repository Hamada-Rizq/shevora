'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Save, Upload, X, ArrowLeft, ImagePlus } from 'lucide-react'
import { Category } from '@/lib/types'
import { createClient } from '@/lib/supabase'

const OFFER_TYPES = [
  { value: '', label: 'بدون عرض' },
  { value: 'buy_1_get_1', label: 'اشترِ 1 واحصل على 1 مجاناً' },
  { value: 'discount_percent', label: 'خصم %' },
  { value: 'bundle_deal', label: 'عرض باقة' },
  { value: 'limited_offer', label: 'عرض محدود' },
]

export default function NewProductPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [saving, setSaving] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [searchInventory, setSearchInventory] = useState('')
  const [inventorySuggestions, setInventorySuggestions] = useState<any[]>([])

  const [form, setForm] = useState({
    name: '', description: '', sku: '', category_id: '',
    cost_price: '', wholesale_price: '', selling_price: '',
    stock_quantity: '0', has_price_drop: false,
    old_price: '', new_price: '', offer_type: '', offer_value: '', offer_label: '',
    is_published: false, is_featured: false, tags: '',
  })

  useEffect(() => {
    fetch('/api/categories').then((r) => r.json()).then(({ data }) => setCategories(data || []))
  }, [])

  // Search existing inventory for auto-fill
  useEffect(() => {
    if (searchInventory.length < 2) { setInventorySuggestions([]); return }
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/admin/products?q=${searchInventory}&limit=5`)
      const { data } = await res.json()
      setInventorySuggestions(data || [])
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInventory])

  const fillFromInventory = (item: any) => {
    setForm((f) => ({
      ...f,
      name: item.name,
      description: item.description || '',
      sku: item.sku || '',
      cost_price: String(item.cost_price || ''),
      wholesale_price: String(item.wholesale_price || ''),
      selling_price: String(item.selling_price || ''),
      stock_quantity: String(item.stock_quantity || '0'),
      category_id: item.category_id || '',
    }))
    setInventorySuggestions([])
    setSearchInventory('')
  }

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setImages((prev) => [...prev, ...files])
    files.forEach((f) => {
      const reader = new FileReader()
      reader.onload = (ev) => setPreviews((prev) => [...prev, ev.target?.result as string])
      reader.readAsDataURL(f)
    })
  }

  const removeImage = (i: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== i))
    setPreviews((prev) => prev.filter((_, idx) => idx !== i))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('اسم المنتج مطلوب'); return }
    setSaving(true)

    const supabase = createClient()

    // Create product
    const res = await fetch('/api/admin/products', {
      method: 'POST',
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
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      }),
    })

    if (!res.ok) {
      toast.error('فشل حفظ المنتج')
      setSaving(false)
      return
    }

    const { data: newProduct } = await res.json()

    // Upload images
    if (images.length > 0 && newProduct?.id) {
      for (let i = 0; i < images.length; i++) {
        const file = images[i]
        const ext = file.name.split('.').pop()
        const path = `products/${newProduct.id}/${Date.now()}-${i}.${ext}`
        const { data: uploaded } = await supabase.storage.from('product-images').upload(path, file)
        if (uploaded) {
          const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path)
          await fetch('/api/admin/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id: newProduct.id, url: publicUrl, is_primary: i === 0 }),
          })
        }
      }
    }

    toast.success('تم حفظ المنتج بنجاح 🎉')
    router.push('/admin/products')
  }

  const set = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }))

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in" dir="rtl">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-charcoal-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-charcoal-800">إضافة منتج جديد</h1>
          <p className="text-sm text-charcoal-600/60">أضف منتجاً جديداً إلى متجر Shevora</p>
        </div>
      </div>

      {/* Inventory search (auto-fill) */}
      <div className="admin-card">
        <h2 className="font-semibold text-charcoal-800 mb-3">🔍 بحث في المخزون (ملء تلقائي)</h2>
        <div className="relative">
          <input
            type="text"
            value={searchInventory}
            onChange={(e) => setSearchInventory(e.target.value)}
            placeholder="ابحث عن منتج موجود لملء البيانات تلقائياً..."
            className="input text-sm"
          />
          {inventorySuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-primary-200 rounded-xl shadow-card mt-1 overflow-hidden z-10">
              {inventorySuggestions.map((item) => (
                <button
                  key={item.id}
                  onClick={() => fillFromInventory(item)}
                  className="w-full text-right px-4 py-3 hover:bg-primary-50 border-b border-gray-50 last:border-0 transition-colors"
                >
                  <p className="text-sm font-semibold text-charcoal-800">{item.name}</p>
                  <p className="text-xs text-charcoal-600/60">{item.sku} · {item.cost_price} EGP تكلفة</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Basic Info */}
        <div className="admin-card space-y-5">
          <h2 className="font-bold text-charcoal-800 border-b border-gray-100 pb-3">المعلومات الأساسية</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="label">اسم المنتج *</label>
              <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)}
                placeholder="مثال: كريم تفتيح البشرة بالكولاجين" className="input" required />
            </div>

            <div>
              <label className="label">SKU</label>
              <input type="text" value={form.sku} onChange={(e) => set('sku', e.target.value)}
                placeholder="مثال: SKN-001" className="input" dir="ltr" />
            </div>

            <div>
              <label className="label">التصنيف</label>
              <select value={form.category_id} onChange={(e) => set('category_id', e.target.value)} className="input">
                <option value="">اختر تصنيف</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="label">الوصف</label>
              <textarea value={form.description} onChange={(e) => set('description', e.target.value)}
                rows={3} placeholder="وصف المنتج..." className="input resize-none" />
            </div>

            <div className="md:col-span-2">
              <label className="label">الوسوم (مفصولة بفاصلة)</label>
              <input type="text" value={form.tags} onChange={(e) => set('tags', e.target.value)}
                placeholder="مثال: بشرة، تفتيح، طبيعي" className="input" />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="admin-card space-y-5">
          <h2 className="font-bold text-charcoal-800 border-b border-gray-100 pb-3">التسعير</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="label">سعر التكلفة (EGP)</label>
              <input type="number" min="0" step="0.01" value={form.cost_price}
                onChange={(e) => set('cost_price', e.target.value)} className="input" dir="ltr" />
            </div>
            <div>
              <label className="label">سعر الجملة (EGP)</label>
              <input type="number" min="0" step="0.01" value={form.wholesale_price}
                onChange={(e) => set('wholesale_price', e.target.value)} className="input" dir="ltr" />
            </div>
            <div>
              <label className="label">سعر البيع (EGP) *</label>
              <input type="number" min="0" step="0.01" value={form.selling_price}
                onChange={(e) => set('selling_price', e.target.value)}
                className="input border-primary-300 focus:ring-primary-400" dir="ltr" />
            </div>
            <div>
              <label className="label">الكمية في المخزون</label>
              <input type="number" min="0" value={form.stock_quantity}
                onChange={(e) => set('stock_quantity', e.target.value)} className="input" dir="ltr" />
            </div>
          </div>
        </div>

        {/* Offers */}
        <div className="admin-card space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="font-bold text-charcoal-800">العروض والخصومات</h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-sm text-charcoal-600">تفعيل تغيير السعر</span>
              <div className={`relative w-10 h-5 rounded-full transition-colors ${form.has_price_drop ? 'bg-primary-500' : 'bg-gray-200'}`}
                onClick={() => set('has_price_drop', !form.has_price_drop)}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.has_price_drop ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
            </label>
          </div>

          {form.has_price_drop && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in">
              <div>
                <label className="label">السعر القديم (EGP)</label>
                <input type="number" min="0" step="0.01" value={form.old_price}
                  onChange={(e) => set('old_price', e.target.value)} className="input" dir="ltr" />
              </div>
              <div>
                <label className="label">السعر الجديد (EGP)</label>
                <input type="number" min="0" step="0.01" value={form.new_price}
                  onChange={(e) => set('new_price', e.target.value)} className="input" dir="ltr" />
              </div>
              <div>
                <label className="label">نوع العرض</label>
                <select value={form.offer_type} onChange={(e) => set('offer_type', e.target.value)} className="input">
                  {OFFER_TYPES.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              {form.offer_type === 'discount_percent' && (
                <div>
                  <label className="label">نسبة الخصم (%)</label>
                  <input type="number" min="1" max="100" value={form.offer_value}
                    onChange={(e) => set('offer_value', e.target.value)} className="input" dir="ltr" />
                </div>
              )}
              <div className="md:col-span-2">
                <label className="label">نص الشارة المخصصة (اختياري)</label>
                <input type="text" value={form.offer_label}
                  onChange={(e) => set('offer_label', e.target.value)}
                  placeholder="مثال: عرض نهاية الشهر" className="input" />
              </div>
            </div>
          )}
        </div>

        {/* Images */}
        <div className="admin-card space-y-4">
          <h2 className="font-bold text-charcoal-800 border-b border-gray-100 pb-3">صور المنتج</h2>
          <div className="flex flex-wrap gap-3">
            {previews.map((src, i) => (
              <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-primary-200">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(i)}
                  className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-white/90 text-red-400">
                  <X className="w-3 h-3" />
                </button>
                {i === 0 && <div className="absolute bottom-0 left-0 right-0 bg-primary-500/80 text-white text-[9px] text-center py-0.5 font-bold">رئيسية</div>}
              </div>
            ))}
            <label className="w-20 h-20 rounded-xl border-2 border-dashed border-primary-300 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-primary-50 transition-colors">
              <ImagePlus className="w-5 h-5 text-primary-400" />
              <span className="text-[10px] text-primary-400">إضافة</span>
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleImages} />
            </label>
          </div>
        </div>

        {/* Publish */}
        <div className="admin-card">
          <h2 className="font-bold text-charcoal-800 border-b border-gray-100 pb-3 mb-4">الإعدادات</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center justify-between p-3 rounded-xl border border-gray-200 cursor-pointer hover:border-primary-300 transition-colors">
              <span className="text-sm font-medium text-charcoal-700">نشر المنتج</span>
              <div className={`relative w-10 h-5 rounded-full transition-colors ${form.is_published ? 'bg-primary-500' : 'bg-gray-200'}`}
                onClick={() => set('is_published', !form.is_published)}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.is_published ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
            </label>
            <label className="flex items-center justify-between p-3 rounded-xl border border-gray-200 cursor-pointer hover:border-primary-300 transition-colors">
              <span className="text-sm font-medium text-charcoal-700">منتج مميز</span>
              <div className={`relative w-10 h-5 rounded-full transition-colors ${form.is_featured ? 'bg-rosegold-400' : 'bg-gray-200'}`}
                onClick={() => set('is_featured', !form.is_featured)}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.is_featured ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary flex-1 py-3.5 disabled:opacity-50">
            {saving ? <span className="animate-spin">⏳</span> : <Save className="w-5 h-5" />}
            {saving ? 'جارٍ الحفظ...' : 'حفظ المنتج'}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary px-6">
            إلغاء
          </button>
        </div>
      </form>
    </div>
  )
}
