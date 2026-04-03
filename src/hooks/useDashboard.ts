'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { getDB } from '@/lib/db'
import { getPeriodRange, formatMonthYear } from '@/lib/utils/date'
import { getCategoryName, getCategoryColor } from '@/lib/classifier/categories'
import type {
  FilterState,
  DashboardSummary,
  CategoryTotal,
  MonthlyTotal,
  CategoryId,
} from '@/types'
import { subMonths, startOfMonth } from 'date-fns'

function isExpense(t: { isInvestment: boolean; isCardPayment: boolean; amount: number }) {
  return !t.isInvestment && !t.isCardPayment && t.amount < 0
}

function isIncome(t: { isInvestment: boolean; isCardPayment: boolean; type: string; amount: number }) {
  return !t.isInvestment && t.type === 'credit' && t.amount > 0
}

export function useDashboard(filter: Pick<FilterState, 'period' | 'dateFrom' | 'dateTo'>) {
  const { from, to } = getPeriodRange(filter.period, filter.dateFrom, filter.dateTo)

  const data = useLiveQuery(async () => {
    const db = getDB()
    const transactions = await db.transactions
      .where('date')
      .between(from, to, true, true)
      .toArray()

    // Summary
    const receitas = transactions.filter(isIncome).reduce((s, t) => s + t.amount, 0)
    const despesas = transactions.filter(isExpense).reduce((s, t) => s + Math.abs(t.amount), 0)
    const saldo = receitas - despesas

    // Category totals (expenses only)
    const catMap = new Map<CategoryId, number>()
    for (const t of transactions) {
      if (!isExpense(t)) continue
      catMap.set(t.category, (catMap.get(t.category) ?? 0) + Math.abs(t.amount))
    }

    const sortedCats = Array.from(catMap.entries())
      .sort((a, b) => b[1] - a[1])

    const categoryTotals: CategoryTotal[] = sortedCats.map(([id, total]) => ({
      categoryId: id,
      name: getCategoryName(id),
      color: getCategoryColor(id),
      total,
      percentage: despesas > 0 ? (total / despesas) * 100 : 0,
    }))

    const topCategory =
      sortedCats.length > 0
        ? { name: getCategoryName(sortedCats[0][0]), amount: sortedCats[0][1] }
        : null

    const summary: DashboardSummary = { totalReceitas: receitas, totalDespesas: despesas, saldo, topCategory }

    // Monthly totals (last 6 months)
    const months: MonthlyTotal[] = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i))
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 23, 59, 59)

      const monthTxs = await db.transactions
        .where('date')
        .between(monthStart, monthEnd, true, true)
        .toArray()

      const contaExp = monthTxs.filter((t) => isExpense(t) && t.source === 'conta')
        .reduce((s, t) => s + Math.abs(t.amount), 0)
      const cartaoExp = monthTxs.filter((t) => isExpense(t) && t.source === 'cartao')
        .reduce((s, t) => s + Math.abs(t.amount), 0)
      const rec = monthTxs.filter(isIncome).reduce((s, t) => s + t.amount, 0)

      months.push({
        month: formatMonthYear(monthStart),
        year: monthStart.getFullYear(),
        conta: contaExp,
        cartao: cartaoExp,
        receitas: rec,
      })
    }

    return { summary, categoryTotals, monthlyTotals: months, total: transactions.length }
  }, [from.getTime(), to.getTime()])

  return data
}
