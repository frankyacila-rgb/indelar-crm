'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const COLORS = ['#94a3b8', '#3b82f6', '#8b5cf6', '#f59e0b', '#f97316', '#10b981', '#ef4444']

interface FunnelData {
  stage: string
  count: number
  value: number
}

export function FunnelChart({ data }: { data: FunnelData[] }) {
  if (data.every(d => d.count === 0)) {
    return <p className="text-sm text-gray-400 text-center py-8">Sin datos aún</p>
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
        <XAxis
          dataKey="stage"
          tick={{ fontSize: 11, fill: '#6b7280' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#6b7280' }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          formatter={(value) => [value, 'Leads']}
          labelStyle={{ fontSize: 12, fontWeight: 600 }}
          contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
        />
        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
