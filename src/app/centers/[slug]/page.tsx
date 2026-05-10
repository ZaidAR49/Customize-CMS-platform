import { centers } from '@/data/centers'
import { notFound } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export async function generateStaticParams() {
  return centers.map(c => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const center = centers.find(c => c.slug === slug)
  if (!center) return { title: 'غير موجود' }
  return { title: center.nameAr, description: center.descAr }
}

export default async function CenterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const center = centers.find(c => c.slug === slug)
  if (!center) notFound()

  const otherCenters = centers.filter(c => c.slug !== slug)

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-l from-[#1b5e20] via-[#2e7d32] to-[#00695c] py-20">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }} />
        <div className="container relative z-10 text-center">
          <div className="text-5xl mb-4">{center.icon}</div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-4">{center.nameAr}</h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">{center.descAr}</p>
        </div>
      </section>

      {/* Services */}
      <section className="py-16">
        <div className="container max-w-4xl">
          <h2 className="text-2xl font-bold text-[var(--fcps-primary-dark)] mb-8">خدمات المركز</h2>
          <div className="grid gap-4">
            {center.services.map((service, i) => (
              <Card key={i} className="border-none shadow-sm transition-all hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--fcps-bg-soft)]">
                    <CheckCircle className="h-5 w-5 text-[var(--fcps-primary)]" />
                  </div>
                  <span className="text-[var(--fcps-text)]">{service}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Other Centers */}
      <section className="py-16 bg-[var(--fcps-bg-soft)]">
        <div className="container">
          <h2 className="text-2xl font-bold text-[var(--fcps-primary-dark)] mb-8">مراكز أخرى</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {otherCenters.map(c => (
              <Link key={c.slug} href={`/centers/${c.slug}`}>
                <Card className="h-full border-none shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                  <CardContent className="p-5 text-center">
                    <div className="text-3xl mb-3">{c.icon}</div>
                    <h3 className="font-bold text-[var(--fcps-dark)] text-sm">{c.nameAr}</h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
