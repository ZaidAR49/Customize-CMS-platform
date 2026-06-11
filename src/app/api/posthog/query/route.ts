import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

// Pre-defined HogQL queries matching the user's requirements
const PREDEFINED_QUERIES: Record<string, any> = {
  total_visits: {
    kind: 'HogQLQuery',
    query: "SELECT countIf(timestamp >= now() - INTERVAL 30 DAY) AS current_30_days, countIf(timestamp < now() - INTERVAL 30 DAY AND timestamp >= now() - INTERVAL 60 DAY) AS previous_30_days FROM events WHERE event = '$pageview'"
  },
  unique_visitors: {
    kind: 'HogQLQuery',
    query: "SELECT count(DISTINCT if(timestamp >= now() - INTERVAL 30 DAY, distinct_id, null)) AS current_uniques, count(DISTINCT if(timestamp < now() - INTERVAL 30 DAY AND timestamp >= now() - INTERVAL 60 DAY, distinct_id, null)) AS previous_uniques FROM events WHERE event = '$pageview'"
  },
  traffic_trend: {
    kind: 'HogQLQuery',
    query: "SELECT formatDateTime(toStartOfDay(timestamp), '%Y-%m-%d') AS day, count() AS total_visits FROM events WHERE event = '$pageview' AND timestamp >= now() - INTERVAL 30 DAY GROUP BY day ORDER BY day ASC"
  },
  engagement_breakdown: {
    kind: 'HogQLQuery',
    query: "SELECT event, count() AS total_count FROM events WHERE event IN ('contact_form_submitted', 'post_liked', 'document_clicked') AND timestamp >= now() - INTERVAL 30 DAY GROUP BY event ORDER BY total_count DESC"
  }
}

export async function POST(req: Request) {
  try {
    // 1. Authenticate Request
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Fetch PostHog Credentials
    const host = (process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com').replace(/\/$/, '')
    const projectId = process.env.POSTHOG_PROJECT_ID
    const apiKey = process.env.POSTHOG_PERSONAL_API_KEY

    if (!projectId || !apiKey) {
      return NextResponse.json(
        { error: 'PostHog configuration is incomplete on the server.' },
        { status: 500 }
      )
    }

    const body = await req.json()
    const { metric, query } = body

    const posthogUrl = `${host}/api/projects/${projectId}/query/`

    // Helper to request data from PostHog API
    const fetchFromPostHog = async (queryPayload: any) => {
      const response = await fetch(posthogUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ query: queryPayload }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`PostHog API responded with status ${response.status}: ${errorText}`)
      }

      return response.json()
    }

    // 3. Handle 'all' metrics request in parallel
    if (metric === 'all') {
      const metricsList = Object.keys(PREDEFINED_QUERIES)
      const results: Record<string, any> = {}

      await Promise.all(
        metricsList.map(async (key) => {
          try {
            results[key] = await fetchFromPostHog(PREDEFINED_QUERIES[key])
          } catch (err: any) {
            results[key] = { error: err.message }
          }
        })
      )

      return NextResponse.json(results)
    }

    // 4. Handle specific predefined metric
    if (metric) {
      const queryPayload = PREDEFINED_QUERIES[metric]
      if (!queryPayload) {
        return NextResponse.json(
          { error: `Invalid metric. Allowed values: ${Object.keys(PREDEFINED_QUERIES).join(', ')}` },
          { status: 400 }
        )
      }
      const data = await fetchFromPostHog(queryPayload)
      return NextResponse.json(data)
    }

    // 5. Handle custom HogQL query passed by the client
    if (query) {
      const data = await fetchFromPostHog(query)
      return NextResponse.json(data)
    }

    return NextResponse.json(
      { error: 'Either "metric" or "query" must be provided in the request body.' },
      { status: 400 }
    )

  } catch (error: any) {
    console.error('PostHog proxy query error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
