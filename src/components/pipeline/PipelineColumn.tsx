'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { LeadCard } from './LeadCard'
import { type Lead, type LeadStage, STAGE_LABELS } from '@/types'

const STAGE_COLORS: Record<LeadStage, { header: string; dot: string }> = {
  nuevo:       { header: 'bg-slate-100',   dot: 'bg-slate-400' },
  contactado:  { header: 'bg-blue-50',     dot: 'bg-blue-500' },
  cotizado:    { header: 'bg-violet-50',   dot: 'bg-violet-500' },
  seguimiento: { header: 'bg-amber-50',    dot: 'bg-amber-500' },
  visita:      { header: 'bg-orange-50',   dot: 'bg-orange-500' },
  ganado:      { header: 'bg-emerald-50',  dot: 'bg-emerald-500' },
  perdido:     { header: 'bg-red-50',      dot: 'bg-red-400' },
}

interface PipelineColumnProps {
  stage: LeadStage
  leads: Lead[]
}

export function PipelineColumn({ stage, leads }: PipelineColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage })
  const colors = STAGE_COLORS[stage]

  const totalValue = leads.reduce((sum, l) => sum + (l.estimated_value ?? 0), 0)

  return (
    <div className="flex-shrink-0 w-64">
      {/* Header de la columna */}
      <div className={`flex items-center justify-between px-3 py-2.5 rounded-t-xl ${colors.header}`}>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            {STAGE_LABELS[stage]}
          </span>
        </div>
        <span className="text-xs font-bold text-gray-500 bg-white rounded-full px-2 py-0.5 shadow-sm">
          {leads.length}
        </span>
      </div>

      {/* Valor total de la columna */}
      {totalValue > 0 && (
        <div className={`px-3 py-1.5 ${colors.header} border-b border-gray-200/50`}>
          <span className="text-xs text-gray-500">
            S/. {totalValue.toLocaleString('es-PE')}
          </span>
        </div>
      )}

      {/* Zona droppable */}
      <div
        ref={setNodeRef}
        className={`min-h-40 rounded-b-xl p-2 space-y-2 transition-colors ${
          isOver ? 'bg-blue-50 ring-2 ring-blue-300 ring-inset' : 'bg-gray-100/60'
        }`}
      >
        <SortableContext items={leads.map((l) => l.id)} strategy={verticalListSortingStrategy}>
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </SortableContext>

        {leads.length === 0 && (
          <div className="flex items-center justify-center h-16 text-xs text-gray-400">
            Sin leads
          </div>
        )}
      </div>
    </div>
  )
}
