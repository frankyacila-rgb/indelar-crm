'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Lead {
  id: string
  code: string
  full_name: string
}

interface CreateTaskButtonProps {
  leads: Lead[]
  userId: string
}

export function CreateTaskButton({ leads, userId }: CreateTaskButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    title: '',
    description: '',
    lead_id: '',
    priority: 'medium',
    due_date: '',
    due_time: '09:00',
  })

  function handleChange(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.due_date) {
      toast.error('Completa título y fecha')
      return
    }
    setLoading(true)

    const due_date = new Date(`${form.due_date}T${form.due_time}:00`)

    const { error } = await supabase.from('tasks').insert({
      title: form.title,
      description: form.description || null,
      lead_id: form.lead_id || null,
      assigned_to: userId,
      priority: form.priority,
      due_date: due_date.toISOString(),
      status: 'pending',
    })

    setLoading(false)

    if (error) {
      toast.error('Error al crear la tarea')
      return
    }

    toast.success('Tarea creada')
    setOpen(false)
    setForm({ title: '', description: '', lead_id: '', priority: 'medium', due_date: '', due_time: '09:00' })
    router.refresh()
  }

  // Fecha mínima = hoy
  const today = new Date().toISOString().split('T')[0]

  return (
    <>
      <Button onClick={() => setOpen(true)} className="bg-orange-500 hover:bg-orange-600">
        <Plus className="w-4 h-4 mr-2" />
        Nueva Tarea
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva Tarea</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Título *</Label>
              <Input
                placeholder="Llamar al cliente para seguimiento"
                value={form.title}
                onChange={e => handleChange('title', e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>Descripción</Label>
              <Textarea
                placeholder="Detalles adicionales..."
                value={form.description}
                onChange={e => handleChange('description', e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Lead relacionado</Label>
              <Select value={form.lead_id} onValueChange={v => handleChange('lead_id', v ?? '')}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar lead (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {leads.map(lead => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.code} · {lead.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Prioridad</Label>
                <Select value={form.priority} onValueChange={v => v && handleChange('priority', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">🔴 Alta</SelectItem>
                    <SelectItem value="medium">🟡 Media</SelectItem>
                    <SelectItem value="low">🟢 Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Fecha *</Label>
                <Input
                  type="date"
                  min={today}
                  value={form.due_date}
                  onChange={e => handleChange('due_date', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Hora</Label>
              <Input
                type="time"
                value={form.due_time}
                onChange={e => handleChange('due_time', e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Crear Tarea'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
