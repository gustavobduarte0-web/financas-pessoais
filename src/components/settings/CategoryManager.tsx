'use client'

import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { CATEGORIES, getCategoryColor } from '@/lib/classifier/categories'
import {
  getSubcategories,
  createSubcategory,
  deleteSubcategory,
} from '@/lib/db/subcategories'
import type { CategoryId } from '@/types'

const PRESET_COLORS = [
  '#F59E0B', '#EF4444', '#3B82F6', '#10B981', '#8B5CF6',
  '#F97316', '#EC4899', '#14B8A6', '#84CC16', '#6366F1',
  '#A78BFA', '#22C55E', '#6B7280', '#820AD1',
]

const PRESET_ICONS = ['🍽️', '🚗', '💊', '👕', '🏠', '🎬', '🛒', '📱', '📈', '⛽', '🏨', '💰', '↔️', '🎵', '📚', '🐾', '🧴', '🔧', '✈️', '🎁', '🍺', '☕', '🧘', '💻']

interface NewSubForm {
  name: string
  color: string
  icon: string
}

function SubcategoryRow({
  sub,
  onDelete,
}: {
  sub: { id: string; name: string; color: string; icon: string }
  onDelete: (id: string) => void
}) {
  const [confirming, setConfirming] = useState(false)

  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-bg-elevated group">
      <div className="flex items-center gap-2">
        <span className="text-base">{sub.icon}</span>
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sub.color }} />
        <span className="text-sm text-text-primary">{sub.name}</span>
      </div>
      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-accent-red transition-all p-1"
        >
          <Trash2 size={13} />
        </button>
      ) : (
        <div className="flex items-center gap-1">
          <span className="text-xs text-accent-red">Apagar?</span>
          <button
            onClick={() => onDelete(sub.id)}
            className="text-xs px-1.5 py-0.5 bg-accent-red/15 text-accent-red rounded hover:bg-accent-red/25"
          >
            Sim
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="text-xs px-1.5 py-0.5 bg-bg-elevated text-text-secondary rounded"
          >
            Não
          </button>
        </div>
      )}
    </div>
  )
}

function CategorySection({ parentId }: { parentId: CategoryId }) {
  const [open, setOpen] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<NewSubForm>({ name: '', color: '#820AD1', icon: '📌' })
  const [saving, setSaving] = useState(false)

  const allSubs = useLiveQuery(() => getSubcategories(), [])
  const subs = allSubs?.filter((s) => s.parentId === parentId) ?? []

  const parentCat = CATEGORIES.find((c) => c.id === parentId)!

  const handleCreate = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    await createSubcategory({ name: form.name.trim(), color: form.color, icon: form.icon, parentId })
    setForm({ name: '', color: '#820AD1', icon: '📌' })
    setShowForm(false)
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    await deleteSubcategory(id)
  }

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-bg-elevated transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">{parentCat.icon}</span>
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: parentCat.color }} />
          <span className="text-sm font-medium text-text-primary">{parentCat.name}</span>
          {subs.length > 0 && (
            <span className="text-xs text-text-muted px-1.5 py-0.5 bg-bg-elevated rounded-full">
              {subs.length}
            </span>
          )}
        </div>
        {open ? <ChevronDown size={16} className="text-text-muted" /> : <ChevronRight size={16} className="text-text-muted" />}
      </button>

      {/* Subcategories */}
      {open && (
        <div className="px-3 pb-3 space-y-1 border-t border-border bg-bg-card">
          {subs.map((sub) => (
            <SubcategoryRow key={sub.id} sub={sub} onDelete={handleDelete} />
          ))}

          {/* Add form */}
          {showForm ? (
            <div className="mt-2 p-3 bg-bg-elevated rounded-xl space-y-3">
              <input
                type="text"
                placeholder="Nome da subcategoria"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                className="w-full px-3 py-2 bg-bg-card border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-purple/50"
                autoFocus
              />

              {/* Icon picker */}
              <div>
                <p className="text-xs text-text-muted mb-1.5">Ícone</p>
                <div className="flex flex-wrap gap-1">
                  {PRESET_ICONS.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setForm((f) => ({ ...f, icon }))}
                      className={`w-8 h-8 rounded-lg text-base flex items-center justify-center transition-colors ${
                        form.icon === icon ? 'bg-accent-purple/20 ring-1 ring-accent-purple' : 'hover:bg-bg-card'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color picker */}
              <div>
                <p className="text-xs text-text-muted mb-1.5">Cor</p>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setForm((f) => ({ ...f, color }))}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        form.color === color ? 'scale-125 ring-2 ring-white/30' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCreate}
                  disabled={!form.name.trim() || saving}
                  className="flex-1 py-2 rounded-lg bg-accent-purple hover:bg-accent-purple-light disabled:opacity-50 text-white text-sm font-medium transition-colors"
                >
                  {saving ? 'Salvando...' : 'Criar'}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-3 py-2 rounded-lg border border-border text-text-secondary text-sm hover:bg-bg-elevated"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 text-xs text-text-muted hover:text-accent-purple-light transition-colors py-1.5 px-3 rounded-lg hover:bg-bg-elevated w-full mt-1"
            >
              <Plus size={13} /> Adicionar subcategoria
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export function CategoryManager() {
  return (
    <div className="space-y-2">
      {CATEGORIES.filter((c) => c.id !== 'receita' && c.id !== 'transferencias').map((cat) => (
        <CategorySection key={cat.id} parentId={cat.id} />
      ))}
    </div>
  )
}
