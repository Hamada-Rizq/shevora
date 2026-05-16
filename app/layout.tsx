import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import LanguageProvider from '@/components/LanguageProvider'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://shevora-app.vercel.app'),
  title: {
    default: 'Shevora — Beauty & Glow | Premium Cosmetics in Egypt',
    template: '%s | Shevora Cosmetics',
  },
  description:
    'Shevora — Your destination for premium beauty products in Egypt. Shop skincare, haircare, makeup, body care. Order via WhatsApp. شيفورا — متجرك للجمال والعناية.',
  keywords: [
    'Shevora', 'Shevora cosmetics', 'Shevora beauty',
    'cosmetics Egypt', 'beauty products Egypt', 'online cosmetics store Egypt',
    'skincare Egypt', 'haircare Egypt', 'makeup Egypt', 'body care Egypt',
    'شيفورا', 'شيفورا كوزماتكس', 'متجر مستحضرات تجميل',
    'مستحضرات تجميل مصر', 'عناية بالبشرة', 'عناية بالشعر', 'مكياج مصر',
  ],
  authors: [{ name: 'Shevora Cosmetics' }],
  creator: 'Shevora',
  publisher: 'Shevora Cosmetics',
  openGraph: {
    type: 'website',
    locale: 'ar_EG',
    alternateLocale: 'en_US',
    url: 'https://shevora-app.vercel.app',
    siteName: 'Shevora — Beauty & Glow',
    title: 'Shevora — Beauty & Glow | Premium Cosmetics in Egypt',
    description:
      'Shop premium skincare, haircare, makeup & body care online. Fast delivery across Egypt.',
    images: [
      {
        url: 'https://shevora-app.vercel.app/logo.png',
        width: 512,
        height: 512,
        alt: 'Shevora Cosmetics Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shevora — Beauty & Glow',
    description: 'Premium cosmetics & beauty products in Egypt. Shop now!',
    images: ['https://shevora-app.vercel.app/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://shevora-app.vercel.app',
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://shevora-app.vercel.app/#organization",
                  "name": "Shevora",
                  "alternateName": ["Shevora Cosmetics", "Shevora Beauty", "شيفورا"],
                  "url": "https://shevora-app.vercel.app",
                  "logo": "https://shevora-app.vercel.app/logo.png",
                  "sameAs": [
                    "https://www.instagram.com/cosmeticano1",
                    "https://www.tiktok.com/@cosmeticano1",
                    "https://wa.me/201550320776"
                  ],
                  "contactPoint": {
                    "@type": "ContactPoint",
                    "telephone": "+201550320776",
                    "contactType": "customer service",
                    "availableLanguage": ["Arabic", "English"],
                    "areaServed": "EG"
                  }
                },
                {
                  "@type": "WebSite",
                  "url": "https://shevora-app.vercel.app",
                  "name": "Shevora — Beauty & Glow",
                  "alternateName": "شيفورا — جمال وإشراق",
                  "publisher": { "@id": "https://shevora-app.vercel.app/#organization" },
                  "inLanguage": ["ar", "en"],
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": "https://shevora-app.vercel.app/products?search={search_term_string}",
                    "query-input": "required name=search_term_string"
                  }
                }
              ]
            })
          }}
        />
      </head>
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#FFF7F4',
              color: '#3C2A33',
              border: '1px solid #F5B8C8',
              borderRadius: '12px',
              fontFamily: 'Inter, sans-serif',
            },
            success: { iconTheme: { primary: '#D97A6C', secondary: '#FFF7F4' } },
          }}
        />
      </body>

    </html>
  )
}
