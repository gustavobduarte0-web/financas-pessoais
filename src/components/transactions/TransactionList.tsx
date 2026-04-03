'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Trash2, Check } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import type { Transaction, CategoryId } from '@/types'
import { formatBRL } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/date'
import {
  getCategoryName,
  getCategoryColor,
  getCategoryIcon,
  CATEGORIES,
} from '@/lib/classifier/categories'
import { updateTransactionCategory, deleteTransaction } from '@/lib/db/transactions'
import { getSubcategories, updateTransactionSubcategory } from '@/lib/db/subcategories'

interface Props {
  transactions: Transaction[]
}

function CategorySelect({
  value,
  onChange,
}: {
  value: CategoryId
  onChange: (id: CategoryId) => void
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as CategoryId)}
      onClick={(e) => e.stopPropagation()}
      className="text-xs bg-bg-elevated border border-border rounded-lg px-2 py-1 text-text-primary focus:outline-none focus:border-accent-purple/50 cursor-pointer appearance-none"
    >
      {CATEGORIES.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  )
}

function TransactionRow({
  tx,
  isSelected,
  onToggle,
}: {
  tx: Transaction
  isSelected: boolean
  onToggle: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [category, setCategory] = useState<CategoryId>(tx.category)
  const [subcategoryId, setSubcategoryId] = useState<string | undefined>(tx.subcategoryId)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const allSubs = useLiveQuery(() => getSubcategories(), [])
  const subsForCategory = allSubs?.filter((s) => s.parentId === category) ?? []

  const handleCategoryChange = async (newCat: CategoryId) => {
    setCategory(newCat)
    setSubcategoryId(undefined)
    await updateTransactionCategory(tx.id, newCat)
    await updateTransactionSubcategory(tx.id, undefined)
  }

  const handleSubcategoryChange = async (val: string) => {
    const id = val === '' ? undefined : val
    setSubcategoryId(id)
    await updateTransactionSubcategory(tx.id, id)
  }

  const handleDelete = async () => {
    await deleteTransaction(tx.id)
  }

  const activeSub = allSubs?.find((s) => s.id === subcategoryId)
  const displayName = activeSub ? activeSub.name : getCategoryName(category)
  const displayColor = activeSub ? activeSub.color : getCategoryColor(category)

  const isCredit = tx.amount >= 0

  return (
    <div className="border-b border-border-subtle last:border-0">
      {/* Main row */}
      <div className="flex items-center gap-3 px-4 py-3 hover:bg-bg-elevated/50 transition-colors">
        {/* Checkbox */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggle() }}
          className={`flex-shrink-0 w-5 h-5 rounded border transition-colors flex items-center justify-center ${
            isSelected
              ? 'bg-accent-purple border-accent-purple'
              : 'border-border hover:border-accent-purple/50'
          }`}
        >
          {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
        </button>

        {/* Clickable area to expand */}
        <div
          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          {/* Icon */}
          <span className="text-lg flex-shrink-0 w-8 text-center">
            {getCategoryIcon(category)}
          </span>

          {/* Description + meta */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-text-primary truncate">{tx.description}</p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs text-text-secondary">{formatDate(tx.date)}</span>

              {/* Source badge */}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full border ${
                  tx.source === 'conta'
                    ? 'border-accent-purple/30 text-accent-purple-light'
                    : 'border-blue-500/30 text-blue-400'
                }`}
              >
                {tx.source === 'conta' ? 'Conta' : `Cartão ${tx.cardHolder ?? ''}`}
              </span>

              {/* Category / subcategory badge */}
              <span
                className="text-xs px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: displayColor + '22',
                  color: displayColor,
                }}
              >
                {displayName}
              </span>

              {/* Installment */}
              {tx.installment && (
                <span className="text-xs text-text-muted">
                  {tx.installment.current}/{tx.installment.total}x
                </span>
              )}

              {/* Confidence badges */}
              {tx.categoryConfidence >= 1.0 && (
                <span className="text-xs text-accent-green">• aprendida</span>
              )}
              {tx.categoryConfidence > 0.7 && tx.categoryConfidence < 0.85 && (
                <span className="text-xs text-blue-400">• IA</span>
              )}
              {tx.categoryConfidence < 0.7 && (
                <span className="text-xs text-yellow-500">• revisar</span>
              )}
            </div>
          </div>

          {/* Amount */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span
              className={`text-sm font-semibold ${
                isCredit ? 'text-accent-green' : 'text-text-primary'
              }`}
            >
              {isCredit ? '+' : '-'}
              {formatBRL(tx.amount)}
            </span>
            {expanded ? (
              <ChevronUp size={14} className="text-text-muted" />
            ) : (
              <ChevronDown size={14} className="text-text-muted" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-3 flex items-center justify-between gap-3 bg-bg-elevated/30">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-text-secondary">Categoria:</span>
            <CategorySelect value={category} onChange={handleCategoryChange} />
            {subsForCategory.length > 0 && (
              <>
                <span className="text-xs text-text-muted">›</span>
                <select
                  value={subcategoryId ?? ''}
                  onChange={(e) => handleSubcategoryChange(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs bg-bg-elevated border border-border rounded-lg px-2 py-1 text-text-primary focus:outline-none focus:border-accent-purple/50 cursor-pointer appearance-none"
                >
                  <option value="">Nenhuma</option>
                  {subsForCategory.map((s) => (
                    <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                  ))}
                </select>
              </>
            )}
          </div>

          {/* Delete individual */}
          {!confirmDelete ? (
            <button
              onClick={(e) => { e.stopPropagation(); setConfirmDelete(true) }}
              className="flex items-center gap-1 text-xs text-text-muted hover:text-accent-red transition-colors px-2 py-1 rounded-lg hover:bg-accent-red/10"
            >
              <Trash2 size={13} /> Apagar
            </button>
          ) : (
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <span className="text-xs text-accent-red">Confirmar?</span>
              <button
                onClick={handleDelete}
                className="text-xs px-2 py-1 rounded-lg bg-accent-red/15 text-accent-red hover:bg-accent-red/25 transition-colors font-medium"
              >
                Sim
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-xs px-2 py-1 rounded-lg bg-bg-elevated text-text-secondary hover:bg-border transition-colors"
              >
                Não
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const PAGE_SIZE = 50

export function TransactionList({ transactions }: Props) {
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkCategory, setBulkCategory] = useState<CategoryId | ''>('')
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false)
  const [bulkApplying, setBulkApplying] = useState(false)

  const paginated = transactions.slice(0, page * PAGE_SIZE)
  const hasMore = paginated.length < transactions.length

  const allSelected = transactions.length > 0 && transactions.every((t) => selectedIds.has(t.id))
  const someSelected = selectedIds.size > 0
  const indeterminate = someSelected && !allSelected

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(transactions.map((t) => t.id)))
    }
  }

  const clearSelection = () => {
    setSelectedIds(new Set())
    setConfirmBulkDelete(false)
    setBulkCategory('')
  }

  const handleBulkDelete = async () => {
    setBulkApplying(true)
    await Promise.all([...selectedIds].map((id) => deleteTransaction(id)))
    clearSelection()
    setBulkApplying(false)
  }

  const handleBulkCategoryApply = async () => {
    if (!bulkCategory) return
    setBulkApplying(true)
    await Promise.all([...selectedIds].map((id) => updateTransactionCategory(id, bulkCategory as CategoryId)))
    clearSelection()
    setBulkApplying(false)
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <span className="text-4xl">🔍</span>
        <p className="text-text-primary font-medium">Nenhuma transação encontrada</p>
        <p className="text-text-secondary text-sm">Tente ajustar os filtros</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Header row: select-all + count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSelectAll}
            className={`flex-shrink-0 w-5 h-5 rounded border transition-colors flex items-center justify-center ${
              allSelected
                ? 'bg-accent-purple border-accent-purple'
                : indeterminate
                ? 'bg-accent-purple/40 border-accent-purple/60'
                : 'border-border hover:border-accent-purple/50'
            }`}
          >
            {allSelected && <Check size={12} className="text-white" strokeWidth={3} />}
            {indeterminate && <div className="w-2.5 h-0.5 bg-white rounded-full" />}
          </button>
          <span className="text-xs text-text-muted">
            {someSelected
              ? `${selectedIds.size} de ${transactions.length} selecionada(s)`
              : `${transactions.length} transação(ões)`}
          </span>
        </div>
      </div>

      {/* Bulk actions bar */}
      {someSelected && (
        <div className="flex items-center gap-2 flex-wrap p-3 bg-accent-purple/10 border border-accent-purple/20 rounded-xl">
          {/* Category change */}
          <select
            value={bulkCategory}
            onChange={(e) => setBulkCategory(e.target.value as CategoryId | '')}
            className="px-2 py-1.5 bg-bg-card border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:border-accent-purple/50 appearance-none cursor-pointer"
          >
            <option value="">Alterar categoria...</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button
            onClick={handleBulkCategoryApply}
            disabled={!bulkCategory || bulkApplying}
            className="px-3 py-1.5 rounded-lg bg-accent-purple hover:bg-accent-purple-light disabled:opacity-40 text-white text-xs font-medium transition-colors"
          >
            Aplicar
          </button>

          <div className="w-px h-4 bg-border mx-1" />

          {/* Bulk delete */}
          {!confirmBulkDelete ? (
            <button
              onClick={() => setConfirmBulkDelete(true)}
              disabled={bulkApplying}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-accent-red/30 text-accent-red text-xs hover:bg-accent-red/10 disabled:opacity-40 transition-colors"
            >
              <Trash2 size={12} /> Apagar {selectedIds.size}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-accent-red font-medium">Apagar {selectedIds.size} transações?</span>
              <button
                onClick={handleBulkDelete}
                disabled={bulkApplying}
                className="px-3 py-1.5 rounded-lg bg-accent-red/15 text-accent-red text-xs font-medium hover:bg-accent-red/25 disabled:opacity-50 transition-colors"
              >
                {bulkApplying ? 'Apagando...' : 'Sim'}
              </button>
              <button
                onClick={() => setConfirmBulkDelete(false)}
                className="px-3 py-1.5 rounded-lg border border-border text-text-secondary text-xs hover:bg-bg-elevated transition-colors"
              >
                Não
              </button>
            </div>
          )}

          <div className="w-px h-4 bg-border mx-1" />

          {/* Cancel selection */}
          <button
            onClick={clearSelection}
            className="px-3 py-1.5 rounded-lg text-text-secondary text-xs hover:text-text-primary hover:bg-bg-elevated transition-colors"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* List */}
      <div className="bg-bg-card border border-border rounded-2xl overflow-hidden divide-y divide-transparent">
        {paginated.map((tx) => (
          <TransactionRow
            key={tx.id}
            tx={tx}
            isSelected={selectedIds.has(tx.id)}
            onToggle={() => toggleSelect(tx.id)}
          />
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <button
          onClick={() => setPage((p) => p + 1)}
          className="w-full py-3 rounded-xl border border-border text-text-secondary hover:bg-bg-elevated hover:text-text-primary text-sm font-medium transition-colors"
        >
          Carregar mais ({transactions.length - paginated.length} restantes)
        </button>
      )}
    </div>
  )
}
