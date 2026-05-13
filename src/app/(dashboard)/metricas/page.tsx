import { createClient } from '@/lib/supabase/server'
import { FunnelChart } from '@/components/metricas/FunnelChart'
import { SourceChart } from '@/components/metricas/SourceChart'
import { ProductChart } from '@/components/metricas/ProductChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Target, DollarSign, BarChart2 } from 'lucide-react'
import { STAGE_LABELS, PRODUCT_LABELS, SOURCE_LABELS, PIPELINE_STAGES } from '@/types'

export default async function MetricasPage() {
  const supabase = await createClient()

  const { data: leads } = await supabase.from('leads').select('*')
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

  // Datos por producto
  const productData = Object.entries(PRODUCT_LABELS).map(([key, label]) => ({
    name: label,
    total: all.filter(l => l.product_interest === key).length,
    ganados: all.filter(l => l.product_interest === key && l.stage === 'ganado').length,
  })).filter(d => d.total > 0)

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Métricas</h1>
        <p className="text-sm text-gray-500 mt-1">Análisis del pipeline comercial</p>
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
