'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CreateEventModal } from './CreateEventModal'
import { EventDetailModal } from './EventDetailModal'

export const EVENT_COLORS: Record<string, string> = {
  visita:      'bg-blue-500 text-white',
  instalacion: 'bg-emerald-500 text-white',
  entrega:     'bg-orange-500 text-white',
  recojo:      'bg-violet-500 text-white',
}

export const EVENT_LABELS: Record<string, string> = {
  visita:      'Visita',
  instalacion: 'Instalación',
  entrega:     'Entrega',
  recojo:      'Recojo',
}

export interface CalendarEvent {
  id: string
  title: string
  type: string
  lead_id: string | null
  event_date: string
  event_time: string | null
  description: string | null
  reminder: boolean
  lead?: { full_name: string; quote_number?: string; code: string } | null
}

interface Props {
  events: CalendarEvent[]
  leads: { id: string; full_name: string; quote_number?: string; code: string }[]
}

export function CalendarView({ events, leads }: Props) {
  const today = new Date()
  const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth() })
  const [createOpen, setCreateOpen] = useState(false)
  const [createDate, setCreateDate] = useState<string | null>(null)
  const [selected, setSelected] = useState<CalendarEvent | null>(null)

  const firstDay = new Date(current.year, current.month, 1).getDay()
  const daysInMonth = new Date(current.year, current.month + 1, 0).getDate()
  const prevMonth = () => setCurrent(c => c.month === 0 ? { year: c.year - 1, month: 11 } : { ...c, month: c.month - 1 })
  const nextMonth = () => setCurrent(c => c.month === 11 ? { year: c.year + 1, month: 0 } : { ...c, month: c.month + 1 })

  const monthName = new Date(current.year, current.month).toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })

  function eventsForDay(day: number) {
    const dateStr = `${current.year}-${String(current.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.filter(e => e.event_date === dateStr)
  }

  function handleDayClick(day: number) {
    const dateStr = `${current.year}-${String(current.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    setCreateDate(dateStr)
    setCreateOpen(true)
  }

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const upcoming = events
    .filter(e => e.event_date >= todayStr)
    .sort((a, b) => a.event_date.localeCompare(b.event_date) || (a.event_time ?? '').localeCompare(b.event_time ?? ''))
    .slice(0, 8)

  return (
    <div className="flex gap-5">
      {/* Calendario */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            </button>
            <h2 className="text-base font-bold text-gray-800 capitalize">{monthName}</h2>
            <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <Button onClick={() => { setCreateDate(todayStr); setCreateOpen(true) }} className="bg-orange-500 hover:bg-orange-600 h-8 text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" /> Nuevo evento
          </Button>
        </div>

        {/* Días semana */}
        <div className="grid grid-cols-7 mb-2">
          {['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'].map(d => (
            <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-xl overflow-hidden">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-gray-50 min-h-[80px]" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dayEvents = eventsForDay(day)
            const dateStr = `${current.year}-${String(current.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const isToday = dateStr === todayStr
            return (
              <div
                key={day}
                onClick={() => handleDayClick(day)}
                className="bg-white min-h-[80px] p-1.5 cursor-pointer hover:bg-orange-50 transition-colors group"
              >
                <span className={`inline-flex w-6 h-6 items-center justify-center rounded-full text-xs font-semibold mb-1 ${
                  isToday ? 'bg-orange-500 text-white' : 'text-gray-700 group-hover:text-orange-600'
                }`}>
                  {day}
                </span>
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 3).map(ev => (
                    <div
                      key={ev.id}
                      onClick={e => { e.stopPropagation(); setSelected(ev) }}
                      className={`text-[10px] px-1.5 py-0.5 rounded font-medium truncate cursor-pointer ${EVENT_COLORS[ev.type]}`}
                    >
                      {ev.event_time ? ev.event_time.slice(0, 5) + ' ' : ''}{ev.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-[10px] text-gray-400 pl-1">+{dayEvents.length - 3} más</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Leyenda */}
        <div className="flex items-center gap-4 mt-4">
          {Object.entries(EVENT_LABELS).map(([key, label]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${EVENT_COLORS[key].split(' ')[0]}`} />
              <span className="text-xs text-gray-500">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Panel lateral — próximos eventos */}
      <div className="w-64 shrink-0 space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Próximos eventos</h3>
        {upcoming.length === 0 ? (
          <p className="text-xs text-gray-400">Sin eventos próximos</p>
        ) : (
          <div className="space-y-2">
            {upcoming.map(ev => (
              <div
                key={ev.id}
                onClick={() => setSelected(ev)}
                className="bg-white rounded-xl border border-gray-200 p-3 cursor-pointer hover:border-orange-300 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${EVENT_COLORS[ev.type]}`}>
                    {EVENT_LABELS[ev.type]}
                  </span>
                  {ev.reminder && <span className="text-[10px] text-gray-400">🔔</span>}
                </div>
                <p className="text-sm font-medium text-gray-800 truncate">{ev.title}</p>
                {ev.lead && (
                  <p className="text-xs text-gray-400 truncate">{ev.lead.quote_number || ev.lead.code} · {ev.lead.full_name}</p>
                )}
                <p className="text-xs text-orange-500 font-medium mt-1">
                  {new Date(ev.event_date + 'T12:00:00').toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' })}
                  {ev.event_time ? ` · ${ev.event_time.slice(0, 5)}` : ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {createOpen && (
        <CreateEventModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          leads={leads}
          defaultDate={createDate ?? todayStr}
        />
      )}

      {selected && (
        <EventDetailModal
          event={selected}
          onClose={() => setSelected(null)}
          leads={leads}
        />
      )}
    </div>
  )
}
