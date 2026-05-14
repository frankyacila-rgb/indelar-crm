'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { EVENT_LABELS, EVENT_COLORS } from './CalendarView'

interface Props {
  open: boolean
  onClose: () => void
  leads: { id: string; full_name: string; quote_number?: string; code: string }[]
  defaultDate: string
  initial?: {
    id: string; title: string; type: string; lead_id: string | null
    event_date: string; event_time: string | null; description: string | null; reminder: boolean
  }
}

export function CreateEventModal({ open, onClose, leads, defaultDate, initial }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    type: initial?.type ?? 'visita',
    lead_id: initial?.lead_id ?? '',
    event_date: initial?.event_date ?? defaultDate,
    event_time: initial?.event_time ?? '09:00',
    description: initial?.description ?? '',
    reminder: initial?.reminder ?? true,
  })

  function set(field: string, value: string | boolean | null) {
    setForm(p => ({ ...p, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title) { toast.error('Ingresa un título'); return }
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    const payload = {
      title: form.title,
      type: form.type,
      lead_id: form.lead_id || null,
      event_date: form.event_date,
      event_time: form.event_time || null,
      description: form.description || null,
      reminder: form.reminder,
      assigned_to: user?.id,
    }

    const { error } = initial
      ? await supabase.from('calendar_events').update(payload).eq('id', initial.id)
      : await supabase.from('calendar_events').insert(payload)

    setLoading(false)
    if (error) { toast.error('Error al guardar: ' + error.message); return }
    toast.success(initial ? 'Evento actualizado' : 'Evento creado')
    onClose()
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? 'Editar evento' : 'Nuevo evento'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-1">
          <div className="space-y-1.5">
            <Label>Título *</Label>
            <Input placeholder="Visita a cliente" value={form.title} onChange={e => set('title', e.target.value)} required />
          </div>

          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(EVENT_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => set('type', key)}
                  className={`text-xs py-1.5 rounded-lg border font-medium transition-all ${
                    form.type === key ? EVENT_COLORS[key] + ' border-transparent' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Fecha</Label>
              <Input type="date" value={form.event_date} onChange={e => set('event_date', e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Hora</Label>
              <Input type="time" value={form.event_time} onChange={e => set('event_time', e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Lead relacionado</Label>
            <Select value={form.lead_id || 'none'} onValueChange={v => set('lead_id', v === 'none' ? '' : v)}>
              <SelectTrigger>
                <SelectValue>
                  {form.lead_id
                    ? (() => { const l = leads.find(x => x.id === form.lead_id); return l ? `${l.quote_number ?? l.code} · ${l.full_name}` : 'Ninguno' })()
                    : 'Ninguno (opcional)'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Ninguno</SelectItem>
                {leads.map(l => (
                  <SelectItem key={l.id} value={l.id}>
                    {(l.quote_number ?? l.code)} · {l.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Descripción</Label>
            <Textarea rows={2} placeholder="Detalles del evento..." value={form.description} onChange={e => set('description', e.target.value)} />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="reminder"
              checked={form.reminder}
              onChange={e => set('reminder', e.target.checked)}
              className="accent-orange-500"
            />
            <label htmlFor="reminder" className="text-sm text-gray-600">🔔 Activar recordatorio</label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : initial ? 'Guardar cambios' : 'Crear evento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
