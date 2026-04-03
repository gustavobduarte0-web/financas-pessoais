import type { Transaction, CategoryId, FilterState } from '@/types'
import { getPeriodRange } from '@/lib/utils/date'
import { getDB } from './index'
import { saveToMemory } from './classificationMemory'

export async function addTransactions(transactions: Transaction[]): Promise<number> {
  const db = getDB()
  // bulkPut ignora duplicatas (mesma PK = sobrescreve, mas não cria novo)
  // Usamos bulkPut e contamos quantos existiam antes
  const ids = transactions.map((t) => t.id)
  const existing = await db.transactions.where('id').anyOf(ids).count()
  await db.transactions.bulkPut(transactions)
  return transactions.length - existing
}

export async function getAllTransactions(): Promise<Transaction[]> {
  const db = getDB()
  return db.transactions.orderBy('date').reverse().toArray()
}

export async function getFilteredTransactions(filter: FilterState): Promise<Transaction[]> {
  const db = getDB()
  const { from, to } = getPeriodRange(filter.period)

  let collection = db.transactions
    .where('date')
    .between(from, to, true, true)

  const results = await collection.toArray()

  return results.filter((t) => {
    if (filter.source !== 'all' && t.source !== filter.source) return false
    if (filter.category !== 'all' && t.category !== filter.category) return false
    if (filter.search) {
      const s = filter.search.toLowerCase()
      if (!t.description.toLowerCase().includes(s)) return false
    }
    return true
  })
}

export async function updateTransactionCategory(
  id: string,
  category: CategoryId
): Promise<void> {
  const db = getDB()
  const tx = await db.transactions.get(id)
  await db.transactions.update(id, { category, categoryConfidence: 1 })
  if (tx) await saveToMemory(tx.description, category, tx.subcategoryId)
}

export async function updateTransactionNote(id: string, note: string): Promise<void> {
  const db = getDB()
  await db.transactions.update(id, { note })
}

export async function deleteTransaction(id: string): Promise<void> {
  const db = getDB()
  await db.transactions.delete(id)
}

export async function clearAllTransactions(): Promise<void> {
  const db = getDB()
  await db.transactions.clear()
}

export async function getTransactionCount(): Promise<number> {
  const db = getDB()
  return db.transactions.count()
}
