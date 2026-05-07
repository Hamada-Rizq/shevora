'use client'
import { useEffect } from 'react'
import { useLanguageStore, type Lang } from '@/context/language-store'

function readLangCookie(): Lang {
  const m = document.cookie.match(/(?:^|;\s*)shevora-lang=(ar|en)/)
  return (m?.[1] ?? 'ar') as Lang
}

export default function LanguageProvider({ children }: { children: React.ReactNode }) {
  const setLang = useLanguageStore((s) => s.setLang)

  useEffect(() => {
    // On mount, sync the store with whatever the cookie says
    const saved = readLangCookie()
    setLang(saved)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>
}
