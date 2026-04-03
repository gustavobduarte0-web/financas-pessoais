'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { formatBRL } from '@/lib/utils/currency'
import type { CategoryTotal } from '@/types'

interface Props {
  data: CategoryTotal[]
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: CategoryTotal }[] }) => {
  if (!active || !payload?.length) return null
  const item = payload[0].payload
  return (
    <div className="bg-bg-elevated border border-border rounded-xl px-3 py-2 shadow-xl text-sm">
      <p className="font-medium text-text-primary">{item.name}</p>
      <p className="text-text-secondary">{formatBRL(item.total)}</p>
      <p className="text-text-muted">{item.percentage.toFixed(1)}%</p>
    </div>
  )
}

const CustomLegend = ({ payload }: { payload?: { value: string; color: string; payload: CategoryTotal }[] }) => {
  if (!payload) return null
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center mt-2">
      {payload.map((entry) => (
        <div key={entry.value} className="flex items-center gap-1.5 text-xs text-text-secondary">
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span>{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export function CategoryPieChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-text-muted text-sm">
        Nenhuma despesa no período
      </div>
    )
  }

  // Show top 8 + "Outros" agrupado
  const top = data.slice(0, 8)
  const rest = data.slice(8)
  const chartData =
    rest.length > 0
      ? [
          ...top,
          {
            categoryId: 'outros' as const,
            name: 'Outros',
            color: '#4B5563',
            total: rest.reduce((s, c) => s + c.total, 0),
            percentage: rest.reduce((s, c) => s + c.percentage, 0),
          },
        ]
      : top

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="45%"
          innerRadius={65}
          outerRadius={105}
          paddingAngle={2}
          dataKey="total"
          nameKey="name"
        >
          {chartData.map((entry) => (
            <Cell key={entry.categoryId} fill={entry.color} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} />
      </PieChart>
    </ResponsiveContainer>
  )
}
