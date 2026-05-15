'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Pencil, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { PRODUCT_LABELS, SOURCE_LABELS, type ProductInterest, type LeadSource } from '@/types'

const DISTRITOS_POR_CIUDAD: Record<string, string[]> = {
  'Lima': [
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
  ],
  'Arequipa': ['Arequipa','Alto Selva Alegre','Cayma','Cerro Colorado','Characato','Hunter','Jacobo Hunter','José Luis Bustamante y Rivero','Mariano Melgar','Miraflores','Mollebaya','Paucarpata','Sachaca','Socabaya','Tiabaya','Uchumayo','Yanahuara','Yarabamba','Yura'],
  'Trujillo': ['Trujillo','El Porvenir','Florencia de Mora','Huanchaco','La Esperanza','Laredo','Moche','Salaverry','Victor Larco Herrera'],
  'Chiclayo': ['Chiclayo','José Leonardo Ortiz','La Victoria','Pimentel','Reque','Santa Rosa','Tumán'],
  'Piura': ['Piura','Castilla','Catacaos','La Arena','La Unión','Las Lomas','Tambo Grande','Veintiséis de Octubre'],
  'Cusco': ['Cusco','Ccorca','Poroy','San Jerónimo','San Sebastián','Santiago','Saylla','Wanchaq'],
  'Huancayo': ['Huancayo','Chilca','El Tambo','Hualhuas','Huancan','Huayucachi','San Agustín','Sapallanga','Sicaya'],
  'Tacna': ['Tacna','Alto de la Alianza','Ciudad Nueva','Inclán','Pocollay','Sama'],
  'Ica': ['Ica','La Tinguiña','Los Aquijes','Parcona','Pueblo Nuevo','San Juan Bautista','Santiago','Subtanjalla'],
  'Cajamarca': ['Cajamarca','Encañada','Jesús','Los Baños del Inca','Magdalena','Namora'],
  'Ayacucho': ['Ayacucho','Carmen Alto','San Juan Bautista','Santiago de Pischa','Socos','Tambillo'],
}

const CIUDADES_PERU = Object.keys(DISTRITOS_POR_CIUDAD).concat(
  ['Iquitos','Chimbote','Juliaca','Pucallpa','Sullana','Chincha Alta',
  'Puno','Huánuco','Tarapoto','Tumbes','Moquegua','Pasco','Abancay',
  'Huaraz','Moyobamba','Puerto Maldonado','Huamachuco','Jaén','Tingo María',
  'Bagua Grande','Chachapoyas','Yurimaguas','Tarma','Huacho','Barranca',
  'Chancay','Huaral','Cañete','Ilo','Juanjuí','Tocache','Satipo','La Oroya']
).filter((v, i, a) => a.indexOf(v) === i).sort()

interface Lead {
  id: string
  full_name: string
  phone: string
  email?: string | null
  source: string
  product_interest: string
  estimated_value?: number | null
  district?: string | null
  city?: string | null
  quote_number?: string | null
  dni_ruc?: string | null
  service_type?: string | null
  address?: string | null
  sale_date?: string | null
}

interface Props {
  lead: Lead
}

export function EditLeadButton({ lead }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    full_name: lead.full_name,
    phone: lead.phone,
    email: lead.email ?? '',
    source: lead.source,
    product_interest: lead.product_interest,
    estimated_value: lead.estimated_value ? String(lead.estimated_value) : '',
    district: lead.district ?? '',
    city: lead.city ?? 'Lima',
    quote_number: lead.quote_number ?? '',
    dni_ruc: lead.dni_ruc ?? '',
    service_type: lead.service_type ?? 'entrega_instalacion',
    sale_date: lead.sale_date ?? '',
  })

  function set(field: string, value: string) {
    setForm(p => ({ ...p, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.full_name || !form.phone || !form.source || !form.product_interest) {
      toast.error('Completa los campos obligatorios')
      return
    }
    setLoading(true)
    const { error } = await supabase.from('leads').update({
      full_name: form.full_name,
      phone: form.phone,
      email: form.email || null,
      source: form.source,
      product_interest: form.product_interest,
      estimated_value: form.estimated_value ? parseFloat(form.estimated_value) : null,
      district: form.district || null,
      city: form.city || null,
      quote_number: form.quote_number || null,
      dni_ruc: form.dni_ruc || null,
      service_type: form.service_type,
      sale_date: form.sale_date || null,
    }).eq('id', lead.id)
    setLoading(false)
    if (error) { toast.error('Error al guardar: ' + error.message); return }
    toast.success('Lead actualizado')
    setOpen(false)
    router.refresh()
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline" size="sm" className="h-8 text-xs gap-1.5">
        <Pencil className="w-3.5 h-3.5" /> Editar lead
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg p-0">
          <div className="overflow-y-auto max-h-[90vh] p-6">
            <DialogHeader>
              <DialogTitle>Editar lead</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <Label>Nombre completo *</Label>
                  <Input value={form.full_name} onChange={e => set('full_name', e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Teléfono *</Label>
                  <Input value={form.phone} onChange={e => set('phone', e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label>DNI / RUC</Label>
                  <Input value={form.dni_ruc} onChange={e => set('dni_ruc', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Nro. de Cotización</Label>
                  <Input value={form.quote_number} onChange={e => set('quote_number', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Origen *</Label>
                  <Select value={form.source} onValueChange={v => v && set('source', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(SOURCE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Monto total (S/.)</Label>
                  <Input type="number" step="0.01" value={form.estimated_value} onChange={e => set('estimated_value', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Ciudad</Label>
                  <select
                    value={form.city}
                    onChange={e => setForm(p => ({ ...p, city: e.target.value, district: '' }))}
                    className="w-full h-9 rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    {CIUDADES_PERU.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Distrito</Label>
                  <select
                    value={form.district}
                    onChange={e => set('district', e.target.value)}
                    disabled={!DISTRITOS_POR_CIUDAD[form.city]}
                    className="w-full h-9 rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50"
                  >
                    <option value="">{DISTRITOS_POR_CIUDAD[form.city] ? 'Seleccionar...' : 'No disponible'}</option>
                    {(DISTRITOS_POR_CIUDAD[form.city] ?? []).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Producto *</Label>
                  <Select value={form.product_interest} onValueChange={v => v && set('product_interest', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(PRODUCT_LABELS).filter(([k]) => k !== 'multiple').map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Tipo de servicio</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[['entrega_instalacion', 'Entrega + Instalación'], ['solo_entrega', 'Solo Entrega']].map(([val, label]) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => set('service_type', val)}
                        className={`py-2 rounded-lg text-sm font-medium border transition-all ${
                          form.service_type === val
                            ? 'bg-orange-500 text-white border-orange-500'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Fecha de venta</Label>
                  <Input type="date" value={form.sale_date} onChange={e => set('sale_date', e.target.value)} />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={loading} className="bg-orange-500 hover:bg-orange-600">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar cambios'}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
