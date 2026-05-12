import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SectionTitle } from '@/components/shared/SectionTitle'

const sectors = [
  {
    icon: '👩',
    title: 'قطاع المرأة',
    items: [
      'التمكين الاقتصادي للمرأة',
      'برامج محو الأمية',
      'الدعم النفسي والاجتماعي',
      'التوعية القانونية والحقوقية',
      'التأهيل المهني والتدريب'
    ]
  },
  {
    icon: '🧒',
    title: 'قطاع الطفولة',
    items: [
      'حماية الأطفال من العنف والإساءة',
      'برامج تعليمية وترفيهية',
      'الرعاية الصحية والنفسية'
    ]
  },
  {
    icon: '🧑',
    title: 'قطاع الشباب',
    items: [
      'تنمية المهارات القيادية',
      'برامج التدريب المهني والتقني'
    ]
  },
  {
    icon: '👴',
    title: 'قطاع كبار السن',
    items: [
      'تقديم الدعم والرعاية الشاملة لكبار السن وتلبية احتياجاتهم الاجتماعية والنفسية والصحية'
    ]
  }
]

export function TargetSectors() {
  return (
    <section className="py-20 bg-(--fcps-bg-soft)">
      <div className="container">
        <SectionTitle
          title="القطاعات المستهدفة"
          subtitle="نعمل على خدمة مختلف شرائح المجتمع من خلال برامج متخصصة"
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
