'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'

interface SaleDetailsFormProps {
  leadId: string
  initial?: Record<string, unknown> | null
  defaultValues?: {
    full_name?: string
    phone?: string
    district?: string
    source?: string
    product_interest?: string
  }
}

const FORMAS_PAGO = ['Efectivo', 'Transferencia', 'Yape', 'Plin', 'Tarjeta', 'Cheque', 'Otro']
const COMPROBANTES = ['Factura', 'Boleta', 'Nota de venta', 'Sin comprobante']

export function SaleDetailsForm({ leadId, initial, defaultValues }: SaleDetailsFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(!initial)

  const [form, setForm] = useState({
    fecha: (initial?.fecha as string) ?? new Date().toISOString().split('T')[0],
    nro_contrato: (initial?.nro_contrato as string) ?? '',
    nombre_cliente: (initial?.nombre_cliente as string) ?? defaultValues?.full_name ?? '',
    dni_ruc: (initial?.dni_ruc as string) ?? '',
    telefono: (initial?.telefono as string) ?? defaultValues?.phone ?? '',
    direccion: (initial?.direccion as string) ?? '',
    distrito: (initial?.distrito as string) ?? defaultValues?.district ?? '',
    procedencia: (initial?.procedencia as string) ?? defaultValues?.source ?? '',
    cartera: (initial?.cartera as string) ?? 'indelar_sac',
    categoria_producto: (initial?.categoria_producto as string) ?? defaultValues?.product_interest ?? '',
    detalle_venta: (initial?.detalle_venta as string) ?? '',
    monto: (initial?.monto as string) ?? '',
    comprobante: (initial?.comprobante as string) ?? '',
    adelanto: (initial?.adelanto as string) ?? '',
    forma_pago_adelanto: (initial?.forma_pago_adelanto as string) ?? '',
    fecha_adelanto: (initial?.fecha_adelanto as string) ?? '',
    detraccion_retencion: (initial?.detraccion_retencion as string) ?? '',
    comision_arq: (initial?.comision_arq as string) ?? '',
    fecha_saldo_final: (initial?.fecha_saldo_final as string) ?? '',
    forma_pago_saldo: (initial?.forma_pago_saldo as string) ?? '',
    dia_entrega: (initial?.dia_entrega as string) ?? '',
    proveedor: (initial?.proveedor as string) ?? '',
    descripcion_compra_proveedor: (initial?.descripcion_compra_proveedor as string) ?? '',
    inversion_venta: (initial?.inversion_venta as string) ?? '',
    costo_instalacion: (initial?.costo_instalacion as string) ?? '',
    costo_transporte: (initial?.costo_transporte as string) ?? '',
  })

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const monto = parseFloat(form.monto) || 0
  const adelanto = parseFloat(form.adelanto) || 0
  const inversion = parseFloat(form.inversion_venta) || 0
  const instalacion = parseFloat(form.costo_instalacion) || 0
  const transporte = parseFloat(form.costo_transporte) || 0
  const saldo = Math.max(0, monto - adelanto)
  const ganancia_bruta = monto - inversion - instalacion - transporte
  const margen = monto > 0 ? Math.round((ganancia_bruta / monto) * 100 * 10) / 10 : 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const payload = {
      lead_id: leadId,
      ...form,
      fecha: form.fecha || null,
      fecha_adelanto: form.fecha_adelanto || null,
      fecha_saldo_final: form.fecha_saldo_final || null,
      dia_entrega: form.dia_entrega || null,
      monto: monto || null,
      adelanto: adelanto || null,
      saldo,
      comision_arq: parseFloat(form.comision_arq) || null,
      inversion_venta: inversion || null,
      costo_instalacion: instalacion || null,
      costo_transporte: transporte || null,
      ganancia_bruta,
      margen_ganancia: margen,
    }

    const { error } = initial
      ? await supabase.from('sale_details').update(payload).eq('lead_id', leadId)
      : await supabase.from('sale_details').insert(payload)

    setLoading(false)
    if (error) { toast.error('Error al guardar: ' + error.message); return }
    toast.success('Datos de venta guardados')
    setExpanded(false)
    router.refresh()
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-gray-900"
      >
        <span>{initial ? 'Ver / editar datos de venta' : 'Completar datos de venta'}</span>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {expanded && (
        <form onSubmit={handleSubmit} className="space-y-5 pt-2">

          {/* Datos del contrato */}
          <Section title="Contrato">
            <Row>
              <Field label="Fecha"><Input type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)} /></Field>
              <Field label="Nro. de Contrato"><Input placeholder="IND-2026-001" value={form.nro_contrato} onChange={e => set('nro_contrato', e.target.value)} /></Field>
            </Row>
          </Section>

          {/* Datos del cliente */}
          <Section title="Cliente">
            <Row>
              <Field label="Nombre del cliente"><Input value={form.nombre_cliente} onChange={e => set('nombre_cliente', e.target.value)} /></Field>
              <Field label="DNI / RUC"><Input placeholder="12345678" value={form.dni_ruc} onChange={e => set('dni_ruc', e.target.value)} /></Field>
            </Row>
            <Row>
              <Field label="Teléfono"><Input value={form.telefono} onChange={e => set('telefono', e.target.value)} /></Field>
              <Field label="Dirección"><Input value={form.direccion} onChange={e => set('direccion', e.target.value)} /></Field>
            </Row>
            <Row>
              <Field label="Distrito"><Input value={form.distrito} onChange={e => set('distrito', e.target.value)} /></Field>
              <Field label="Procedencia"><Input placeholder="FB / Instagram / Web / Referido" value={form.procedencia} onChange={e => set('procedencia', e.target.value)} /></Field>
            </Row>
            <Row>
              <Field label="Cartera">
                <Select value={form.cartera} onValueChange={v => v && set('cartera', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="indelar_sac">Indelar S.A.C.</SelectItem>
                    <SelectItem value="corporacion_indelar">Corporación Indelar</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Categoría de producto"><Input value={form.categoria_producto} onChange={e => set('categoria_producto', e.target.value)} /></Field>
            </Row>
            <Field label="Detalle de la venta" full>
              <Textarea rows={2} value={form.detalle_venta} onChange={e => set('detalle_venta', e.target.value)} />
            </Field>
          </Section>

          {/* Económico */}
          <Section title="Económico">
            <Row>
              <Field label="Monto total (S/.)"><Input type="number" value={form.monto} onChange={e => set('monto', e.target.value)} /></Field>
              <Field label="Comprobante">
                <Select value={form.comprobante} onValueChange={v => v && set('comprobante', v)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>{COMPROBANTES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            </Row>
            <Row>
              <Field label="Adelanto (S/.)"><Input type="number" value={form.adelanto} onChange={e => set('adelanto', e.target.value)} /></Field>
              <Field label="Forma de pago adelanto">
                <Select value={form.forma_pago_adelanto} onValueChange={v => v && set('forma_pago_adelanto', v)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>{FORMAS_PAGO.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            </Row>
            <Row>
              <Field label="Fecha del adelanto"><Input type="date" value={form.fecha_adelanto} onChange={e => set('fecha_adelanto', e.target.value)} /></Field>
              <Field label="Saldo (S/.)">
                <div className="px-3 py-2 rounded-md border border-gray-200 bg-gray-50 text-sm font-semibold text-gray-700">
                  S/. {saldo.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </div>
              </Field>
            </Row>
            <Row>
              <Field label="Detracción / Retención"><Input placeholder="%" value={form.detraccion_retencion} onChange={e => set('detraccion_retencion', e.target.value)} /></Field>
              <Field label="Comisión Arq. (S/.)"><Input type="number" value={form.comision_arq} onChange={e => set('comision_arq', e.target.value)} /></Field>
            </Row>
            <Row>
              <Field label="Fecha del saldo final"><Input type="date" value={form.fecha_saldo_final} onChange={e => set('fecha_saldo_final', e.target.value)} /></Field>
              <Field label="Forma de pago saldo">
                <Select value={form.forma_pago_saldo} onValueChange={v => v && set('forma_pago_saldo', v)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>{FORMAS_PAGO.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            </Row>
            <Field label="Día de entrega del trabajo">
              <Input type="date" value={form.dia_entrega} onChange={e => set('dia_entrega', e.target.value)} className="w-full" />
            </Field>
          </Section>

          {/* Proveedor y costos */}
          <Section title="Proveedor y costos">
            <Row>
              <Field label="Proveedor"><Input value={form.proveedor} onChange={e => set('proveedor', e.target.value)} /></Field>
              <Field label="Inversión de venta (S/.)"><Input type="number" value={form.inversion_venta} onChange={e => set('inversion_venta', e.target.value)} /></Field>
            </Row>
            <Field label="Descripción de compra al proveedor" full>
              <Textarea rows={2} value={form.descripcion_compra_proveedor} onChange={e => set('descripcion_compra_proveedor', e.target.value)} />
            </Field>
            <Row>
              <Field label="Costo instalación (S/.)"><Input type="number" value={form.costo_instalacion} onChange={e => set('costo_instalacion', e.target.value)} /></Field>
              <Field label="Costo transporte (S/.)"><Input type="number" value={form.costo_transporte} onChange={e => set('costo_transporte', e.target.value)} /></Field>
            </Row>
          </Section>

          {/* Resultados calculados */}
          {monto > 0 && (
            <Section title="Resultado">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3">
                  <p className="text-xs text-emerald-600 font-medium">Ganancia bruta</p>
                  <p className="text-lg font-bold text-emerald-700">S/. {ganancia_bruta.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="rounded-lg bg-blue-50 border border-blue-100 p-3">
                  <p className="text-xs text-blue-600 font-medium">Margen de ganancia</p>
                  <p className="text-lg font-bold text-blue-700">{margen}%</p>
                </div>
              </div>
            </Section>
          )}

          <div className="flex justify-end pt-2">
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar datos de venta'}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</p>
      {children}
    </div>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={`space-y-1.5 ${full ? 'col-span-2' : ''}`}>
      <Label className="text-xs text-gray-500">{label}</Label>
      {children}
    </div>
  )
}
