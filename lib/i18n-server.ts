import { cookies } from 'next/headers'
import { translations, type TKey } from './i18n-translations'

type Lang = 'ar' | 'en'

export async function getServerT() {
  const cookieStore = await cookies()
  const lang = (cookieStore.get('shevora-lang')?.value ?? 'ar') as Lang

  return (key: TKey, vars?: Record<string, string | number>) => {
    let str: string = translations[lang][key] ?? translations.ar[key] ?? key
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replace(`{{${k}}}`, String(v))
      })
    }
    return str
  }
}
