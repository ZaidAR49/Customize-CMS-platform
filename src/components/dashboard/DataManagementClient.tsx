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
import { useTranslations, useLocale } from 'next-intl'

// ─── Types ───────────────────────────────────────────────────────────────────
type Status = 'idle' | 'loading' | 'success' | 'error'
type RestoreMode = 'merge' | 'wipe'

interface OpState {
  status: Status
  message: string
}

const IDLE: OpState = { status: 'idle', message: '' }

// ─── Root component ───────────────────────────────────────────────────────────
export function DataManagementClient() {
  const t = useTranslations('dashboardDataManagement')
  const locale = useLocale()
  const CONFIRM_PHRASE = t('dialogConfirmPhrase')

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
    setBackup({ status: 'loading', message: t('backupProgress') })
    try {
      const res = await fetch('/api/data-management/backup')
      if (!res.ok) {
        const b = await res.json().catch(() => ({}))
        throw new Error(b.error || `Error ${res.status}`)
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

      setBackup({ status: 'success', message: t('backupSuccess') })
    } catch (err: any) {
      setBackup({ status: 'error', message: err.message || t('backupError') })
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
    setRestore({ status: 'loading', message: t('restoreProgress') })

    let parsed: any
    try {
      parsed = JSON.parse(await selectedFile.text())
    } catch {
      setRestore({ status: 'error', message: t('restoreInvalidJson') })
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
          message: `${t('restorePartial')}\n${(body.details as string[]).join('\n')}`,
        })
        return
      }

      if (!res.ok) throw new Error(body.error || `Error ${res.status}`)

      setRestore({ status: 'success', message: t('restoreSuccess') })
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err: any) {
      setRestore({ status: 'error', message: err.message || t('restoreError') })
    }
  }

  return (
    <>
      {/* ── Wipe confirmation dialog ── */}
      {showWipeDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          dir={locale === 'ar' ? 'rtl' : 'ltr'}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            {/* Icon + heading */}
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">{t('dialogWarningTitle')}</h3>
                <p className="text-xs text-gray-500">{t('dialogWarningSubtitle')}</p>
              </div>
            </div>

            <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm leading-relaxed text-red-700">
              {t('dialogWarningDesc')}
            </p>

            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t.rich('dialogConfirmLabel', {
                 phrase: <span className="font-bold text-red-600">{CONFIRM_PHRASE}</span>
              })}
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
                {t('restoreBtnWipe')}
              </button>
              <button
                onClick={() => setShowWipeDialog(false)}
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              >
                {t('dialogCancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main layout ── */}
      <div className="space-y-6" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        {/* Page header */}
        <div className="flex items-center gap-3 border-b border-gray-100 pb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--fcps-primary)">
            <DatabaseBackup className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-(--fcps-dark)">{t('title')}</h2>
            <p className="text-xs text-(--fcps-gray-text)">{t('subtitle')}</p>
          </div>
        </div>

        {/* Info strip */}
        <div className="flex items-start gap-2.5 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-500">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
          <span>{t('info')}</span>
        </div>

        {/* ── Two-column grid ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ── Backup section ── */}
        <Section
          icon={<HardDriveDownload className="h-4 w-4" />}
          title={t('backupTitle')}
          subtitle={t('backupSubtitle')}
          locale={locale}
        >
          <p className="mb-4 text-sm leading-relaxed text-gray-500">
            {t('backupDesc')}
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
            {backup.status === 'loading' ? t('backupLoading') : t('backupBtn')}
          </button>
        </Section>

        {/* ── Restore section ── */}
        <Section
          icon={<RefreshCw className="h-4 w-4" />}
          title={t('restoreTitle')}
          subtitle={t('restoreSubtitle')}
          locale={locale}
        >
          {/* Mode selector */}
          <div className="mb-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              {t('restoreModeTitle')}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <ModeCard
                active={restoreMode === 'merge'}
                onClick={() => setRestoreMode('merge')}
                icon={<ShieldCheck className="h-4 w-4" />}
                title={t('mergeTitle')}
                description={t('mergeDesc')}
                accentClass="border-(--fcps-primary) bg-(--fcps-primary)/5"
                iconClass="text-(--fcps-primary)"
                locale={locale}
              />
              <ModeCard
                active={restoreMode === 'wipe'}
                onClick={() => setRestoreMode('wipe')}
                icon={<Trash2 className="h-4 w-4" />}
                title={t('wipeTitle')}
                description={t('wipeDesc')}
                accentClass="border-red-400 bg-red-50"
                iconClass="text-red-500"
                locale={locale}
              />
            </div>
          </div>

          {/* Wipe warning */}
          {restoreMode === 'wipe' && (
            <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{t('wipeWarning')}</span>
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
                {t('fileInputEmpty')}
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
              ? t('restoreBtnLoading')
              : restoreMode === 'wipe'
                ? t('restoreBtnWipe')
                : t('restoreBtn')}
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
  locale
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  children: React.ReactNode
  locale: string
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
  locale
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  title: string
  description: string
  accentClass: string
  iconClass: string
  locale: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-start gap-1.5 rounded-lg border-2 p-3 ${locale === 'ar' ? 'text-right' : 'text-left'} transition-all ${
        active ? accentClass : 'border-gray-200 bg-gray-50 hover:border-gray-300'
      }`}
    >
      <span className={`${iconClass} ${active ? '' : 'text-gray-400'}`}>{icon}</span>
      <span
        className={`text-xs font-semibold ${active ? 'text-(--fcps-dark)' : 'text-gray-500'}`}
      >
        {title}
      </span>
      <span className={`text-xs leading-relaxed text-gray-400 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>{description}</span>
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

