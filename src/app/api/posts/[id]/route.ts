import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import supabase from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { postsService } from '@/lib/services/posts.service'

function toDatabasePostType(type: string | null | undefined): string {
  if (type === 'activity') return 'activities'
  if (type === 'program') return 'posts'
  if (type === 'center') return 'top_employees'
  return type ?? 'news'
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || !['admin', 'editor'].includes(session.user.role))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  try {
    const keys = Object.keys(body)
    if (keys.length === 0) return NextResponse.json({ error: 'No data' }, { status: 400 })

    const post = await postsService.updatePost(id, body)
    return NextResponse.json(post)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ deleted: true })
}
