import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--fcps-bg)] px-4">
      <div className="text-center max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border">
        <div className="flex justify-center mb-6 text-red-500">
          <ShieldAlert className="h-16 w-16" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--fcps-dark)] mb-4">
          عذراً، غير مصرح لك بالدخول
        </h1>
        <p className="text-[var(--fcps-gray-text)] mb-8">
          حسابك لا يملك الصلاحيات اللازمة (مشرف أو محرر) للوصول إلى لوحة التحكم. يرجى التواصل مع الإدارة إذا كنت تعتقد أن هذا خطأ.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center w-full rounded-md bg-[var(--fcps-primary)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--fcps-primary-dark)]"
        >
          العودة إلى الصفحة الرئيسية
        </Link>
      </div>
    </div>
  )
}
