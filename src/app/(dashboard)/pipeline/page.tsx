import { createClient } from '@/lib/supabase/server'
import { PipelineBoard } from '@/components/pipeline/PipelineBoard'
import { type Lead } from '@/types'

export default async function PipelinePage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })

  const leads: Lead[] = data ?? []
  const activos = leads.filter(l => !['ganado', 'perdido'].includes(l.stage)).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pipeline</h1>
        <p className="text-sm text-gray-500 mt-1">
          {activos} leads activos · {leads.length} en total — arrastra para cambiar de etapa
        </p>
      </div>
      <PipelineBoard initialLeads={leads} />
    </div>
  )
}
