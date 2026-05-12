import { programs } from '@/data/programs'
import { notFound } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export async function generateStaticParams() {
  return programs.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const program = programs.find(p => p.slug === slug)
  if (!program) return { title: 'غير موجود' }
  return { title: program.nameAr, description: program.descAr }
}

export default async function ProgramPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const program = programs.find(p => p.slug === slug)
  if (!program) notFound()

  const otherPrograms = programs.filter(p => p.slug !== slug)

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-l from-[#0277bd] via-[#00838f] to-[#2e7d32] py-20">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }} />
        <div className="container relative z-10 text-center">
          <Badge className="mb-4 bg-white/20 text-white border-none text-sm">برامج ومشاريع</Badge>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-4">{program.nameAr}</h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">{program.descAr}</p>
        </div>
      </section>

      {/* Details */}
      <section className="py-16">
        <div className="container max-w-4xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Partners */}
            <Card className="border-none shadow-[var(--fcps-shadow-card)]">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--fcps-primary)] text-white">
                    <Users className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--fcps-primary-dark)]">الشركاء</h3>
                </div>
                <ul className="space-y-3">
                  {program.partners.map((partner, i) => (
                    <li key={i} className="flex items-center gap-2 text-[var(--fcps-gray-text)]">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--fcps-primary-light)]" />
                      {partner}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Impact */}
            <Card className="border-none shadow-[var(--fcps-shadow-card)]">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--fcps-accent)] text-white">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--fcps-primary-dark)]">الأثر</h3>
                </div>
                <p className="text-lg leading-relaxed text-[var(--fcps-gray-text)]">
                  {program.impact}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Other Programs */}
      <section className="py-16 bg-[var(--fcps-bg-soft)]">
        <div className="container">
          <h2 className="text-2xl font-bold text-[var(--fcps-primary-dark)] mb-8">برامج أخرى</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {otherPrograms.map(p => (
              <Link key={p.slug} href={`/programs/${p.slug}`}>
                <Card className="h-full border-none shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                  <CardContent className="p-5">
                    <h3 className="font-bold text-[var(--fcps-dark)] text-sm mb-2">{p.nameAr}</h3>
                    <p className="text-xs text-[var(--fcps-gray-text)] line-clamp-2">{p.descAr}</p>
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
