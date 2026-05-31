'use client'

import { useCountUp } from '@/hooks/useCountUp'
import type { OrgStats } from '@/types/organization'
import { Users, Baby, Heart, Sparkles } from 'lucide-react'
import { formatSiteNumber } from '@/lib/date-format'
import { useTranslations } from 'next-intl'

interface StatsCounterProps {
  stats: OrgStats
}

function StatItem({ target, label, icon: Icon }: { target: number; label: string; icon: React.ElementType }) {
  const { count, ref } = useCountUp(target)

  return (
    <div ref={ref} className="text-center group">
      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 transition-transform group-hover:scale-110">
        <Icon className="h-7 w-7 text-white/90" />
      </div>
      <div className="text-5xl font-black text-white mb-2 tabular-nums">
        {formatSiteNumber(count)}
      </div>
      <div className="text-lg text-white/80 mt-2">
        {label}
      </div>
    </div>
  )
}

export function StatsCounter({ stats }: StatsCounterProps) {
  const t = useTranslations('homePage.statsCounter')

  return (
    <section className="py-20 bg-gradient-to-l from-[#1b5e20] via-[#2e7d32] to-[#1b5e20] relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-white/5" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="container relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('title')}</h2>
          <div className="mx-auto h-1 w-20 rounded-full bg-white/40" />
        </div>

        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <StatItem target={stats.families} label={t('families')} icon={Users} />
          <StatItem target={stats.children} label={t('children')} icon={Baby} />
          <StatItem target={stats.women} label={t('women')} icon={Heart} />
          <StatItem target={stats.activities} label={t('activities')} icon={Sparkles} />
        </div>
      </div>
    </section>
  )
}
