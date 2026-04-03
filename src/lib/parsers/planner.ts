import * as XLSX from 'xlsx'
import type { Transaction, CategoryId, TransactionType } from '@/types'
import { classify } from '@/lib/classifier'

// Columns: Data do evento | Data efetivação | Categoria | Subcategoria |
//          Inst. Financeira | Cartão de crédito | Descrição | Valor | Status

// Detect if an xlsx buffer is in Planner format (has "Lançamentos" sheet with expected header)
export function isPlannerWorkbook(workbook: XLSX.WorkBook): boolean {
  if (!workbook.SheetNames.includes('Lançamentos')) return false
  const ws = workbook.Sheets['Lançamentos']
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' }) as string[][]
  if (!rows[0]) return false
  const header = rows[0].map((c) => c.toString().toLowerCase())
  return header.some((h) => h.includes('data do evento')) &&
         header.some((h) => h.includes('valor'))
}

// Mapeamento categoria Planner → CategoryId do app
// Subcategoria tem prioridade sobre categoria principal
const SUBCAT_MAP: Record<string, CategoryId> = {
  'mercado': 'supermercado',
  'combustível': 'combustivel',
  'combustivel': 'combustivel',
  'academia': 'saude',
  'farmácia': 'saude',
  'farmacia': 'saude',
  'hotel': 'hospedagem',
  'assinaturas': 'assinaturas',
  'roupa': 'vestuario',
  'acessórios': 'vestuario',
  'acessorios': 'vestuario',
  'pedágio': 'transporte',
  'pedagio': 'transporte',
  'estacionamento': 'transporte',
  'restaurante': 'alimentacao',
  'ifood': 'alimentacao',
  'padaria': 'alimentacao',
  'vale-refeição': 'alimentacao',
  'vale-refeicao': 'alimentacao',
  'auxílio mobilidade': 'transporte',
  'auxilio mobilidade': 'transporte',
  'aluguel': 'moradia',
  'garagem': 'moradia',
  'carne': 'moradia',
  'faxina': 'moradia',
  'cozinheira': 'moradia',
  'auxílio home office': 'moradia',
  'auxilio home office': 'moradia',
}

const CATEGORY_MAP: Record<string, CategoryId> = {
  'comida': 'alimentacao',
  'rolê': 'lazer',
  'role': 'lazer',
  'transporte': 'transporte',
  'saúde': 'saude',
  'saude': 'saude',
  'moradia': 'moradia',
  'viagem': 'hospedagem',
  'salário': 'receita',
  'salario': 'receita',
  'renda extra': 'receita',
  'mei': 'transferencias',
  'swile': 'alimentacao',
  'educação': 'outros',
  'educacao': 'outros',
  'gastos extras': 'outros',
}

function mapPlannerCategory(cat: string, subcat: string): CategoryId | null {
  const subNorm = subcat.toLowerCase().trim()
  if (subNorm && subNorm !== '-' && SUBCAT_MAP[subNorm]) return SUBCAT_MAP[subNorm]
  const catNorm = cat.toLowerCase().trim()
  return CATEGORY_MAP[catNorm] ?? null
}

function generateId(date: Date, description: string, amount: number): string {
  const key = `planner_${date.getFullYear()}${date.getMonth()}${date.getDate()}_${description.substring(0, 20)}_${amount}`
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    const char = key.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return `planner_${Math.abs(hash)}`
}

function parseDate(raw: unknown): Date | null {
  if (raw instanceof Date && !isNaN(raw.getTime())) {
    return new Date(raw.getFullYear(), raw.getMonth(), raw.getDate())
  }
  if (typeof raw === 'string') {
    const parts = raw.split('/')
    if (parts.length === 3) {
      const [d, m, y] = parts.map(Number)
      if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
        return new Date(y, m - 1, d)
      }
    }
  }
  return null
}

function parseAmount(raw: unknown): number | null {
  if (typeof raw === 'number') return raw
  if (typeof raw === 'string' && raw.trim() !== '') {
    const n = parseFloat(raw.replace(',', '.').replace(/[^\d.-]/g, ''))
    return isNaN(n) ? null : n
  }
  return null
}

export async function parsePlanner(file: File): Promise<Transaction[]> {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true })

  const ws = workbook.Sheets['Lançamentos']
  if (!ws) throw new Error('Sheet "Lançamentos" não encontrada no arquivo Planner.')

  const rows = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    raw: true,
    defval: '',
  }) as unknown[][]

  const transactions: Transaction[] = []

  // Skip header row (index 0)
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]

    // Col indices: 0=Data evento, 2=Categoria, 3=Subcategoria,
    //              5=Cartão, 6=Descrição, 7=Valor
    const rawDate   = row[0]
    const categoria = (row[2] ?? '').toString().trim()
    const subcat    = (row[3] ?? '').toString().trim()
    const cartao    = (row[5] ?? '').toString().trim()
    const descricao = (row[6] ?? '').toString().trim()
    const rawValor  = row[7]

    if (!descricao || rawValor === '' || rawValor === undefined || rawValor === null) continue

    const date = parseDate(rawDate)
    if (!date) continue

    const amount = parseAmount(rawValor)
    if (amount === null || amount === 0) continue

    const type: TransactionType = amount >= 0 ? 'credit' : 'debit'
    const isInvestment = categoria.toLowerCase().includes('invest')
    const source = cartao && cartao !== '-' ? 'cartao' as const : 'conta' as const

    // Try category mapping from Planner first (confidence 0.85)
    const mappedCategory = mapPlannerCategory(categoria, subcat)

    let category: CategoryId
    let confidence: number

    if (mappedCategory) {
      category = mappedCategory
      confidence = 0.85
    } else {
      // Fall back to keyword classifier
      const result = await classify(descricao, type, isInvestment)
      category = result.category
      confidence = result.confidence
    }

    transactions.push({
      id: generateId(date, descricao, amount),
      date,
      description: descricao,
      amount,
      type,
      source,
      category,
      categoryConfidence: confidence,
      isInvestment,
      isCardPayment: false,
      importedAt: new Date(),
    })
  }

  return transactions
}
