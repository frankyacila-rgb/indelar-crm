'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
]

export function PeriodFilter() {
  const router = useRouter()
  const params = useSearchParams()

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  const selectedMonth = params.get('mes') ?? String(currentMonth)
  const selectedYear = params.get('año') ?? String(currentYear)

  function update(mes: string | null, año: string | null) {
    router.push(`/metricas?mes=${mes ?? selectedMonth}&año=${año ?? selectedYear}`)
  }

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedMonth} onValueChange={v => update(v, selectedYear ?? String(currentYear))}>
        <SelectTrigger className="w-36 h-8 text-sm">
          <SelectValue>{MESES[parseInt(selectedMonth) - 1]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {MESES.map((m, i) => (
            <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={selectedYear} onValueChange={v => update(selectedMonth ?? String(currentMonth), v)}>
        <SelectTrigger className="w-24 h-8 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {years.map(y => (
            <SelectItem key={y} value={String(y)}>{y}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
