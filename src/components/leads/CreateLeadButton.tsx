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
import { PRODUCT_LABELS, SOURCE_LABELS, type ProductInterest } from '@/types'

const DISTRITOS_LIMA = [
  'Ancón','Ate','Barranco','Breña','Carabayllo','Chaclacayo','Chorrillos',
  'Cieneguilla','Comas','El Agustino','Independencia','Jesús María',
  'La Molina','La Victoria','Lince','Los Olivos','Lurigancho','Lurín',
  'Magdalena del Mar','Miraflores','Pachacámac','Pucusana','Pueblo Libre',
  'Puente Piedra','Punta Hermosa','Punta Negra','Rímac','San Bartolo',
  'San Borja','San Isidro','San Juan de Lurigancho','San Juan de Miraflores',
  'San Luis','San Martín de Porres','San Miguel','Santa Anita','Santa María del Mar',
  'Santa Rosa','Santiago de Surco','Surquillo','Villa El Salvador',
  'Villa María del Triunfo','Callao','Bellavista','Carmen de la Legua',
  'La Perla','La Punta','Mi Perú','Ventanilla',
]

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
    estimated_value: '',
    district: '',
  })
  const [selectedProducts, setSelectedProducts] = useState<ProductInterest[]>([])

  function handleChange(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function toggleProduct(p: ProductInterest) {
    setSelectedProducts(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.full_name || !form.phone || !form.source || selectedProducts.length === 0) {
      toast.error('Completa los campos requeridos')
      return
    }
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    const { count } = await supabase.from('leads').select('*', { count: 'exact', head: true })
    const code = `IND-${String((count ?? 0) + 1).padStart(4, '0')}`

    const product_interest = selectedProducts.length === 1 ? selectedProducts[0] : 'multiple'
    const product_notes = selectedProducts.length > 1
      ? selectedProducts.map(p => PRODUCT_LABELS[p]).join(', ')
      : null

    const { error } = await supabase.from('leads').insert({
      code,
      full_name: form.full_name,
      phone: form.phone,
      email: form.email || null,
      source: form.source,
      product_interest,
      address: product_notes,
      estimated_value: form.estimated_value ? parseFloat(form.estimated_value) : null,
      district: form.district || null,
      stage: 'nuevo',
      assigned_to: user?.id,
    })

    setLoading(false)

    if (error) {
      console.error('Insert error:', error)
      toast.error(`Error: ${error.message}`)
      return
    }

    toast.success(`Lead ${code} creado correctamente`)
    setOpen(false)
    setForm({ full_name: '', phone: '', email: '', source: '', estimated_value: '', district: '' })
    setSelectedProducts([])
    router.refresh()
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="bg-orange-500 hover:bg-orange-600">
        <Plus className="w-4 h-4 mr-2" />
        Nuevo Lead
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
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
                <Label>Distrito</Label>
                <Select value={form.district} onValueChange={(v) => v && handleChange('district', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {DISTRITOS_LIMA.map(d => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Producto(s) *</Label>
                <div className="grid grid-cols-2 gap-1.5 p-3 border border-gray-200 rounded-lg bg-gray-50">
                  {(Object.entries(PRODUCT_LABELS) as [ProductInterest, string][])
                    .filter(([k]) => k !== 'multiple')
                    .map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => toggleProduct(value)}
                        className={`text-left text-xs px-2.5 py-1.5 rounded-md border transition-all font-medium ${
                          selectedProducts.includes(value)
                            ? 'bg-orange-500 text-white border-orange-500'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                </div>
                {selectedProducts.length > 1 && (
                  <p className="text-xs text-orange-600 font-medium">
                    {selectedProducts.length} productos seleccionados
                  </p>
                )}
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
