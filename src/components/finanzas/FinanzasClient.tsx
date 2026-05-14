'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, TrendingUp, TrendingDown, Scale } from 'lucide-react'
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
  lead?: { full_name: string; quote_number?: string; code: string } | null
}

interface Props {
  entries: Entry[]
  totalIngresos: number
  totalEgresos: number
  ingresoLeads: number
}

export function FinanzasClient({ entries, totalIngresos, totalEgresos, ingresoLeads }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [defaultType, setDefaultType] = useState<'ingreso' | 'egreso'>('egreso')

  const balance = totalIngresos - totalEgresos

  async function handleDelete(id: string) {
    const { error } = await supabase.from('finance_entries').delete().eq('id', id)
    if (error) { toast.error('Error al eliminar'); return }
    toast.success('Movimiento eliminado')
    router.refresh()
  }

  function openModal(type: 'ingreso' | 'egreso') {
    setDefaultType(type)
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
          <p className="text-xs text-gray-400 mt-1">S/. {ingresoLeads.toLocaleString('es-PE', { minimumFractionDigits: 2 })} de leads ganados</p>
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
        <Button onClick={() => openModal('ingreso')} className="bg-emerald-500 hover:bg-emerald-600 h-8 text-xs">
          <Plus className="w-3.5 h-3.5 mr-1" /> Ingreso manual
        </Button>
        <Button onClick={() => openModal('egreso')} className="bg-red-500 hover:bg-red-600 h-8 text-xs">
          <Plus className="w-3.5 h-3.5 mr-1" /> Egreso
        </Button>
      </div>

      {/* Tabla de movimientos */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">Movimientos</h3>
        </div>
        {entries.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-12">Sin movimientos registrados</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {entries.map(e => (
              <div key={e.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-2 h-8 rounded-full flex-shrink-0 ${e.type === 'ingreso' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{e.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      {e.category && <span className="bg-gray-100 px-1.5 py-0.5 rounded">{e.category}</span>}
                      <span>{new Date(e.date + 'T12:00:00').toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      {e.lead && (
                        <Link href={`/leads/${e.lead_id}`} className="text-blue-500 hover:underline truncate">
                          {e.lead.quote_number || e.lead.code} · {e.lead.full_name}
                        </Link>
                      )}
                      {e.lead_id && !e.lead && <span className="text-orange-500">Lead ganado</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                  <span className={`text-sm font-bold ${e.type === 'ingreso' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {e.type === 'ingreso' ? '+' : '-'} S/. {e.amount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </span>
                  {!e.lead_id && (
                    <button onClick={() => handleDelete(e.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <AddEntryModal open={modalOpen} onClose={() => setModalOpen(false)} defaultType={defaultType} />
      )}
    </div>
  )
}
