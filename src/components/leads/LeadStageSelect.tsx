'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { STAGE_LABELS, PIPELINE_STAGES, type LeadStage } from '@/types'

interface Props {
  leadId: string
  currentStage: LeadStage
}

export function LeadStageSelect({ leadId, currentStage }: Props) {
  const [stage, setStage] = useState<LeadStage>(currentStage)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleChange(newStage: string | null) {
    if (!newStage) return
    if (newStage === stage) return

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('leads')
      .update({ stage: newStage, updated_at: new Date().toISOString() })
      .eq('id', leadId)

    if (!error) {
      await supabase.from('activities').insert({
        lead_id: leadId,
        user_id: user?.id,
        type: 'stage_change',
        content: `Etapa cambiada a: ${STAGE_LABELS[newStage as LeadStage]}`,
      })
      setStage(newStage as LeadStage)
      toast.success('Etapa actualizada')
      router.refresh()
    } else {
      toast.error('Error al actualizar la etapa')
    }
    setLoading(false)
  }

  return (
    <Select value={stage} onValueChange={handleChange} disabled={loading}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PIPELINE_STAGES.map((s) => (
          <SelectItem key={s} value={s}>{STAGE_LABELS[s]}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
