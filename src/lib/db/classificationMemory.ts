import type { CategoryId } from '@/types'
import { getDB } from './index'

function normalizeDesc(description: string): string {
  return description.toUpperCase().trim()
}

export async function getMemory(
  description: string
): Promise<{ category: CategoryId; subcategoryId?: string; source?: 'user' | 'ai' } | null> {
  const db = getDB()
  const entry = await db.classificationMemory.get(normalizeDesc(description))
  if (!entry) return null
  return { category: entry.category, subcategoryId: entry.subcategoryId, source: entry.source }
}

export async function saveToMemory(
  description: string,
  category: CategoryId,
  subcategoryId?: string,
  source: 'user' | 'ai' = 'user',
): Promise<void> {
  const db = getDB()
  const key = normalizeDesc(description)
  const existing = await db.classificationMemory.get(key)
  await db.classificationMemory.put({
    description: key,
    category,
    subcategoryId,
    count: (existing?.count ?? 0) + 1,
    updatedAt: new Date(),
    source,
  })
}

export async function deleteFromMemory(description: string): Promise<void> {
  const db = getDB()
  await db.classificationMemory.delete(normalizeDesc(description))
}

export async function getAllMemory() {
  const db = getDB()
  return db.classificationMemory.orderBy('updatedAt').reverse().toArray()
}
