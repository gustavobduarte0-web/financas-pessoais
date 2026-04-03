'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { getDB } from '@/lib/db'
import { getPeriodRange } from '@/lib/utils/date'
import type { FilterState } from '@/types'

export function useTransactions(filter: FilterState) {
  const { from, to } = getPeriodRange(filter.period, filter.dateFrom, filter.dateTo)

  return useLiveQuery(async () => {
    const db = getDB()
    const results = await db.transactions
      .where('date')
      .between(from, to, true, true)
      .reverse()
      .toArray()

    return results.filter((t) => {
      if (filter.source !== 'all' && t.source !== filter.source) return false
      if (filter.category !== 'all' && t.category !== filter.category) return false
      if (filter.search) {
        const s = filter.search.toLowerCase()
        if (!t.description.toLowerCase().includes(s)) return false
      }
      return true
    })
  }, [from.getTime(), to.getTime(), filter.source, filter.category, filter.search])
}
