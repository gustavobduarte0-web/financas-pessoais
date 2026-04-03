import { format, startOfMonth, subMonths, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { PeriodFilter } from '@/types'

// "20251201000000[-03:EST]" → Date
export function parseOFXDate(raw: string): Date {
  const s = raw.substring(0, 8) // YYYYMMDD
  const year = parseInt(s.substring(0, 4))
  const month = parseInt(s.substring(4, 6)) - 1
  const day = parseInt(s.substring(6, 8))
  return new Date(year, month, day)
}

// "25/12/2025" → Date
export function parseBRDate(raw: string): Date | null {
  const m = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!m) return null
  return new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1]))
}

export function formatDate(date: Date): string {
  return format(date, 'dd/MM/yyyy', { locale: ptBR })
}

export function formatMonthYear(date: Date): string {
  return format(date, 'MMM/yy', { locale: ptBR })
}

export function formatMonth(date: Date): string {
  return format(date, 'MMM', { locale: ptBR })
}

export function getPeriodRange(
  period: PeriodFilter,
  dateFrom?: string,
  dateTo?: string,
): { from: Date; to: Date } {
  const now = new Date()
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  switch (period) {
    case 'month':
      return { from: startOfMonth(now), to }
    case '3months':
      return { from: startOfMonth(subMonths(now, 2)), to }
    case '6months':
      return { from: startOfMonth(subMonths(now, 5)), to }
    case 'custom': {
      const from = dateFrom ? new Date(dateFrom + 'T00:00:00') : new Date(2000, 0, 1)
      const customTo = dateTo ? new Date(dateTo + 'T23:59:59') : to
      return { from, to: customTo }
    }
    case 'all':
      return { from: new Date(2000, 0, 1), to }
  }
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function startOfDayLocal(date: Date): Date {
  return startOfDay(date)
}
