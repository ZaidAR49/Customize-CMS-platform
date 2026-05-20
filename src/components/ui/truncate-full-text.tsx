'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TruncateFullTextPopupProps {
  text: string
  className?: string
  /** Dialog header (Arabic UI labels ok). */
  dialogTitle?: string
  /** Optional footer; receives `close` to dismiss the dialog (e.g. before navigating). */
  renderDialogFooter?: (close: () => void) => ReactNode
}

export function TruncateFullTextPopup({
  text,
  className,
  dialogTitle = 'النص الكامل',
  renderDialogFooter,
}: TruncateFullTextPopupProps) {
  const [mounted, setMounted] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [hoverOpen, setHoverOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 320 })
  const wrapRef = useRef<HTMLDivElement>(null)
  const hoverOpenTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const hoverCloseTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (dialogOpen) setHoverOpen(false)
  }, [dialogOpen])

  const updatePosition = useCallback(() => {
    const el = wrapRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const panelW = Math.min(420, Math.max(r.width, 280))
    let left = r.left
    if (left + panelW > window.innerWidth - 16) {
      left = window.innerWidth - panelW - 16
    }
    if (left < 16) left = 16
    setCoords({
      top: r.bottom + 8,
      left,
      width: panelW,
    })
  }, [])

  useEffect(() => {
    if (!hoverOpen) return
    updatePosition()
    const onMove = () => updatePosition()
    window.addEventListener('scroll', onMove, true)
    window.addEventListener('resize', onMove)
    return () => {
      window.removeEventListener('scroll', onMove, true)
      window.removeEventListener('resize', onMove)
    }
  }, [hoverOpen, updatePosition])

  useEffect(
    () => () => {
      clearTimeout(hoverOpenTimerRef.current)
      clearTimeout(hoverCloseTimerRef.current)
    },
    []
  )

  function openHoverSoon() {
    clearTimeout(hoverCloseTimerRef.current)
    hoverOpenTimerRef.current = setTimeout(() => {
      updatePosition()
      setHoverOpen(true)
    }, 280)
  }

  function scheduleHoverClose() {
    clearTimeout(hoverOpenTimerRef.current)
    hoverCloseTimerRef.current = setTimeout(() => setHoverOpen(false), 180)
  }

  function cancelHoverClose() {
    clearTimeout(hoverCloseTimerRef.current)
  }

  if (!text) {
    return <span className={className}>—</span>
  }

  return (
    <>
      <div
        ref={wrapRef}
        className="min-w-0 outline-none"
        onMouseEnter={openHoverSoon}
        onMouseLeave={scheduleHoverClose}
        onClick={(e) => {
          e.stopPropagation()
          setDialogOpen(true)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setDialogOpen(true)
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={dialogTitle}
      >
        <span
          className={cn(
            'line-clamp-2 max-w-full cursor-pointer wrap-break-word underline-offset-2 hover:underline',
            className
          )}
        >
          {text}
        </span>
      </div>

      {mounted && hoverOpen
        ? createPortal(
            <div
              className="fixed z-[100] max-h-[min(24rem,calc(100vh-2rem))] overflow-y-auto rounded-lg border bg-popover p-3 text-sm text-popover-foreground shadow-lg ring-1 ring-foreground/10 wrap-break-word"
              style={{
                top: coords.top,
                left: coords.left,
                width: coords.width,
              }}
              dir="auto"
              onMouseEnter={cancelHoverClose}
              onMouseLeave={scheduleHoverClose}
            >
              {text}
            </div>,
            document.body
          )
        : null}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg" dir="auto" showCloseButton>
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[min(70vh,28rem)] overflow-y-auto whitespace-pre-wrap wrap-break-word text-sm">
            {text}
          </div>
          <DialogFooter className="flex-wrap gap-2 sm:justify-start">
            {renderDialogFooter ? (
              renderDialogFooter(() => setDialogOpen(false))
            ) : (
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                إغلاق
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
