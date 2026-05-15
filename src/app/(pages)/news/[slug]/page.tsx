import { PostContent } from '@/components/news/PostContent'
import { commentsService } from '@/lib/services/comments.service'
import { postsService } from '@/lib/services/posts.service'
import { normalizeSlug } from '@/lib/slug'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Post } from '@/types/post'

export const dynamic = 'force-dynamic'
export const dynamicParams = true

export async function generateStaticParams() {
  try {
    const posts = await postsService.getPosts(undefined, true)
    return posts
      .filter((p) => p.type === 'news' || p.type === 'activity')
      .map((p) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug: rawSlug } = await params
  const slug = normalizeSlug(rawSlug)
  const post = await postsService.getPostBySlug(slug)
  if (!post) return { title: 'غير موجود' }
  return { title: post.title, description: post.excerpt }
}

function pickRelated(post: Post, all: Post[]): Post[] {
  const pool = all.filter((p) => p.id !== post.id)
  const sameCategory = post.category
    ? pool.filter((p) => p.category === post.category)
    : pool.filter((p) => p.type === post.type)
  const source = sameCategory.length >= 3 ? sameCategory : pool
  return source.slice(0, 3)
}

function buildCategories(posts: Post[]) {
  const map = new Map<string, string>()
  for (const p of posts) {
    if (!p.category) continue
    map.set(p.category, p.categoryLabel ?? p.category)
  }
  return Array.from(map.entries())
    .map(([key, label]) => ({ key, label }))
    .sort((a, b) => a.label.localeCompare(b.label, 'ar'))
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: rawSlug } = await params
  const slug = normalizeSlug(rawSlug)
  const post = await postsService.getPostBySlug(slug)
  if (!post || (post.type !== 'news' && post.type !== 'activity')) notFound()

  const allPosts = await postsService.getPosts(undefined, true)
  const newsPosts = allPosts.filter((p) => p.type === 'news' || p.type === 'activity')

  const sorted = [...newsPosts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )
  const currentIndex = sorted.findIndex((p) => p.id === post.id)
  const previousPost =
    currentIndex >= 0 && currentIndex < sorted.length - 1 ? sorted[currentIndex + 1] : null

  const related = pickRelated(post, newsPosts)

  const latestPosts = sorted.slice(0, 5)
  const latestWithCounts = await Promise.all(
    latestPosts.map(async (p) => ({
      ...p,
      commentCount: p.id ? await commentsService.countApprovedForPost(p.id) : 0,
    }))
  )

  let approvedComments: Awaited<ReturnType<typeof commentsService.listApprovedForPost>> = []
  if (post.id) {
    try {
      approvedComments = await commentsService.listApprovedForPost(post.id)
    } catch {
      approvedComments = []
    }
  }

  return (
    <PostContent
      post={post}
      related={related}
      previousPost={previousPost}
      latestPosts={latestWithCounts}
      categories={buildCategories(newsPosts)}
      approvedComments={approvedComments}
    />
  )
}
