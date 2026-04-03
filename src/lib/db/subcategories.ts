import type { Subcategory, CategoryId } from '@/types'
import { getDB } from './index'
import { saveToMemory } from './classificationMemory'

function generateId(): string {
  return `sub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

export async function getSubcategories(): Promise<Subcategory[]> {
  const db = getDB()
  return db.subcategories.orderBy('createdAt').toArray()
}

export async function getSubcategoriesByParent(
  parentId: CategoryId
): Promise<Subcategory[]> {
  const db = getDB()
  return db.subcategories.where('parentId').equals(parentId).toArray()
}

export async function createSubcategory(
  data: Omit<Subcategory, 'id' | 'createdAt'>
): Promise<Subcategory> {
  const db = getDB()
  const sub: Subcategory = { ...data, id: generateId(), createdAt: new Date() }
  await db.subcategories.add(sub)
  return sub
}

export async function updateSubcategory(
  id: string,
  data: Partial<Pick<Subcategory, 'name' | 'color' | 'icon'>>
): Promise<void> {
  const db = getDB()
  await db.subcategories.update(id, data)
}

export async function deleteSubcategory(id: string): Promise<void> {
  const db = getDB()
  // Transações com essa subcategoria perdem o vínculo (subcategoryId vira undefined)
  await db.transactions.where('subcategoryId').equals(id).modify({ subcategoryId: undefined })
  await db.subcategories.delete(id)
}

export async function updateTransactionSubcategory(
  transactionId: string,
  subcategoryId: string | undefined
): Promise<void> {
  const db = getDB()
  const tx = await db.transactions.get(transactionId)
  await db.transactions.update(transactionId, { subcategoryId })
  if (tx) await saveToMemory(tx.description, tx.category, subcategoryId)
}
