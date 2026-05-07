import { create } from 'zustand'

export type Lang = 'ar' | 'en'

interface LanguageStore {
  lang: Lang
  setLang: (lang: Lang) => void
  isRTL: () => boolean
}

export const useLanguageStore = create<LanguageStore>()((set, get) => ({
  lang: 'ar',
  setLang: (lang) => {
    set({ lang })
    if (typeof document !== 'undefined') {
      document.cookie = `shevora-lang=${lang}; path=/; max-age=31536000; samesite=lax`
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
      document.documentElement.lang = lang
    }
  },
  isRTL: () => get().lang === 'ar',
}))
