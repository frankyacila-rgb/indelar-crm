import { createClient } from '@/lib/supabase/server'
import { FunnelChart } from '@/components/metricas/FunnelChart'
import { SourceChart } from '@/components/metricas/SourceChart'
import { ProductChart } from '@/components/metricas/ProductChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Target, DollarSign, BarChart2, Download } from 'lucide-react'
import { STAGE_LABELS, PRODUCT_LABELS, SOURCE_LABELS, PIPELINE_STAGES } from '@/types'
import { PeriodFilter } from '@/components/metricas/PeriodFilter'
import { Suspense } from 'react'

const MESES = ['','Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

export default async function MetricasPage({ searchParams }: { searchParams: Promise<{ mes?: string; año?: string }> }) {
  const supabase = await createClient()
  const params = await searchParams

  const now = new Date()
  const mes = parseInt(params.mes ?? String(now.getMonth() + 1))
  const año = parseInt(params.año ?? String(now.getFullYear()))

  const mesStr = String(mes).padStart(2, '0')
  const fechaInicio = `${año}-${mesStr}-01`
  const fechaFin = `${año}-${mesStr}-31`

  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .gte('created_at', fechaInicio)
    .lte('created_at', fechaFin + 'T23:59:59')

  const all = leads ?? []

  // KPIs generales
  const total = all.length
  const ganados = all.filter(l => l.stage === 'ganado').length
  const perdidos = all.filter(l => l.stage === 'perdido').length
  const activos = all.filter(l => !['ganado', 'perdido'].includes(l.stage)).length
  const tasaCierre = total > 0 ? Math.round((ganados / total) * 100) : 0
  const valorGanado = all
    .filter(l => l.stage === 'ganado')
    .reduce((s, l) => s + (l.estimated_value ?? 0), 0)
  const valorPipeline = all
    .filter(l => !['ganado', 'perdido'].includes(l.stage))
    .reduce((s, l) => s + (l.estimated_value ?? 0), 0)
  const ticketPromedio = ganados > 0 ? Math.round(valorGanado / ganados) : 0

  // Datos para embudo
  const funnelData = PIPELINE_STAGES.map(stage => ({
    stage: STAGE_LABELS[stage],
    count: all.filter(l => l.stage === stage).length,
    value: all.filter(l => l.stage === stage).reduce((s, l) => s + (l.estimated_value ?? 0), 0),
  }))

  // Datos por origen
  const sourceData = Object.entries(SOURCE_LABELS).map(([key, label]) => ({
    name: label,
    value: all.filter(l => l.source === key).length,
  })).filter(d => d.value > 0)

  // Datos por producto — expande leads con múltiples productos
  const productCount: Record<string, { total: number; ganados: number }> = {}
  for (const lead of all) {
    const products: string[] = lead.product_interest === 'multiple' && lead.address
      ? lead.address.split(', ')
      : [PRODUCT_LABELS[lead.product_interest as keyof typeof PRODUCT_LABELS] ?? lead.product_interest]
    for (const p of products) {
      if (!productCount[p]) productCount[p] = { total: 0, ganados: 0 }
      productCount[p].total++
      if (lead.stage === 'ganado') productCount[p].ganados++
    }
  }
  const productData = Object.entries(productCount)
    .map(([name, d]) => ({ name, ...d }))
    .sort((a, b) => b.total - a.total)

  // Top ventas por monto
  const topVentas = [...all]
    .filter(l => l.estimated_value)
    .sort((a, b) => (b.estimated_value ?? 0) - (a.estimated_value ?? 0))
    .slice(0, 5)

  // Ventas por distrito
  const districtCount: Record<string, { total: number; valor: number }> = {}
  for (const lead of all) {
    const d = lead.district?.trim() || 'Sin distrito'
    if (!districtCount[d]) districtCount[d] = { total: 0, valor: 0 }
    districtCount[d].total++
    districtCount[d].valor += lead.estimated_value ?? 0
  }
  const districtData = Object.entries(districtCount)
    .map(([name, d]) => ({ name, ...d }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8)

  const kpis = [
    {
      label: 'Tasa de cierre',
      value: `${tasaCierre}%`,
      sub: `${ganados} de ${total} leads`,
      icon: Target,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Valor ganado',
      value: `S/. ${valorGanado.toLocaleString('es-PE')}`,
      sub: `${ganados} ventas cerradas`,
      icon: DollarSign,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Pipeline activo',
      value: `S/. ${valorPipeline.toLocaleString('es-PE')}`,
      sub: `${activos} leads en proceso`,
      icon: TrendingUp,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
    },
    {
      label: 'Ticket promedio',
      value: `S/. ${ticketPromedio.toLocaleString('es-PE')}`,
      sub: 'Por venta cerrada',
      icon: BarChart2,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Métricas</h1>
          <p className="text-sm text-gray-500 mt-1">{MESES[mes]} {año} · {all.length} leads</p>
        </div>
        <div className="flex items-center gap-3">
          <Suspense><PeriodFilter /></Suspense>
          <a
            href="/api/export/ventas"
            download
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar ventas (.xlsx)
          </a>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, sub, icon: Icon, color, bg }) => (
          <Card key={label} className="border-gray-200 shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`flex-shrink-0 w-11 h-11 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-xs text-gray-400">{sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Embudo de conversión */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Embudo de conversión</CardTitle>
        </CardHeader>
        <CardContent>
          <FunnelChart data={funnelData} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Por origen */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Leads por origen</CardTitle>
          </CardHeader>
          <CardContent>
            <SourceChart data={sourceData} />
          </CardContent>
        </Card>

        {/* Por producto */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Leads por producto</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductChart data={productData} />
          </CardContent>
        </Card>
      </div>

      {/* Top ventas + Distritos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Monto más alto por venta */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Monto más alto por venta</CardTitle>
          </CardHeader>
          <CardContent>
            {topVentas.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">Sin datos</p>
            ) : (
              <div className="space-y-3">
                {topVentas.map((lead, i) => {
                  const maxVal = topVentas[0].estimated_value ?? 1
                  const pct = Math.round(((lead.estimated_value ?? 0) / maxVal) * 100)
                  return (
                    <div key={lead.id} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-800 truncate">{lead.full_name}</span>
                          <span className="text-sm font-bold text-emerald-600 ml-2 flex-shrink-0">
                            S/. {(lead.estimated_value ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{lead.district || '—'} · {lead.quote_number || lead.code}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ventas por distrito */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Leads por distrito</CardTitle>
          </CardHeader>
          <CardContent>
            {districtData.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">Sin datos</p>
            ) : (
              <div className="space-y-3">
                {districtData.map(({ name, total: count, valor }) => {
                  const maxCount = districtData[0].total
                  const pct = Math.round((count / maxCount) * 100)
                  return (
                    <div key={name} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-800 truncate">{name}</span>
                          <div className="flex items-center gap-3 ml-2 flex-shrink-0">
                            <span className="text-xs text-gray-400">{count} lead{count !== 1 ? 's' : ''}</span>
                            {valor > 0 && <span className="text-xs font-semibold text-blue-600">S/. {valor.toLocaleString('es-PE')}</span>}
                          </div>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabla resumen por etapa */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Resumen por etapa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {funnelData.map(({ stage, count, value }) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0
              return (
                <div key={stage} className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 w-40 flex-shrink-0">{stage}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8 text-right">{count}</span>
                  <span className="text-xs text-gray-400 w-24 text-right">
                    {value > 0 ? `S/. ${value.toLocaleString('es-PE')}` : '—'}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
