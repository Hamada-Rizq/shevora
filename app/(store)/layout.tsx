import Navbar from '@/components/store/Navbar'
import Footer from '@/components/store/Footer'
import CartSidebar from '@/components/store/CartSidebar'
import WhatsAppButton from '@/components/store/WhatsAppButton'

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFF7F4]">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <CartSidebar />
      <WhatsAppButton />
    </div>
  )
}
