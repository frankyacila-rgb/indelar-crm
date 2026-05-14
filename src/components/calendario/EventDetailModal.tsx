'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Trash2, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { EVENT_LABELS, EVENT_COLORS, type CalendarEvent } from './CalendarView'
import { CreateEventModal } from './CreateEventModal'
import Link from 'next/link'

interface Props {
  event: CalendarEvent
  onClose: () => void
  leads: { id: string; full_name: string; quote_number?: string; code: string }[]
}

export function EventDetailModal({ event, onClose, leads }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [editing, setEditing] = useState(false)

  async function handleDelete() {
    const { error } = await supabase.from('calendar_events').delete().eq('id', event.id)
    if (error) { toast.error('Error al eliminar'); return }
    toast.success('Evento eliminado')
    onClose()
    router.refresh()
  }

  if (editing) {
    return (
      <CreateEventModal
        open
        onClose={() => { setEditing(false); onClose() }}
        leads={leads}
        defaultDate={event.event_date}
        initial={{
          id: event.id,
          title: event.title,
          type: event.type,
          lead_id: event.lead_id,
          event_date: event.event_date,
          event_time: event.event_time,
          description: event.description,
          reminder: event.reminder,
        }}
      />
    )
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded font-semibold ${EVENT_COLORS[event.type]}`}>
              {EVENT_LABELS[event.type]}
            </span>
            {event.reminder && <span className="text-sm">🔔</span>}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-base font-bold text-gray-900">{event.title}</p>
          <p className="text-sm text-orange-500 font-medium">
            {new Date(event.event_date + 'T12:00:00').toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            {event.event_time ? ` · ${event.event_time.slice(0, 5)}` : ''}
          </p>
          {event.lead && (
            <Link
              href={`/leads/${event.lead_id}`}
              onClick={onClose}
              className="block text-sm text-blue-600 hover:underline"
            >
              {event.lead.quote_number || event.lead.code} · {event.lead.full_name}
            </Link>
          )}
          {event.description && (
            <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{event.description}</p>
          )}
          <div className="flex items-center justify-between pt-2">
            <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="gap-1.5">
              <Pencil className="w-3.5 h-3.5" /> Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="text-red-500 border-red-200 hover:bg-red-50 gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Eliminar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
