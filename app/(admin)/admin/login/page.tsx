'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Eye, EyeOff, Lock, User, Sparkles } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from') || '/admin'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'خطأ في تسجيل الدخول')
      setLoading(false)
      return
    }

    router.push(from)
    router.refresh()
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(160deg, #FFF7F4 0%, #FCDDE7 55%, #F5B8C8 100%)' }}
    >
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-rosegold-300/20 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 md:p-10">

          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="relative w-44 h-44 mx-auto mb-4 bg-nude-50 rounded-full overflow-hidden border-4 border-primary-200 shadow-pink">
              <Image
                src="/logo.png"
                alt="Shevora"
                fill
                className="object-contain"
                priority
              />
            </div>
            <h1
              className="text-3xl font-bold text-cocoa-800 leading-none"
              style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
            >
              Shevora
            </h1>
            <p className="text-xs text-taupe-500 tracking-widest uppercase mt-1 font-semibold">
              لوحة تحكم المشرف
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5" dir="rtl">
            <div>
              <label className="block text-sm font-semibold text-cocoa-800 mb-1.5">
                اسم المستخدم
              </label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-taupe-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="اسم المستخدم"
                  autoComplete="username"
                  className="w-full pr-10 pl-4 py-3 rounded-xl border-2 border-primary-200 bg-white text-cocoa-800 placeholder-taupe-400/50 focus:outline-none focus:border-terracotta-300 focus:ring-2 focus:ring-terracotta-100 transition-all"
                  dir="ltr"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-cocoa-800 mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-taupe-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="كلمة المرور"
                  autoComplete="current-password"
                  className="w-full pr-10 pl-10 py-3 rounded-xl border-2 border-primary-200 bg-white text-cocoa-800 placeholder-taupe-400/50 focus:outline-none focus:border-terracotta-300 focus:ring-2 focus:ring-terracotta-100 transition-all"
                  dir="ltr"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-taupe-400/60 hover:text-terracotta-400 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 text-center font-medium animate-fade-in">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-terracotta-400 hover:bg-terracotta-500 text-white font-bold text-base shadow-terra transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  جارٍ الدخول...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  دخول
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-taupe-400 mt-6">
            Shevora Admin © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
