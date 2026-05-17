'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import {
  Check,
  CloudUpload,
  ImageIcon,
  Loader2,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  fetchCloudinaryImages,
  uploadImagesToCloudinary,
  deleteImagesFromCloudinary,
  formatFileSize,
  type ImageResource,
} from '@/lib/cloudinary-client'
import { DeleteGalleryImagesDialog } from './DeleteGalleryImagesDialog'

const MAX_BATCH = 10
const MAX_FILE_BYTES = 5 * 1024 * 1024
const MAX_SELECT = 10

interface GalleryImageCardProps {
  image: ImageResource
  selected: boolean
  onToggle: (publicId: string) => void
}

function GalleryImageCard({ image, selected, onToggle }: GalleryImageCardProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(image.public_id)}
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-white text-start shadow-sm transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--fcps-primary) focus-visible:ring-offset-2',
        selected
          ? 'border-(--fcps-primary) ring-2 ring-(--fcps-primary)/30'
          : 'border-border/60 hover:border-(--fcps-primary)/40 hover:shadow-md'
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-(--fcps-gray-light)">
        <Image
          src={image.secure_url}
          alt={image.public_id}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <Badge variant="secondary" className="bg-white/90 text-xs uppercase backdrop-blur-sm">
            {image.format}
          </Badge>
          <span className="text-xs font-medium text-white drop-shadow-sm">
            {formatFileSize(image.bytes)}
          </span>
        </div>

        <div
          className={cn(
            'absolute top-2 end-2 flex size-7 items-center justify-center rounded-full border-2 transition-all',
            selected
              ? 'border-(--fcps-primary) bg-(--fcps-primary) text-white'
              : 'border-white/80 bg-black/30 text-transparent group-hover:border-white group-hover:bg-white/20'
          )}
        >
          {selected ? <Check className="size-4" strokeWidth={3} /> : null}
        </div>
      </div>
    </button>
  )
}

interface GalleryManagerProps {
  initialImages?: ImageResource[]
  initialNextCursor?: string | null
}

