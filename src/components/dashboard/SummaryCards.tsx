import { TrendingUp, TrendingDown, Wallet, Tag } from 'lucide-react'
import { formatBRL } from '@/lib/utils/currency'
import type { DashboardSummary } from '@/types'

interface Props {
  summary: DashboardSummary
}

export function SummaryCards({ summary }: Props) {
  const { totalReceitas, totalDespesas, saldo, topCategory } = summary

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Receitas */}
      <div className="bg-bg-card border border-border rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">
            Receitas
          </span>
          <div className="w-8 h-8 rounded-lg bg-accent-green/10 flex items-center justify-center">
            <TrendingUp size={16} className="text-accent-green" />
          </div>
        </div>
        <div>
          <p className="text-xl font-bold text-accent-green">
            {formatBRL(totalReceitas)}
          </p>
        </div>
      </div>

      {/* Despesas */}
      <div className="bg-bg-card border border-border rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">
            Despesas
          </span>
          <div className="w-8 h-8 rounded-lg bg-accent-red/10 flex items-center justify-center">
            <TrendingDown size={16} className="text-accent-red" />
          </div>
        </div>
        <div>
          <p className="text-xl font-bold text-accent-red">
            {formatBRL(totalDespesas)}
          </p>
        </div>
      </div>

      {/* Saldo */}
      <div
        className={`bg-bg-card border rounded-2xl p-4 space-y-3 ${
          saldo >= 0 ? 'border-accent-green/20' : 'border-accent-red/20'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">
            Saldo
          </span>
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              saldo >= 0 ? 'bg-accent-green/10' : 'bg-accent-red/10'
            }`}
          >
            <Wallet size={16} className={saldo >= 0 ? 'text-accent-green' : 'text-accent-red'} />
          </div>
        </div>
        <div>
          <p
            className={`text-xl font-bold ${
              saldo >= 0 ? 'text-accent-green' : 'text-accent-red'
            }`}
          >
            {saldo >= 0 ? '+' : ''}
            {formatBRL(saldo)}
          </p>
        </div>
      </div>

      {/* Maior categoria */}
      <div className="bg-bg-card border border-border rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">
            Maior gasto
          </span>
          <div className="w-8 h-8 rounded-lg bg-accent-purple/10 flex items-center justify-center">
            <Tag size={16} className="text-accent-purple-light" />
          </div>
        </div>
        <div>
          {topCategory ? (
            <>
              <p className="text-xl font-bold text-text-primary">
                {formatBRL(topCategory.amount)}
              </p>
              <p className="text-xs text-text-secondary mt-0.5">{topCategory.name}</p>
            </>
          ) : (
            <p className="text-text-muted text-sm">—</p>
          )}
        </div>
      </div>
    </div>
  )
}
