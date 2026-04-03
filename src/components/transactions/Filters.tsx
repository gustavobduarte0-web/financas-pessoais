'use client'

import { Search, X } from 'lucide-react'
import { CATEGORIES } from '@/lib/classifier/categories'
import { useStore } from '@/store/useStore'
import type { PeriodFilter } from '@/types'

const PERIODS: { value: PeriodFilter; label: string }[] = [
  { value: 'month', label: 'Este mês' },
  { value: '3months', label: '3 meses' },
  { value: '6months', label: '6 meses' },
  { value: 'all', label: 'Tudo' },
  { value: 'custom', label: 'Personalizado' },
]

export function Filters() {
  const { filter, setFilter } = useStore()

  const isFiltered =
    filter.source !== 'all' ||
    filter.category !== 'all' ||
    filter.period !== 'all' ||
    !!filter.search

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Buscar transação..."
          value={filter.search}
          onChange={(e) => setFilter({ search: e.target.value })}
          className="w-full pl-9 pr-9 py-2.5 bg-bg-card border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-purple/50 transition-colors"
        />
        {filter.search && (
          <button
            onClick={() => setFilter({ search: '' })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Row 2: Period + Source + Category */}
      <div className="flex flex-wrap gap-2">
        {/* Period */}
        <select
          value={filter.period}
          onChange={(e) => setFilter({ period: e.target.value as PeriodFilter, dateFrom: undefined, dateTo: undefined })}
          className="px-3 py-2 bg-bg-card border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent-purple/50 transition-colors appearance-none cursor-pointer"
        >
          {PERIODS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>

        {/* Source */}
        <select
          value={filter.source}
          onChange={(e) => setFilter({ source: e.target.value as 'all' | 'conta' | 'cartao' })}
          className="px-3 py-2 bg-bg-card border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent-purple/50 transition-colors appearance-none cursor-pointer"
        >
          <option value="all">Conta + Cartão</option>
          <option value="conta">Só Conta</option>
          <option value="cartao">Só Cartão</option>
        </select>

        {/* Category */}
        <select
          value={filter.category}
          onChange={(e) => setFilter({ category: e.target.value as 'all' })}
          className="px-3 py-2 bg-bg-card border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent-purple/50 transition-colors appearance-none cursor-pointer"
        >
          <option value="all">Todas as categorias</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* Clear filters */}
        {isFiltered && (
          <button
            onClick={() => setFilter({ source: 'all', category: 'all', period: 'all', search: '', dateFrom: undefined, dateTo: undefined })}
            className="px-3 py-2 rounded-xl border border-accent-red/30 text-accent-red text-sm hover:bg-accent-red/5 transition-colors flex items-center gap-1"
          >
            <X size={14} /> Limpar
          </button>
        )}
      </div>

      {/* Custom date range */}
      {filter.period === 'custom' && (
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="date"
            value={filter.dateFrom ?? ''}
            onChange={(e) => setFilter({ dateFrom: e.target.value || undefined })}
            className="px-3 py-2 bg-bg-card border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent-purple/50 transition-colors"
          />
          <span className="text-text-muted text-sm">até</span>
          <input
            type="date"
            value={filter.dateTo ?? ''}
            onChange={(e) => setFilter({ dateTo: e.target.value || undefined })}
            className="px-3 py-2 bg-bg-card border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent-purple/50 transition-colors"
          />
        </div>
      )}
    </div>
  )
}
