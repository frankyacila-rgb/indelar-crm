import { createClient } from '@/lib/supabase/server'
import { FinanzasClient } from '@/components/finanzas/FinanzasClient'

export const dynamic = 'force-dynamic'

export default async function FinanzasPage() {
  const supabase = await createClient()

  const { data: entries } = await supabase
    .from('finance_entries')
    .select('*, lead:leads(full_name, quote_number, code)')
    .order('date', { ascending: false })

  const allEntries = entries ?? []

  const totalIngresos = allEntries
    .filter(e => e.type === 'ingreso')
    .reduce((s, e) => s + (e.amount ?? 0), 0)

  const totalEgresos = allEntries
    .filter(e => e.type === 'egreso')
    .reduce((s, e) => s + (e.amount ?? 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Finanzas</h1>
        <p className="text-sm text-gray-500 mt-1">Ingresos y egresos del negocio</p>
      </div>
      <FinanzasClient
        entries={allEntries}
        totalIngresos={totalIngresos}
        totalEgresos={totalEgresos}
        ingresoLeads={0}
      />
    </div>
  )
}
