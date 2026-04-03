'use client'

import Link from 'next/link'
import { Upload } from 'lucide-react'
import { useDashboard } from '@/hooks/useDashboard'
import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { CategoryPieChart } from '@/components/dashboard/CategoryPieChart'
import { MonthlyBarChart } from '@/components/dashboard/MonthlyBarChart'
import { useStore } from '@/store/useStore'
import type { PeriodFilter } from '@/types'

const PERIOD_OPTIONS: { value: PeriodFilter; label: string }[] = [
  { value: 'month', label: 'Este mês' },
  { value: '3months', label: 'Últimos 3 meses' },
  { value: '6months', label: 'Últimos 6 meses' },
  { value: 'all', label: 'Tudo' },
  { value: 'custom', label: 'Personalizado' },
]

export default function DashboardPage() {
  const { filter, setFilter, setPeriod } = useStore()
  const data = useDashboard(filter)

  const isEmpty = data && data.total === 0
  const loading = data === undefined

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-secondary text-sm mt-0.5">
            Resumo financeiro pessoal
          </p>
        </div>
        <Link
          href="/import"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-purple hover:bg-accent-purple-light text-white text-sm font-medium transition-colors"
        >
          <Upload size={16} />
          Importar
        </Link>
      </div>

      {/* Period filter */}
      <div className="space-y-2">
        <div className="flex gap-2 flex-wrap">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter.period === opt.value
                  ? 'bg-accent-purple text-white'
                  : 'bg-bg-card border border-border text-text-secondary hover:text-text-primary hover:border-accent-purple/30'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {filter.period === 'custom' && (
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="date"
              value={filter.dateFrom ?? ''}
              onChange={(e) => setFilter({ dateFrom: e.target.value || undefined })}
              className="px-3 py-1.5 bg-bg-card border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-purple/50 transition-colors"
            />
            <span className="text-text-muted text-sm">até</span>
            <input
              type="date"
              value={filter.dateTo ?? ''}
              onChange={(e) => setFilter({ dateTo: e.target.value || undefined })}
              className="px-3 py-1.5 bg-bg-card border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-purple/50 transition-colors"
            />
          </div>
        )}
      </div>

      {/* Empty state */}
      {isEmpty && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-bg-card border border-border flex items-center justify-center text-3xl">
            📊
          </div>
          <div>
            <p className="text-text-primary font-medium">Nenhum dado ainda</p>
            <p className="text-text-secondary text-sm mt-1">
              Importe seu extrato Bradesco para começar
            </p>
          </div>
          <Link
            href="/import"
            className="px-5 py-2.5 rounded-xl bg-accent-purple hover:bg-accent-purple-light text-white font-medium transition-colors"
          >
            Importar extrato
          </Link>
        </div>
      )}

      {/* Summary cards */}
      {!isEmpty && (
        <>
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-bg-card border border-border rounded-2xl p-4 h-24 animate-pulse" />
              ))}
            </div>
          ) : (
            <SummaryCards summary={data!.summary} />
          )}

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Pizza */}
            <div className="bg-bg-card border border-border rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-text-primary mb-4">
                Despesas por categoria
              </h2>
              {loading ? (
                <div className="h-64 animate-pulse bg-bg-elevated rounded-xl" />
              ) : (
                <CategoryPieChart data={data!.categoryTotals} />
              )}
            </div>

            {/* Barras mensais */}
            <div className="bg-bg-card border border-border rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-text-primary mb-4">
                Evolução mensal (últimos 6 meses)
              </h2>
              {loading ? (
                <div className="h-64 animate-pulse bg-bg-elevated rounded-xl" />
              ) : (
                <MonthlyBarChart data={data!.monthlyTotals} />
              )}
            </div>
          </div>

          {/* Category ranking */}
          {!loading && data!.categoryTotals.length > 0 && (
            <div className="bg-bg-card border border-border rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-text-primary mb-4">
                Ranking de categorias
              </h2>
              <div className="space-y-3">
                {data!.categoryTotals.slice(0, 6).map((cat) => (
                  <div key={cat.categoryId} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-primary">{cat.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-text-secondary text-xs">
                          {cat.percentage.toFixed(1)}%
                        </span>
                        <span className="font-medium text-text-primary">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(cat.total)}
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${cat.percentage}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
