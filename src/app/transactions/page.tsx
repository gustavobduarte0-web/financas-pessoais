'use client'

import { useTransactions } from '@/hooks/useTransactions'
import { TransactionList } from '@/components/transactions/TransactionList'
import { Filters } from '@/components/transactions/Filters'
import { useStore } from '@/store/useStore'

export default function TransactionsPage() {
  const { filter } = useStore()
  const transactions = useTransactions(filter)

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Transações</h1>
        <p className="text-text-secondary text-sm mt-0.5">
          Todas as transações importadas
        </p>
      </div>

      {/* Filters */}
      <Filters />

      {/* List */}
      {transactions === undefined ? (
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-16 bg-bg-card border border-border rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <TransactionList transactions={transactions} />
      )}
    </div>
  )
}
