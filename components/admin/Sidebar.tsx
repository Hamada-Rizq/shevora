'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Package, Tag, ShoppingCart,
  BarChart3, Users, ChevronLeft,
  Store
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguageStore } from '@/context/language-store'
import { useT } from '@/lib/i18n'

export default function AdminSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const lang = useLanguageStore((s) => s.lang)
  const t = useT()

  const NAV = [
    { href: '/admin',            icon: LayoutDashboard, label: t('dashboard') },
    { href: '/admin/products',   icon: Package,         label: t('productsMenu') },
    { href: '/admin/categories', icon: Tag,             label: t('categoriesMenu') },
    { href: '/admin/orders',     icon: ShoppingCart,    label: t('ordersMenu') },
    { href: '/admin/analytics',  icon: BarChart3,       label: t('analyticsMenu') },
    { href: '/admin/leads',      icon: Users,           label: t('leadsMenu') },
  ]

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col h-screen bg-charcoal-900 text-white transition-all duration-300 flex-shrink-0',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center gap-3 px-4 py-5 border-b border-white/10', collapsed && 'justify-center px-0')}>
        <div className="relative w-16 h-16 bg-white rounded-full overflow-hidden flex-shrink-0">
          <Image src="/logo.png" alt="Shevora" fill className="object-contain" />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-primary-500 text-white shadow-pink'
                  : 'text-gray-400 hover:bg-white/10 hover:text-white',
                collapsed && 'justify-center px-0'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-white/10 p-2 space-y-1">
        <Link
          href="/"
          className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-white/10 hover:text-white transition-all', collapsed && 'justify-center px-0')}
        >
          <Store className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>{t('viewStore')}</span>}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-white/10 hover:text-white transition-all', collapsed && 'justify-center px-0')}
        >
          <ChevronLeft className={cn(
            'w-5 h-5 flex-shrink-0 transition-transform',
            lang === 'ar'
              ? collapsed ? 'rotate-180' : 'rotate-0'
              : collapsed ? 'rotate-0' : 'rotate-180'
          )} />
          {!collapsed && <span>{t('collapseList')}</span>}
        </button>
      </div>
    </aside>
  )
}
