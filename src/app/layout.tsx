import type { Metadata } from 'next'
import './globals.css'
import { Nav } from '@/components/layout/Nav'

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
        <div className="flex min-h-screen">
          {/* Sidebar — visível só no desktop */}
          <Nav />
          {/* Conteúdo principal */}
          <main className="flex-1 pb-20 md:pb-0 md:ml-56">
            <div className="max-w-5xl mx-auto px-4 py-6">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  )
}
