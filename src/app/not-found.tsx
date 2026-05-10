import Link from 'next/link'
import { Shield, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--fcps-bg-soft)]">
        <Shield className="h-10 w-10 text-[var(--fcps-primary)]" />
      </div>
      <h1 className="mb-2 text-6xl font-black text-[var(--fcps-primary)]">404</h1>
      <h2 className="mb-4 text-2xl font-bold text-[var(--fcps-dark)]">الصفحة غير موجودة</h2>
      <p className="mb-8 max-w-md text-[var(--fcps-gray-text)]">
        عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-lg bg-[var(--fcps-primary)] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[var(--fcps-primary-dark)] hover:scale-105"
      >
        <Home className="h-4 w-4" />
        العودة للرئيسية
      </Link>
    </div>
  )
}
