import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Checkout — Complete Your Order',
  description: 'Complete your Shevora order via WhatsApp. Fast and easy checkout.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children
}
