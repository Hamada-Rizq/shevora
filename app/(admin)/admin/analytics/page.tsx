import { createServiceClient } from '@/lib/supabase-server'
import { TrendingUp, ShoppingCart, Package, DollarSign, BarChart2, Star } from 'lucide-react'
import { formatPriceSimple } from '@/lib/utils'

async function getAnalytics() {
  const supabase = createServiceClient()

  const [
    { data: orders },
    { data: products },
    { data: reviews },
    { data: leads },
  ] = await Promise.all([
    supabase.from('orders').select('*').not('status', 'eq', 'cancelled'),
    supabase.from('inventory').select('id,name,cost_price,selling_price').eq('is_published', true),
    supabase.from('reviews').select('rating').eq('is_approved', true),
    supabase.from('social_leads').select('source, status'),
  ])

  const totalRevenue = orders?.reduce((s, o) => s + (o.total || 0), 0) || 0

  // Profit calc using orders items and product costs
  // Simplified: sum (selling - cost) × qty for each order
  let totalProfit = 0
  const productMap: Record<string, number> = {}
  products?.forEach((p) => { productMap[p.id] = p.cost_price || 0 })

  orders?.forEach((order) => {
    const items = order.items as any[]
    items?.forEach((item) => {
      const cost = productMap[item.id] || 0
      totalProfit += (item.price - cost) * item.qty
    })
  })

  const avgRating = reviews?.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '0'

  const leadsBySource = leads?.reduce((acc: Record<string, number>, l) => {
    acc[l.source] = (acc[l.source] || 0) + 1
    return acc
  }, {}) || {}

  const convertedLeads = leads?.filter((l) => l.status === 'converted').length || 0
  const totalLeads = leads?.length || 0
  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0'

  return {
    totalRevenue,
    totalProfit,
    ordersCount: orders?.length || 0,
    avgRating,
    totalLeads,
    convertedLeads,
    conversionRate,
    leadsBySource,
    recentOrders: orders?.slice(-10).reverse() || [],
  }
}

export default async function AnalyticsPage() {
  const stats = await getAnalytics()

  const kpis = [
    { label: 'إجمالي الإيرادات', value: formatPriceSimple(stats.totalRevenue), icon: DollarSign, color: 'bg-green-100 text-green-600', sub: 'كل الطلبات المؤكدة' },
    { label: 'الأرباح المقدرة', value: formatPriceSimple(stats.totalProfit), icon: TrendingUp, color: 'bg-primary-100 text-primary-600', sub: 'الإيراد - التكلفة' },
    { label: 'الطلبات الكلية', value: stats.ordersCount, icon: ShoppingCart, color: 'bg-blue-100 text-blue-600', sub: 'باستثناء الملغى' },
    { label: 'متوسط التقييم', value: `${stats.avgRating} ⭐`, icon: Star, color: 'bg-amber-100 text-amber-600', sub: 'من التقييمات المعتمدة' },
    { label: 'العملاء المحتملون', value: stats.totalLeads, icon: Package, color: 'bg-rosegold-100 text-rosegold-500', sub: 'من جميع المصادر' },
    { label: 'معدل التحويل', value: `${stats.conversionRate}%`, icon: BarChart2, color: 'bg-purple-100 text-purple-600', sub: `${stats.convertedLeads} محوّل` },
  ]

  const SOURCE_LABELS: Record<string, string> = {
    tiktok:    '🎵 TikTok',
    instagram: '📸 Instagram',
    meta_ads:  '📢 Meta Ads',
    whatsapp:  '💬 WhatsApp',
    other:     '🔗 أخرى',
  }

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-charcoal-800">التحليلات والإحصاءات</h1>
        <p className="text-sm text-charcoal-600/60 mt-1">نظرة شاملة على أداء متجر Shevora</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="admin-card hover:shadow-card-hover transition-shadow">
            <div className={`p-2.5 rounded-xl w-fit mb-3 ${kpi.color}`}>
              <kpi.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-charcoal-800">{kpi.value}</p>
            <p className="text-sm font-semibold text-charcoal-700 mt-1">{kpi.label}</p>
            <p className="text-xs text-charcoal-600/50 mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Leads by source */}
      <div className="admin-card">
        <h2 className="font-bold text-charcoal-800 mb-4">مصادر العملاء المحتملين</h2>
        <div className="space-y-3">
          {Object.entries(stats.leadsBySource).sort(([, a], [, b]) => b - a).map(([source, count]) => {
            const pct = stats.totalLeads > 0 ? Math.round((count / stats.totalLeads) * 100) : 0
            return (
              <div key={source}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-charcoal-700">{SOURCE_LABELS[source] || source}</span>
                  <span className="text-sm font-bold text-charcoal-800">{count} ({pct}%)</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-400 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
          {Object.keys(stats.leadsBySource).length === 0 && (
            <p className="text-center text-charcoal-600/40 py-6">لا توجد بيانات بعد</p>
          )}
        </div>
      </div>

      {/* Profit margin info */}
      <div className="admin-card bg-primary-50 border border-primary-200">
        <div className="flex items-start gap-3">
          <TrendingUp className="w-6 h-6 text-primary-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-charcoal-800">نسبة هامش الربح</p>
            <p className="text-sm text-charcoal-600/80 mt-1">
              هامش الربح = الأرباح ÷ الإيرادات × 100 =
              <strong className="text-primary-600 mx-1">
                {stats.totalRevenue > 0
                  ? ` ${((stats.totalProfit / stats.totalRevenue) * 100).toFixed(1)}%`
                  : ' —'}
              </strong>
            </p>
            <p className="text-xs text-charcoal-600/50 mt-1">
              محسوب على أساس سعر التكلفة المسجل في المخزون
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
