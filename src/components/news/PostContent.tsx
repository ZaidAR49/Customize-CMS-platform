import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { PostMediaGallery } from '@/components/news/post-detail/PostMediaGallery'
import { PostShareBar } from '@/components/news/post-detail/PostShareBar'
import { PostCommentsSection } from '@/components/news/post-detail/PostCommentsSection'
import type { PostApprovedComment } from '@/components/news/post-detail/PostCommentsSection'
import { RelatedPosts } from '@/components/news/post-detail/RelatedPosts'
import { PostSidebar } from '@/components/news/post-detail/PostSidebar'
import { getPublicPostUrl } from '@/lib/post-url'
import type { Post } from '@/types/post'
import { formatSiteDate } from '@/lib/date-format'

const typeBreadcrumbLabels: Record<string, string> = {
  news: 'أخبار الجمعية',
  activity: 'نشاطات الجمعية',
}

interface SidebarCategory {
  key: string
  label: string
}

export interface PostContentProps {
  post: Post
  related: Post[]
  previousPost: Post | null
  latestPosts: Array<Post & { commentCount?: number }>
  categories: SidebarCategory[]
  approvedComments: PostApprovedComment[]
}

function authorAvatarUrl(avatarUrl: string, name: string): string | null {
  if (avatarUrl?.trim()) return avatarUrl.trim()
  return null
}

function AuthorBlock({ post }: { post: Post }) {
  const avatar = authorAvatarUrl(post.author.avatarUrl, post.author.name)

  return (
    <div className="mb-10 flex items-center gap-3">
      {avatar ? (
        <Image
          src={avatar}
          alt=""
          width={64}
          height={64}
          className="h-16 w-16 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0073aa] text-lg font-bold text-white">
          {post.author.name.charAt(0)}
        </div>
      )}
      <span className="text-base font-medium text-[#333333]">{post.author.name}</span>
    </div>
  )
}

export function PostContent({
  post,
  related,
  previousPost,
  latestPosts,
  categories,
  approvedComments,
}: PostContentProps) {
  const postUrl = getPublicPostUrl(post.slug)
  const categoryLabel =
    post.categoryLabel ?? typeBreadcrumbLabels[post.type] ?? 'أخبار الجمعية'

  return (
    <div className="bg-white">
      <nav
        className="border-b border-[#e0e0e0] bg-[#fafafa] py-3 text-sm text-[#777777]"
        aria-label="مسار التنقل"
      >
        <div className="container flex flex-wrap items-center gap-2">
          <Link href="/" className="hover:text-[#0073aa]">
            الرئيسية
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/news" className="hover:text-[#0073aa]">
            نشاطات وأخبار الجمعية
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-[#777777]">{categoryLabel}</span>
          <span aria-hidden="true">/</span>
          <span className="text-[#333333]">{post.title}</span>
        </div>
      </nav>

      <div className="py-10">
        <div className="page-layout">
          <article className="min-w-0">
            <h1 className="mb-4 text-3xl font-bold leading-tight text-[#1a1a1a] md:text-4xl">
              {post.title}
            </h1>

            {previousPost && (
              <Link
                href={`/news/${previousPost.slug}`}
                className="mb-6 flex items-start gap-2 text-sm text-[#0073aa] hover:text-[#005580]"
              >
                <ChevronRight className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <span>
                  <span className="block text-[#777777]">{formatSiteDate(previousPost.publishedAt)}</span>
                  <span className="font-medium">{previousPost.title}</span>
                </span>
              </Link>
            )}

            <PostMediaGallery
              coverImage={post.coverImage}
              gallery={post.gallery}
              title={post.title}
            />

            <div
              className="prose prose-lg max-w-none text-[#333333] leading-[1.8]
                [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-[#1a1a1a] [&_h2]:mt-8 [&_h2]:mb-4
                [&_p]:mb-4 [&_p]:text-right
                [&_ul]:pr-6 [&_ul]:space-y-2
                [&_li]:text-[#333333]"
              dangerouslySetInnerHTML={{ __html: post.content || `<p>${post.excerpt}</p>` }}
            />

            <PostShareBar
              postId={post.id ?? ''}
              postUrl={postUrl}
              postTitle={post.title}
              initialLikes={post.likes}
            />

            {post.id && (
              <PostCommentsSection postId={post.id} comments={approvedComments} />
            )}

            <RelatedPosts posts={related} />
          </article>

          <PostSidebar latestPosts={latestPosts} categories={categories} />
        </div>
      </div>
    </div>
  )
}
