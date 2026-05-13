import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { STAGE_LABELS, STAGE_COLORS, PRODUCT_LABELS, SOURCE_LABELS, type LeadStage, type ProductInterest, type LeadSource } from '@/types'
import { LeadStageSelect } from '@/components/leads/LeadStageSelect'
import { AddActivityForm } from '@/components/leads/AddActivityForm'
import { formatDistanceToNow, format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Phone, MapPin, MessageCircle, Mail, Calendar,
  FileText, PhoneCall, MessageSquare, StickyNote, Repeat, ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'

const ACTIVITY_ICONS = {
  note: StickyNote,
  call: PhoneCall,
  whatsapp: MessageCircle,
  email: Mail,
  stage_change: Repeat,
  task: FileText,
  visit: Calendar,
}

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [leadRes, activitiesRes] = await Promise.all([
    supabase.from('leads').select('*').eq('id', id).single(),
    supabase.from('activities').select('*, profile:profiles(full_name)').eq('lead_id', id).order('created_at', { ascending: false }),
  ])

  if (!leadRes.data) notFound()

  const lead = leadRes.data
  const activities = activitiesRes.data ?? []

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back */}
      <Link href="/leads" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" /> Volver a Leads
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">{lead.full_name}</h1>
            <span className="text-sm text-gray-400 font-mono">{lead.code}</span>
            <Badge className={`text-xs ${STAGE_COLORS[lead.stage as LeadStage]}`} variant="secondary">
              {STAGE_LABELS[lead.stage as LeadStage]}
            </Badge>
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> {lead.phone}
            </span>
            {lead.email && (
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> {lead.email}
              </span>
            )}
            {lead.district && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> {lead.district}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href={`https://wa.me/51${lead.phone.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors"
          >
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda: info + cambio de etapa */}
        <div className="space-y-4">
          {/* Info */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">Información del lead</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Producto</span>
                <span className="font-medium">{PRODUCT_LABELS[lead.product_interest as ProductInterest]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Origen</span>
                <span className="font-medium">{SOURCE_LABELS[lead.source as LeadSource]}</span>
              </div>
              {lead.estimated_value && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Valor estimado</span>
                  <span className="font-medium text-emerald-600">S/. {lead.estimated_value.toLocaleString('es-PE')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Creado</span>
                <span className="font-medium">{format(new Date(lead.created_at), 'dd/MM/yyyy', { locale: es })}</span>
              </div>
            </CardContent>
          </Card>

          {/* Cambiar etapa */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">Etapa del pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <LeadStageSelect leadId={lead.id} currentStage={lead.stage} />
            </CardContent>
          </Card>
        </div>

        {/* Columna derecha: timeline */}
        <div className="lg:col-span-2 space-y-4">
          {/* Agregar actividad */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">Registrar actividad</CardTitle>
            </CardHeader>
            <CardContent>
              <AddActivityForm leadId={lead.id} />
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">
                Historial ({activities.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No hay actividad registrada</p>
              ) : (
                <div className="relative space-y-4">
                  <div className="absolute left-4 top-2 bottom-2 w-px bg-gray-200" />
                  {activities.map((activity) => {
                    const Icon = ACTIVITY_ICONS[activity.type as keyof typeof ACTIVITY_ICONS] ?? StickyNote
                    return (
                      <div key={activity.id} className="flex gap-4 relative">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center z-10">
                          <Icon className="w-3.5 h-3.5 text-gray-500" />
                        </div>
                        <div className="flex-1 pb-2">
                          <p className="text-sm text-gray-900">{activity.content}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {activity.profile?.full_name ?? 'Sistema'} ·{' '}
                            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: es })}
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
      </div>
    </div>
  )
}
