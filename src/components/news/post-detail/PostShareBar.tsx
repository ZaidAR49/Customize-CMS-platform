'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { FaFacebookF, FaLinkedinIn, FaInstagram, FaXTwitter } from 'react-icons/fa6'
import { formatSiteNumber } from '@/lib/date-format'
import { useTranslations } from 'next-intl'
import posthog from 'posthog-js'

interface PostShareBarProps {
  postId: string
  postUrl: string
  postTitle: string
  initialLikes: number
}

export function PostShareBar({ postId, postUrl, postTitle, initialLikes }: PostShareBarProps) {
  const [likes, setLikes] = useState(initialLikes)
  const [liked, setLiked] = useState(false)
  const [pending, setPending] = useState(false)
  const t = useTranslations('newsPage')

  const encodedUrl = encodeURIComponent(postUrl)
  const encodedTitle = encodeURIComponent(postTitle)

  const shareLinks = [
    {
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: FaFacebookF,
    },
    {
      label: 'X',
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      icon: FaXTwitter,
    },
    {
      label: 'LinkedIn',
      href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}`,
      icon: FaLinkedinIn,
    },
    {
      label: 'Instagram',
      href: `https://instagram.com/pin/find/?url=${encodedUrl}`,
      icon: FaInstagram,
    },
  ]

  async function handleLike() {
    if (liked || pending || !postId) return
    setPending(true)
    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: 'POST' })
      const data = (await res.json()) as { likes?: number }
      if (res.ok) {
        setLikes((n) => (typeof data.likes === 'number' ? data.likes : n + 1))
        setLiked(true)
        posthog.capture('post_liked', {
          post_id: postId,
          post_title: postTitle,
          total_likes: typeof data.likes === 'number' ? data.likes : likes + 1,
        })
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-y border-[#e0e0e0] py-5">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-(--fcps-gray-text)">{t('share')}</span>
        <div className="flex items-center gap-2">
          {shareLinks.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-[#e0e0e0] bg-white text-[#0073aa] transition-colors hover:border-[#0073aa] hover:bg-[#f0f7fb]"
              aria-label={label}
            >
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={handleLike}
        disabled={liked || pending}
        className="flex items-center gap-2 text-sm text-[#0073aa] transition-colors hover:text-[#005580] disabled:opacity-60"
        aria-label={t('like')}
      >
        <Heart className={`h-5 w-5 ${liked ? 'fill-red-500 text-red-500' : 'text-red-400'}`} />
        <span className="font-medium tabular-nums">{formatSiteNumber(likes)}</span>
      </button>
    </div>
  )
}
