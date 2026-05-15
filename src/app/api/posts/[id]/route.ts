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

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || !['admin', 'editor'].includes(session.user.role))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  try {
    const keys = Object.keys(body)
    if (keys.length === 0) return NextResponse.json({ error: 'No data' }, { status: 400 })

    const { descripcion, excerpt, type, category_id, ...rest } = body
    const payload: Record<string, unknown> = { ...rest }

    if (type !== undefined) payload.type = toDatabasePostType(type)
    if (category_id !== undefined) payload.category_id = category_id || null

    if (descripcion !== undefined) {
      payload.descripcion = descripcion
    }

    if (excerpt !== undefined) {
      const { data: existingPost, error: existingError } = await supabase
        .from('posts')
        .select('metadata')
        .eq('id', id)
        .single()

      if (existingError) throw existingError

      payload.metadata = {
        ...(existingPost?.metadata ?? {}),
        excerpt,
      }
    }

    const { data, error } = await supabase
      .from('posts')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(data)
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
