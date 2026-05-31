import { organizationService } from '@/lib/services/organization.service'
import { organizationStatsService } from '@/lib/services/organization-stats.service'
import { formatSiteNumber } from '@/lib/date-format'
import { Card, CardContent } from '@/components/ui/card'
import { SectionTitle } from '@/components/shared/SectionTitle'
import { Target, Eye, Calendar, MapPin, Phone, Mail, Users, Baby, Heart, Sparkles } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'عن الجمعية' }

export default async function AboutPage() {
  const [org, statsRows] = await Promise.all([
    organizationService.getOrganization(),
    organizationStatsService.getAllStats(),
  ])

  // Extract stats
  const familiesStat = parseInt(statsRows.find(s => s.key === 'families')?.value || '0', 10)
  const childrenStat = parseInt(statsRows.find(s => s.key === 'children')?.value || '0', 10)
  const womenStat = parseInt(statsRows.find(s => s.key === 'women')?.value || '0', 10)
  const activitiesStat = parseInt(statsRows.find(s => s.key === 'activities')?.value || '0', 10)

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
          <p className="text-lg text-white/80 max-w-2xl mx-auto">{org?.tagline_ar}</p>
        </div>
      </section>

      {/* About Content */}
      <section className="py-16 bg-white">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-(--fcps-bg-soft) px-4 py-2 text-sm text-(--fcps-primary) mb-6">
              <Calendar className="h-4 w-4" />
              تأسست عام {org?.founded_year}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-(--fcps-dark) mb-6">
              {org?.name_ar}
            </h2>
            <p className="text-lg leading-relaxed text-(--fcps-gray-text)">
              {org?.about_ar}
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
                <p className="leading-relaxed text-(--fcps-gray-text)">{org?.mission_ar}</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-(--fcps-shadow-card)">
              <CardContent className="p-8">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-(--fcps-primary-light) text-white">
                  <Eye className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-(--fcps-primary-dark)">رؤيتنا</h3>
                <p className="leading-relaxed text-(--fcps-gray-text)">{org?.vision_ar}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="py-16 bg-gradient-to-l from-[#1b5e20] to-[#2e7d32] relative overflow-hidden">
        <div className="container">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 text-center text-white">
            <div className="group">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 transition-transform group-hover:scale-110">
                <Users className="h-7 w-7 text-white/90" />
              </div>
              <div className="text-4xl md:text-5xl font-black">{formatSiteNumber(familiesStat)}</div>
              <div className="mt-2 text-white/80">أسرة</div>
            </div>
            <div className="group">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 transition-transform group-hover:scale-110">
                <Baby className="h-7 w-7 text-white/90" />
              </div>
              <div className="text-4xl md:text-5xl font-black">{formatSiteNumber(childrenStat)}</div>
              <div className="mt-2 text-white/80">طفل</div>
            </div>
            <div className="group">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 transition-transform group-hover:scale-110">
                <Heart className="h-7 w-7 text-white/90" />
              </div>
              <div className="text-4xl md:text-5xl font-black">{formatSiteNumber(womenStat)}</div>
              <div className="mt-2 text-white/80">من النساء</div>
            </div>
            <div className="group">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 transition-transform group-hover:scale-110">
                <Sparkles className="h-7 w-7 text-white/90" />
              </div>
              <div className="text-4xl md:text-5xl font-black">{formatSiteNumber(activitiesStat)}</div>
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
              <span dir="ltr">{org?.phone}</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-(--fcps-bg-soft) p-4">
              <Mail className="h-5 w-5 text-(--fcps-primary)" />
              <span>{org?.email}</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-(--fcps-bg-soft) p-4">
              <MapPin className="h-5 w-5 text-(--fcps-primary)" />
              <span>{(org?.metadata as Record<string, string>)?.address_ar || 'إربد، المملكة الأردنية الهاشمية'}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
