'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const CATEGORIAS_EGRESO = ['Proveedor','Instalación','Transporte','Marketing','Oficina','Salarios','Servicios','Otros']
const CATEGORIAS_INGRESO = ['Venta','Adelanto','Saldo','Otro']

interface Props {
  open: boolean
  onClose: () => void
  defaultType?: 'ingreso' | 'egreso'
}

export function AddEntryModal({ open, onClose, defaultType = 'egreso' }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    type: defaultType,
    category: '' as string,
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  })

  function set(field: string, value: string) {
    setForm(p => ({ ...p, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.description || !form.amount || !form.date) {
      toast.error('Completa todos los campos')
      return
    }
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('finance_entries').insert({
      type: form.type,
      category: form.category || null,
      description: form.description,
      amount: parseFloat(form.amount),
      date: form.date,
      created_by: user?.id,
    })
    setLoading(false)
    if (error) { toast.error('Error: ' + error.message); return }
    toast.success(form.type === 'ingreso' ? 'Ingreso registrado' : 'Egreso registrado')
    onClose()
    router.refresh()
  }

  const categorias = form.type === 'ingreso' ? CATEGORIAS_INGRESO : CATEGORIAS_EGRESO

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Nuevo movimiento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-1">
          <div className="grid grid-cols-2 gap-2">
            {(['ingreso', 'egreso'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => { set('type', t); set('category', '') }}
                className={`py-2 rounded-lg text-sm font-semibold border transition-all capitalize ${
                  form.type === t
                    ? t === 'ingreso' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-red-500 text-white border-red-500'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                {t === 'ingreso' ? '↑ Ingreso' : '↓ Egreso'}
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label>Categoría</Label>
            <Select value={form.category} onValueChange={(v) => set('category', v ?? '')}>
              <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
              <SelectContent>
                {categorias.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Descripción *</Label>
            <Input placeholder="Ej: Pago a proveedor cortinas" value={form.description} onChange={e => set('description', e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Monto (S/.) *</Label>
              <Input type="number" step="0.01" placeholder="0.00" value={form.amount} onChange={e => set('amount', e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Fecha *</Label>
              <Input type="date" value={form.date} onChange={e => set('date', e.target.value)} required />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading}
              className={form.type === 'ingreso' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Registrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
