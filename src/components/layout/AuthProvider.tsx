'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

interface Session {
  email: string
  loggedAt: number
}

export function getSession(): Session | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('finance_session')
    if (!raw) return null
    const session = JSON.parse(raw) as Session
    if (Date.now() - session.loggedAt > SESSION_DURATION_MS) {
      localStorage.removeItem('finance_session')
      return null
    }
    return session
  } catch {
    return null
  }
}

export function logout() {
  localStorage.removeItem('finance_session')
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (pathname === '/login') {
      setChecked(true)
      return
    }
    const session = getSession()
    if (!session) {
      router.replace('/login')
    } else {
      setChecked(true)
    }
  }, [pathname, router])

  // Prevent flash of protected content while checking auth
  if (!checked) return null

  return <>{children}</>
}
