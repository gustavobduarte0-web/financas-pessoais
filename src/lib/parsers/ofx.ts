import type { Transaction } from '@/types'
import { parseOFXDate } from '@/lib/utils/date'
import { classify } from '@/lib/classifier'

function extractField(block: string, field: string): string {
  const regex = new RegExp(`<${field}>([^\\r\\n<]*)`)
  const match = regex.exec(block)
  return match ? match[1].trim() : ''
}

function generateId(fitid: string): string {
  return `ofx_${fitid.replace(/[^a-zA-Z0-9]/g, '_')}`
}

export async function parseOFX(file: File): Promise<Transaction[]> {
  // Bradesco OFX uses Windows-1252 encoding
  const buffer = await file.arrayBuffer()
  const decoder = new TextDecoder('windows-1252')
  const content = decoder.decode(buffer)

  const transactions: Transaction[] = []
  const trnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/g
  let match

  while ((match = trnRegex.exec(content)) !== null) {
    const block = match[1]

    const trntype = extractField(block, 'TRNTYPE')
    const dtposted = extractField(block, 'DTPOSTED')
    const trnamtStr = extractField(block, 'TRNAMT')
    const fitid = extractField(block, 'FITID')
    const memo = extractField(block, 'MEMO').trim()

    if (!dtposted || !trnamtStr || !fitid) continue

    const amount = parseFloat(trnamtStr)
    if (isNaN(amount)) continue

    const date = parseOFXDate(dtposted)
    const type = trntype === 'CREDIT' ? 'credit' : 'debit'

    const memoUpper = memo.toUpperCase()

    // Transações de investimento — marcamos mas incluímos
    const isInvestment =
      memoUpper.includes('APL.INVEST') ||
      memoUpper.includes('RESGATE INV') ||
      memoUpper.includes('RENT.INV') ||
      memoUpper.includes('APLICACAO CDB') ||
      memoUpper.includes('RESG.AUTOM.INVEST') ||
      memoUpper.includes('JUROS S/ RD FX')

    // Débito de fatura do cartão — já importado via XLSX
    const isCardPayment = memoUpper.includes('GASTO C CREDITO')

    const { category, confidence } = await classify(memo, type, isInvestment)

    transactions.push({
      id: generateId(fitid),
      date,
      description: memo,
      amount,
      type,
      source: 'conta',
      category,
      categoryConfidence: confidence,
      isInvestment,
      isCardPayment,
      importedAt: new Date(),
    })
  }

  return transactions
}
