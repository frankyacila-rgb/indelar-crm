'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { PipelineColumn } from './PipelineColumn'
import { LeadCard } from './LeadCard'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  type Lead,
  type LeadStage,
  PIPELINE_STAGES,
  STAGE_LABELS,
} from '@/types'

interface PipelineBoardProps {
  initialLeads: Lead[]
}

export function PipelineBoard({ initialLeads }: PipelineBoardProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [activeLeadId, setActiveLeadId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const activeLead = leads.find((l) => l.id === activeLeadId)

  function getLeadsByStage(stage: LeadStage) {
    return leads.filter((l) => l.stage === stage)
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveLeadId(event.active.id as string)
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveLeadId(null)

    if (!over) return

    const leadId = active.id as string

    // over.id puede ser el ID de una columna (stage) o el ID de una card
    // Si es una card, buscamos a qué columna pertenece
    const isStage = PIPELINE_STAGES.includes(over.id as LeadStage)
    const newStage = isStage
      ? (over.id as LeadStage)
      : (leads.find((l) => l.id === over.id)?.stage ?? null)

    if (!newStage) return

    const lead = leads.find((l) => l.id === leadId)
    if (!lead || lead.stage === newStage) return

    // Optimistic update
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, stage: newStage } : l))
    )

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('leads')
      .update({ stage: newStage, updated_at: new Date().toISOString() })
      .eq('id', leadId)

    if (error) {
      // Revert on error
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, stage: lead.stage } : l))
      )
      toast.error('Error al mover el lead')
      return
    }

    await supabase.from('activities').insert({
      lead_id: leadId,
      user_id: user?.id,
      type: 'stage_change',
      content: `Etapa cambiada a: ${STAGE_LABELS[newStage]}`,
    })

    toast.success(`${lead.full_name} → ${STAGE_LABELS[newStage]}`)
    router.refresh()
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-scroll pb-3 [&::-webkit-scrollbar]:h-2.5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb:hover]:bg-gray-500">
        {PIPELINE_STAGES.map((stage) => (
          <PipelineColumn
            key={stage}
            stage={stage}
            leads={getLeadsByStage(stage)}
          />
        ))}
      </div>
      <DragOverlay>
        {activeLead ? <LeadCard lead={activeLead} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  )
}
