import type { Metadata } from 'next'
import { Cairo } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ScrollToTop } from '@/components/shared/ScrollToTop'

const cairo = Cairo({
  subsets: ['arabic'],
  variable: '--font-cairo',
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: {
    default: 'جمعية حماية الأسرة والطفولة',
    template: '%s | جمعية حماية الأسرة والطفولة',
  },
  description: 'الطفولة والبراءة والامل بالبقاء — إربد، الأردن',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable} suppressHydrationWarning>
      <body className="bg-white text-[#333] antialiased" style={{ fontFamily: 'var(--font-cairo), sans-serif' }}>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <ScrollToTop />
      </body>
    </html>
  )
}
