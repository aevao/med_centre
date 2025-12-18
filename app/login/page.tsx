'use client'

import { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthModal, type AuthMode } from '@/components/auth/auth-modal'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const redirectParam = searchParams.get('redirect') || '/dashboard'
  const redirectTo = useMemo(
    () => (redirectParam.startsWith('/') ? redirectParam : '/dashboard'),
    [redirectParam]
  )
  const initialMode: AuthMode = searchParams.get('mode') === 'register' ? 'register' : 'login'

  const [open, setOpen] = useState(true)
  const [mode, setMode] = useState<AuthMode>(initialMode)

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-8 top-10 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-8 bottom-10 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />
      </div>
      <AuthModal
        open={open}
        onOpenChange={(value) => {
          setOpen(value)
          if (!value) {
            router.push('/')
          }
        }}
        mode={mode}
        onModeChange={setMode}
        redirectTo={redirectTo}
        onCloseFallback={() => router.push('/')}
      />
    </div>
  )
}

