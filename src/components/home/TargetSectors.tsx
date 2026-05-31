import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SectionTitle } from '@/components/shared/SectionTitle'
import { getTranslations } from 'next-intl/server'

export async function TargetSectors() {
  const t = await getTranslations('homePage.targetSectors')

  const sectors = [
    {
      icon: '👩',
      title: t('womenSector.title'),
      items: [
        t('womenSector.economicEmpowerment'),
        t('womenSector.literacyPrograms'),
        t('womenSector.psychoSocialSupport'),
        t('womenSector.legalAwareness'),
        t('womenSector.vocationalRehab'),
      ],
    },
    {
      icon: '🧒',
      title: t('childhoodSector.title'),
      items: [
        t('childhoodSector.protectionFromViolence'),
        t('childhoodSector.educationalPrograms'),
        t('childhoodSector.healthCare'),
      ],
    },
    {
      icon: '🧑',
      title: t('youthSector.title'),
      items: [
        t('youthSector.leadershipSkills'),
        t('youthSector.vocationalTraining'),
      ],
    },
    {
      icon: '👴',
      title: t('elderlySector.title'),
      items: [
        t('elderlySector.comprehensiveSupport'),
      ],
    },
  ]

  return (
    <section className="py-20 bg-(--fcps-bg-soft)">
      <div className="container">
        <SectionTitle
          title={t('title')}
          subtitle={t('subtitle')}
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {sectors.map((sector, index) => (
            <Card
              key={sector.title}
              className="group cursor-default border-none bg-white shadow-(--fcps-shadow-card) transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-(--fcps-bg-soft) text-3xl transition-transform group-hover:scale-110">
                  {sector.icon}
                </div>
                <CardTitle className="text-lg font-bold text-(--fcps-primary-dark)">
                  {sector.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {sector.items.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-(--fcps-gray-text)"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-(--fcps-primary-light)" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
