'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#10b981', '#8b5cf6', '#3b82f6', '#f59e0b', '#64748b']

interface SourceData {
  name: string
  value: number
}

export function SourceChart({ data }: { data: SourceData[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-8">Sin datos aún</p>
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [value, 'Leads']}
          contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, color: '#6b7280' }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
