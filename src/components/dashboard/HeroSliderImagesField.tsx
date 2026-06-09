'use client'

import { useState, useRef, useCallback, type ChangeEvent, type DragEvent } from 'react'
import {
  UploadCloud,
  Trash2,
  Image as ImageIcon,
  Loader2,
  Check,
  GripVertical,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  uploadImagesToCloudinary,
  fetchCloudinaryImages,
  type ImageResource,
} from '@/lib/cloudinary-client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

const MAX_SLIDES = 5

interface HeroSliderImagesFieldProps {
  slides: string[]
  onChange: (slides: string[]) => void
  disabled?: boolean
}

export function HeroSliderImagesField({
  slides,
  onChange,
  disabled = false,
}: HeroSliderImagesFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Cloudinary library picker
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [libraryImages, setLibraryImages] = useState<ImageResource[]>([])
  const [libNextCursor, setLibNextCursor] = useState<string | null>(null)
  const [isLibLoading, setIsLibLoading] = useState(false)
  const [selectedLibUrls, setSelectedLibUrls] = useState<Set<string>>(new Set())

  const remaining = MAX_SLIDES - slides.length
  const isFull = slides.length >= MAX_SLIDES

  // ── File upload ────────────────────────────────────────────────────────────

  async function processFiles(files: File[]) {
    const images = files.filter((f) => f.type.startsWith('image/'))
    if (!images.length) {
      toast.error('الرجاء اختيار ملفات صور صالحة فقط')
      return
    }
    if (images.length > remaining) {
      toast.error(`يمكنك إضافة ${remaining} صور فقط. الحد الأقصى ${MAX_SLIDES} صور.`)
      return
    }

    setIsUploading(true)
    const toastId = toast.loading(`جاري رفع ${images.length} صور...`)
    try {
      const result = await uploadImagesToCloudinary(images)
      if (result.uploaded.length > 0) {
        onChange([...slides, ...result.uploaded.map((r) => r.secure_url)])
        toast.success(`تم رفع ${result.uploaded.length} صور بنجاح!`, { id: toastId })
      }
      if (result.failed.length > 0) {
        toast.error(`فشل رفع ${result.failed.length} صور`)
      }
    } catch {
      toast.error('حدث خطأ أثناء الرفع', { id: toastId })
    } finally {
      setIsUploading(false)
    }
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files ? Array.from(e.target.files) : []
    if (files.length) processFiles(files)
    e.target.value = ''
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    if (!disabled && !isUploading) setIsDragging(true)
  }
  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
  }
  async function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    if (disabled || isUploading || isFull) return
    const files = e.dataTransfer.files ? Array.from(e.dataTransfer.files) : []
    if (files.length) processFiles(files)
  }

  // ── Cloudinary library ─────────────────────────────────────────────────────

  async function loadLibraryImages(cursor?: string) {
    setIsLibLoading(true)
    try {
      const result = await fetchCloudinaryImages(cursor)
      setLibraryImages((prev) => (cursor ? [...prev, ...result.images] : result.images))
      setLibNextCursor(result.nextCursor)
    } catch {
      toast.error('تعذّر تحميل مكتبة الصور')
    } finally {
      setIsLibLoading(false)
    }
  }

  const toggleLib = useCallback(
    (url: string) => {
      setSelectedLibUrls((prev) => {
        const next = new Set(prev)
        if (next.has(url)) {
          next.delete(url)
        } else {
          if (slides.length + next.size >= MAX_SLIDES) {
            toast.error(`الحد الأقصى للشريط الترحيبي هو ${MAX_SLIDES} صور`)
            return prev
          }
          next.add(url)
        }
        return next
      })
    },
    [slides.length],
  )

  function confirmLibrary() {
    if (!selectedLibUrls.size) return
    onChange([...slides, ...Array.from(selectedLibUrls)])
    setSelectedLibUrls(new Set())
    setIsPickerOpen(false)
    toast.success(`تمت إضافة ${selectedLibUrls.size} صور من المكتبة`)
  }

  // ── Slide management ───────────────────────────────────────────────────────

  function removeSlide(idx: number) {
    const next = slides.filter((_, i) => i !== idx)
    onChange(next)
  }

  function moveSlide(from: number, to: number) {
    if (to < 0 || to >= slides.length) return
    const next = [...slides]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    onChange(next)
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          الصور ستُعرض بالترتيب في الشريط الترحيبي للصفحة الرئيسية
        </span>
        <Badge variant="secondary" className="text-xs">
          {slides.length} / {MAX_SLIDES} صور
        </Badge>
      </div>

      {/* Slides grid */}
      {slides.length > 0 && (
        <div className="grid grid-cols-5 gap-3">
          {slides.map((url, idx) => (
            <div
              key={`${url}-${idx}`}
              className="relative group aspect-video rounded-xl overflow-hidden border-2 border-border bg-muted shadow-sm"
            >
              <img
                src={url}
                alt={`شريحة ${idx + 1}`}
                className="w-full h-full object-cover select-none"
                loading="lazy"
              />

              {/* Slide number badge */}
              <span className="absolute bottom-1 right-1 text-[10px] font-bold bg-black/60 text-white rounded px-1.5 py-0.5 leading-none">
                {idx + 1}
              </span>

              {/* Controls overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                {/* Move up (right in RTL = earlier) */}
                {idx > 0 && (
                  <button
                    type="button"
                    onClick={() => moveSlide(idx, idx - 1)}
                    title="تقديم"
                    className="p-1.5 rounded-lg bg-white/90 text-slate-700 hover:bg-white transition"
                  >
                    <GripVertical className="h-3.5 w-3.5 rotate-90" />
                  </button>
                )}
                {/* Move down */}
                {idx < slides.length - 1 && (
                  <button
                    type="button"
                    onClick={() => moveSlide(idx, idx + 1)}
                    title="تأخير"
                    className="p-1.5 rounded-lg bg-white/90 text-slate-700 hover:bg-white transition"
                  >
                    <GripVertical className="h-3.5 w-3.5 -rotate-90" />
                  </button>
                )}
                {/* Remove */}
                <button
                  type="button"
                  onClick={() => removeSlide(idx)}
                  disabled={disabled}
                  title="حذف الشريحة"
                  className="p-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}

          {/* Empty placeholder slots */}
          {Array.from({ length: MAX_SLIDES - slides.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="aspect-video rounded-xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-center"
            >
              <ImageIcon className="h-5 w-5 text-muted-foreground/40" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {slides.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed border-border bg-muted/20 text-center gap-2">
          <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">لا توجد صور بعد</p>
          <p className="text-xs text-muted-foreground/70">
            أضف حتى {MAX_SLIDES} صور لعرضها في الشريط الترحيبي
          </p>
          <p className="text-[11px] font-medium text-amber-600/80 dark:text-amber-400/80 mt-1">
            الأبعاد الموصى بها: 16:9 (ويتم تكييف الأبعاد الأخرى تلقائياً بمظهر احترافي)
          </p>
        </div>
      )}

      {/* Upload / pick buttons */}
      {!isFull && (
        <div className="flex flex-wrap gap-2">
          {/* Drag-drop / click upload zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
            className={cn(
              'flex flex-1 min-w-[180px] items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-all text-sm font-medium',
              isDragging
                ? 'border-primary bg-primary/5 scale-[1.01]'
                : 'border-border bg-muted/20 hover:bg-muted/40 hover:border-muted-foreground/40',
              (disabled || isUploading) && 'opacity-60 cursor-not-allowed pointer-events-none',
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              disabled={disabled || isUploading}
              onChange={handleFileChange}
              className="hidden"
            />
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-muted-foreground">جاري الرفع...</span>
              </>
            ) : (
              <>
                <UploadCloud className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">رفع صورة ({remaining} متبقية)</span>
              </>
            )}
          </div>

          {/* Library picker */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 h-auto py-3"
            disabled={disabled || isUploading}
            onClick={() => {
              setIsPickerOpen(true)
              loadLibraryImages()
            }}
          >
            <ImageIcon className="h-4 w-4" />
            اختيار من المكتبة
          </Button>
        </div>
      )}

      {isFull && (
        <p className="text-xs text-center text-muted-foreground py-1">
          وصلت للحد الأقصى ({MAX_SLIDES} صور). احذف صورة لإضافة أخرى.
        </p>
      )}

      {/* Cloudinary Library Dialog */}
      <Dialog
        open={isPickerOpen}
        onOpenChange={(open) => {
          setIsPickerOpen(open)
          if (!open) setSelectedLibUrls(new Set())
        }}
      >
        <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col p-6 overflow-hidden">
          <DialogHeader className="text-right">
            <DialogTitle>اختيار صور من مكتبة الصور</DialogTitle>
            <DialogDescription>
              حدد الصور التي تريد إضافتها للشريط الترحيبي ({slides.length} / {MAX_SLIDES})
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto my-4 min-h-[300px] border rounded-xl bg-muted/20 p-4">
            {libraryImages.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {libraryImages.map((img) => {
                  const selected = selectedLibUrls.has(img.secure_url)
                  const alreadyAdded = slides.includes(img.secure_url)
                  return (
                    <button
                      key={img.public_id}
                      type="button"
                      disabled={alreadyAdded}
                      onClick={() => toggleLib(img.secure_url)}
                      className={cn(
                        'relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200',
                        alreadyAdded
                          ? 'opacity-40 border-border cursor-not-allowed'
                          : selected
                            ? 'border-primary ring-2 ring-primary/20 scale-[1.01]'
                            : 'border-border hover:border-muted-foreground hover:scale-[1.01]',
                      )}
                    >
                      <img
                        src={img.secure_url}
                        alt={img.public_id}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {selected && (
                        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                          <div className="bg-primary text-primary-foreground rounded-full p-1 border border-white shadow">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </div>
                        </div>
                      )}
                      {alreadyAdded && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="text-[10px] bg-black/70 text-white px-1.5 py-0.5 rounded font-medium">
                            مضاف
                          </span>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            ) : isLibLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">جاري تحميل الصور...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 gap-2">
                <ImageIcon className="h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">لا توجد صور في المكتبة</p>
              </div>
            )}

            {libNextCursor && (
              <div className="mt-4 flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => loadLibraryImages(libNextCursor)}
                  disabled={isLibLoading}
                  className="gap-1.5 text-xs"
                >
                  {isLibLoading ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      جاري التحميل...
                    </>
                  ) : (
                    'عرض المزيد'
                  )}
                </Button>
              </div>
            )}
          </div>

          <DialogFooter className="flex-row-reverse sm:justify-start gap-2 border-t pt-4">
            <Button
              type="button"
              disabled={selectedLibUrls.size === 0}
              onClick={confirmLibrary}
            >
              إضافة المحدد ({selectedLibUrls.size})
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsPickerOpen(false)
                setSelectedLibUrls(new Set())
              }}
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
