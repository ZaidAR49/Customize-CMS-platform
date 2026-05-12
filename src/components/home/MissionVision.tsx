import { Target, Eye } from 'lucide-react'
import { SectionTitle } from '@/components/shared/SectionTitle'

interface MissionVisionProps {
  mission: string
  vision: string
}

export function MissionVision({ mission, vision }: MissionVisionProps) {
  return (
    <section className="py-20 bg-white">
      <div className="container">
        <SectionTitle
          title="رسالتنا ورؤيتنا"
          subtitle="نعمل بإخلاص لتحقيق أهدافنا في خدمة المجتمع"
        />

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Mission */}
          <div className="group rounded-2xl border border-(--fcps-primary)/10 bg-gradient-to-br from-white to-(--fcps-bg-soft) p-8 transition-all duration-300 hover:shadow-lg">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-(--fcps-primary) text-white transition-transform group-hover:scale-110">
              <Target className="h-7 w-7" />
            </div>
            <h3 className="mb-4 text-2xl font-bold text-(--fcps-primary-dark)">
              رسالتنا
            </h3>
            <p className="text-base leading-relaxed text-(--fcps-gray-text)">
              {mission}
            </p>
          </div>

          {/* Vision */}
          <div className="group rounded-2xl border border-(--fcps-primary)/10 bg-gradient-to-br from-white to-(--fcps-bg-soft) p-8 transition-all duration-300 hover:shadow-lg">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-(--fcps-primary-light) text-white transition-transform group-hover:scale-110">
              <Eye className="h-7 w-7" />
            </div>
            <h3 className="mb-4 text-2xl font-bold text-(--fcps-primary-dark)">
              رؤيتنا
            </h3>
            <p className="text-base leading-relaxed text-(--fcps-gray-text)">
              {vision}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
