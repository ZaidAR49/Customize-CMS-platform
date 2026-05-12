'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface UserAvatarPickerProps {
  /** Shown image: new file preview (blob URL) or existing `avatarUrl` */
  displaySrc: string | null
  fallbackLetter: string
  /** `true` when `displaySrc` is a blob: Next/Image needs `unoptimized` */
  isBlobPreview: boolean
  disabled: boolean
  onFileSelected: (file: File | null) => void
  /** Hint under the picker (e.g. save vs add flow) */
  footerHint?: string
}

const DEFAULT_FOOTER_HINT =
  'اضغط أيقونة الكاميرا لاختيار صورة جديدة (حتى 4 ميغابايت). احفظ التعديلات لتطبيقها.'

export function UserAvatarPicker({
  displaySrc,
  fallbackLetter,
  isBlobPreview,
  disabled,
  onFileSelected,
  footerHint = DEFAULT_FOOTER_HINT,
}: UserAvatarPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-sm font-medium text-(--fcps-dark)">صورة الملف الشخصي</p>
      <div className="relative inline-flex">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          tabIndex={-1}
          disabled={disabled}
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null
            onFileSelected(f)
            e.target.value = ''
          }}
        />
        <div className="relative h-24 w-24 overflow-hidden rounded-full ring-2 ring-(--fcps-bg-soft) shadow-sm">
          {displaySrc ? (
            <Image
              src={displaySrc}
              alt=""
              width={96}
              height={96}
              className="size-full object-cover"
              unoptimized={isBlobPreview}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-(--fcps-primary) text-2xl font-bold text-white">
              {fallbackLetter || '?'}
            </div>
          )}
        </div>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="absolute bottom-1 end-1 z-10 h-9 w-9 rounded-full border-2 border-white bg-white text-(--fcps-primary) shadow-md hover:bg-(--fcps-bg-soft)"
          disabled={disabled}
          aria-label="تغيير صورة الملف الشخصي"
          title="تغيير الصورة"
          onClick={() => inputRef.current?.click()}
        >
          <Camera className="h-4 w-4" />
        </Button>
      </div>
      <p className="max-w-xs text-center text-xs text-(--fcps-gray-text)">{footerHint}</p>
    </div>
  )
}
