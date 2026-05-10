import { createClient } from '@supabase/supabase-js'
import type { Post } from '@/types/post'
import type { Organization } from '@/types/organization'

// Server-side client (uses service role — full access, bypasses RLS)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_key'
)

// Client-side client (uses anon key — respects RLS)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key'
)

// ─── Data Fetching Functions ──────────────────────

export async function getPosts(type?: string): Promise<Post[]> {
  let query = supabaseAdmin
    .from('posts')
    .select('*, author:users(name, avatar_url)')
    .eq('published', true)
    .order('published_at', { ascending: false })

  if (type) query = query.eq('type', type)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data as Post[]
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const { data, error } = await supabaseAdmin
    .from('posts')
    .select('*, author:users(name, avatar_url)')
    .eq('slug', slug)
    .eq('published', true)
    .single()
  if (error) return null
  return data as Post
}

export async function getOrganization(): Promise<Organization> {
  const { data, error } = await supabaseAdmin
    .from('organization')
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return data as Organization
}

export async function incrementLikes(postId: string): Promise<void> {
  await supabaseAdmin.rpc('increment_likes', { post_id: postId })
}
