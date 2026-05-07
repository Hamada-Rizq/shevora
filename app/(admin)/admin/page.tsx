import { createServiceClient } from '@/lib/supabase-server'
import { Package, ShoppingCart, TrendingUp, Users, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { getServerT } from '@/lib/i18n-server'

async function getStats() {
  const supabase = createServiceClient()
  const [
    { count: products },
    { count: orders },
    { data: revenue },
    { count: leads },
    { data: recentOrders },
    { data: lowStock },
  ] = await Promise.all([
    supabase.from('inventory').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('total').not('status', 'eq', 'cancelled'),
    supabase.from('social_leads').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
    supabase.from('inventory').select('id,name,stock_quantity').lte('stock_quantity', 5).gt('stock_quantity', 0).limit(5),
  ])

  const totalRevenue = revenue?.reduce((s, o) => s + (o.total || 0), 0) || 0

  return { products, orders, totalRevenue, leads, recentOrders, lowStock }
}

export default async function AdminDashboard() {
  const [{ products, orders, totalRevenue, leads, recentOrders, lowStock }, t] = await Promise.all([
    getStats(),
    getServerT(),
  ])

  const stats = [
    { label: t('publishedProducts'), value: products || 0, icon: Package, color: 'bg-primary-100 text-primary-600', change: '+12%' },
    { label: t('totalOrders'), value: orders || 0, icon: ShoppingCart, color: 'bg-blue-100 text-blue-600', change: '+8%' },
    { label: t('revenueEGP'), value: (totalRevenue).toLocaleString('en-EG'), icon: TrendingUp, color: 'bg-green-100 text-green-600', change: '+23%' },
    { label: t('potentialClients'), value: leads || 0, icon: Users, color: 'bg-rosegold-100 text-rosegold-500', change: '+5%' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-cocoa-800">{t('dashboardGreeting')}</h1>
        <p className="text-cocoa-800/60 text-sm mt-1">{t('dashboardSubtitle')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="admin-card hover:shadow-card-hover transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-green-600 flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> {s.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-cocoa-800">{s.value}</p>
            <p className="text-xs text-cocoa-800/60 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Orders */}
        <div className="lg:col-span-2 admin-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-cocoa-800">{t('recentOrders')}</h2>
            <Link href="/admin/orders" className="text-xs text-primary-500 hover:underline">{t('viewAll')}</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-cocoa-800/60 text-xs border-b border-gray-100">
                  <th className="pb-2 font-medium text-start">{t('orderNumber')}</th>
                  <th className="pb-2 font-medium text-start">{t('customer')}</th>
                  <th className="pb-2 font-medium text-start">{t('totalAmount')}</th>
                  <th className="pb-2 font-medium text-start">{t('statusLabel')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(recentOrders || []).map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 font-mono text-xs text-cocoa-800/60">{order.order_number}</td>
                    <td className="py-3 font-medium text-cocoa-800">{order.customer_name}</td>
                    <td className="py-3 font-bold text-cocoa-800">{order.total?.toLocaleString()} EGP</td>
                    <td className="py-3">
                      <OrderStatusBadge status={order.status} t={t} />
                    </td>
                  </tr>
                ))}
                {(!recentOrders || recentOrders.length === 0) && (
                  <tr><td colSpan={4} className="py-8 text-center text-cocoa-800/40">{t('noOrders')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="admin-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-cocoa-800">{t('lowStockAlert')}</h2>
            <Link href="/admin/products" className="text-xs text-primary-500 hover:underline">{t('manage')}</Link>
          </div>
          <div className="space-y-3">
            {(lowStock || []).map((p: any) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50">
                <p className="text-sm text-cocoa-800 font-medium line-clamp-1">{p.name}</p>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                  {t('pieces', { n: p.stock_quantity })}
                </span>
              </div>
            ))}
            {(!lowStock || lowStock.length === 0) && (
              <p className="text-center text-cocoa-800/40 py-6 text-sm">{t('stockOk')}</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="admin-card">
        <h2 className="font-bold text-cocoa-800 mb-4">{t('quickActions')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: '/admin/products/new', label: t('addProduct'), emoji: '➕', color: 'bg-primary-50 hover:bg-primary-100 text-primary-700' },
            { href: '/admin/products?import=1', label: t('importExcel'), emoji: '📊', color: 'bg-green-50 hover:bg-green-100 text-green-700' },
            { href: '/admin/orders', label: t('manageOrders'), emoji: '📦', color: 'bg-blue-50 hover:bg-blue-100 text-blue-700' },
            { href: '/admin/leads', label: t('leadsMenu'), emoji: '👥', color: 'bg-rosegold-100 hover:bg-rosegold-200 text-rosegold-600' },
          ].map((a) => (
            <Link key={a.href} href={a.href}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-colors ${a.color}`}>
              <span className="text-lg">{a.emoji}</span> {a.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function OrderStatusBadge({ status, t }: { status: string; t: (key: any) => string }) {
  const map: Record<string, string> = {
    pending:   'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    shipped:   'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }
  const labelKey: Record<string, any> = {
    pending: 'statusPending', confirmed: 'statusConfirmed',
    shipped: 'statusShipped', delivered: 'statusDelivered', cancelled: 'statusCancelled',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {labelKey[status] ? t(labelKey[status]) : status}
    </span>
  )
}
