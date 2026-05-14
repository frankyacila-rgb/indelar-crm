export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { CalendarView } from '@/components/calendario/CalendarView'

export default async function CalendarioPage() {
  const supabase = await createClient()

  const [{ data: events }, { data: leads }] = await Promise.all([
    supabase
      .from('calendar_events')
      .select('*, lead:leads(full_name, quote_number, code)')
      .order('event_date', { ascending: true }),
    supabase
      .from('leads')
      .select('id, full_name, quote_number, code')
      .order('full_name'),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Calendario</h1>
        <p className="text-sm text-gray-500 mt-1">Visitas, instalaciones, entregas y recojos</p>
      </div>
      <CalendarView events={events ?? []} leads={leads ?? []} />
    </div>
  )
}
