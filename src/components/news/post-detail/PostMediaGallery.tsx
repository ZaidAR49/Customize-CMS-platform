'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { ZoomIn } from 'lucide-react'
import { ImageLightbox } from './ImageLightbox'

interface PostMediaGalleryProps {
  coverImage?: string
  gallery?: string[]
  title: string
}

export function PostMediaGallery({ coverImage, gallery = [], title }: PostMediaGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const hasCover = Boolean(coverImage?.trim())

  const allImages = useMemo(() => {
    const urls: string[] = []
    if (hasCover) urls.push(coverImage!.trim())
    for (const url of gallery) {
      const trimmed = url.trim()
      if (trimmed && !urls.includes(trimmed)) urls.push(trimmed)
    }
    return urls
  }, [coverImage, gallery, hasCover])

  const heroImage = hasCover ? coverImage!.trim() : gallery[0]?.trim()
  const gridImages = hasCover ? gallery : gallery.slice(1)

  function openLightbox(index: number) {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  if (!heroImage && gridImages.length === 0) {
    return (
      <div className="mb-8 flex h-64 items-center justify-center rounded-lg bg-(--fcps-bg-soft) text-5xl opacity-30 md:h-96">
        📰
      </div>
    )
  }

  return (
    <>
      {heroImage && (
        <button
          type="button"
          onClick={() => openLightbox(0)}
          className="group relative mb-8 block w-full cursor-zoom-in overflow-hidden rounded-lg shadow-md"
          aria-label="عرض الصورة بحجم كامل"
        >
          <div className="relative aspect-[3/2] w-full bg-(--fcps-bg-soft)">
            <Image
              src={heroImage}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              sizes="(max-width: 1024px) 100vw, 70vw"
              priority
            />
            <span className="absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100">
              <ZoomIn className="h-4 w-4" />
            </span>
          </div>
        </button>
      )}

      {gridImages.length > 0 && (
        <div className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {gridImages.map((src, idx) => {
            const lightboxIdx = heroImage ? idx + 1 : idx
            return (
              <button
                key={`${src}-${idx}`}
                type="button"
                onClick={() => openLightbox(lightboxIdx)}
                className="group relative aspect-[4/3] cursor-zoom-in overflow-hidden rounded-md bg-(--fcps-bg-soft)"
                aria-label={`صورة ${idx + 1}`}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <span className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/25" />
                <span className="absolute bottom-2 left-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <ZoomIn className="h-3.5 w-3.5" />
                </span>
              </button>
            )
          })}
        </div>
      )}

      <ImageLightbox
        images={allImages}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  )
}
