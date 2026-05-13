import { createClient } from '@/lib/supabase/server'
import { PipelineBoard } from '@/components/pipeline/PipelineBoard'
import { type Lead } from '@/types'

export default async function PipelinePage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('leads')
    .select('*')
    .not('stage', 'in', '(ganado,perdido)')
    .order('created_at', { ascending: false })

  const leads: Lead[] = data ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pipeline</h1>
        <p className="text-sm text-gray-500 mt-1">
          {leads.length} leads activos — arrastra para cambiar de etapa
        </p>
      </div>
      <PipelineBoard initialLeads={leads} />
    </div>
  )
}
