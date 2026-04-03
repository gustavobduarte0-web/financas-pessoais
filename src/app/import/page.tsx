'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import * as XLSX from 'xlsx'
import { DropZone } from '@/components/import/DropZone'
import { ImportPreview } from '@/components/import/ImportPreview'
import { parseOFX } from '@/lib/parsers/ofx'
import { parseXLSX } from '@/lib/parsers/xlsx'
import { parsePlanner, isPlannerWorkbook } from '@/lib/parsers/planner'
import { addTransactions } from '@/lib/db/transactions'
import type { Transaction } from '@/types'

type Step = 'upload' | 'preview' | 'success'

interface ParsedResult {
  transactions: Transaction[]
  duplicatesSkipped: number
}

async function detectAndParseXLSX(file: File): Promise<Transaction[]> {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true })
  if (isPlannerWorkbook(workbook)) {
    return parsePlanner(file)
  }
  return parseXLSX(file)
}

export default function ImportPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('upload')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<ParsedResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFiles = async (files: File[]) => {
    setLoading(true)
    setError(null)

    try {
      const allTransactions: Transaction[] = []

      for (const file of files) {
        if (file.name.toLowerCase().endsWith('.ofx')) {
          const txs = await parseOFX(file)
          allTransactions.push(...txs)
        } else if (
          file.name.toLowerCase().endsWith('.xlsx') ||
          file.name.toLowerCase().endsWith('.xls')
        ) {
          const txs = await detectAndParseXLSX(file)
          allTransactions.push(...txs)
        }
      }

      if (allTransactions.length === 0) {
        setError('Nenhuma transação encontrada nos arquivos.')
        return
      }

      setResult({ transactions: allTransactions, duplicatesSkipped: 0 })
      setStep('preview')
    } catch (err) {
      console.error(err)
      setError('Erro ao processar o arquivo. Verifique se o formato é suportado.')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async (editedTransactions: Transaction[]) => {
    if (!result) return
    setSaving(true)
    try {
      const added = await addTransactions(editedTransactions)
      const skipped = editedTransactions.length - added
      setResult((r) => r ? { ...r, transactions: editedTransactions, duplicatesSkipped: skipped } : r)
      setStep('success')
    } catch (err) {
      console.error(err)
      setError('Erro ao salvar as transações.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setResult(null)
    setStep('upload')
    setError(null)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Importar Extrato</h1>
        <p className="text-text-secondary mt-1">
          Bradesco (OFX), fatura do cartão (XLSX) ou Planner pessoal (XLSX)
        </p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2">
        {(['upload', 'preview', 'success'] as Step[]).map((s, i) => {
          const labels = ['Upload', 'Revisão', 'Concluído']
          const done = step === 'preview' ? i === 0 : step === 'success' ? i <= 1 : false
          const active = step === s
          return (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  done
                    ? 'bg-accent-green text-black'
                    : active
                    ? 'bg-accent-purple text-white'
                    : 'bg-bg-elevated text-text-muted'
                }`}
              >
                {done ? '✓' : i + 1}
              </div>
              <span
                className={`text-sm ${active ? 'text-text-primary font-medium' : 'text-text-muted'}`}
              >
                {labels[i]}
              </span>
              {i < 2 && <div className="w-6 h-px bg-border mx-1" />}
            </div>
          )
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Content */}
      {step === 'upload' && (
        <DropZone onFiles={handleFiles} loading={loading} />
      )}

      {step === 'preview' && result && (
        <ImportPreview
          transactions={result.transactions}
          duplicatesSkipped={result.duplicatesSkipped}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          saving={saving}
        />
      )}

      {step === 'success' && (
        <div className="text-center py-12 space-y-4 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-accent-green/10 flex items-center justify-center mx-auto">
            <span className="text-3xl">✓</span>
          </div>
          <h2 className="text-xl font-bold text-text-primary">Importação concluída!</h2>
          <p className="text-text-secondary">
            {result?.transactions.length} transações importadas com sucesso
            {result && result.duplicatesSkipped > 0 && ` (${result.duplicatesSkipped} duplicatas ignoradas)`}
          </p>
          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={handleCancel}
              className="px-6 py-2.5 rounded-xl border border-border text-text-secondary hover:bg-bg-elevated transition-colors font-medium"
            >
              Importar mais
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2.5 rounded-xl bg-accent-purple hover:bg-accent-purple-light text-white font-semibold transition-colors"
            >
              Ver dashboard
            </button>
          </div>
        </div>
      )}

      {/* Tip */}
      {step === 'upload' && (
        <div className="p-4 bg-bg-card border border-border rounded-xl text-sm text-text-secondary space-y-2">
          <p className="font-medium text-text-primary">Formatos suportados:</p>
          <p>
            <span className="text-accent-purple-light">Extrato OFX:</span> Bradesco Internet Banking →
            Extrato → Exportar → Formato OFX
          </p>
          <p>
            <span className="text-blue-400">Fatura XLSX:</span> Bradesco Internet Banking → Cartão →
            Fatura → Exportar → Excel
          </p>
          <p>
            <span className="text-accent-green">Planner XLSX:</span> Planilha pessoal com sheet
            "Lançamentos" — detectada automaticamente
          </p>
        </div>
      )}
    </div>
  )
}
