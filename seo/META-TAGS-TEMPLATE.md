# Shevora SEO Integration Guide

> All instructions below use ONLY Next.js built-in `metadata` exports.
> No new npm packages needed. No React Helmet.

---

## Phase 1: Files Already Created (No Code Changes)

| File | Status | Description |
|------|--------|-------------|
| `public/robots.txt` | DONE | Allows crawlers, blocks /api and /admin |
| `public/sitemap.xml` | DONE | All 46+ product URLs + main pages |
| `vercel.json` | DONE | SEO headers + caching added |
| `public/schema.json` | DONE | Organization + Website + Breadcrumb schema |
| `seo/SEO-Config.js` | DONE | Centralized metadata for every page |

---

## Phase 2: Meta Tags Integration (Minimal Code Changes)

### IMPORTANT: Next.js App Router uses `export const metadata` — no Helmet needed.

---

### 2.1 Root Layout — `app/layout.tsx`

The root layout ALREADY has basic metadata. To enhance it, update the `metadata` export:

```tsx
// app/layout.tsx — ONLY update the metadata export, nothing else

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
  // Uncomment after Google Search Console verification:
  // verification: {
  //   google: 'YOUR_VERIFICATION_CODE_HERE',
  // },
}
```

---

### 2.2 Homepage — `app/(store)/page.tsx`

Add at the TOP of the file (before the component):

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shevora — Beauty & Glow | Premium Cosmetics in Egypt',
  description:
    'Shevora — Your beauty destination. Shop skincare, haircare, makeup, body care & bundles online. Fast WhatsApp ordering. شيفورا — متجرك للجمال.',
  keywords: [
    'Shevora', 'Shevora cosmetics', 'beauty store Egypt',
    'cosmetics online Egypt', 'skincare haircare makeup',
    'شيفورا', 'متجر تجميل', 'مستحضرات تجميل اونلاين',
  ],
  openGraph: {
    title: 'Shevora — Beauty & Glow | Premium Cosmetics',
    description: 'Shop premium beauty products online. Fast delivery across Egypt.',
    url: 'https://shevora-app.vercel.app',
  },
  alternates: {
    canonical: 'https://shevora-app.vercel.app',
  },
}
```

---

### 2.3 Products Listing — `app/(store)/products/page.tsx`

Add at the TOP of the file:

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'All Products — Skincare, Haircare, Makeup & More',
  description:
    'Browse all Shevora beauty products. Skincare, haircare, makeup, body care, tools, bundles & hot offers. تسوقي كل منتجات شيفورا.',
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
```

---

### 2.4 Product Detail — `app/(store)/products/[id]/page.tsx`

This page needs DYNAMIC metadata. Add this function BEFORE the component:

```tsx
import type { Metadata } from 'next'

// Add this function — it generates metadata per product
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  // Use your existing fetch logic to get the product
  const res = await fetch(
    `https://shevora-app.vercel.app/api/products?slug=${params.id}`,
    { next: { revalidate: 3600 } }
  )
  const data = await res.json()
  const product = data?.product

  if (!product) {
    return { title: 'Product Not Found | Shevora' }
  }

  return {
    title: product.name,
    description: `Buy ${product.name} online from Shevora. EGP ${product.selling_price}. Premium beauty product with fast delivery in Egypt.`,
    keywords: [product.name, 'Shevora', 'buy online Egypt', 'شيفورا', 'شراء اونلاين'],
    openGraph: {
      title: `${product.name} — Shevora Cosmetics`,
      description: `${product.name} — EGP ${product.selling_price}. Shop now at Shevora.`,
      url: `https://shevora-app.vercel.app/products/${product.slug}`,
      type: 'article',
      images: product.primary_image
        ? [{ url: product.primary_image, alt: product.name }]
        : [{ url: 'https://shevora-app.vercel.app/logo.png' }],
    },
    alternates: {
      canonical: `https://shevora-app.vercel.app/products/${product.slug}`,
    },
  }
}
```

---

### 2.5 Checkout — `app/(store)/checkout/page.tsx`

Add at the TOP of the file:

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Checkout — Complete Your Order',
  description: 'Complete your Shevora order via WhatsApp.',
  robots: {
    index: false,
    follow: false,
  },
}
```

---

## Phase 3: Schema Markup Integration (Safe)

### How to Add JSON-LD Schema to the Site

Add this `<script>` tag inside the `<head>` in `app/layout.tsx`.
It does NOT affect design or features — it's invisible metadata for Google.

```tsx
// Inside app/layout.tsx, add this in the <head> section:

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
          "alternateName": ["Shevora Cosmetics", "شيفورا"],
          "url": "https://shevora-app.vercel.app",
          "logo": "https://shevora-app.vercel.app/logo.png",
          "sameAs": [
            "https://www.instagram.com/cosmeticano1",
            "https://www.tiktok.com/@cosmeticano1"
          ],
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+201550320776",
            "contactType": "customer service",
            "availableLanguage": ["Arabic", "English"]
          }
        },
        {
          "@type": "WebSite",
          "url": "https://shevora-app.vercel.app",
          "name": "Shevora — Beauty & Glow",
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
```

### Product-Level Schema (for product detail pages)

Add inside each product page's return, or create a reusable component:

