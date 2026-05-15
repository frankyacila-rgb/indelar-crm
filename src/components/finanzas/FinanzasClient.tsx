'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, TrendingUp, TrendingDown, Scale, Pencil } from 'lucide-react'
import { AddEntryModal } from './AddEntryModal'
import { toast } from 'sonner'
import Link from 'next/link'

interface Entry {
  id: string
  type: 'ingreso' | 'egreso'
  category: string | null
  description: string
  amount: number
  date: string
  lead_id: string | null
  account: string | null
  lead?: { full_name: string; quote_number?: string; code: string } | null
}

interface Lead {
  id: string
  full_name: string
  quote_number?: string | null
  code: string
}

interface Props {
  entries: Entry[]
  totalIngresos: number
  totalEgresos: number
  ingresoLeads: number
  leads: Lead[]
}

function EntryRow({ e, onEdit, onDelete }: {
  e: Entry
  onEdit: (e: Entry) => void
  onDelete: (id: string) => void
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-1.5 h-7 rounded-full flex-shrink-0 ${e.type === 'ingreso' ? 'bg-emerald-400' : 'bg-red-400'}`} />
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{e.description}</p>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 flex-wrap mt-0.5">
            {e.category && <span className="bg-gray-100 px-1.5 py-0.5 rounded">{e.category}</span>}
            {e.account && <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{e.account}</span>}
            <span>{new Date(e.date + 'T12:00:00').toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            {e.lead && (
              <Link href={`/leads/${e.lead_id}`} className="text-blue-500 hover:underline truncate">
                {e.lead.quote_number || e.lead.code} · {e.lead.full_name}
              </Link>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 ml-2 flex-shrink-0">
        <span className={`text-sm font-bold ${e.type === 'ingreso' ? 'text-emerald-600' : 'text-red-500'}`}>
          {e.type === 'ingreso' ? '+' : '-'} S/. {e.amount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
        </span>
        <button onClick={() => onEdit(e)} className="text-gray-300 hover:text-blue-400 transition-colors">
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => { if (confirm('¿Eliminar este movimiento?')) onDelete(e.id) }} className="text-gray-300 hover:text-red-400 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

export function FinanzasClient({ entries, totalIngresos, totalEgresos, ingresoLeads, leads }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [defaultType, setDefaultType] = useState<'ingreso' | 'egreso'>('egreso')
  const [editEntry, setEditEntry] = useState<Entry | null>(null)

  const balance = totalIngresos - totalEgresos

  async function handleDelete(id: string) {
    const { error } = await supabase.from('finance_entries').delete().eq('id', id)
    if (error) { toast.error('Error al eliminar'); return }
    toast.success('Movimiento eliminado')
    router.refresh()
  }

  function openCreate(type: 'ingreso' | 'egreso') {
    setEditEntry(null)
    setDefaultType(type)
    setModalOpen(true)
  }

  function openEdit(entry: Entry) {
    setEditEntry(entry)
    setModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-sm font-medium text-gray-500">Total Ingresos</p>
          </div>
          <p className="text-2xl font-bold text-emerald-600">S/. {totalIngresos.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
          <p className="text-xs text-gray-400 mt-1">Ingresos registrados manualmente</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-red-500" />
            </div>
            <p className="text-sm font-medium text-gray-500">Total Egresos</p>
          </div>
          <p className="text-2xl font-bold text-red-500">S/. {totalEgresos.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
          <p className="text-xs text-gray-400 mt-1">Gastos registrados manualmente</p>
        </div>

        <div className={`rounded-2xl border shadow-sm p-5 ${balance >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${balance >= 0 ? 'bg-blue-100' : 'bg-red-100'}`}>
              <Scale className={`w-4 h-4 ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
            </div>
            <p className="text-sm font-medium text-gray-500">Balance</p>
          </div>
          <p className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-700' : 'text-red-600'}`}>
            S/. {balance.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-400 mt-1">{balance >= 0 ? 'Resultado positivo' : 'Resultado negativo'}</p>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-2">
        <Button onClick={() => openCreate('ingreso')} className="bg-emerald-500 hover:bg-emerald-600 h-8 text-xs">
          <Plus className="w-3.5 h-3.5 mr-1" /> Ingreso manual
        </Button>
        <Button onClick={() => openCreate('egreso')} className="bg-red-500 hover:bg-red-600 h-8 text-xs">
          <Plus className="w-3.5 h-3.5 mr-1" /> Egreso
        </Button>
      </div>

      {/* Movimientos en dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Columna Ingresos */}
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-emerald-100 bg-emerald-50/50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-emerald-700">↑ Ingresos</h3>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
              {entries.filter(e => e.type === 'ingreso').length}
            </span>
          </div>
          {entries.filter(e => e.type === 'ingreso').length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">Sin ingresos registrados</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {entries.filter(e => e.type === 'ingreso').map(e => (
                <EntryRow key={e.id} e={e} onEdit={openEdit} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>

        {/* Columna Egresos */}
        <div className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-red-100 bg-red-50/50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-red-600">↓ Egresos</h3>
            <span className="text-xs font-bold text-red-500 bg-red-100 px-2 py-0.5 rounded-full">
              {entries.filter(e => e.type === 'egreso').length}
            </span>
          </div>
          {entries.filter(e => e.type === 'egreso').length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">Sin egresos registrados</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {entries.filter(e => e.type === 'egreso').map(e => (
                <EntryRow key={e.id} e={e} onEdit={openEdit} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <AddEntryModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditEntry(null) }}
          defaultType={defaultType}
          leads={leads}
          entry={editEntry}
        />
      )}
    </div>
  )
}
