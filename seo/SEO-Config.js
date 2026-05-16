/**
 * =========================================================
 * Shevora SEO Configuration — Centralized Meta Tags
 * =========================================================
 *
 * This file contains all SEO metadata for every page.
 * Use it as a reference when adding metadata to Next.js pages.
 *
 * HOW TO USE:
 * Copy the relevant section into your page's `export const metadata` block.
 * See META-TAGS-TEMPLATE.md for step-by-step integration instructions.
 *
 * NO CODE CHANGES NEEDED — this is a reference config file.
 */

const SITE_URL = 'https://shevora-app.vercel.app';
const BRAND_NAME = 'Shevora';
const WHATSAPP = '+201550320776';
const LOGO_URL = `${SITE_URL}/logo.png`;

// =========================================================
// GLOBAL — Root Layout (app/layout.tsx)
// Already partially configured. Below is the COMPLETE version.
// =========================================================
const globalMetadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Shevora — Beauty & Glow | Premium Cosmetics in Egypt',
    template: '%s | Shevora Cosmetics',
  },
  description:
    'Shevora — Your destination for premium beauty products in Egypt. Shop skincare, haircare, makeup, body care. Order via WhatsApp. شيفورا — متجرك للجمال والعناية.',
  keywords: [
    // English
    'Shevora', 'Shevora cosmetics', 'Shevora beauty',
    'cosmetics Egypt', 'beauty products Egypt', 'online cosmetics store Egypt',
    'skincare Egypt', 'haircare Egypt', 'makeup Egypt', 'body care Egypt',
    'sunscreen Egypt', 'Korean skincare Egypt', 'beauty bundles',
    'buy cosmetics online Egypt', 'affordable beauty products',
    // Arabic
    'شيفورا', 'شيفورا كوزماتكس', 'متجر مستحضرات تجميل',
    'مستحضرات تجميل مصر', 'عناية بالبشرة', 'عناية بالشعر',
    'مكياج مصر', 'واقي شمس', 'منتجات كورية', 'عروض تجميل',
    'شراء مستحضرات تجميل اونلاين',
  ],
  authors: [{ name: 'Shevora Cosmetics' }],
  creator: 'Shevora',
  publisher: 'Shevora Cosmetics',
  formatDetection: { telephone: true, email: false },
  openGraph: {
    type: 'website',
    locale: 'ar_EG',
    alternateLocale: 'en_US',
    url: SITE_URL,
    siteName: 'Shevora — Beauty & Glow',
    title: 'Shevora — Beauty & Glow | Premium Cosmetics in Egypt',
    description:
      'Shop premium skincare, haircare, makeup & body care online. Fast delivery across Egypt. Order via WhatsApp.',
    images: [
      {
        url: LOGO_URL,
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
    images: [LOGO_URL],
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
    canonical: SITE_URL,
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  verification: {
    // FILL IN after setting up Google Search Console:
    // google: 'YOUR_GOOGLE_VERIFICATION_CODE',
  },
};

// =========================================================
// HOMEPAGE — app/(store)/page.tsx
// =========================================================
const homepageMetadata = {
  title: 'Shevora — Beauty & Glow | Premium Cosmetics in Egypt',
  description:
    'Shevora — Your beauty destination. Shop skincare, haircare, makeup, body care & beauty bundles online. Fast WhatsApp ordering. شيفورا — متجرك للجمال.',
  keywords: [
    'Shevora', 'Shevora cosmetics', 'beauty store Egypt',
    'cosmetics online Egypt', 'skincare haircare makeup',
    'شيفورا', 'متجر تجميل', 'مستحضرات تجميل اونلاين',
  ],
  openGraph: {
    title: 'Shevora — Beauty & Glow | Premium Cosmetics',
    description: 'Shop premium beauty products online. Fast delivery across Egypt.',
    url: SITE_URL,
    type: 'website',
  },
  alternates: {
    canonical: SITE_URL,
  },
};

// =========================================================
// PRODUCTS LISTING — app/(store)/products/page.tsx
// =========================================================
const productsListingMetadata = {
  title: 'All Products — Skincare, Haircare, Makeup & More',
  description:
    'Browse all Shevora beauty products. Skincare, haircare, makeup, body care, tools, bundles & hot offers. Filter by category, sort by price. تسوقي منتجات شيفورا.',
  keywords: [
    'Shevora products', 'beauty products', 'skincare products Egypt',
    'haircare products', 'makeup products', 'cosmetics catalog',
    'منتجات شيفورا', 'منتجات تجميل', 'عروض مستحضرات تجميل',
  ],
  openGraph: {
    title: 'All Products — Shevora Cosmetics',
    description: 'Browse our complete collection of beauty products.',
    url: `${SITE_URL}/products`,
    type: 'website',
  },
  alternates: {
    canonical: `${SITE_URL}/products`,
  },
};

// =========================================================
// PRODUCT DETAIL — app/(store)/products/[id]/page.tsx
// (Dynamic — use generateMetadata function)
// =========================================================
const productDetailMetadataTemplate = (product) => ({
  title: `${product.name} — Shevora`,
  description: `Buy ${product.name} online from Shevora. ${product.description?.slice(0, 120) || 'Premium beauty product'}. EGP ${product.selling_price}. Fast delivery in Egypt.`,
  keywords: [
    product.name, 'Shevora', product.category || 'cosmetics',
    'buy online Egypt', 'شراء اونلاين', 'شيفورا',
  ],
  openGraph: {
    title: `${product.name} — Shevora Cosmetics`,
    description: `${product.name} — EGP ${product.selling_price}. Shop now at Shevora.`,
    url: `${SITE_URL}/products/${product.slug}`,
    type: 'og:product',
    images: product.image ? [{ url: product.image, alt: product.name }] : [{ url: LOGO_URL }],
  },
  alternates: {
    canonical: `${SITE_URL}/products/${product.slug}`,
  },
});

// =========================================================
// CHECKOUT — app/(store)/checkout/page.tsx
// =========================================================
const checkoutMetadata = {
  title: 'Checkout — Complete Your Order',
  description: 'Complete your Shevora order via WhatsApp. Fast and easy checkout.',
  robots: {
    index: false,    // Don't index checkout page
    follow: false,
  },
};

// =========================================================
// CATEGORY-SPECIFIC KEYWORDS
// Use these when filtering products by category
// =========================================================
const categoryKeywords = {
  skincare: {
    en: ['skincare Egypt', 'face cream', 'serum', 'sunscreen SPF', 'face wash', 'toner', 'moisturizer', 'anti-aging', 'vitamin C serum', 'retinol', 'hyaluronic acid', 'whitening cream', 'acne treatment'],
    ar: ['عناية بالبشرة', 'كريم وجه', 'سيروم', 'واقي شمس', 'غسول وجه', 'تونر', 'مرطب', 'فيتامين سي', 'ريتينول', 'كريم تفتيح', 'علاج حبوب'],
  },
  haircare: {
    en: ['haircare Egypt', 'shampoo', 'conditioner', 'hair mask', 'hair treatment', 'hair serum', 'nourishing hair'],
    ar: ['عناية بالشعر', 'شامبو', 'بلسم', 'ماسك شعر', 'علاج شعر', 'سيروم شعر'],
  },
  'body-care': {
    en: ['body care Egypt', 'body lotion', 'deodorant', 'body spray', 'whitening spray', 'hand cream', 'body splash'],
    ar: ['عناية بالجسم', 'لوشن جسم', 'مزيل عرق', 'سبراي جسم', 'كريم يد', 'تفتيح جسم'],
  },
  makeup: {
    en: ['makeup Egypt', 'foundation', 'mascara', 'lip balm', 'lip gloss', 'cosmetics', 'beauty makeup'],
    ar: ['مكياج', 'فاونديشن', 'ماسكارا', 'بالم شفاه', 'مستحضرات تجميل'],
  },
  bundles: {
    en: ['beauty bundles', 'skincare kit', 'cosmetics set', 'value bundle', 'beauty gift set'],
    ar: ['باندل تجميل', 'مجموعة عناية', 'سيت تجميل', 'هدايا تجميل'],
  },
  'hot-offers': {
    en: ['beauty offers', 'cosmetics deals', 'discount skincare', 'sale beauty products'],
    ar: ['عروض تجميل', 'خصومات', 'تخفيضات مستحضرات', 'عروض شيفورا'],
  },
  kids: {
    en: ['kids skincare', 'children cosmetics', 'baby care', 'gentle skincare kids'],
    ar: ['عناية اطفال', 'مستحضرات اطفال', 'منتجات اطفال'],
  },
  'men-care': {
    en: ['men skincare', 'men grooming', 'men care products Egypt'],
    ar: ['عناية رجال', 'منتجات رجالية', 'تجميل رجال'],
  },
};

// =========================================================
// BRAND-SPECIFIC KEYWORDS (for all pages)
// =========================================================
const brandKeywords = [
  'Shevora', 'Shevora cosmetics', 'Shevora beauty', 'Shevora Egypt',
  'شيفورا', 'شيفورا كوزماتكس', 'شيفورا مصر',
  // Product brands sold on Shevora
  'Leylak', 'StarVille', 'Drakon', 'Kolagra', 'Infinity',
  'SKIN1004', 'SOME BY MI', 'Dr Althea', 'Biotherm', 'Capixy',
  'Eva cosmetics', 'Bobana', 'Essence', 'Arencia',
];

module.exports = {
  SITE_URL,
  BRAND_NAME,
  WHATSAPP,
  LOGO_URL,
  globalMetadata,
  homepageMetadata,
  productsListingMetadata,
  productDetailMetadataTemplate,
  checkoutMetadata,
  categoryKeywords,
  brandKeywords,
};
