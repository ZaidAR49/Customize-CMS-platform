import { PostContent } from '@/components/news/PostContent'
import { categoriesService } from '@/lib/services/categories.service'
import { commentsService } from '@/lib/services/comments.service'
import { postsService } from '@/lib/services/posts.service'
import { normalizeSlug } from '@/lib/slug'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Post } from '@/types/post'
import { getLocale } from 'next-intl/server'

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
  if (!post) return { title: 'Not Found' }
  
  const locale = await getLocale()
  const title = locale === 'ar' ? post.title : (post.title_en || post.title)
  const description = locale === 'ar' ? post.excerpt : (post.excerpt_en || post.excerpt)
  return { title, description }
}

function pickRelated(post: Post, all: Post[]): Post[] {
  const pool = all.filter((p) => p.id !== post.id)
  const sameCategory = post.category
    ? pool.filter((p) => p.category === post.category)
    : pool.filter((p) => p.type === post.type)
  const source = sameCategory.length >= 3 ? sameCategory : pool
  return source.slice(0, 3)
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: rawSlug } = await params
  const slug = normalizeSlug(rawSlug)
  const post = await postsService.getPostBySlug(slug)
  if (!post || (post.type !== 'news' && post.type !== 'activity')) notFound()

  const locale = await getLocale()
  const [allPosts, dbCategories] = await Promise.all([
    postsService.getPosts(undefined, true),
    categoriesService.getAllCategories(),
  ])
  const newsPosts = allPosts.filter((p) => p.type === 'news' || p.type === 'activity')
  const mappedCategories = dbCategories.map(c => ({ 
    key: c.key, 
    label: locale === 'ar' ? c.label_ar : (c.label_en || c.label_ar) 
  }))

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
      categories={mappedCategories}
      approvedComments={approvedComments}
    />
  )
}

