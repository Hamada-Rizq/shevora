import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'All Products — Skincare, Haircare, Makeup & More',
  description:
    'Browse all Shevora beauty products. Skincare, haircare, makeup, body care, tools, bundles & hot offers. Filter by category, sort by price. تسوقي كل منتجات شيفورا.',
  keywords: [
    'Shevora products', 'beauty products', 'skincare products Egypt',
    'haircare products', 'makeup products', 'cosmetics catalog',
    'منتجات شيفورا', 'منتجات تجميل', 'عروض مستحضرات تجميل',
  ],
  openGraph: {
    title: 'All Products — Shevora Cosmetics',
    description: 'Browse our complete collection of beauty products.',
    url: 'https://shevora-app.vercel.app/products',
  },
  alternates: {
    canonical: 'https://shevora-app.vercel.app/products',
  },
}

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return children
}
