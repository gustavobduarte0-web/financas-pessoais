import Dexie, { type Table } from 'dexie'
import type { Transaction, Subcategory, ClassificationMemory } from '@/types'

export class FinancasDB extends Dexie {
  transactions!: Table<Transaction>
  subcategories!: Table<Subcategory>
  classificationMemory!: Table<ClassificationMemory>

  constructor() {
    super('financas-pessoais')
    this.version(1).stores({
      transactions: 'id, date, source, category, type, isInvestment, isCardPayment',
    })
    this.version(2).stores({
      transactions: 'id, date, source, category, subcategoryId, type, isInvestment, isCardPayment',
      subcategories: 'id, parentId',
    })
    this.version(3).stores({
      transactions: 'id, date, source, category, subcategoryId, type, isInvestment, isCardPayment',
      subcategories: 'id, parentId, createdAt',
    })
    this.version(4).stores({
      transactions: 'id, date, source, category, subcategoryId, type, isInvestment, isCardPayment',
      subcategories: 'id, parentId, createdAt',
      classificationMemory: 'description, category, updatedAt',
    })
  }
}

// Singleton — criado apenas no browser
let _db: FinancasDB | null = null

export function getDB(): FinancasDB {
  if (typeof window === 'undefined') {
    throw new Error('DB só pode ser usado no browser')
  }
  if (!_db) {
    _db = new FinancasDB()
  }
  return _db
}