export function GalleryManager({
  initialImages = [],
  initialNextCursor = null,
}: GalleryManagerProps) {
  const [images, setImages] = useState<ImageResource[]>(initialImages)
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor)
  const [loadingMore, setLoadingMore] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [stagedFiles, setStagedFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleLoadMore = async () => {
    if (!nextCursor || loadingMore) return
    try {
      setLoadingMore(true)
      const result = await fetchCloudinaryImages(nextCursor)
      setImages((prev) => [...prev, ...result.images])
      setNextCursor(result.nextCursor)
    } catch (e) {
      console.error(e)
      toast.error('تعذّر تحميل المزيد من الصور')
    } finally {
      setLoadingMore(false)
    }
  }

  const toggleSelection = (publicId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(publicId)) {
        next.delete(publicId)
        return next
      }
      if (next.size >= MAX_SELECT) {
        toast.error(`يمكنك تحديد ${MAX_SELECT} صور كحد أقصى للحذف`)
        return prev
      }
      next.add(publicId)
      return next
    })
  }

  const clearSelection = () => setSelectedIds(new Set())

  const validateAndStageFiles = (incoming: FileList | File[]) => {
    const list = Array.from(incoming).filter((f) => f.type.startsWith('image/'))
    if (list.length === 0) {
      toast.error('يرجى اختيار ملفات صور فقط')
      return
    }

    const combined = [...stagedFiles, ...list]
    if (combined.length > MAX_BATCH) {
      toast.error(`الحد الأقصى ${MAX_BATCH} ملفات في كل دفعة رفع`)
      return
    }

    const oversized = list.filter((f) => f.size > MAX_FILE_BYTES)
    if (oversized.length > 0) {
      toast.error(`حجم الملف يتجاوز 5 م.ب: ${oversized.map((f) => f.name).join('، ')}`)
      return
    }

    setStagedFiles(combined)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files?.length) validateAndStageFiles(e.dataTransfer.files)
  }

  const removeStagedFile = (index: number) => {
    setStagedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (stagedFiles.length === 0) return
    try {
      setUploading(true)
      const result = await uploadImagesToCloudinary(stagedFiles)
      const uploaded = result.uploaded as ImageResource[]

      if (uploaded.length > 0) {
        setImages((prev) => [...uploaded, ...prev])
        toast.success(`تم رفع ${uploaded.length} صورة`)
      }
      if (result.failed.length > 0) {
        toast.error(`فشل رفع ${result.failed.length} صورة`)
      }
      if (uploaded.length === 0 && result.failed.length === 0) {
        toast.error('لم يتم رفع أي صورة')
      }
      setStagedFiles([])
    } catch (e) {
      console.error(e)
      toast.error('حدث خطأ أثناء الرفع')
    } finally {
      setUploading(false)
    }
  }

  const handleConfirmDelete = async () => {
    const publicIds = Array.from(selectedIds)
    if (publicIds.length === 0) return

    try {
      setDeleting(true)
      const result = await deleteImagesFromCloudinary(publicIds)

      if (result.deleted.length > 0) {
        setImages((prev) => prev.filter((img) => !result.deleted.includes(img.public_id)))
        toast.success(`تم حذف ${result.deleted.length} صورة`)
      }
      if (result.failed.length > 0) {
        toast.error(`فشل حذف ${result.failed.length} صورة`)
      }

      clearSelection()
      setDeleteDialogOpen(false)
    } catch (e) {
      console.error(e)
      toast.error('حدث خطأ أثناء الحذف')
    } finally {
      setDeleting(false)
    }
  }

  const selectedCount = selectedIds.size
  const hasSelection = selectedCount > 0
  const showEmpty = images.length === 0

  return (
    <div className="space-y-8">
      {hasSelection ? (
        <div className="sticky top-[4.5rem] z-30 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-(--fcps-primary)/20 bg-white px-4 py-3 shadow-md">
          <p className="text-sm font-medium text-(--fcps-dark)">
            تم تحديد <span className="font-bold text-(--fcps-primary)">{selectedCount}</span> من{' '}
            {MAX_SELECT} صور
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={clearSelection}>
              إلغاء التحديد
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="size-4" />
              حذف المحدد
            </Button>
          </div>
        </div>
      ) : null}

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="mb-1 text-base font-bold text-(--fcps-dark)">رفع صور جديدة</h3>
        <p className="mb-4 text-sm text-(--fcps-gray-text)">
          اسحب الصور هنا أو اخترها من جهازك. الحد: {MAX_BATCH} ملفات، 5 م.ب لكل ملف.
        </p>

        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click()
          }}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 transition-colors',
            isDragging
              ? 'border-(--fcps-primary) bg-(--fcps-primary)/5'
              : 'border-(--fcps-primary)/25 bg-(--fcps-bg-soft) hover:border-(--fcps-primary)/50 hover:bg-(--fcps-primary)/5'
          )}
        >
          <div className="flex size-14 items-center justify-center rounded-full bg-(--fcps-primary)/10 text-(--fcps-primary)">
            <CloudUpload className="size-7" />
          </div>
          <div className="text-center">
            <p className="font-medium text-(--fcps-dark)">اسحب الصور وأفلتها هنا</p>
            <p className="mt-1 text-sm text-(--fcps-gray-text)">أو انقر لاختيار الملفات</p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) validateAndStageFiles(e.target.files)
            e.target.value = ''
          }}
        />

        {stagedFiles.length > 0 ? (
          <ul className="mt-5 space-y-2">
            {stagedFiles.map((file, index) => (
              <li
                key={`${file.name}-${file.size}-${index}`}
                className="flex items-center justify-between gap-3 rounded-lg border bg-(--fcps-bg-soft) px-3 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-(--fcps-dark)">{file.name}</p>
                  <p className="text-xs text-(--fcps-gray-text)">{formatFileSize(file.size)}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeStagedFile(index)
                  }}
                  aria-label="إزالة الملف"
                >
                  <X className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        ) : null}

        {stagedFiles.length > 0 ? (
          <Button
            type="button"
            className="mt-4 bg-(--fcps-primary) text-white hover:bg-(--fcps-primary)/90"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
            رفع {stagedFiles.length} {stagedFiles.length === 1 ? 'صورة' : 'صور'}
          </Button>
        ) : null}
      </section>

      <section>
        <h3 className="mb-4 text-base font-bold text-(--fcps-dark)">مكتبة الصور</h3>

        {showEmpty ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-white px-6 py-16 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-(--fcps-primary)/10 text-(--fcps-primary)">
              <ImageIcon className="size-8" />
            </div>
            <p className="text-lg font-semibold text-(--fcps-dark)">لا توجد صور بعد</p>
            <p className="mt-2 max-w-sm text-sm text-(--fcps-gray-text)">
              ارفع صوراً جديدة من القسم أعلاه لإضافتها إلى المعرض.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {images.map((image) => (
                <GalleryImageCard
                  key={image.public_id}
                  image={image}
                  selected={selectedIds.has(image.public_id)}
                  onToggle={toggleSelection}
                />
              ))}
            </div>

            {nextCursor ? (
              <div className="mt-8 flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="min-w-[10rem]"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      جاري التحميل...
                    </>
                  ) : (
                    'عرض المزيد'
                  )}
                </Button>
              </div>
            ) : null}
          </>
        )}
      </section>

      <DeleteGalleryImagesDialog
        open={deleteDialogOpen}
        count={selectedCount}
        pending={deleting}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
