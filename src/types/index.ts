export type UserRole = 'admin' | 'vendedor'

export type LeadSource = 'whatsapp' | 'instagram' | 'tiktok' | 'facebook' | 'web' | 'referido' | 'cliente_indelar'

export type ProductInterest =
  | 'roller_screen'
  | 'roller_screen_motor'
  | 'blackout'
  | 'blackout_motor'
  | 'duo'
  | 'pvc'
  | 'ripplefold'
  | 'alfombra_rollo'
  | 'multiple'

export type LeadStage =
  | 'nuevo'
  | 'contactado'
  | 'cotizado'
  | 'seguimiento'
  | 'visita'
  | 'ganado'
  | 'perdido'

export type TaskPriority = 'low' | 'medium' | 'high'
export type TaskStatus = 'pending' | 'done' | 'overdue'

export type QuoteStatus =
  | 'borrador'
  | 'enviada'
  | 'aceptada'
  | 'rechazada'
  | 'vencida'

export type ActivityType =
  | 'note'
  | 'call'
  | 'whatsapp'
  | 'email'
  | 'stage_change'
  | 'task'
  | 'visit'

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  avatar_url?: string
  whatsapp_number?: string
  created_at: string
}

export interface Lead {
  id: string
  code: string
  full_name: string
  phone: string
  email?: string
  source: LeadSource
  product_interest: ProductInterest
  stage: LeadStage
  assigned_to?: string
  estimated_value?: number
  address?: string
  district?: string
  quote_number?: string
  service_type?: string
  dni_ruc?: string
  lost_reason?: string
  last_contact_at?: string
  created_at: string
  updated_at: string
  profile?: Profile
}

export interface Activity {
  id: string
  lead_id: string
  user_id: string
  type: ActivityType
  content: string
  metadata?: Record<string, unknown>
  created_at: string
  profile?: Profile
}

export interface Task {
  id: string
  lead_id?: string
  assigned_to: string
  title: string
  description?: string
  due_date: string
  priority: TaskPriority
  status: TaskStatus
  created_at: string
  lead?: Pick<Lead, 'id' | 'code' | 'full_name'>
}

export interface QuoteItem {
  id: string
  quote_id: string
  product_type: ProductInterest
  description: string
  width_cm?: number
  height_cm?: number
  quantity: number
  unit_price: number
  total_price: number
}

export interface Quote {
  id: string
  code: string
  lead_id: string
  created_by: string
  status: QuoteStatus
  subtotal: number
  discount_pct: number
  igv: number
  total: number
  valid_until: string
  sent_at?: string
  accepted_at?: string
  notes?: string
  created_at: string
  items?: QuoteItem[]
}

export const STAGE_LABELS: Record<LeadStage, string> = {
  nuevo: 'Nuevo Lead',
  contactado: 'Contactado',
  cotizado: 'Cotización Enviada',
  seguimiento: 'Seguimiento',
  visita: 'Visita Agendada',
  ganado: 'Cerrado Ganado',
  perdido: 'Cerrado Perdido',
}

export const STAGE_COLORS: Record<LeadStage, string> = {
  nuevo: 'bg-slate-100 text-slate-700',
  contactado: 'bg-blue-100 text-blue-700',
  cotizado: 'bg-violet-100 text-violet-700',
  seguimiento: 'bg-amber-100 text-amber-700',
  visita: 'bg-orange-100 text-orange-700',
  ganado: 'bg-emerald-100 text-emerald-700',
  perdido: 'bg-red-100 text-red-700',
}

export const PRODUCT_LABELS: Record<ProductInterest, string> = {
  roller_screen: 'Roller Screen',
  roller_screen_motor: 'Roller Screen Motorizado',
  blackout: 'Roller Blackout',
  blackout_motor: 'Roller Blackout Motorizado',
  duo: 'Roller Duo',
  pvc: 'Puerta PVC',
  ripplefold: 'Cortina Ripplefold',
  alfombra_rollo: 'Alfombra de Rollo',
  multiple: 'Múltiples',
}

export const SOURCE_LABELS: Record<LeadSource, string> = {
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  facebook: 'Facebook Ads',
  web: 'Sitio Web',
  referido: 'Referido',
  cliente_indelar: 'Cliente Indelar',
}

export const PIPELINE_STAGES: LeadStage[] = [
  'nuevo',
  'contactado',
  'cotizado',
  'seguimiento',
  'visita',
  'ganado',
  'perdido',
]
