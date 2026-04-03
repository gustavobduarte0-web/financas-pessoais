'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ArrowDownUp, Upload, Settings, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transações', icon: ArrowDownUp },
  { href: '/import', label: 'Importar', icon: Upload },
  { href: '/chat', label: 'Assistente', icon: MessageSquare },
  { href: '/settings', label: 'Config.', icon: Settings },
]

export function Nav() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed top-0 left-0 h-full w-56 flex-col border-r border-border bg-bg-card z-10">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-6 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-accent-purple flex items-center justify-center text-white font-bold text-sm">
            F
          </div>
          <span className="font-semibold text-text-primary">Finanças</span>
        </div>

        {/* Links */}
        <nav className="flex-1 p-3 space-y-1 mt-2">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-accent-purple/15 text-accent-purple-light'
                    : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
                )}
              >
                <Icon size={18} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border">
          <p className="text-xs text-text-muted">Dados salvos localmente</p>
        </div>
      </aside>

      {/* Mobile bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-10 bg-bg-card border-t border-border flex">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors',
                active ? 'text-accent-purple-light' : 'text-text-secondary'
              )}
            >
              <Icon size={20} />
              {label}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
