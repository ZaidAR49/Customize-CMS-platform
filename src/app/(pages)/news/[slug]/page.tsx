import { PostContent } from '@/components/news/PostContent'
import { postsService } from '@/lib/services/posts.service'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export async function generateStaticParams() {
  const posts = await postsService.getPosts(undefined, true)
  return posts.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await postsService.getPostBySlug(slug)
  if (!post) return { title: 'غير موجود' }
  return { title: post.title, description: post.excerpt }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await postsService.getPostBySlug(slug)
  if (!post) notFound()
  const allPosts = await postsService.getPosts(undefined, true)
  const related = allPosts.filter(p => p.id !== post.id).slice(0, 3)
  return <PostContent post={post} related={related} />
}
