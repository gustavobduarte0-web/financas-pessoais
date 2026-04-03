'use client'

import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import type { Transaction, CategoryId } from '@/types'
import { formatBRL } from '@/lib/utils/currency'
import { CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Trash2, Check, Sparkles, Loader2 } from 'lucide-react'
import { CATEGORIES, getCategoryColor, getCategoryIcon, getCategoryName } from '@/lib/classifier/categories'
import { getSubcategories } from '@/lib/db/subcategories'
import { saveToMemory } from '@/lib/db/classificationMemory'

interface ImportPreviewProps {
  transactions: Transaction[]
  duplicatesSkipped: number
  onConfirm: (transactions: Transaction[]) => void
  onCancel: () => void
  saving: boolean
}

function toDateInput(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function EditableRow({
  tx,
  isSelected,
  isAiClassified,
  onToggle,
  onChange,
}: {
  tx: Transaction
  isSelected: boolean
  isAiClassified: boolean
  onToggle: () => void
  onChange: (updated: Transaction) => void
}) {
  const [expanded, setExpanded] = useState(false)

  const allSubs = useLiveQuery(() => getSubcategories(), [])
  const subsForCategory = allSubs?.filter((s) => s.parentId === tx.category) ?? []

  const update = (patch: Partial<Transaction>) => onChange({ ...tx, ...patch })

  const handleCategoryChange = (cat: CategoryId) => {
    update({ category: cat, subcategoryId: undefined, categoryConfidence: 1 })
    saveToMemory(tx.description, cat, undefined)
  }

  const handleDateChange = (val: string) => {
    if (!val) return
    const [y, m, d] = val.split('-').map(Number)
    update({ date: new Date(y, m - 1, d) })
  }

  const handleAmountChange = (val: string) => {
    const n = parseFloat(val.replace(',', '.'))
    if (!isNaN(n)) update({ amount: n })
  }

  const isCredit = tx.amount >= 0
  const catColor = getCategoryColor(tx.category)

  return (
    <div className="border-b border-border-subtle last:border-0">
      {/* Collapsed row */}
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

        {/* Clickable area */}
        <div
          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <span className="text-lg flex-shrink-0 w-8 text-center">
            {getCategoryIcon(tx.category)}
          </span>

          <div className="flex-1 min-w-0">
            <p className="text-sm text-text-primary truncate">{tx.description}</p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs text-text-secondary">
                {tx.date.toLocaleDateString('pt-BR')}
              </span>
              <span
                className="text-xs px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: catColor + '22', color: catColor }}
              >
                {getCategoryName(tx.category)}
              </span>
              {tx.categoryConfidence >= 1.0 && (
                <span className="text-xs text-accent-green">• aprendida</span>
              )}
              {isAiClassified && tx.categoryConfidence < 1.0 && (
                <span className="text-xs text-blue-400">• IA</span>
              )}
              {tx.categoryConfidence < 0.7 && (
                <span className="text-xs text-yellow-500">• revisar</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-sm font-semibold ${isCredit ? 'text-accent-green' : 'text-text-primary'}`}>
              {isCredit ? '+' : '-'}{formatBRL(tx.amount)}
            </span>
            {expanded
              ? <ChevronUp size={14} className="text-text-muted" />
              : <ChevronDown size={14} className="text-text-muted" />
            }
          </div>
        </div>
      </div>

      {/* Expanded edit form */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 bg-bg-elevated/30 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Nome */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs text-text-muted">Nome</label>
              <input
                type="text"
                value={tx.description}
                onChange={(e) => update({ description: e.target.value })}
                className="w-full px-3 py-2 bg-bg-card border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-purple/50 transition-colors"
              />
            </div>

            {/* Data */}
            <div className="space-y-1">
              <label className="text-xs text-text-muted">Data</label>
              <input
                type="date"
                value={toDateInput(tx.date)}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full px-3 py-2 bg-bg-card border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-purple/50 transition-colors"
              />
            </div>

            {/* Valor */}
            <div className="space-y-1">
              <label className="text-xs text-text-muted">Valor (negativo = despesa)</label>
              <input
                type="number"
                step="0.01"
                value={tx.amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="w-full px-3 py-2 bg-bg-card border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-purple/50 transition-colors"
              />
            </div>

            {/* Categoria */}
            <div className="space-y-1">
              <label className="text-xs text-text-muted">Categoria</label>
              <select
                value={tx.category}
                onChange={(e) => handleCategoryChange(e.target.value as CategoryId)}
                className="w-full px-3 py-2 bg-bg-card border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-purple/50 appearance-none cursor-pointer transition-colors"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Subcategoria */}
            {subsForCategory.length > 0 && (
              <div className="space-y-1">
                <label className="text-xs text-text-muted">Subcategoria</label>
                <select
                  value={tx.subcategoryId ?? ''}
                  onChange={(e) => {
                const subId = e.target.value || undefined
                update({ subcategoryId: subId })
                saveToMemory(tx.description, tx.category, subId)
              }}
                  className="w-full px-3 py-2 bg-bg-card border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-purple/50 appearance-none cursor-pointer transition-colors"
                >
                  <option value="">Nenhuma</option>
                  {subsForCategory.map((s) => (
                    <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function ImportPreview({
  transactions,
  duplicatesSkipped,
  onConfirm,
  onCancel,
  saving,
}: ImportPreviewProps) {
  const [items, setItems] = useState<Transaction[]>(transactions)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false)
  const [aiClassifying, setAiClassifying] = useState(false)
  const [aiClassifiedIds, setAiClassifiedIds] = useState<Set<string>>(new Set())

  const lowConfidence = items.filter((t) => t.categoryConfidence < 0.7)
  const unclassified = items.filter((t) => t.category === 'outros')

  const handleAiClassify = async () => {
    if (unclassified.length === 0 || aiClassifying) return
    setAiClassifying(true)
    try {
      const descriptions = unclassified.map((t) => t.description)
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'classify-batch', descriptions }),
      })
      if (!res.ok) throw new Error('Erro na API')
      const data = await res.json() as { categories: CategoryId[] }

      const newAiIds = new Set(aiClassifiedIds)
      setItems((prev) =>
        prev.map((t) => {
          const idx = unclassified.findIndex((u) => u.id === t.id)
          if (idx === -1) return t
          const aiCategory = data.categories[idx] ?? 'outros'
          if (aiCategory !== 'outros') {
            newAiIds.add(t.id)
            saveToMemory(t.description, aiCategory, undefined, 'ai')
            return { ...t, category: aiCategory, categoryConfidence: 0.75 }
          }
          return t
        })
      )
      setAiClassifiedIds(newAiIds)
    } catch {
      // silently fail — user can classify manually
    } finally {
      setAiClassifying(false)
    }
  }

  const allSelected = items.length > 0 && items.every((t) => selectedIds.has(t.id))
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
      setSelectedIds(new Set(items.map((t) => t.id)))
    }
  }

  const handleChange = (updated: Transaction) => {
    setItems((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
  }

  const handleBulkDelete = () => {
    setItems((prev) => prev.filter((t) => !selectedIds.has(t.id)))
    setSelectedIds(new Set())
    setConfirmBulkDelete(false)
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-bg-card border border-border rounded-xl p-4">
          <p className="text-text-secondary text-xs mb-1">Transações</p>
          <p className="text-2xl font-bold text-text-primary">{items.length}</p>
        </div>
        {duplicatesSkipped > 0 && (
          <div className="bg-bg-card border border-border rounded-xl p-4">
            <p className="text-text-secondary text-xs mb-1">Duplicatas ignoradas</p>
            <p className="text-2xl font-bold text-text-secondary">{duplicatesSkipped}</p>
          </div>
        )}
        <div className="bg-bg-card border border-border rounded-xl p-4">
          <p className="text-text-secondary text-xs mb-1">Classificadas automaticamente</p>
          <p className="text-2xl font-bold text-accent-green">
            {items.length - lowConfidence.length}
          </p>
        </div>
      </div>

      {unclassified.length > 0 && (
        <div className="flex items-center justify-between gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <div className="flex items-center gap-2 text-sm text-blue-300">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{unclassified.length} transação(ões) em "Outros" — classifique com IA</span>
          </div>
          <button
            onClick={handleAiClassify}
            disabled={aiClassifying}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-300 text-xs font-medium hover:bg-blue-500/30 disabled:opacity-50 transition-colors flex-shrink-0"
          >
            {aiClassifying
              ? <><Loader2 size={12} className="animate-spin" /> Classificando...</>
              : <><Sparkles size={12} /> Classificar com IA</>
            }
          </button>
        </div>
      )}

      {lowConfidence.length > 0 && unclassified.length === 0 && (
        <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-sm text-yellow-400">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{lowConfidence.length} transação(ões) para revisar — clique para expandir e editar</span>
        </div>
      )}

      {/* List */}
      <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border flex items-center gap-3">
          {/* Select all */}
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
          <p className="text-sm font-medium text-text-primary flex-1">
            {someSelected
              ? `${selectedIds.size} de ${items.length} selecionada(s)`
              : `${items.length} transações — clique para editar`}
          </p>
        </div>

        {/* Bulk delete bar */}
        {someSelected && (
          <div className="px-4 py-2 bg-accent-purple/10 border-b border-accent-purple/20 flex items-center gap-3 flex-wrap">
            {!confirmBulkDelete ? (
              <button
                onClick={() => setConfirmBulkDelete(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-accent-red/30 text-accent-red text-xs hover:bg-accent-red/10 transition-colors"
              >
                <Trash2 size={12} /> Remover {selectedIds.size} da lista
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-accent-red font-medium">
                  Remover {selectedIds.size} transações?
                </span>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1.5 rounded-lg bg-accent-red/15 text-accent-red text-xs font-medium hover:bg-accent-red/25 transition-colors"
                >
                  Sim
                </button>
                <button
                  onClick={() => setConfirmBulkDelete(false)}
                  className="px-3 py-1.5 rounded-lg border border-border text-text-secondary text-xs hover:bg-bg-elevated transition-colors"
                >
                  Não
                </button>
              </div>
            )}
            <button
              onClick={() => { setSelectedIds(new Set()); setConfirmBulkDelete(false) }}
              className="px-3 py-1.5 rounded-lg text-text-secondary text-xs hover:text-text-primary hover:bg-bg-elevated transition-colors ml-auto"
            >
              Cancelar seleção
            </button>
          </div>
        )}

        {/* Rows */}
        <div className="divide-y divide-border-subtle max-h-[60vh] overflow-y-auto">
          {items.map((tx) => (
            <EditableRow
              key={tx.id}
              tx={tx}
              isSelected={selectedIds.has(tx.id)}
              isAiClassified={aiClassifiedIds.has(tx.id)}
              onToggle={() => toggleSelect(tx.id)}
              onChange={handleChange}
            />
          ))}
          {items.length === 0 && (
            <p className="text-center py-8 text-text-muted text-sm">
              Todas as transações foram removidas
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          disabled={saving}
          className="flex-1 py-3 rounded-xl border border-border text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition-colors font-medium"
        >
          Cancelar
        </button>
        <button
          onClick={() => onConfirm(items)}
          disabled={saving || items.length === 0}
          className="flex-1 py-3 rounded-xl bg-accent-purple hover:bg-accent-purple-light disabled:opacity-50 text-white font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <CheckCircle2 size={18} />
          {saving ? 'Salvando...' : `Importar ${items.length} transações`}
        </button>
      </div>
    </div>
  )
}
