'use client'

import { usePathname } from 'next/navigation'
import { Nav } from './Nav'

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLogin = pathname === '/login'

  if (isLogin) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen">
      <Nav />
      <main className="flex-1 pb-20 md:pb-0 md:ml-56">
        <div className="max-w-5xl mx-auto px-4 py-6">
          {children}
        </div>
      </main>
    </div>
  )
}
