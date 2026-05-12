import { organization } from '@/data/organization'
import { Card, CardContent } from '@/components/ui/card'
import { SectionTitle } from '@/components/shared/SectionTitle'
import { Target, Eye, Calendar, MapPin, Phone, Mail } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'عن الجمعية' }

export default function AboutPage() {
  return (
    <div>
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-l from-[#1b5e20] via-[#2e7d32] to-[#00695c] py-20">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }} />
        <div className="container relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">عن الجمعية</h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">{organization.taglineAr}</p>
        </div>
      </section>

      {/* About Content */}
      <section className="py-16 bg-white">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-(--fcps-bg-soft) px-4 py-2 text-sm text-(--fcps-primary) mb-6">
              <Calendar className="h-4 w-4" />
              تأسست عام {organization.foundedYear}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-(--fcps-dark) mb-6">
              {organization.nameAr}
            </h2>
            <p className="text-lg leading-relaxed text-(--fcps-gray-text)">
              {organization.aboutAr}
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-(--fcps-bg-soft)">
        <div className="container">
          <SectionTitle title="رسالتنا ورؤيتنا" />
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            <Card className="border-none shadow-(--fcps-shadow-card)">
              <CardContent className="p-8">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-(--fcps-primary) text-white">
                  <Target className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-(--fcps-primary-dark)">رسالتنا</h3>
                <p className="leading-relaxed text-(--fcps-gray-text)">{organization.missionAr}</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-(--fcps-shadow-card)">
              <CardContent className="p-8">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-(--fcps-primary-light) text-white">
                  <Eye className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-(--fcps-primary-dark)">رؤيتنا</h3>
                <p className="leading-relaxed text-(--fcps-gray-text)">{organization.visionAr}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="py-16 bg-gradient-to-l from-[#1b5e20] to-[#2e7d32]">
        <div className="container">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 text-center text-white">
            <div>
              <div className="text-4xl md:text-5xl font-black">{organization.stats.families}</div>
              <div className="mt-2 text-white/80">أسرة</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-black">{organization.stats.children.toLocaleString()}</div>
              <div className="mt-2 text-white/80">طفل</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-black">{organization.stats.women.toLocaleString()}</div>
              <div className="mt-2 text-white/80">من النساء</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-black">{organization.stats.activities}</div>
              <div className="mt-2 text-white/80">نشاط</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 bg-white">
        <div className="container max-w-2xl">
          <SectionTitle title="معلومات التواصل" />
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg bg-(--fcps-bg-soft) p-4">
              <Phone className="h-5 w-5 text-(--fcps-primary)" />
              <span dir="ltr">{organization.phone}</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-(--fcps-bg-soft) p-4">
              <Mail className="h-5 w-5 text-(--fcps-primary)" />
              <span>{organization.email}</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-(--fcps-bg-soft) p-4">
              <MapPin className="h-5 w-5 text-(--fcps-primary)" />
              <span>{organization.addressAr}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
