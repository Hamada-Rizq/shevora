import Link from 'next/link'
import Image from 'next/image'
import { Instagram } from 'lucide-react'
import { getServerT } from '@/lib/i18n-server'

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
  </svg>
)

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

export default async function Footer() {
  const t = await getServerT()

  return (
    <footer className="bg-cocoa-800 text-white">
      <div className="w-full overflow-hidden leading-none">
        <svg viewBox="0 0 1440 60" className="w-full h-12 block" style={{ fill: '#FFF7F4' }}>
          <path d="M0,60 C480,0 960,0 1440,60 L1440,0 L0,0 Z" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-12 h-12 bg-white rounded-full overflow-hidden">
                <Image src="/logo.png" alt="Shevora" fill className="object-contain" />
              </div>
              <div>
                <p className="font-display text-xl font-bold text-white">Shevora</p>
                <p className="text-xs text-primary-300 tracking-widest uppercase">{t('tagline')}</p>
              </div>
            </div>
            <p className="text-sm text-nude-200/70 leading-relaxed">
              {t('footerDesc')}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-primary-300 mb-4 tracking-wide uppercase text-xs">{t('quickLinks')}</h3>
            <ul className="space-y-2 text-sm text-nude-200/70">
              {[
                { href: '/',                        label: t('home') },
                { href: '/products',                label: t('allProducts') },
                { href: '/products?cat=hot-offers', label: t('currentOffers') },
                { href: '/products?cat=bundles',    label: t('bundles') },
                { href: '/products?cat=skincare',   label: t('skincare') },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-primary-300 transition-colors hover:underline underline-offset-4">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-primary-300 mb-4 tracking-wide uppercase text-xs">{t('categories')}</h3>
            <ul className="space-y-2 text-sm text-nude-200/70">
              {[
                ['skincare',  t('skincare')],
                ['haircare',  t('haircare')],
                ['body-care', 'Body Care'],
                ['makeup',    'Makeup'],
                ['tools',     'Tools'],
                ['kids',      'Kids'],
              ].map(([cat, label]) => (
                <li key={cat}>
                  <Link href={`/products?cat=${cat}`} className="hover:text-primary-300 transition-colors hover:underline underline-offset-4">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-primary-300 mb-4 tracking-wide uppercase text-xs">{t('contactTitle')}</h3>
            <div className="space-y-3">
              <a href="https://wa.me/201550320776" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-nude-200/70 hover:text-green-400 transition-colors">
                <WhatsAppIcon /> {t('whatsapp')}
              </a>
              <a href="https://www.instagram.com/cosmeticano1" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-nude-200/70 hover:text-primary-300 transition-colors">
                <Instagram className="w-5 h-5" /> @cosmeticano1
              </a>
              <a href="https://www.tiktok.com/@cosmeticano1" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-nude-200/70 hover:text-primary-300 transition-colors">
                <TikTokIcon /> @cosmeticano1
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-nude-200/50">
          <p>{t('footerCopy', { year: new Date().getFullYear() })}</p>
          <p>{t('madeWith')}</p>
        </div>
      </div>
    </footer>
  )
}
