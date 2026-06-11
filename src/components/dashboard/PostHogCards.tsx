'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { useTranslations } from 'next-intl'
import { Eye, Users } from 'lucide-react'

export function PostHogCards() {
  const t = useTranslations('dashboardOverview')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/posthog/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ metric: 'all' }),
        })

        if (!res.ok) {
          throw new Error('Failed to fetch PostHog analytics')
        }

        const json = await res.json()
        setData(json)
      } catch (err: any) {
        console.error('Error fetching PostHog metrics:', err)
        setError(err.message || 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  // 1. Total Visits Parsing
  const totalVisitsResults = data?.total_visits?.results
  const currentTotal = totalVisitsResults?.[0]?.[0] ?? 0
  const previousTotal = totalVisitsResults?.[0]?.[1] ?? 0
  const totalVisitsDiff = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0

  // 2. Unique Visitors Parsing
  const uniqueVisitorsResults = data?.unique_visitors?.results
  const currentUnique = uniqueVisitorsResults?.[0]?.[0] ?? 0
  const previousUnique = uniqueVisitorsResults?.[0]?.[1] ?? 0
  const uniqueVisitorsDiff = previousUnique > 0 ? ((currentUnique - previousUnique) / previousUnique) * 100 : 0

  const cardsInfo = [
    {
      label: t('totalVisits'),
      value: currentTotal,
      diff: totalVisitsDiff,
      icon: Eye,
      color: 'bg-blue-500', // matches eye color in image
    },
    {
      label: t('uniqueVisitors'),
      value: currentUnique,
      diff: uniqueVisitorsDiff,
      icon: Users,
      color: 'bg-slate-600', // matches slate color in image
    },
  ]

  if (loading) {
    return (
      <>
        {[1, 2].map((i) => (
          <Card key={i} className="border-none shadow-sm bg-white animate-pulse">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="h-12 w-12 rounded-xl bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-1/2" />
                <div className="h-6 bg-slate-200 rounded w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </>
    )
  }

  return (
    <>
      {cardsInfo.map((card) => {
        const formattedValue = Number(card.value).toLocaleString('en-US')
        const formattedDiff = card.diff.toFixed(1)
        const isPositive = card.diff >= 0
        const diffText = isPositive ? `+${formattedDiff}%` : `${formattedDiff}%`
        const diffColor = isPositive ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'

        return (
          <Card key={card.label} className="border-none shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.color} text-white`}>
                <card.icon className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-(--fcps-gray-text) truncate">{card.label}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold text-(--fcps-dark)">
                    {error ? '—' : formattedValue}
                  </span>
                  {!error && (
                    <span className={`text-xs ${diffColor}`} dir="ltr">
                      {diffText}
                    </span>
                  )}
                </div>
                <p className="text-xs text-(--fcps-gray-text) mt-0.5">
                  {t('fromLastMonth')}
                </p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </>
  )
}