```tsx
// Inside the product detail page, add before the closing tag:

<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "description": product.description,
      "image": product.primary_image || "https://shevora-app.vercel.app/logo.png",
      "brand": { "@type": "Brand", "name": "Shevora" },
      "offers": {
        "@type": "Offer",
        "url": `https://shevora-app.vercel.app/products/${product.slug}`,
        "priceCurrency": "EGP",
        "price": product.selling_price,
        "availability": product.stock_quantity > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        "seller": { "@type": "Organization", "name": "Shevora" }
      }
    })
  }}
/>
```

---

## Phase 4: Google Search Console Setup

### Step 1: Register Property
1. Go to https://search.google.com/search-console
2. Sign in with your Google account
3. Click "Add Property"
4. Choose "URL prefix"
5. Enter: `https://shevora-app.vercel.app`
6. Click "Continue"

### Step 2: Verify Ownership
Easiest method — **HTML tag verification**:
1. Google gives you a meta tag like:
   `<meta name="google-site-verification" content="YOUR_CODE_HERE" />`
2. Add it to `app/layout.tsx` inside the `<head>`:
   ```tsx
   <meta name="google-site-verification" content="YOUR_CODE_HERE" />
   ```
3. OR use the `verification` field in the metadata export:
   ```tsx
   verification: {
     google: 'YOUR_CODE_HERE',
   },
   ```
4. Deploy (git push)
5. Go back to Google Search Console and click "Verify"

### Step 3: Submit Sitemap
1. In Google Search Console, go to "Sitemaps" (left menu)
2. Enter: `sitemap.xml`
3. Click "Submit"
4. Status should change to "Success" within minutes

### Step 4: Request Indexing
1. Go to "URL Inspection" (left menu)
2. Enter: `https://shevora-app.vercel.app`
3. Click "Request Indexing"
4. Repeat for: `https://shevora-app.vercel.app/products`
5. Google will crawl and index within 2-7 days

### Step 5: Monitor
1. Check "Coverage" report daily for the first week
2. Check "Performance" for search impressions after 1-2 weeks
3. Fix any errors shown in "Coverage" > "Error" tab

---

## Phase 5: Keyword Strategy (No Code Changes)

### Primary Brand Keywords
- **"Shevora"** — brand name, must rank #1
- **"Shevora cosmetics"** — brand + category
- **"Shevora beauty"** — brand + industry

### Category Keywords (use in product descriptions)

| Category | English Keywords | Arabic Keywords |
|----------|-----------------|-----------------|
| Skincare | skincare Egypt, face cream, serum, sunscreen, face wash, toner, moisturizer, vitamin C, retinol | عناية بالبشرة, كريم وجه, سيروم, واقي شمس, غسول وجه, تونر, مرطب, فيتامين سي |
| Haircare | haircare Egypt, shampoo, conditioner, hair mask, hair treatment | عناية بالشعر, شامبو, بلسم, ماسك شعر, علاج شعر |
| Body Care | body care, body lotion, deodorant, body spray, hand cream | عناية بالجسم, لوشن جسم, مزيل عرق, كريم يد |
| Makeup | makeup Egypt, foundation, mascara, lip balm, lip gloss | مكياج, فاونديشن, ماسكارا, بالم شفاه |
| Bundles | beauty bundles, skincare kit, cosmetics set, gift set | مجموعة عناية, سيت تجميل, هدايا تجميل |
| Hot Offers | beauty offers, cosmetics deals, discount skincare | عروض تجميل, خصومات, تخفيضات |

### How to Use Keywords (No Code Needed)
1. **Product names** — Include category keywords naturally (already done for most)
2. **Product descriptions** — Mention the product type and use case
3. **Instagram/TikTok posts** — Use "#Shevora #ShevoraCosmetics" consistently
4. **WhatsApp messages** — Include "Shevora" in your business name

---

## Phase 6: Testing & Verification

After deploying, verify these URLs work:

| Test | URL | Expected |
|------|-----|----------|
| robots.txt | https://shevora-app.vercel.app/robots.txt | Text file with crawl rules |
| sitemap.xml | https://shevora-app.vercel.app/sitemap.xml | XML with all product URLs |
| Schema test | https://search.google.com/test/rich-results | Paste homepage URL |
| PageSpeed | https://pagespeed.web.dev | Test homepage performance |
| Mobile test | https://search.google.com/test/mobile-friendly | Paste homepage URL |

### Verify No Design Changes
- Homepage looks exactly the same
- Products page works as before
- Product detail pages unchanged
- Cart + checkout still work
- Mobile responsive still works
- Language switcher still works

---

## File Summary

### New Files Created (no existing code modified):
```
public/robots.txt          — Crawler instructions
public/sitemap.xml         — All page URLs for Google
public/schema.json         — Structured data reference
seo/SEO-Config.js          — Centralized metadata config
seo/META-TAGS-TEMPLATE.md  — This guide
```

### Files with Safe Additions (SEO headers only):
```
vercel.json                — Added security + caching headers
```

### Files That Need Manual Meta Tag Updates:
```
app/layout.tsx             — Enhanced metadata export + schema script
app/(store)/page.tsx       — Add homepage metadata
app/(store)/products/page.tsx — Add products listing metadata
app/(store)/products/[id]/page.tsx — Add generateMetadata function
app/(store)/checkout/page.tsx — Add noindex metadata
```
