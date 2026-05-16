'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = [
  '#10b981', // emerald
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#64748b', // slate
  '#ef4444', // red
  '#06b6d4', // cyan
  '#f97316', // orange
  '#ec4899', // pink
  '#84cc16', // lime
]

interface SourceData {
  name: string
  value: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0].payload
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md px-3 py-2 text-xs">
      <p className="font-semibold text-gray-800">{name}</p>
      <p className="text-gray-500 mt-0.5">{value} {value === 1 ? 'lead' : 'leads'}</p>
    </div>
  )
}

export function SourceChart({ data }: { data: SourceData[] }) {
  const filtered = data.filter(d => d.value > 0)

  if (filtered.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-8">Sin datos aún</p>
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={filtered}
          cx="50%"
          cy="45%"
          innerRadius={58}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
        >
          {filtered.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, color: '#6b7280' }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
