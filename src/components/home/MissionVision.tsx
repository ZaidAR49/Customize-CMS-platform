import { Target, Eye } from 'lucide-react'
import { SectionTitle } from '@/components/shared/SectionTitle'
import { getTranslations } from 'next-intl/server'

interface MissionVisionProps {
  mission: string
  vision: string
}

export async function MissionVision({ mission, vision }: MissionVisionProps) {
  const t = await getTranslations('homePage.missionVision')

  return (
    <section className="py-20 bg-white">
      <div className="container">
        <SectionTitle
          title={t('title')}
          subtitle={t('subtitle')}
        />

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Mission */}
          <div className="group rounded-2xl border border-(--fcps-primary)/10 bg-gradient-to-br from-white to-(--fcps-bg-soft) p-8 transition-all duration-300 hover:shadow-lg">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-(--fcps-primary) text-white transition-transform group-hover:scale-110">
              <Target className="h-7 w-7" />
            </div>
            <h3 className="mb-4 text-2xl font-bold text-(--fcps-primary-dark)">
              {t('mission.title')}
            </h3>
            <p className="text-base leading-relaxed text-(--fcps-gray-text)">
              {mission || t('mission.content')}
            </p>
          </div>

          {/* Vision */}
          <div className="group rounded-2xl border border-(--fcps-primary)/10 bg-gradient-to-br from-white to-(--fcps-bg-soft) p-8 transition-all duration-300 hover:shadow-lg">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-(--fcps-primary-light) text-white transition-transform group-hover:scale-110">
              <Eye className="h-7 w-7" />
            </div>
            <h3 className="mb-4 text-2xl font-bold text-(--fcps-primary-dark)">
              {t('vision.title')}
            </h3>
            <p className="text-base leading-relaxed text-(--fcps-gray-text)">
              {vision || t('vision.content')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
