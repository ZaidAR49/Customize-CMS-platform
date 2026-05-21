'use client'

import { useState, useRef, DragEvent, ChangeEvent } from 'react'
import { UploadCloud, Trash2, Star, Image as ImageIcon, Plus, Loader2, Link as LinkIcon, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { uploadImagesToCloudinary, fetchCloudinaryImages, type ImageResource } from '@/lib/cloudinary-client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { PostFormValue } from '@/lib/posts-form'

interface PostImageGalleryProps {
  coverImage: string
  gallery: string[]
  onChange: <K extends keyof PostFormValue>(key: K, next: PostFormValue[K]) => void
  disabled?: boolean
}

export function PostImageGallery({
  coverImage,
  gallery,
  onChange,
  disabled = false,
}: PostImageGalleryProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [externalUrl, setExternalUrl] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const maxImages = 20
  const remainingSlots = maxImages - gallery.length

  // Cloudinary Library Picker States
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [libraryImages, setLibraryImages] = useState<ImageResource[]>([])
  const [libNextCursor, setLibNextCursor] = useState<string | null>(null)
  const [isLibLoading, setIsLibLoading] = useState(false)
  const [selectedLibUrls, setSelectedLibUrls] = useState<Set<string>>(new Set())

  // Trigger file selection dialog
  function handleButtonClick() {
    if (disabled || isUploading) return
    fileInputRef.current?.click()
  }

  // Handle file selection
  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files ? Array.from(e.target.files) : []
    if (files.length === 0) return
    await processAndUploadFiles(files)
    // Clear input
    e.target.value = ''
  }

  // Handle drag events
  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    if (disabled || isUploading) return
    setIsDragging(true)
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
  }

  async function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    if (disabled || isUploading) return

    const files = e.dataTransfer.files ? Array.from(e.dataTransfer.files) : []
    if (files.length === 0) return
    await processAndUploadFiles(files)
  }

  // Shared file validation and upload process
  async function processAndUploadFiles(files: File[]) {
    // 1. Filter only image files
    const imageFiles = files.filter((file) => file.type.startsWith('image/'))
    if (imageFiles.length === 0) {
      toast.error('الرجاء اختيار ملفات صور صالحة فقط')
      return
    }

    // 2. Validate max count
    if (imageFiles.length > remainingSlots) {
      toast.error(`لا يمكنك رفع أكثر من ${remainingSlots} صور إضافية. الحد الأقصى للمقال هو ${maxImages} صور.`)
      return
    }

    setIsUploading(true)
    const uploadToastId = toast.loading(`جاري رفع ${imageFiles.length} صور إلى الخادم...`)

    try {
      const result = await uploadImagesToCloudinary(imageFiles)

      if (result.uploaded.length > 0) {
        const uploadedUrls = result.uploaded.map((res) => res.secure_url)
        const nextGallery = [...gallery, ...uploadedUrls]
        
        // Update gallery state
        onChange('gallery', nextGallery)

        // Automatically set first uploaded image as cover if none exists
        if (!coverImage && uploadedUrls.length > 0) {
          onChange('cover_image', uploadedUrls[0])
        }

        toast.success(`تم رفع ${result.uploaded.length} صور بنجاح!`, { id: uploadToastId })
      }

      if (result.failed.length > 0) {
        toast.error(`فشل رفع ${result.failed.length} صور. الرجاء المحاولة لاحقاً.`)
      }
    } catch (error) {
      console.error('Failed to upload files:', error)
      toast.error('حدث خطأ غير متوقع أثناء الرفع', { id: uploadToastId })
    } finally {
      setIsUploading(false)
    }
  }

  // Load images from Cloudinary library
  async function loadLibraryImages(cursor?: string) {
    setIsLibLoading(true)
    try {
      const result = await fetchCloudinaryImages(cursor)
      if (cursor) {
        setLibraryImages((prev) => [...prev, ...result.images])
      } else {
        setLibraryImages(result.images)
      }
      setLibNextCursor(result.nextCursor)
    } catch (e) {
      console.error(e)
      toast.error('تعذّر تحميل مكتبة الصور من Cloudinary')
    } finally {
      setIsLibLoading(false)
    }
  }

  // Toggle selection inside library picker
  function toggleLibSelection(url: string) {
    setSelectedLibUrls((prev) => {
      const next = new Set(prev)
      if (next.has(url)) {
        next.delete(url)
      } else {
        // Check total size
        if (gallery.length + next.size >= maxImages) {
          toast.error(`لا يمكنك تحديد المزيد من الصور. الحد الأقصى للمقال هو ${maxImages} صور.`)
          return prev
        }
        next.add(url)
      }
      return next
    })
  }

  // Add all selected library images to post gallery
  function handleConfirmLibrarySelection() {
    if (selectedLibUrls.size === 0) return

    const newUrls = Array.from(selectedLibUrls)
    const nextGallery = [...gallery, ...newUrls]
    onChange('gallery', nextGallery)

    if (!coverImage && newUrls.length > 0) {
      onChange('cover_image', newUrls[0])
    }

    setSelectedLibUrls(new Set())
    setIsPickerOpen(false)
    toast.success(`تمت إضافة ${newUrls.length} صور من المكتبة!`)
  }

  // Set an image as the cover
  function handleSetCover(url: string) {
    if (disabled) return
    onChange('cover_image', url)
    toast.success('تم تحديد الصورة كصورة رئيسية للمقال')
  }

  // Remove an image from gallery
  function handleRemoveImage(url: string) {
    if (disabled) return
    const nextGallery = gallery.filter((item) => item !== url)
    onChange('gallery', nextGallery)

    // If the removed image was the cover, clear it or fall back
    if (coverImage === url) {
      const fallbackCover = nextGallery.length > 0 ? nextGallery[0] : ''
      onChange('cover_image', fallbackCover)
    }
    toast.success('تم حذف الصورة من المعرض')
  }

  // Add image from external URL
  function handleAddExternalUrl() {
    if (disabled || !externalUrl.trim()) return

    // Simple URL validation
    if (!externalUrl.startsWith('http://') && !externalUrl.startsWith('https://')) {
      toast.error('الرجاء إدخال رابط صالح يبدأ بـ http:// أو https://')
      return
    }

    if (gallery.length >= maxImages) {
      toast.error(`لقد وصلت للحد الأقصى المسموح به وهو ${maxImages} صورة.`)
      return
    }

    const nextGallery = [...gallery, externalUrl.trim()]
    onChange('gallery', nextGallery)

    if (!coverImage) {
      onChange('cover_image', externalUrl.trim())
    }

    setExternalUrl('')
    toast.success('تمت إضافة الصورة بنجاح!')
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
        className={cn(
          "relative flex flex-col items-center justify-center min-h-[160px] p-6 border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer bg-slate-50/50 hover:bg-slate-50",
          isDragging
            ? "border-blue-500 bg-blue-50/30 scale-[1.01] ring-4 ring-blue-500/10"
            : "border-slate-200 hover:border-slate-300",
          (disabled || isUploading) && "opacity-60 cursor-not-allowed pointer-events-none"
        )}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          multiple
          disabled={disabled || isUploading}
          className="hidden"
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-3 animate-pulse">
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            <p className="text-sm font-medium text-slate-600">جاري رفع ومعالجة الصور...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center gap-2">
            <div className="p-3 bg-white rounded-full shadow-sm border border-slate-100 text-slate-400 group-hover:text-blue-500 transition-colors">
              <UploadCloud className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-sm font-semibold text-slate-700">
              اسحب الصور وأفلتها هنا، أو اضغط للتصفح
            </p>
            <p className="text-xs text-slate-400">
              يدعم ملفات JPG، PNG، WEBP (بحد أقصى {remainingSlots} صور متبقية)
            </p>
          </div>
        )}
      </div>

      {/* External URL Bar */}
      <div className="flex gap-2 items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative flex-1">
          <LinkIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            placeholder="أو أضف رابط صورة مباشر من الإنترنت..."
            className="pr-9 pl-3 text-slate-700 placeholder:text-slate-400 focus-visible:ring-blue-500"
            disabled={disabled || isUploading || gallery.length >= maxImages}
            dir="ltr"
          />
        </div>
        <Button
          type="button"
          onClick={handleAddExternalUrl}
          disabled={disabled || isUploading || !externalUrl.trim() || gallery.length >= maxImages}
          className="bg-blue-600 hover:bg-blue-700 text-white shrink-0"
        >
          <Plus className="h-4 w-4 ml-1" />
          إضافة
        </Button>
      </div>

      {/* Gallery Header */}
      <div className="flex justify-between items-center px-1">
        <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
          <ImageIcon className="h-4 w-4 text-slate-500" />
          معرض الصور للمقال
        </span>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setIsPickerOpen(true)
              loadLibraryImages()
            }}
            disabled={disabled || isUploading}
            className="h-8 border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs gap-1.5"
          >
            <ImageIcon className="h-3.5 w-3.5 text-blue-500" />
            اختيار من مكتبة Cloudinary
          </Button>
          <Badge variant="secondary" className="bg-slate-100 text-slate-600 border border-slate-200 py-1 text-xs">
            {gallery.length} / {maxImages} صورة
          </Badge>
        </div>
      </div>

      {/* Image Grid */}
      {gallery.length > 0 ? (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
          {gallery.map((url, idx) => {
            const isCover = coverImage === url
            return (
              <div
                key={`${url}-${idx}`}
                className={cn(
                  "relative group aspect-square rounded-xl overflow-hidden bg-slate-50 border-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm",
                  isCover
                    ? "border-blue-500 shadow-sm ring-2 ring-blue-500/10 scale-[1.02]"
                    : "border-slate-100 hover:border-slate-300"
                )}
              >
                {/* Image */}
                <img
                  src={url}
                  alt={`Post image ${idx + 1}`}
                  className="w-full h-full object-cover select-none"
                  loading="lazy"
                />

                {/* Fixed Star/Cover Button */}
                <button
                  type="button"
                  onClick={() => handleSetCover(url)}
                  disabled={disabled}
                  title={isCover ? "الصورة الرئيسية" : "تعيين كصورة رئيسية"}
                  className={cn(
                    "absolute top-1 right-1 p-1 rounded-full border shadow-sm transition-all duration-200 z-10",
                    isCover
                      ? "bg-yellow-400 border-yellow-300 text-white scale-105 shadow-yellow-100"
                      : "bg-white/95 border-slate-100 text-slate-400 hover:text-yellow-500 hover:scale-105 hover:bg-white"
                  )}
                >
                  <Star className={cn("h-3 w-3", isCover && "fill-white")} />
                </button>

                {/* Fixed Trash/Delete Button (Visible on Hover/Focus) */}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(url)}
                  disabled={disabled}
                  title="حذف الصورة"
                  className="absolute top-1 left-1 p-1 rounded-full border bg-white/95 border-slate-100 text-slate-400 hover:text-red-500 hover:bg-white hover:scale-105 shadow-sm transition-all duration-200 z-10 opacity-0 group-hover:opacity-100 focus:opacity-100"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-center gap-2">
          <ImageIcon className="h-8 w-8 text-slate-300" />
          <p className="text-sm font-medium text-slate-500">لا توجد صور في المعرض بعد</p>
          <p className="text-xs text-slate-400">قم برفع الصور أو إضافة روابط للبدء</p>
        </div>
      )}

      {/* Cloudinary Media Library Dialog */}
      <Dialog open={isPickerOpen} onOpenChange={(open) => {
        setIsPickerOpen(open)
        if (!open) setSelectedLibUrls(new Set())
      }}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col p-6 overflow-hidden bg-white rounded-2xl shadow-xl border border-slate-100 animate-in fade-in-0 duration-200">
          <DialogHeader className="text-right">
            <DialogTitle className="text-lg font-bold text-slate-800">
              مكتبة صور Cloudinary
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500 mt-1">
              اختر الصور التي ترغب في إضافتها إلى المقال الحالي. يمكنك تحديد عدة صور. (الصور الحالية: {gallery.length} / {maxImages})
            </DialogDescription>
          </DialogHeader>

          {/* Library Images Grid */}
          <div className="flex-1 overflow-y-auto my-4 pr-1 pl-1 min-h-[300px] border rounded-xl bg-slate-50/50 p-4">
            {libraryImages.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {libraryImages.map((image) => {
                  const isSelected = selectedLibUrls.has(image.secure_url)
                  const isAlreadyInGallery = gallery.includes(image.secure_url)
                  return (
                    <button
                      key={image.public_id}
                      type="button"
                      disabled={isAlreadyInGallery}
                      onClick={() => toggleLibSelection(image.secure_url)}
                      className={cn(
                        "relative aspect-square rounded-xl overflow-hidden bg-white border-2 transition-all duration-200 select-none",
                        isAlreadyInGallery
                          ? "opacity-40 border-slate-200 cursor-not-allowed"
                          : isSelected
                            ? "border-blue-500 ring-2 ring-blue-500/10 scale-[1.01] shadow-sm"
                            : "border-slate-200 hover:border-slate-300 hover:scale-[1.01]"
                      )}
                    >
                      <img
                        src={image.secure_url}
                        alt={image.public_id}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />

                      {/* Selection Overlay or Badge */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center">
                          <div className="bg-blue-500 text-white rounded-full p-1 border border-white shadow-md">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </div>
                        </div>
                      )}

                      {isAlreadyInGallery && (
                        <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                          <span className="text-[10px] bg-slate-800 text-white px-1.5 py-0.5 rounded-md font-medium border border-slate-700">
                            مضاف مسبقاً
                          </span>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            ) : isLibLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                <p className="text-sm font-medium text-slate-500">جاري تحميل الصور من Cloudinary...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
                <ImageIcon className="h-10 w-10 text-slate-300" />
                <p className="text-sm font-medium text-slate-500">لا توجد صور في مكتبة Cloudinary</p>
              </div>
            )}

            {/* Load More Library Images */}
            {libNextCursor && (
              <div className="mt-6 flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => loadLibraryImages(libNextCursor)}
                  disabled={isLibLoading}
                  className="px-6 h-8 text-xs border-slate-200 hover:bg-slate-50 font-semibold gap-1.5"
                >
                  {isLibLoading ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      جاري التحميل...
                    </>
                  ) : (
                    'عرض المزيد من الصور'
                  )}
                </Button>
              </div>
            )}
          </div>

          <DialogFooter className="flex-row-reverse sm:justify-start gap-2 border-t pt-4">
            <Button
              type="button"
              onClick={handleConfirmLibrarySelection}
              disabled={selectedLibUrls.size === 0 || disabled}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              إضافة الصور المحددة ({selectedLibUrls.size})
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsPickerOpen(false)
                setSelectedLibUrls(new Set())
              }}
              disabled={disabled}
              className="border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold"
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
