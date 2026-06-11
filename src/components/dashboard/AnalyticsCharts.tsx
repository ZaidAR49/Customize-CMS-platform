'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useTranslations, useLocale } from 'next-intl'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

export function AnalyticsCharts() {
  const t = useTranslations('dashboardOverview')
  const locale = useLocale()
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
        console.error('Error fetching PostHog metrics for charts:', err)
        setError(err.message || 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i} className="border-none shadow-sm bg-white animate-pulse h-[360px]">
            <CardHeader className="space-y-2 p-5 pb-0">
              <div className="h-5 bg-slate-200 rounded w-1/3" />
              <div className="h-4 bg-slate-200 rounded w-1/2" />
            </CardHeader>
            <CardContent className="p-5 pt-4">
              <div className="h-[220px] w-full bg-slate-100 rounded-xl" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error || !data) {
    return null // Gracefully hide charts or show empty state if there's an error
  }

  // 1. Parse AreaChart data (Website Traffic Growth)
  const last30Days = []
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(now.getDate() - i)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    last30Days.push(`${yyyy}-${mm}-${dd}`)
  }

  const posthogVisitsMap: Record<string, number> = {}
  if (data.traffic_trend?.results) {
    data.traffic_trend.results.forEach((row: any) => {
      const dayStr = row[0]
      if (dayStr) {
        const key = dayStr.split(' ')[0]
        posthogVisitsMap[key] = Number(row[1]) || 0
      }
    })
  }

  const areaData = last30Days.map((dayStr) => {
    const visits = posthogVisitsMap[dayStr] ?? 0
    const dateObj = new Date(dayStr)
    const dateFormatted = dateObj.toLocaleDateString(locale, {
      month: 'long',
      day: 'numeric',
    })
    return {
      dayStr,
      dateFormatted,
      visits,
    }
  })

  // 2. Parse BarChart data (User Engagement)
  const currentTotal = data.total_visits?.results?.[0]?.[0] ?? 0

  let formsCount = 0
  let likesCount = 0
  let commentsCount = 0

  if (data.engagement_breakdown?.results) {
    data.engagement_breakdown.results.forEach((row: any) => {
      const eventName = row[0]
      const count = Number(row[1]) || 0
      if (eventName === 'contact_form_submitted') {
        formsCount = count
      } else if (eventName === 'post_liked') {
        likesCount = count
      } else if (eventName === 'comment_submitted') {
        commentsCount = count
      }
    })
  }

  const barData = [
    {
      label: t('logins'),
      value: currentTotal,
      formattedValue: Number(currentTotal).toLocaleString('en-US'),
      color: '#3b82f6', // blue
    },
    {
      label: t('forms'),
      value: formsCount,
      formattedValue: Number(formsCount).toLocaleString('en-US'),
      color: '#16a34a', // green
    },
    {
      label: t('comments'),
      value: commentsCount,
      formattedValue: Number(commentsCount).toLocaleString('en-US'),
      color: '#15803d', // darker green
    },
    {
      label: t('likes'),
      value: likesCount,
      formattedValue: Number(likesCount).toLocaleString('en-US'),
      color: '#dc2626', // red
    },
  ]

  // Custom tooltips to match the user's design (dark rounded tooltip box)
  const CustomAreaTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1e293b] text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-lg border border-[#334155] flex items-center gap-1.5">
          <span>{label}:</span>
          <span className="font-mono">{payload[0].value}</span>
        </div>
      )
    }
    return null
  }

  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const barItem = payload[0].payload
      return (
        <div className="bg-[#1e293b] text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-lg border border-[#334155] flex flex-col gap-0.5">
          <span className="text-[10px] text-slate-400">{barItem.label}</span>
          <span className="font-mono text-sm">{barItem.formattedValue}</span>
        </div>
      )
    }
    return null
  }

  // Custom Tick component for the BarChart XAxis
  const CustomXAxisTick = (props: any) => {
    const { x, y, payload } = props
    const item = barData[payload.index]
    if (!item) return null
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={16} textAnchor="middle" className="fill-muted-foreground text-[11px]">
          {item.label}
        </text>
        <text x={0} y={0} dy={32} textAnchor="middle" className="fill-foreground font-bold text-xs">
          {item.formattedValue}
        </text>
      </g>
    )
  }

  // Determine if the current page alignment is RTL (Arabic) or LTR (English)
  const isRtl = locale === 'ar'

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* 1. User Engagement Card (rendered first so in RTL it displays on the right) */}
      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="p-5 pb-0">
          <CardTitle className="text-lg font-bold text-(--fcps-dark)">
            {t('engagementTitle')}
          </CardTitle>
          <CardDescription className="text-xs text-(--fcps-gray-text)">
            {t('engagementSubtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-4">
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                margin={{ top: 20, right: 10, left: 10, bottom: 10 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  height={50}
                  tick={CustomXAxisTick}
                />
                <YAxis hide />
                <Tooltip content={CustomBarTooltip} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={50}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 2. Website Traffic Growth Card (rendered second so in RTL it displays on the left) */}
      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="p-5 pb-0">
          <CardTitle className="text-lg font-bold text-(--fcps-dark)">
            {t('trafficTitle')}
          </CardTitle>
          <CardDescription className="text-xs text-(--fcps-gray-text)">
            {t('trafficSubtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-4">
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={areaData}
                margin={{ left: 10, right: 10, top: 10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#475569" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#475569" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis
                  dataKey="dateFormatted"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  reversed={isRtl} // reverses XAxis labels flow correctly in RTL layouts
                  className="text-[10px] fill-muted-foreground"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  orientation={isRtl ? 'right' : 'left'} // align YAxis to right in RTL
                  tickMargin={8}
                  className="text-[10px] fill-muted-foreground"
                />
                <Tooltip content={CustomAreaTooltip} />
                <Area
                  type="monotone"
                  dataKey="visits"
                  stroke="#475569"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorVisits)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
