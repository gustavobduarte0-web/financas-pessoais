'use client'

import { useState } from 'react'
import { Trash2, AlertTriangle } from 'lucide-react'
import { CategoryManager } from '@/components/settings/CategoryManager'
import { clearAllTransactions } from '@/lib/db/transactions'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()
  const [confirmClear, setConfirmClear] = useState(false)
  const [clearing, setClearing] = useState(false)

  const handleClearAll = async () => {
    setClearing(true)
    await clearAllTransactions()
    setClearing(false)
    setConfirmClear(false)
    router.push('/')
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Configurações</h1>
        <p className="text-text-secondary text-sm mt-0.5">
          Gerencie categorias e dados do app
        </p>
      </div>

      {/* Categories */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-text-primary">Subcategorias</h2>
          <p className="text-text-secondary text-sm mt-0.5">
            Crie subcategorias personalizadas dentro de cada grupo. Clique em uma categoria para expandir.
          </p>
        </div>
        <CategoryManager />
      </section>

      {/* Danger zone */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-text-primary">Zona de risco</h2>
        <div className="border border-accent-red/20 rounded-xl p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent-red/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertTriangle size={16} className="text-accent-red" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">Apagar todos os dados</p>
              <p className="text-xs text-text-secondary mt-0.5">
                Remove todas as transações importadas. Esta ação não pode ser desfeita.
              </p>
            </div>
          </div>

          {!confirmClear ? (
            <button
              onClick={() => setConfirmClear(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-accent-red/30 text-accent-red text-sm hover:bg-accent-red/5 transition-colors"
            >
              <Trash2 size={15} />
              Apagar tudo
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <p className="text-sm text-accent-red font-medium">Tem certeza?</p>
              <button
                onClick={handleClearAll}
                disabled={clearing}
                className="px-4 py-2 rounded-xl bg-accent-red/15 text-accent-red text-sm font-medium hover:bg-accent-red/25 disabled:opacity-50 transition-colors"
              >
                {clearing ? 'Apagando...' : 'Sim, apagar tudo'}
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="px-4 py-2 rounded-xl border border-border text-text-secondary text-sm hover:bg-bg-elevated transition-colors"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
