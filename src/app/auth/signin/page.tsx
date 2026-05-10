'use client'

import { signIn } from 'next-auth/react'
import { Shield } from 'lucide-react'
import { useState } from 'react'
import { FaGoogle } from 'react-icons/fa6'
import { cn } from '@/lib/utils'

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    await signIn('google', { callbackUrl: '/dashboard' })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--fcps-gray-light)] px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-[var(--fcps-bg-soft)] text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="flex justify-center mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--fcps-primary)] text-white shadow-md">
            <Shield className="h-8 w-8" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-[var(--fcps-dark)] mb-2">
          مرحباً بك مجدداً
        </h1>
        <p className="text-[var(--fcps-gray-text)] mb-8">
          الرجاء تسجيل الدخول للوصول إلى لوحة التحكم
        </p>

        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className={cn(
            "flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-all",
            "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[var(--fcps-primary)] focus:ring-offset-2",
            isLoading && "opacity-70 cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-[var(--fcps-primary)]" />
          ) : (
            <>
              <FaGoogle className="h-5 w-5 text-red-500" />
              <span>المتابعة باستخدام Google</span>
            </>
          )}
        </button>
        
        <div className="mt-8 text-xs text-gray-400">
          هذه الصفحة مخصصة فقط للمشرفين والمحررين في الجمعية
        </div>
      </div>
    </div>
  )
}
