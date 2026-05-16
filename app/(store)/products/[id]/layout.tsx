import type { Metadata } from 'next'

const SITE_URL = 'https://shevora-app.vercel.app'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id: slug } = await params

  try {
    const res = await fetch(`${SITE_URL}/api/products?slug=${slug}`, {
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      return { title: 'Product | Shevora' }
    }

    const data = await res.json()
    const product = data?.product || data?.data?.[0]

    if (!product) {
      return { title: 'Product Not Found | Shevora' }
    }

    const title = product.name
    const price = product.selling_price ? `EGP ${product.selling_price}` : ''
    const description = `Buy ${product.name} online from Shevora. ${price}. Premium beauty product with fast delivery in Egypt. اشتري ${product.name} اونلاين من شيفورا.`

    return {
      title,
      description,
      keywords: [
        product.name, 'Shevora', 'buy online Egypt', 'cosmetics',
        'شيفورا', 'شراء اونلاين', 'مستحضرات تجميل',
      ],
      openGraph: {
        title: `${product.name} — Shevora Cosmetics`,
        description: `${product.name} — ${price}. Shop now at Shevora.`,
        url: `${SITE_URL}/products/${product.slug}`,
        type: 'article',
        images: product.primary_image
          ? [{ url: product.primary_image, alt: product.name }]
          : [{ url: `${SITE_URL}/logo.png`, alt: 'Shevora Cosmetics' }],
      },
      alternates: {
        canonical: `${SITE_URL}/products/${product.slug}`,
      },
    }
  } catch {
    return { title: 'Product | Shevora' }
  }
}

export default function ProductDetailLayout({ children }: { children: React.ReactNode }) {
  return children
}
