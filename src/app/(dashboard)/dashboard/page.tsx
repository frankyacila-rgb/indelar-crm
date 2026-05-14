import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, TrendingUp, CheckSquare, DollarSign, ArrowRight, ArrowUpRight, CalendarDays } from 'lucide-react'
import { STAGE_LABELS, STAGE_COLORS, PRODUCT_LABELS, SOURCE_LABELS, type Lead } from '@/types'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { CreateLeadButton } from '@/components/leads/CreateLeadButton'

export default async function DashboardPage() {
  const supabase = await createClient()

  const todayStr = new Date().toISOString().split('T')[0]
  const [leadsRes, tasksRes, eventsRes, { data: { user } }] = await Promise.all([
    supabase.from('leads').select('*').order('created_at', { ascending: false }),
    supabase.from('tasks').select('*, lead:leads(code, full_name)').eq('status', 'pending').order('due_date', { ascending: true }).limit(5),
    supabase.from('calendar_events').select('*, lead:leads(full_name, quote_number, code)').gte('event_date', todayStr).order('event_date').order('event_time').limit(5),
    supabase.auth.getUser(),
  ])

  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user?.id ?? '').single()

  const leads: Lead[] = leadsRes.data ?? []
  const tasks = tasksRes.data ?? []
  const upcomingEvents = eventsRes.data ?? []

  const totalLeads = leads.length
  const ganados = leads.filter(l => l.stage === 'ganado').length
  const activos = leads.filter(l => !['ganado', 'perdido'].includes(l.stage)).length
  const valorPipeline = leads
    .filter(l => !['ganado', 'perdido'].includes(l.stage))
    .reduce((sum, l) => sum + (l.estimated_value ?? 0), 0)

  const recentLeads = leads.slice(0, 5)

  const horaPeru = new Date().toLocaleString('en-US', { timeZone: 'America/Lima', hour: 'numeric', hour12: false })
  const hora = parseInt(horaPeru)
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'
  const nombreUsuario = profile?.full_name || user?.email?.split('@')[0] || 'equipo'

  const stats = [
    {
      label: 'Total Leads',
      value: totalLeads,
      icon: Users,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      trend: null,
    },
    {
      label: 'Leads Activos',
      value: activos,
      icon: TrendingUp,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-100',
      trend: null,
    },
    {
      label: 'Cerrados Ganados',
      value: ganados,
      icon: CheckSquare,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-100',
      trend: null,
    },
    {
      label: 'Valor en Pipeline',
      value: `S/. ${valorPipeline.toLocaleString('es-PE')}`,
      icon: DollarSign,
      iconColor: 'text-violet-600',
      iconBg: 'bg-violet-100',
      trend: null,
    },
  ]

  return (
    <div className="space-y-7 max-w-7xl">
      {/* Header con saludo */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400 font-medium">{saludo},</p>
          <h1 className="text-2xl font-bold text-gray-900 capitalize">{nombreUsuario} 👋</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-gray-400">
              {new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{tasks.length} tareas pendientes hoy</p>
          </div>
          <CreateLeadButton />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, iconColor, iconBg }) => (
          <Card key={label} className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${iconColor}`} />
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-300" />
              </div>
              <div className="mt-3">
                <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
                <p className="text-xs text-gray-400 mt-1 font-medium">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Leads recientes — ocupa 3/5 */}
        <Card className="lg:col-span-3 border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3 pt-5 px-5">
            <CardTitle className="text-sm font-semibold text-gray-700">Leads recientes</CardTitle>
            <Link
              href="/leads"
              className="inline-flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 font-medium"
            >
              Ver todos <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent className="px-0 pb-2">
            {recentLeads.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">No hay leads aún</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {recentLeads.map((lead) => (
                  <Link
                    key={lead.id}
                    href={`/leads/${lead.id}`}
                    className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-white">
                          {lead.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                          {lead.full_name}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {PRODUCT_LABELS[lead.product_interest]} · {SOURCE_LABELS[lead.source]}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                      {lead.estimated_value && (
                        <span className="text-xs font-semibold text-gray-600">
                          S/. {lead.estimated_value.toLocaleString('es-PE')}
                        </span>
                      )}
                      <Badge className={`text-xs px-2 ${STAGE_COLORS[lead.stage]}`} variant="secondary">
                        {STAGE_LABELS[lead.stage]}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tareas pendientes — ocupa 2/5 */}
        <Card className="lg:col-span-2 border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3 pt-5 px-5">
            <CardTitle className="text-sm font-semibold text-gray-700">Tareas pendientes</CardTitle>
            <Link
              href="/tareas"
              className="inline-flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 font-medium"
            >
              Ver todas <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent className="px-0 pb-2">
            {tasks.length === 0 ? (
              <div className="text-center py-10">
                <CheckSquare className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Sin tareas pendientes</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {tasks.map((task) => {
                  const overdue = new Date(task.due_date) < new Date()
                  return (
                    <div key={task.id} className="flex items-start gap-3 px-5 py-3">
                      <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${overdue ? 'bg-red-400' : 'bg-amber-400'}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{task.title}</p>
                        {task.lead && (
                          <p className="text-xs text-gray-400 truncate">{task.lead.code} · {task.lead.full_name}</p>
                        )}
                        <p className={`text-xs mt-0.5 font-medium ${overdue ? 'text-red-500' : 'text-gray-400'}`}>
                          {overdue ? '⚠ Vencida · ' : ''}
                          {formatDistanceToNow(new Date(task.due_date), { addSuffix: true, locale: es })}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Próximos eventos */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3 pt-5 px-5">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-orange-500" />
            <CardTitle className="text-sm font-semibold text-gray-700">Próximos eventos</CardTitle>
          </div>
          <Link href="/calendario" className="inline-flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 font-medium">
            Ver todos <ArrowRight className="w-3 h-3" />
          </Link>
        </CardHeader>
        <CardContent className="px-0 pb-2">
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Sin eventos próximos</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {upcomingEvents.map((ev) => {
                const TYPE_COLORS: Record<string, string> = { visita: 'bg-blue-100 text-blue-700', instalacion: 'bg-emerald-100 text-emerald-700', entrega: 'bg-orange-100 text-orange-700', recojo: 'bg-violet-100 text-violet-700' }
                const TYPE_LABELS: Record<string, string> = { visita: 'Visita', instalacion: 'Instalación', entrega: 'Entrega', recojo: 'Recojo' }
                return (
                  <div key={ev.id} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`text-xs px-2 py-0.5 rounded font-semibold flex-shrink-0 ${TYPE_COLORS[ev.type]}`}>{TYPE_LABELS[ev.type]}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{ev.title}</p>
                        {ev.lead && <p className="text-xs text-gray-400 truncate">{ev.lead.quote_number || ev.lead.code} · {ev.lead.full_name}</p>}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 flex-shrink-0 ml-3 text-right">
                      <p className="font-medium">{new Date(ev.event_date + 'T12:00:00').toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}</p>
                      {ev.event_time && <p className="text-gray-400">{ev.event_time.slice(0, 5)}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
