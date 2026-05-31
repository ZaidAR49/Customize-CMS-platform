import Link from 'next/link'
import { Home } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function NotFound() {
  const t = useTranslations('notFoundPage')

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white overflow-hidden border border-(--fcps-bg-soft) shadow-sm">
        <img src="/images/logo.png" alt="Logo" width={80} height={80} className="object-contain" />
      </div>
      <h1 className="mb-2 text-6xl font-black text-(--fcps-primary)">404</h1>
      <h2 className="mb-4 text-2xl font-bold text-(--fcps-dark)">{t('title')}</h2>
      <p className="mb-8 max-w-md text-(--fcps-gray-text)">
        {t('description')}
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-lg bg-(--fcps-primary) px-6 py-3 text-sm font-bold text-white transition-all hover:bg-(--fcps-primary-dark) hover:scale-105"
      >
        <Home className="h-4 w-4" />
        {t('backToHome')}
      </Link>
    </div>
  )
}

