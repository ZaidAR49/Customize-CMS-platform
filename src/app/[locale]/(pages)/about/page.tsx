import { organizationService } from '@/lib/services/organization.service'
import { organizationStatsService } from '@/lib/services/organization-stats.service'
import { formatSiteNumber } from '@/lib/date-format'
import { Card, CardContent } from '@/components/ui/card'
import { SectionTitle } from '@/components/shared/SectionTitle'
import { Target, Eye, Calendar, MapPin, Phone, Mail, Users, Baby, Heart, Sparkles } from 'lucide-react'
import type { Metadata } from 'next'
import { getTranslations, getLocale } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = await getTranslations({ locale, namespace: 'aboutPage' })
  return { title: t('metaTitle') }
}

export default async function AboutPage() {
  const locale = await getLocale()
  const t = await getTranslations({ locale, namespace: 'aboutPage' })
  const [org, statsRows] = await Promise.all([
    organizationService.getOrganization(),
    organizationStatsService.getAllStats(),
  ])

  // Extract stats
  const familiesStat = parseInt(statsRows.find(s => s.key === 'families')?.value || '0', 10)
  const childrenStat = parseInt(statsRows.find(s => s.key === 'children')?.value || '0', 10)
  const womenStat = parseInt(statsRows.find(s => s.key === 'women')?.value || '0', 10)
  const activitiesStat = parseInt(statsRows.find(s => s.key === 'activities')?.value || '0', 10)

  const orgName = locale === 'ar' ? org?.name_ar : org?.name_en
  const orgTagline = locale === 'ar' ? org?.tagline_ar : org?.tagline_en
  const orgAbout = locale === 'ar' ? org?.about_ar : org?.about_en
  const orgMission = locale === 'ar' ? org?.mission_ar : org?.mission_en
  const orgVision = locale === 'ar' ? org?.vision_ar : org?.vision_en

  const defaultAddress = t('contactInfo.address')
  const orgAddress = locale === 'ar' 
    ? ((org?.metadata as Record<string, string>)?.address_ar || defaultAddress)
    : ((org?.metadata as Record<string, string>)?.address_en || defaultAddress)

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-l from-[#1b5e20] via-[#2e7d32] to-[#00695c] py-20">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }} />
        <div className="container relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">{t('hero.title')}</h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">{orgTagline || t('hero.tagline')}</p>
        </div>
      </section>

      {/* About Content */}
      <section className="py-16 bg-white">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-(--fcps-bg-soft) px-4 py-2 text-sm text-(--fcps-primary) mb-6">
              <Calendar className="h-4 w-4" />
              {t('history.foundedIn')} {org?.founded_year}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-(--fcps-dark) mb-6">
              {orgName || t('history.name')}
            </h2>
            <p className="text-lg leading-relaxed text-(--fcps-gray-text)">
              {orgAbout || t('history.description')}
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-(--fcps-bg-soft)">
        <div className="container">
          <SectionTitle title={t('missionVision.title')} />
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            <Card className="border-none shadow-(--fcps-shadow-card)">
              <CardContent className="p-8">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-(--fcps-primary) text-white">
                  <Target className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-(--fcps-primary-dark)">{t('missionVision.mission.title')}</h3>
                <p className="leading-relaxed text-(--fcps-gray-text)">{orgMission || t('missionVision.mission.content')}</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-(--fcps-shadow-card)">
              <CardContent className="p-8">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-(--fcps-primary-light) text-white">
                  <Eye className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-(--fcps-primary-dark)">{t('missionVision.vision.title')}</h3>
                <p className="leading-relaxed text-(--fcps-gray-text)">{orgVision || t('missionVision.vision.content')}</p>
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
              <div className="mt-2 text-white/80">{t('stats.families')}</div>
            </div>
            <div className="group">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 transition-transform group-hover:scale-110">
                <Baby className="h-7 w-7 text-white/90" />
              </div>
              <div className="text-4xl md:text-5xl font-black">{formatSiteNumber(childrenStat)}</div>
              <div className="mt-2 text-white/80">{t('stats.children')}</div>
            </div>
            <div className="group">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 transition-transform group-hover:scale-110">
                <Heart className="h-7 w-7 text-white/90" />
              </div>
              <div className="text-4xl md:text-5xl font-black">{formatSiteNumber(womenStat)}</div>
              <div className="mt-2 text-white/80">{t('stats.women')}</div>
            </div>
            <div className="group">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 transition-transform group-hover:scale-110">
                <Sparkles className="h-7 w-7 text-white/90" />
              </div>
              <div className="text-4xl md:text-5xl font-black">{formatSiteNumber(activitiesStat)}</div>
              <div className="mt-2 text-white/80">{t('stats.activities')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 bg-white">
        <div className="container max-w-2xl">
          <SectionTitle title={t('contactInfo.title')} />
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
              <span>{orgAddress}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
