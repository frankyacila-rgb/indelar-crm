import { createClient } from '@/lib/supabase/server'
import * as XLSX from 'xlsx'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('sale_details')
    .select('*, lead:leads(code, full_name, stage)')
    .order('created_at', { ascending: false })

  if (error) return new Response('Error', { status: 500 })

  const rows = (data ?? []).map(s => ({
    'Código Lead': s.lead?.code ?? '',
    'Fecha': s.fecha ?? '',
    'Nro. Contrato': s.nro_contrato ?? '',
    'Nombre Cliente': s.nombre_cliente ?? '',
    'DNI / RUC': s.dni_ruc ?? '',
    'Teléfono': s.telefono ?? '',
    'Dirección': s.direccion ?? '',
    'Distrito': s.distrito ?? '',
    'Procedencia': s.procedencia ?? '',
    'Cartera': s.cartera === 'indelar_sac' ? 'Indelar S.A.C.' : 'Corporación Indelar',
    'Categoría Producto': s.categoria_producto ?? '',
    'Detalle Venta': s.detalle_venta ?? '',
    'Monto (S/.)': s.monto ?? '',
    'Comprobante': s.comprobante ?? '',
    'Adelanto (S/.)': s.adelanto ?? '',
    'Forma Pago Adelanto': s.forma_pago_adelanto ?? '',
    'Fecha Adelanto': s.fecha_adelanto ?? '',
    'Saldo (S/.)': s.saldo ?? '',
    'Detracción / Retención': s.detraccion_retencion ?? '',
    'Comisión Arq. (S/.)': s.comision_arq ?? '',
    'Fecha Saldo Final': s.fecha_saldo_final ?? '',
    'Forma Pago Saldo': s.forma_pago_saldo ?? '',
    'Día Entrega': s.dia_entrega ?? '',
    'Proveedor': s.proveedor ?? '',
    'Descripción Compra Proveedor': s.descripcion_compra_proveedor ?? '',
    'Inversión Venta (S/.)': s.inversion_venta ?? '',
    'Costo Instalación (S/.)': s.costo_instalacion ?? '',
    'Costo Transporte (S/.)': s.costo_transporte ?? '',
    'Ganancia Bruta (S/.)': s.ganancia_bruta ?? '',
    'Margen Ganancia (%)': s.margen_ganancia ?? '',
  }))

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows)

  // Ancho de columnas
  ws['!cols'] = Object.keys(rows[0] ?? {}).map(k => ({ wch: Math.max(k.length + 2, 16) }))

  XLSX.utils.book_append_sheet(wb, ws, 'Ventas')

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  const fecha = new Date().toISOString().split('T')[0]
  return new Response(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="ventas-indelar-${fecha}.xlsx"`,
    },
  })
}
