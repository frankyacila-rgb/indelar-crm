import { createClient } from '@/lib/supabase/server'
import { FinanzasClient } from '@/components/finanzas/FinanzasClient'

export const dynamic = 'force-dynamic'

export default async function FinanzasPage() {
  const supabase = await createClient()

  const { data: entries } = await supabase
    .from('finance_entries')
    .select('*, lead:leads(full_name, quote_number, code)')
    .order('date', { ascending: false })

  const { data: ganadoLeads } = await supabase
    .from('leads')
    .select('id, full_name, estimated_value, quote_number, code')
    .eq('stage', 'ganado')

  const allEntries = entries ?? []
  const ganado = ganadoLeads ?? []

  // IDs already in finance_entries as income linked to leads
  const linkedLeadIds = new Set(
    allEntries.filter(e => e.lead_id && e.type === 'ingreso').map(e => e.lead_id)
  )

  // Auto-generate ingreso entries for ganado leads not yet manually entered
  const autoEntries = ganado
    .filter(l => !linkedLeadIds.has(l.id) && l.estimated_value)
    .map(l => ({
      id: `auto-${l.id}`,
      type: 'ingreso' as const,
      category: 'Venta',
      description: `Venta cerrada · ${l.quote_number || l.code}`,
      amount: l.estimated_value,
      date: new Date().toISOString().split('T')[0],
      lead_id: l.id,
      lead: { full_name: l.full_name, quote_number: l.quote_number, code: l.code },
    }))

  const combined = [
    ...autoEntries,
    ...allEntries,
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const totalIngresos = combined
    .filter(e => e.type === 'ingreso')
    .reduce((s, e) => s + (e.amount ?? 0), 0)

  const totalEgresos = combined
    .filter(e => e.type === 'egreso')
    .reduce((s, e) => s + (e.amount ?? 0), 0)

  const ingresoLeads = [
    ...autoEntries,
    ...allEntries.filter(e => e.lead_id && e.type === 'ingreso'),
  ].reduce((s, e) => s + (e.amount ?? 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Finanzas</h1>
        <p className="text-sm text-gray-500 mt-1">Ingresos y egresos del negocio</p>
      </div>
      <FinanzasClient
        entries={combined}
        totalIngresos={totalIngresos}
        totalEgresos={totalEgresos}
        ingresoLeads={ingresoLeads}
      />
    </div>
  )
}
