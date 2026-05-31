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
import { preparePostHtml } from '@/lib/post-html'
import { useTranslations, useLocale } from 'next-intl'

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
  const t = useTranslations('newsPage')
  const locale = useLocale()

  const typeBreadcrumbLabels: Record<string, string> = {
    news: t('breadcrumbs.news'),
    activity: t('breadcrumbs.news'),
  }

  const title = locale === 'ar' ? post.title : (post.title_en || post.title)
  const description = locale === 'ar' ? post.descripcion : (post.descripcion_en || post.descripcion)
  const excerpt = locale === 'ar' ? post.excerpt : (post.excerpt_en || post.excerpt)

  const postUrl = getPublicPostUrl(post.slug)
  const categoryLabel =
    post.categoryLabel ?? typeBreadcrumbLabels[post.type] ?? t('breadcrumbs.news')
  const postBodyHtml =
    preparePostHtml(description) || (excerpt ? `<p>${excerpt}</p>` : '')

  return (
    <div className="bg-white">
      <nav
        className="border-b border-[#e0e0e0] bg-[#fafafa] py-3 text-sm text-[#777777]"
        aria-label="مسار التنقل"
      >
        <div className="page-layout-shell flex flex-wrap items-center gap-2">
          <Link href="/" className="hover:text-[#0073aa]">
            {t('breadcrumbs.home')}
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/news" className="hover:text-[#0073aa]">
            {t('breadcrumbs.news')}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-[#777777]">{categoryLabel}</span>
          <span aria-hidden="true">/</span>
          <span className="text-[#333333]">{title}</span>
        </div>
      </nav>

      <div className="py-10">
        <div className="page-layout-shell page-layout">
          <article className="min-w-0">
            <h1 className="mb-4 text-3xl font-bold leading-tight text-[#1a1a1a] md:text-4xl">
              {title}
            </h1>

            {previousPost && (
              <Link
                href={`/news/${previousPost.slug}`}
                className="mb-6 flex items-start gap-2 text-sm text-[#0073aa] hover:text-[#005580]"
              >
                <ChevronRight className={`mt-0.5 h-4 w-4 shrink-0 ${locale === 'en' ? 'rotate-180' : ''}`} aria-hidden />
                <span>
                  <span className="block text-[#777777]">{formatSiteDate(previousPost.publishedAt)}</span>
                  <span className="font-medium">{locale === 'ar' ? previousPost.title : (previousPost.title_en || previousPost.title)}</span>
                </span>
              </Link>
            )}

            <PostMediaGallery
              coverImage={post.coverImage}
              gallery={post.gallery}
              title={title}
            />

            <div
              className="post-html-content"
              dangerouslySetInnerHTML={{ __html: postBodyHtml }}
            />

            {(() => {
              const tagsAr = post.tags ?? []
              const tagsEn = post.tags_en ?? []
              const displayTags =
                locale === 'ar'
                  ? tagsAr.length > 0 ? tagsAr : tagsEn
                  : tagsEn.length > 0 ? tagsEn : tagsAr
              return displayTags.length > 0 ? (
                <div className="mt-8 mb-6 flex flex-wrap gap-2 items-center border-t border-[#f0f0f0] pt-6">
                  <span className={`text-sm font-medium text-gray-500 ${locale === 'ar' ? 'ml-2' : 'mr-2'}`}>{t('breadcrumbs.tags')}</span>
                  {displayTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 rounded-full bg-blue-50/70 border border-blue-100/50 px-3 py-1 text-xs font-medium text-blue-600 transition-all hover:bg-blue-50 hover:border-blue-200"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              ) : null
            })()}

            <PostShareBar
              postId={post.id ?? ''}
              postUrl={postUrl}
              postTitle={title}
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

