'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import type { MonthlyTotal } from '@/types'

interface Props {
  data: MonthlyTotal[]
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { name: string; value: number; fill: string }[]
  label?: string
}) => {
  if (!active || !payload?.length) return null
  const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
  return (
    <div className="bg-bg-elevated border border-border rounded-xl px-3 py-2 shadow-xl text-sm space-y-1">
      <p className="font-medium text-text-primary mb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.fill }} />
          <span className="text-text-secondary">{p.name}:</span>
          <span className="text-text-primary font-medium">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export function MonthlyBarChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-text-muted text-sm">
        Nenhum dado disponível
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} barGap={2} barCategoryGap="30%">
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#2E2E2E"
          vertical={false}
        />
        <XAxis
          dataKey="month"
          tick={{ fill: '#888888', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#888888', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) =>
            v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v}`
          }
          width={50}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff08' }} />
        <Legend
          wrapperStyle={{ paddingTop: 12, fontSize: 12, color: '#888888' }}
        />
        <Bar dataKey="receitas" name="Receitas" fill="#03DAC6" radius={[3, 3, 0, 0]} />
        <Bar dataKey="conta" name="Conta" fill="#820AD1" radius={[3, 3, 0, 0]} />
        <Bar dataKey="cartao" name="Cartão" fill="#3B82F6" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
