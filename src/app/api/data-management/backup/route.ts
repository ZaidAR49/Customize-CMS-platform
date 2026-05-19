import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import supabase from '@/lib/supabase'
import { NextResponse } from 'next/server'

/**
 * GET /api/data-management/backup
 * Fetches all rows from every public table and returns a single JSON object
 * keyed by table name.  Only admin users may call this endpoint.
 */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  try {
    // Fetch every table in parallel
    const [
      usersRes,
      categoriesRes,
      postsRes,
      commentsRes,
      orgRes,
      orgStatsRes,
    ] = await Promise.all([
      supabase.from('users').select('*').order('created_at', { ascending: true }),
      supabase.from('categories').select('*').order('created_at', { ascending: true }),
      supabase.from('posts').select('*').order('published_at', { ascending: true }),
      supabase.from('post_comments').select('*').order('created_at', { ascending: true }),
      supabase.from('organization').select('*'),
      supabase.from('organization_stats').select('*').order('display_order', { ascending: true }),
    ])

    // Surface any Supabase errors
    const errors = [
      usersRes.error,
      categoriesRes.error,
      postsRes.error,
      commentsRes.error,
      orgRes.error,
      orgStatsRes.error,
    ].filter(Boolean)

    if (errors.length > 0) {
      throw new Error(errors.map((e) => e!.message).join('; '))
    }

    const backup = {
      _meta: {
        version: 1,
        exported_at: new Date().toISOString(),
        tables: ['users', 'categories', 'posts', 'post_comments', 'organization', 'organization_stats'],
      },
      users: usersRes.data ?? [],
      categories: categoriesRes.data ?? [],
      posts: postsRes.data ?? [],
      post_comments: commentsRes.data ?? [],
      organization: orgRes.data ?? [],
      organization_stats: orgStatsRes.data ?? [],
    }

    return NextResponse.json(backup)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'فشل في إنشاء النسخة الاحتياطية' }, { status: 500 })
  }
}
