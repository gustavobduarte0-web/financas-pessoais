'use client'

import { create } from 'zustand'
import type { FilterState, PeriodFilter } from '@/types'

interface Store {
  filter: FilterState
  setFilter: (filter: Partial<FilterState>) => void
  setPeriod: (period: PeriodFilter) => void
}

export const useStore = create<Store>((set) => ({
  filter: {
    period: 'all',
    source: 'all',
    category: 'all',
    search: '',
    dateFrom: undefined,
    dateTo: undefined,
  },
  setFilter: (partial) =>
    set((state) => ({ filter: { ...state.filter, ...partial } })),
  setPeriod: (period) =>
    set((state) => ({ filter: { ...state.filter, period } })),
}))
