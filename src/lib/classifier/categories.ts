import type { Category, CategoryId } from '@/types'

export const CATEGORIES: Category[] = [
  { id: 'alimentacao', name: 'Alimentação', color: '#F59E0B', icon: '🍽️' },
  { id: 'supermercado', name: 'Supermercado', color: '#6366F1', icon: '🛒' },
  { id: 'transporte', name: 'Transporte', color: '#3B82F6', icon: '🚗' },
  { id: 'combustivel', name: 'Combustível', color: '#84CC16', icon: '⛽' },
  { id: 'saude', name: 'Saúde', color: '#EF4444', icon: '💊' },
  { id: 'vestuario', name: 'Vestuário', color: '#8B5CF6', icon: '👕' },
  { id: 'moradia', name: 'Moradia', color: '#10B981', icon: '🏠' },
  { id: 'hospedagem', name: 'Hospedagem', color: '#A78BFA', icon: '🏨' },
  { id: 'lazer', name: 'Lazer', color: '#F97316', icon: '🎬' },
  { id: 'assinaturas', name: 'Assinaturas', color: '#EC4899', icon: '📱' },
  { id: 'investimentos', name: 'Investimentos', color: '#14B8A6', icon: '📈' },
  { id: 'receita', name: 'Receita', color: '#22C55E', icon: '💰' },
  { id: 'transferencias', name: 'Transferências', color: '#6B7280', icon: '↔️' },
  { id: 'outros', name: 'Outros', color: '#4B5563', icon: '❓' },
]

export const CATEGORY_MAP = new Map<CategoryId, Category>(
  CATEGORIES.map((c) => [c.id, c])
)

export function getCategoryColor(id: CategoryId): string {
  return CATEGORY_MAP.get(id)?.color ?? '#4B5563'
}

export function getCategoryName(id: CategoryId): string {
  return CATEGORY_MAP.get(id)?.name ?? 'Outros'
}

export function getCategoryIcon(id: CategoryId): string {
  return CATEGORY_MAP.get(id)?.icon ?? '❓'
}
