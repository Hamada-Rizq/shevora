'use client'

import { useRouter } from 'next/navigation'
import { LogOut, Store, Globe } from 'lucide-react'
import Link from 'next/link'
import { useLanguageStore } from '@/context/language-store'
import { useT } from '@/lib/i18n'

export default function AdminTopBar() {
  const router = useRouter()
  const lang = useLanguageStore((s) => s.lang)
  const setLang = useLanguageStore((s) => s.setLang)
  const t = useT()

  const logout = async () => {
    await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    })
    router.push('/admin/login')
    router.refresh()
  }

  const toggleLang = () => {
    setLang(lang === 'ar' ? 'en' : 'ar')
    router.refresh()
  }

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0 shadow-sm">
      <h1 className="font-semibold text-cocoa-800 text-sm">{t('adminPanel')}</h1>
      <div className="flex items-center gap-2">
        <button
          onClick={toggleLang}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-taupe-500 hover:bg-gray-100 transition-colors border border-nude-200 cursor-pointer"
          type="button"
        >
          <Globe className="w-3.5 h-3.5" />
          {lang === 'ar' ? 'EN' : 'عر'}
        </button>
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-charcoal-600 hover:bg-gray-100 transition-colors"
        >
          <Store className="w-3.5 h-3.5" />
          {t('viewStore')}
        </Link>
        <button
          onClick={logout}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-red-500 hover:bg-red-50 transition-colors font-medium cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          {t('logout')}
        </button>
        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm">
          S
        </div>
      </div>
    </header>
  )
}
