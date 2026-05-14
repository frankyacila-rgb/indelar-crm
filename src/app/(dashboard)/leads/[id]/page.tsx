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
import { DeleteLeadButton } from '@/components/leads/DeleteLeadButton'
import { EditLeadButton } from '@/components/leads/EditLeadButton'
import { SaleDetailsForm } from '@/components/leads/SaleDetailsForm'

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

  const [leadRes, activitiesRes, saleRes] = await Promise.all([
    supabase.from('leads').select('*').eq('id', id).single(),
    supabase.from('activities').select('*, profile:profiles(full_name)').eq('lead_id', id).order('created_at', { ascending: false }),
    supabase.from('sale_details').select('*').eq('lead_id', id).maybeSingle(),
  ])

  if (!leadRes.data) notFound()

  const lead = leadRes.data
  const activities = activitiesRes.data ?? []
  const saleDetail = saleRes.data ?? null

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
            <span className="text-sm text-gray-400 font-mono">{lead.quote_number || lead.code}</span>
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
          <EditLeadButton lead={lead} />
          <DeleteLeadButton leadId={lead.id} leadName={lead.full_name} />
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
              <div className="flex justify-between items-start">
                <span className="text-gray-500">Producto</span>
                <span className="font-medium text-right max-w-[55%]">
                  {lead.product_interest === 'multiple' && lead.address
                    ? <span className="text-xs leading-relaxed">{lead.address}</span>
                    : PRODUCT_LABELS[lead.product_interest as ProductInterest]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Servicio</span>
                <span className="font-medium">
                  {lead.service_type === 'solo_entrega' ? 'Solo Entrega' : 'Entrega + Instalación'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Origen</span>
                <span className="font-medium">{SOURCE_LABELS[lead.source as LeadSource]}</span>
              </div>
              {lead.estimated_value && (() => {
                const total = lead.estimated_value
                const base = Math.round((total / 1.18) * 100) / 100
                const igv = Math.round((total - base) * 100) / 100
                return (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="font-medium">S/. {base.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">IGV (18%)</span>
                      <span className="font-medium">S/. {igv.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-100 pt-2">
                      <span className="text-gray-700 font-semibold">Total</span>
                      <span className="font-bold text-emerald-600">S/. {total.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </>
                )
              })()}
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

          {/* Datos de venta — solo si está ganado */}
          {lead.stage === 'ganado' && (
            <Card className="border-emerald-200 shadow-sm bg-emerald-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-emerald-700">Datos de venta</CardTitle>
              </CardHeader>
              <CardContent>
                <SaleDetailsForm
                  leadId={lead.id}
                  initial={saleDetail}
                  defaultValues={{
                    full_name: lead.full_name,
                    phone: lead.phone,
                    district: lead.district ?? '',
                    source: lead.source,
                    product_interest: lead.product_interest,
                  }}
                />
              </CardContent>
            </Card>
          )}
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
