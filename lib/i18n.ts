'use client'
import { useLanguageStore } from '@/context/language-store'
import { translations, type TKey } from './i18n-translations'

export type { TKey }
export { translations }

export function useT() {
  const lang = useLanguageStore((s) => s.lang)

  function t(key: TKey, vars?: Record<string, string | number>): string {
    let str: string = translations[lang][key] ?? translations.ar[key] ?? key
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replace(`{{${k}}}`, String(v))
      }
    }
    return str
  }

  return t
}
