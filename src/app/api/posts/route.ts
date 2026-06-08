import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import supabase from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { postsService } from '@/lib/services/posts.service'

function toDatabasePostType(type: string | null | undefined): string {
  if (type === 'activity') return 'activities'
  return type ?? 'news'
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const isAdminOrEditor = session && ['admin', 'editor'].includes(session.user.role)

    let query = supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (!isAdminOrEditor) {
      query = query.eq('published', true)
    }

    const { data, error } = await query

    if (error) throw error
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || !['admin', 'editor'].includes(session.user.role))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const postData = { ...body, author_id: body.author_id || session.user.id }
    const post = await postsService.createPost(postData)
    return NextResponse.json(post, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
