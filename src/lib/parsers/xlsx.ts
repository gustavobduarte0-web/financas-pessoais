import * as XLSX from 'xlsx'
import type { Transaction, Installment } from '@/types'
import { parseBRDate } from '@/lib/utils/date'
import { parseBRLString } from '@/lib/utils/currency'
import { classify } from '@/lib/classifier'

function generateId(date: Date, description: string, amount: number): string {
  const dateStr = `${date.getFullYear()}${date.getMonth()}${date.getDate()}`
  const key = `${dateStr}_${description.substring(0, 20)}_${amount}`
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    const char = key.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return `xlsx_${Math.abs(hash)}`
}

function detectCardHolder(row: (string | undefined)[]): { name: string; card: string } | null {
  const col0 = (row[0] || '').toString().trim()
  // Format: "GUSTAVO B DUARTE - 2723"
  const m = col0.match(/^(.+?)\s*-\s*(\d{4})\s*$/)
  if (!m) return null
  // Must have empty other columns (not a transaction row)
  const col1 = (row[1] || '').toString().trim()
  const col2 = (row[2] || '').toString().trim()
  if (col1 !== '' && !col1.startsWith('Data') && col2 === '') return null
  if (col1 === '') return { name: m[1].trim(), card: m[2] }
  return null
}

function extractInstallment(description: string): { desc: string; installment?: Installment } {
  // Pattern: "DESCRIÇÃO X/Y" at end — e.g. "RENNER 2/2", "BR1*DOMDIGITAL 2/10"
  const m = description.match(/^(.*?)\s+(\d+)\/(\d+)\s*$/)
  if (m && parseInt(m[3]) > 1) {
    return {
      desc: m[1].trim(),
      installment: { current: parseInt(m[2]), total: parseInt(m[3]) },
    }
  }
  return { desc: description }
}

// Tenta parsear data de célula Excel.
// Com cellDates:true, o SheetJS já entrega objetos Date.
// Fallback para string "DD/MM/YYYY" caso a célula seja texto.
function parseXLSXDate(raw: unknown): Date | null {
  if (raw instanceof Date && !isNaN(raw.getTime())) {
    // Normaliza para meia-noite local (SheetJS pode entregar horário UTC)
    return new Date(raw.getFullYear(), raw.getMonth(), raw.getDate())
  }
  if (typeof raw === 'string') return parseBRDate(raw.trim())
  return null
}

// Trata número nativo do Excel (float) ou string no formato BR "1.234,56"
function parseXLSXValue(raw: unknown): number {
  if (typeof raw === 'number') return raw
  if (typeof raw === 'string' && raw.trim() !== '') return parseBRLString(raw.trim())
  return 0
}

export async function parseXLSX(file: File): Promise<Transaction[]> {
  const buffer = await file.arrayBuffer()
  // cellDates: true → SheetJS converte serial dates do Excel em objetos Date automaticamente
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true })
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]

  // raw: true preserva tipos nativos: datas vêm como serial number, valores como float
  const rows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    raw: true,
    defval: '',
  }) as unknown[][]

  const transactions: Transaction[] = []
  let currentCard: string | null = null
  let inTransactions = false

  for (const row of rows) {
    // col0/col1 sempre como string para comparações de texto (header, portador, etc.)
    const col0 = (row[0] ?? '').toString().trim()
    const col1 = (row[1] ?? '').toString().trim()
    const rawVal = row[4]  // Valor(R$) — coluna E (índice 4). Colunas: Data|Histórico|""|Valor(US$)|Valor(R$)

    // Detect cardholder section header: "NAME - XXXX" com col1 vazia
    const holderMatch = col0.match(/^.+?\s*-\s*(\d{4})\s*$/)
    if (holderMatch && col1 === '') {
      currentCard = holderMatch[1]
      inTransactions = false
      continue
    }

    // Column header row
    if (col0 === 'Data' && (col1.startsWith('Hist') || col1 === 'Histórico')) {
      inTransactions = true
      continue
    }

    // Stop at summary sections
    if (
      col0.startsWith('Total') ||
      col0.startsWith('Resumo') ||
      col0 === 'Taxas' ||
      col0 === 'Descrição' ||
      col0 === 'Descricao'
    ) {
      inTransactions = false
      continue
    }

    if (!inTransactions) continue

    // Skip empty or special rows
    if (!col1) continue
    if (col1 === 'SALDO ANTERIOR') continue
    if (col1 === 'PAGTO. POR DEB EM C/C') continue

    // Parsear data: pode ser serial number (Excel date) ou string "DD/MM/YYYY"
    const date = parseXLSXDate(row[0])
    if (!date) continue

    const value = parseXLSXValue(rawVal)
    if (isNaN(value) || value === 0) continue

    // All credit card entries are expenses (debits)
    const amount = -Math.abs(value)

    const { desc, installment } = extractInstallment(col1)
    const { category, confidence } = await classify(desc, 'debit', false)

    transactions.push({
      id: generateId(date, col1, amount),
      date,
      description: desc,
      amount,
      type: 'debit',
      source: 'cartao',
      cardHolder: currentCard ?? undefined,
      category,
      categoryConfidence: confidence,
      isInvestment: false,
      isCardPayment: false,
      installment,
      importedAt: new Date(),
    })
  }

  return transactions
}
