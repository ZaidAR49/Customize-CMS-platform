import supabase from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// Force dynamic execution to ensure the database is hit on every request (prevents build-time static caching)
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Verify the request is coming from Vercel's cron scheduler.
  // Vercel sends: Authorization: Bearer <CRON_SECRET>
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { status: 'error', message: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    if (!supabase) {
      throw new Error('Supabase client is not initialized')
    }

    // A very cheap select query that fetches at most 1 user ID to hit the database.
    // Even if no users exist, the query will succeed and return an empty array, keeping the DB alive.
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1)

    if (error) {
      throw error
    }

    return NextResponse.json({
      status: 'success',
      message: 'Database keep-alive query executed successfully',
      timestamp: new Date().toISOString(),
      count: data?.length ?? 0,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to execute keep-alive query',
        error: error?.message || String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
