import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import LanguageProvider from '@/components/LanguageProvider'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Shevora — Beauty & Glow',
    template: '%s | Shevora',
  },
  description: 'متجر Shevora للجمال — منتجات العناية بالبشرة والشعر والمكياج بأسعار مميزة',
  keywords: ['شيفورا', 'مستحضرات تجميل', 'عناية بشرة', 'شعر', 'مكياج', 'مصر'],
  openGraph: {
    type: 'website',
    locale: 'ar_EG',
    siteName: 'Shevora Beauty & Glow',
  },
  icons: { icon: '/logo.png' },
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
