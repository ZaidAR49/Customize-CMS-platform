import type { Metadata } from 'next'
import { Cairo } from 'next/font/google'
import './globals.css'
import { ConditionalHeader, ConditionalFooter,ConditionalChatBot } from '@/components/layout/ConditionalLayout'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { ScrollToTop } from '@/components/shared/ScrollToTop'
import { Toaster } from 'sonner'

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

import { postsService } from '@/lib/services/posts.service'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [programs, centers] = await Promise.all([
    postsService.getPosts('program', true),
    postsService.getPosts('center', true)
  ])

  return (
    <html lang="ar" dir="rtl" className={cairo.variable} suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="bg-white text-[#333] antialiased" style={{ fontFamily: 'var(--font-cairo), sans-serif' }}>
        <SessionProvider>
          <ConditionalHeader programs={programs} centers={centers} />
          <main className="min-h-screen">{children}</main>
          <ConditionalFooter />
          <ScrollToTop />
          <Toaster richColors position="top-center" dir="rtl" />
          <ConditionalChatBot />
        </SessionProvider>
      </body>
    </html>
  )
}
