'use client'

import { useState, useRef } from 'react'
import {
  Download,
  Upload,
  CheckCircle2,
  XCircle,
  Loader2,
  DatabaseBackup,
  FileJson,
  Info,
  AlertTriangle,
  Trash2,
  RefreshCw,
  HardDriveDownload,
  ShieldCheck,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────
type Status = 'idle' | 'loading' | 'success' | 'error'
type RestoreMode = 'merge' | 'wipe'

interface OpState {
  status: Status
  message: string
}

const IDLE: OpState = { status: 'idle', message: '' }
const CONFIRM_PHRASE = 'أوافق'

// ─── Root component ───────────────────────────────────────────────────────────
export function DataManagementClient() {
  const [backup, setBackup] = useState<OpState>(IDLE)
  const [restore, setRestore] = useState<OpState>(IDLE)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [restoreMode, setRestoreMode] = useState<RestoreMode>('merge')
  const [showWipeDialog, setShowWipeDialog] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isBusy = backup.status === 'loading' || restore.status === 'loading'
  const confirmOk = confirmText.trim() === CONFIRM_PHRASE

  // ── Backup ──────────────────────────────────────────────────────────────────
  async function handleBackup() {
    setBackup({ status: 'loading', message: 'جارٍ تصدير البيانات…' })
    try {
      const res = await fetch('/api/data-management/backup')
      if (!res.ok) {
        const b = await res.json().catch(() => ({}))
        throw new Error(b.error || `خطأ ${res.status}`)
      }
      const data = await res.json()

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
      a.download = `cms-backup-${ts}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setBackup({ status: 'success', message: 'تم تصدير النسخة الاحتياطية وحفظها بنجاح.' })
    } catch (err: any) {
      setBackup({ status: 'error', message: err.message || 'فشل في تصدير البيانات.' })
    }
  }

  // ── Restore ─────────────────────────────────────────────────────────────────
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSelectedFile(e.target.files?.[0] ?? null)
    setRestore(IDLE)
  }

  function onRestoreClick() {
    if (restoreMode === 'wipe') {
      setConfirmText('')
      setShowWipeDialog(true)
    } else {
      executeRestore('merge')
    }
  }

  function onWipeConfirm() {
    setShowWipeDialog(false)
    executeRestore('wipe')
  }

  async function executeRestore(mode: RestoreMode) {
    if (!selectedFile) return
    setRestore({ status: 'loading', message: 'جارٍ التحقق من الملف واستعادة البيانات…' })

    let parsed: any
    try {
      parsed = JSON.parse(await selectedFile.text())
    } catch {
      setRestore({ status: 'error', message: 'الملف المرفوع ليس JSON صالحاً.' })
      return
    }

    try {
      const res = await fetch('/api/data-management/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...parsed, mode }),
      })

      const body = await res.json()

      if (res.status === 207) {
        setRestore({
          status: 'error',
          message: `اكتملت الاستعادة جزئياً مع أخطاء:\n${(body.details as string[]).join('\n')}`,
        })
        return
      }

      if (!res.ok) throw new Error(body.error || `خطأ ${res.status}`)

      setRestore({ status: 'success', message: 'تمت استعادة البيانات بنجاح.' })
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err: any) {
      setRestore({ status: 'error', message: err.message || 'فشل في استعادة البيانات.' })
    }
  }

  return (
    <>
      {/* ── Wipe confirmation dialog ── */}
      {showWipeDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          dir="rtl"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            {/* Icon + heading */}
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">تحذير: سيتم حذف جميع البيانات</h3>
                <p className="text-xs text-gray-500">هذا الإجراء لا يمكن التراجع عنه</p>
              </div>
            </div>

            <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm leading-relaxed text-red-700">
              سيتم <strong>حذف جميع السجلات الحالية</strong> من قاعدة البيانات (المقالات، التعليقات، التصنيفات،
              معلومات المنظمة، الإحصاءات) ثم إعادة تعبئتها من ملف النسخة الاحتياطية. لا يمكن التراجع عن هذه
              العملية.
            </p>

            <label className="mb-1 block text-sm font-medium text-gray-700">
              اكتب <span className="font-bold text-red-600">{CONFIRM_PHRASE}</span> للمتابعة
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={CONFIRM_PHRASE}
              className="mb-4 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none ring-1 ring-transparent transition focus:border-red-400 focus:ring-red-400"
              autoFocus
            />

            <div className="flex gap-3">
              <button
                onClick={onWipeConfirm}
                disabled={!confirmOk}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Trash2 className="h-4 w-4" />
                حذف وإعادة الاستعادة
              </button>
              <button
                onClick={() => setShowWipeDialog(false)}
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main layout ── */}
      <div className="space-y-6" dir="rtl">
        {/* Page header */}
        <div className="flex items-center gap-3 border-b border-gray-100 pb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--fcps-primary)">
            <DatabaseBackup className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-(--fcps-dark)">إدارة البيانات</h2>
            <p className="text-xs text-(--fcps-gray-text)">احتياطي البيانات واستعادتها</p>
          </div>
        </div>

        {/* Info strip */}
        <div className="flex items-start gap-2.5 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-500">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
          <span>
            يشمل الاحتياطي: المستخدمين · التصنيفات · المقالات · التعليقات · معلومات المنظمة · الإحصاءات
          </span>
        </div>

        {/* ── Two-column grid ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ── Backup section ── */}
        <Section
          icon={<HardDriveDownload className="h-4 w-4" />}
          title="تصدير نسخة احتياطية"
          subtitle="تصدير كامل لقاعدة البيانات كملف JSON"
        >
          <p className="mb-4 text-sm leading-relaxed text-gray-500">
            انقر على الزر أدناه لتنزيل ملف JSON يحتوي على جميع سجلات قاعدة البيانات. احتفظ بهذا الملف في
            مكان آمن واستخدمه عند الحاجة لاستعادة البيانات.
          </p>

          <StatusBanner state={backup} />

          <button
            id="backup-btn"
            onClick={handleBackup}
            disabled={isBusy}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-(--fcps-primary) px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {backup.status === 'loading' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {backup.status === 'loading' ? 'جارٍ التصدير…' : 'تصدير النسخة الاحتياطية'}
          </button>
        </Section>

        {/* ── Restore section ── */}
        <Section
          icon={<RefreshCw className="h-4 w-4" />}
          title="استعادة البيانات"
          subtitle="رفع ملف نسخة احتياطية (.json) لإعادة البيانات"
        >
          {/* Mode selector */}
          <div className="mb-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              وضع الاستعادة
            </p>
            <div className="grid grid-cols-2 gap-3">
              <ModeCard
                active={restoreMode === 'merge'}
                onClick={() => setRestoreMode('merge')}
                icon={<ShieldCheck className="h-4 w-4" />}
                title="دمج البيانات"
                description="تجاهل السجلات المكررة وإضافة الجديدة فقط"
                accentClass="border-(--fcps-primary) bg-(--fcps-primary)/5"
                iconClass="text-(--fcps-primary)"
              />
              <ModeCard
                active={restoreMode === 'wipe'}
                onClick={() => setRestoreMode('wipe')}
                icon={<Trash2 className="h-4 w-4" />}
                title="حذف وإعادة الاستعادة"
                description="حذف جميع البيانات الحالية ثم استعادة الملف"
                accentClass="border-red-400 bg-red-50"
                iconClass="text-red-500"
              />
            </div>
          </div>

          {/* Wipe warning */}
          {restoreMode === 'wipe' && (
            <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                سيتم حذف جميع السجلات الحالية نهائياً قبل استعادة النسخة الاحتياطية. ستظهر رسالة تأكيد
                صارمة قبل تنفيذ العملية.
              </span>
            </div>
          )}

          {/* File picker */}
          <label
            htmlFor="restore-file-input"
            className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed py-8 text-center transition-colors ${
              selectedFile
                ? 'border-(--fcps-primary)/50 bg-(--fcps-primary)/5'
                : 'border-gray-200 hover:border-(--fcps-primary)/40 hover:bg-gray-50'
            }`}
          >
            <FileJson
              className={`h-7 w-7 ${selectedFile ? 'text-(--fcps-primary)' : 'text-gray-300'}`}
            />
            {selectedFile ? (
              <span className="text-sm font-medium text-(--fcps-primary)">{selectedFile.name}</span>
            ) : (
              <span className="text-sm text-gray-400">
                انقر لاختيار ملف{' '}
                <span className="font-mono font-semibold text-gray-500">.json</span>
              </span>
            )}
            <input
              id="restore-file-input"
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="sr-only"
              onChange={handleFileChange}
              disabled={isBusy}
            />
          </label>

          <StatusBanner state={restore} />

          <button
            id="restore-btn"
            onClick={onRestoreClick}
            disabled={isBusy || !selectedFile}
            className={`mt-4 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
              restoreMode === 'wipe'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-(--fcps-primary) hover:opacity-90'
            }`}
          >
            {restore.status === 'loading' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : restoreMode === 'wipe' ? (
              <Trash2 className="h-4 w-4" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {restore.status === 'loading'
              ? 'جارٍ الاستعادة…'
              : restoreMode === 'wipe'
                ? 'حذف وإعادة الاستعادة'
                : 'استعادة البيانات'}
          </button>
        </Section>
        </div>
      </div>
    </>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function Section({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2.5 border-b border-gray-100 pb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--fcps-gray-light) text-(--fcps-primary)">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-bold text-(--fcps-dark)">{title}</h3>
          <p className="text-xs text-(--fcps-gray-text)">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

function ModeCard({
  active,
  onClick,
  icon,
  title,
  description,
  accentClass,
  iconClass,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  title: string
  description: string
  accentClass: string
  iconClass: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-start gap-1.5 rounded-lg border-2 p-3 text-right transition-all ${
        active ? accentClass : 'border-gray-200 bg-gray-50 hover:border-gray-300'
      }`}
    >
      <span className={`${iconClass} ${active ? '' : 'text-gray-400'}`}>{icon}</span>
      <span
        className={`text-xs font-semibold ${active ? 'text-(--fcps-dark)' : 'text-gray-500'}`}
      >
        {title}
      </span>
      <span className="text-left text-xs leading-relaxed text-gray-400">{description}</span>
    </button>
  )
}

function StatusBanner({ state }: { state: OpState }) {
  if (state.status === 'idle') return null

  const map = {
    loading: {
      icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
      cls: 'border-blue-200 bg-blue-50 text-blue-700',
    },
    success: {
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      cls: 'border-green-200 bg-green-50 text-green-700',
    },
    error: {
      icon: <XCircle className="h-3.5 w-3.5" />,
      cls: 'border-red-200 bg-red-50 text-red-700',
    },
  } as const

  const { icon, cls } = map[state.status]

  return (
    <div className={`mt-4 flex items-start gap-2 rounded-lg border px-3 py-2.5 text-xs ${cls}`}>
      <span className="mt-0.5 shrink-0">{icon}</span>
      <p className="whitespace-pre-wrap leading-relaxed">{state.message}</p>
    </div>
  )
}
