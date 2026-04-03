import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/components/layout/AuthProvider'
import { AppShell } from '@/components/layout/AppShell'

export const metadata: Metadata = {
  title: 'Finanças Pessoais',
  description: 'Controle financeiro pessoal — Bradesco',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-bg-primary text-text-primary min-h-screen">
        <AuthProvider>
          <AppShell>
            {children}
          </AppShell>
        </AuthProvider>
      </body>
    </html>
  )
}
