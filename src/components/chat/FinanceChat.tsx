'use client'

import { useState, useRef, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { getDB } from '@/lib/db'
import { formatBRL } from '@/lib/utils/currency'
import { Send, Bot, User, Loader2 } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTIONS = [
  'Como foram meus gastos este mês?',
  'Onde estou gastando mais?',
  'Compare meus gastos por categoria',
  'Tenho oportunidades de economia?',
  'Quais são meus maiores gastos?',
  'Qual meu saldo total?',
]

export function FinanceChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const transactions = useLiveQuery(async () => {
    const db = getDB()
    return db.transactions.orderBy('date').toArray()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const buildContext = () => {
    if (!transactions || transactions.length === 0) {
      return { transactions: [], summary: { count: 0 } }
    }

    const txData = transactions.map((t) => ({
      date: t.date.toISOString().slice(0, 10),
      desc: t.description,
      amount: t.amount,
      cat: t.category,
      src: t.source,
    }))

    const byCategory: Record<string, number> = {}
    let totalReceitas = 0
    let totalDespesas = 0

    for (const t of transactions) {
      if (t.amount > 0) totalReceitas += t.amount
      else totalDespesas += Math.abs(t.amount)
      byCategory[t.category] = (byCategory[t.category] ?? 0) + Math.abs(t.amount)
    }

    const sorted = [...transactions].sort((a, b) => a.date.getTime() - b.date.getTime())

    return {
      transactions: txData,
      summary: {
        totalReceitas,
        totalDespesas,
        saldo: totalReceitas - totalDespesas,
        byCategory,
        period: {
          from: sorted[0]?.date.toISOString().slice(0, 10),
          to: sorted[sorted.length - 1]?.date.toISOString().slice(0, 10),
        },
        count: transactions.length,
      },
    }
  }

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content || loading) return

    const userMsg: Message = { role: 'user', content }
    const newMessages: Message[] = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const { transactions: txData, summary } = buildContext()

      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          messages: newMessages,
          transactions: txData,
          summary,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error ?? 'Erro na API')
      }

      const data = await res.json() as { text: string }
      setMessages((prev) => [...prev, { role: 'assistant', content: data.text }])
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido'
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: `Ocorreu um erro: ${msg}. Verifique se a chave ANTHROPIC_API_KEY está configurada.`,
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 && (
          <div className="space-y-6 pt-4">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-accent-purple/20 flex items-center justify-center mx-auto mb-4">
                <Bot size={32} className="text-accent-purple" />
              </div>
              <h2 className="text-xl font-semibold text-text-primary">Assistente Financeiro</h2>
              <p className="text-text-secondary text-sm mt-2">
                Powered by Claude — conheço todos os seus dados financeiros.
              </p>
              {transactions !== undefined && (
                <p className="text-text-muted text-xs mt-1">
                  {transactions.length} transações carregadas
                  {transactions.length > 0 && ` · ${formatBRL(
                    transactions.reduce((s, t) => s + Math.abs(t.amount), 0)
                  )} em movimentações`}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="px-3 py-2 rounded-xl border border-border text-sm text-text-secondary hover:border-accent-purple/50 hover:text-text-primary transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              msg.role === 'user'
                ? 'bg-accent-purple'
                : 'bg-bg-elevated border border-border'
            }`}>
              {msg.role === 'user'
                ? <User size={16} className="text-white" />
                : <Bot size={16} className="text-accent-purple" />
              }
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
              msg.role === 'user'
                ? 'bg-accent-purple text-white rounded-tr-sm'
                : 'bg-bg-card border border-border text-text-primary rounded-tl-sm'
            }`}>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-bg-elevated border border-border flex items-center justify-center">
              <Bot size={16} className="text-accent-purple" />
            </div>
            <div className="bg-bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
              <Loader2 size={14} className="text-text-muted animate-spin" />
              <span className="text-xs text-text-muted">Analisando seus dados...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-border pt-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
            placeholder="Pergunte sobre seus gastos..."
            disabled={loading}
            className="flex-1 px-4 py-3 bg-bg-card border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-purple/50 transition-colors disabled:opacity-50"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="px-4 py-3 rounded-xl bg-accent-purple hover:bg-accent-purple-light disabled:opacity-40 text-white transition-colors flex items-center justify-center"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
