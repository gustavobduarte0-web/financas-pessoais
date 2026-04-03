export type CategoryId =
  | 'alimentacao'
  | 'transporte'
  | 'saude'
  | 'vestuario'
  | 'moradia'
  | 'lazer'
  | 'supermercado'
  | 'assinaturas'
  | 'investimentos'
  | 'combustivel'
  | 'hospedagem'
  | 'receita'
  | 'transferencias'
  | 'outros'

export type TransactionSource = 'conta' | 'cartao'
export type TransactionType = 'credit' | 'debit'
export type PeriodFilter = 'month' | '3months' | '6months' | 'all' | 'custom'

export interface Installment {
  current: number
  total: number
}

export interface Subcategory {
  id: string           // gerado: `sub_${timestamp}_${random}`
  name: string
  color: string
  icon: string
  parentId: CategoryId // sempre vinculada a uma categoria base
  createdAt: Date
}

export interface Transaction {
  id: string
  date: Date
  description: string
  amount: number // positive = entrada, negative = saída
  type: TransactionType
  source: TransactionSource
  cardHolder?: string // '2723' | '4761' | '1725'
  category: CategoryId
  subcategoryId?: string // referência a Subcategory.id (opcional)
  categoryConfidence: number // 0–1
  isInvestment: boolean
  isCardPayment: boolean // "Gasto c Credito" no OFX — já está no XLSX
  installment?: Installment
  note?: string
  importedAt: Date
}

export interface Category {
  id: CategoryId
  name: string
  color: string
  icon: string
}

export interface DashboardSummary {
  totalReceitas: number
  totalDespesas: number
  saldo: number
  topCategory: { name: string; amount: number } | null
}

export interface CategoryTotal {
  categoryId: CategoryId
  name: string
  color: string
  total: number
  percentage: number
}

export interface MonthlyTotal {
  month: string // 'Jan', 'Fev', etc.
  year: number
  conta: number
  cartao: number
  receitas: number
}

export interface ImportResult {
  transactions: Transaction[]
  duplicatesSkipped: number
  source: TransactionSource
  fileName: string
}

export interface ClassificationMemory {
  description: string  // chave — uppercase + trim
  category: CategoryId
  subcategoryId?: string
  count: number
  updatedAt: Date
  source?: 'user' | 'ai'  // undefined = legacy (tratado como 'user')
}

export interface FilterState {
  period: PeriodFilter
  source: TransactionSource | 'all'
  category: CategoryId | 'all'
  search: string
  dateFrom?: string // 'YYYY-MM-DD', used when period === 'custom'
  dateTo?: string   // 'YYYY-MM-DD', used when period === 'custom'
}
