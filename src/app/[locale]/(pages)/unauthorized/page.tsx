import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export default async function UnauthorizedPage() {
  const t = await getTranslations('authPage.unauthorized')
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-(--fcps-bg) px-4">
      <div className="text-center max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border">
        <div className="flex justify-center mb-6 text-red-500">
          <ShieldAlert className="h-16 w-16" />
        </div>
        <h1 className="text-2xl font-bold text-(--fcps-dark) mb-4">
          {t('title')}
        </h1>
        <p className="text-(--fcps-gray-text) mb-8">
          {t('description')}
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center w-full rounded-md bg-(--fcps-primary) px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-(--fcps-primary-dark)"
        >
          {t('backToHome')}
        </Link>
      </div>
    </div>
  )
}

