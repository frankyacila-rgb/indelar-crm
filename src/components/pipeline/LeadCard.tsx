'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Link from 'next/link'
import { MessageCircle, DollarSign } from 'lucide-react'
import { type Lead, PRODUCT_LABELS, SOURCE_LABELS } from '@/types'
import { cn } from '@/lib/utils'

const SOURCE_ICONS: Record<string, string> = {
  whatsapp:  '💬',
  instagram: '📸',
  facebook:  '📘',
  web:       '🌐',
  referido:  '🤝',
}

interface LeadCardProps {
  lead: Lead
  isDragging?: boolean
}

export function LeadCard({ lead, isDragging = false }: LeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: lead.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'bg-white rounded-lg border border-gray-200 p-3 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-all select-none',
        (isSortableDragging || isDragging) && 'opacity-50 shadow-lg rotate-1 scale-105'
      )}
    >
      {/* Nombre y origen */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-semibold text-gray-900 leading-tight line-clamp-1">
          {lead.full_name}
        </p>
        <span className="text-sm flex-shrink-0" title={SOURCE_LABELS[lead.source]}>
          {SOURCE_ICONS[lead.source] ?? '📌'}
        </span>
      </div>

      {/* Código y producto */}
      <p className="text-xs text-gray-400 mb-2">
        {lead.code} · {PRODUCT_LABELS[lead.product_interest]}
      </p>

      {/* Footer: valor + acciones */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
        {lead.estimated_value ? (
          <div className="flex items-center gap-1 text-xs font-medium text-emerald-600">
            <DollarSign className="w-3 h-3" />
            S/. {lead.estimated_value.toLocaleString('es-PE')}
          </div>
        ) : (
          <span className="text-xs text-gray-300">Sin valor</span>
        )}

        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <a
            href={`https://wa.me/51${lead.phone.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:text-emerald-600 transition-colors"
            title="Abrir WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5" />
          </a>
          <Link
            href={`/leads/${lead.id}`}
            className="text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors"
          >
            Ver →
          </Link>
        </div>
      </div>
    </div>
  )
}
