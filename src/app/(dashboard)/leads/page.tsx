export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { LeadsTable } from '@/components/leads/LeadsTable'
import { CreateLeadButton } from '@/components/leads/CreateLeadButton'
import type { Lead } from '@/types'

export default async function LeadsPage() {
  const supabase = await createClient()
  const { data, error, count } = await supabase
    .from('leads')
    .select('*, profile:profiles(full_name, avatar_url)', { count: 'exact' })
    .order('created_at', { ascending: false })

  console.log('leads data:', data?.length, 'error:', error, 'count:', count)

  const leads: Lead[] = data ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-sm text-gray-500 mt-1">{leads.length} leads en total</p>
        </div>
        <CreateLeadButton />
      </div>
      <LeadsTable leads={leads} />
    </div>
  )
}
