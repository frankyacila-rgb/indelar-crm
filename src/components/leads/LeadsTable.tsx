'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Search, Phone, MessageCircle } from 'lucide-react'
import {
  type Lead, STAGE_LABELS, STAGE_COLORS, PRODUCT_LABELS, SOURCE_LABELS,
  type LeadStage, type ProductInterest,
} from '@/types'

interface LeadsTableProps {
  leads: Lead[]
}

export function LeadsTable({ leads }: LeadsTableProps) {
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState<string>('all')
  const [productFilter, setProductFilter] = useState<string>('all')

  const filtered = leads.filter((lead) => {
    const matchSearch =
      lead.full_name.toLowerCase().includes(search.toLowerCase()) ||
      lead.phone.includes(search) ||
      lead.code.toLowerCase().includes(search.toLowerCase())
    const matchStage = stageFilter === 'all' || lead.stage === stageFilter
    const matchProduct = productFilter === 'all' || lead.product_interest === productFilter
    return matchSearch && matchStage && matchProduct
  })

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre, teléfono o código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={stageFilter} onValueChange={(v) => v && setStageFilter(v)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Etapa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las etapas</SelectItem>
            {Object.entries(STAGE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={productFilter} onValueChange={(v) => v && setProductFilter(v)}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Producto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los productos</SelectItem>
            {Object.entries(PRODUCT_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabla */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Lead</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contacto</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Producto</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Origen</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Etapa</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Valor</TableHead>
              <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Creado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-sm text-gray-400 py-12">
                  No se encontraron leads
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((lead) => (
                <TableRow key={lead.id} className="hover:bg-gray-50 cursor-pointer">
                  <TableCell>
                    <Link href={`/leads/${lead.id}`} className="block">
                      <p className="text-sm font-medium text-gray-900">{lead.full_name}</p>
                      <p className="text-xs text-gray-400">{lead.code}</p>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{lead.phone}</span>
                      <a
                        href={`https://wa.me/51${lead.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-500 hover:text-emerald-600"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {lead.product_interest === 'multiple' && lead.address
                        ? <span className="text-xs leading-relaxed">{lead.address}</span>
                        : PRODUCT_LABELS[lead.product_interest as ProductInterest]}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">{SOURCE_LABELS[lead.source]}</span>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${STAGE_COLORS[lead.stage as LeadStage]}`} variant="secondary">
                      {STAGE_LABELS[lead.stage as LeadStage]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {lead.estimated_value ? `S/. ${lead.estimated_value.toLocaleString('es-PE')}` : '—'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true, locale: es })}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-gray-400">{filtered.length} de {leads.length} leads</p>
    </div>
  )
}
