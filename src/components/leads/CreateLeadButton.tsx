'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { PRODUCT_LABELS, SOURCE_LABELS } from '@/types'

export function CreateLeadButton() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    source: '',
    product_interest: '',
    estimated_value: '',
    district: '',
  })

  function handleChange(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.full_name || !form.phone || !form.source || !form.product_interest) {
      toast.error('Completa los campos requeridos')
      return
    }
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    // Generar código correlativo
    const { count } = await supabase.from('leads').select('*', { count: 'exact', head: true })
    const code = `IND-${String((count ?? 0) + 1).padStart(4, '0')}`

    const { error } = await supabase.from('leads').insert({
      code,
      full_name: form.full_name,
      phone: form.phone,
      email: form.email || null,
      source: form.source,
      product_interest: form.product_interest,
      estimated_value: form.estimated_value ? parseFloat(form.estimated_value) : null,
      district: form.district || null,
      stage: 'nuevo',
      assigned_to: user?.id,
    })

    setLoading(false)

    if (error) {
      toast.error('Error al crear el lead')
      return
    }

    toast.success(`Lead ${code} creado correctamente`)
    setOpen(false)
    setForm({ full_name: '', phone: '', email: '', source: '', product_interest: '', estimated_value: '', district: '' })
    router.refresh()
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="bg-orange-500 hover:bg-orange-600">
        <Plus className="w-4 h-4 mr-2" />
        Nuevo Lead
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nuevo Lead</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label>Nombre completo *</Label>
                <Input
                  placeholder="María García"
                  value={form.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Teléfono *</Label>
                <Input
                  placeholder="987654321"
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="maria@email.com"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Origen *</Label>
                <Select value={form.source} onValueChange={(v) => v && handleChange('source', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SOURCE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Producto *</Label>
                <Select value={form.product_interest} onValueChange={(v) => v && handleChange('product_interest', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRODUCT_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Valor estimado (S/.)</Label>
                <Input
                  type="number"
                  placeholder="1200"
                  value={form.estimated_value}
                  onChange={(e) => handleChange('estimated_value', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Distrito</Label>
                <Input
                  placeholder="Miraflores"
                  value={form.district}
                  onChange={(e) => handleChange('district', e.target.value)}
                />
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Crear Lead'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
