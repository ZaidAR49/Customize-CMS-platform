import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import supabase from '@/lib/supabase'
import { NextResponse } from 'next/server'

function toDatabasePostType(type: string | null | undefined): string {
  if (type === 'activity') return 'activities'
  if (type === 'program') return 'posts'
  if (type === 'center') return 'top_employees'
  return type ?? 'news'
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })

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
    const { title, slug, content, excerpt, cover_image, type, category_id, published, author_id } = body
    const metadata: Record<string, string> = {}
    if (typeof excerpt === 'string') metadata.excerpt = excerpt
    if (typeof content === 'string') metadata.body = content

    const { data, error } = await supabase
      .from('posts')
      .insert({
        title,
        slug,
        cover_image: cover_image ?? null,
        type: toDatabasePostType(type),
        category_id: category_id || null,
        metadata,
        published: published ?? false,
        author_id,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
