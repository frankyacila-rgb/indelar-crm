'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckSquare, Clock, CheckCheck, AlertCircle, Link as LinkIcon } from 'lucide-react'
import { format, isPast, isToday, isTomorrow } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const PRIORITY_COLORS = {
  high:   'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low:    'bg-gray-100 text-gray-600',
}

const PRIORITY_LABELS = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
}

function dueDateLabel(dateStr: string) {
  const date = new Date(dateStr)
  if (isPast(date) && !isToday(date)) return { label: 'Vencida', color: 'text-red-500' }
  if (isToday(date)) return { label: 'Hoy', color: 'text-amber-500' }
  if (isTomorrow(date)) return { label: 'Mañana', color: 'text-blue-500' }
  return { label: format(date, "d 'de' MMM", { locale: es }), color: 'text-gray-400' }
}

interface Task {
  id: string
  title: string
  description?: string
  due_date: string
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'done' | 'overdue'
  lead?: { id: string; code: string; full_name: string } | null
}

function TaskRow({ task, onToggle }: { task: Task; onToggle: (id: string, done: boolean) => void }) {
  const isDone = task.status === 'done'
  const due = dueDateLabel(task.due_date)

  return (
    <div className={cn(
      'flex items-start gap-4 p-4 rounded-xl border transition-all',
      isDone
        ? 'bg-gray-50 border-gray-100 opacity-60'
        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
    )}>
      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id, !isDone)}
        className={cn(
          'mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
          isDone
            ? 'bg-emerald-500 border-emerald-500'
            : 'border-gray-300 hover:border-emerald-400'
        )}
      >
        {isDone && <CheckCheck className="w-3 h-3 text-white" />}
      </button>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium', isDone ? 'line-through text-gray-400' : 'text-gray-900')}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{task.description}</p>
        )}
        {task.lead && (
          <Link
            href={`/leads/${task.lead.id}`}
            className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 mt-1"
          >
            <LinkIcon className="w-3 h-3" />
            {task.lead.code} · {task.lead.full_name}
          </Link>
        )}
      </div>

      {/* Meta */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Badge className={`text-xs ${PRIORITY_COLORS[task.priority]}`} variant="secondary">
          {PRIORITY_LABELS[task.priority]}
        </Badge>
        <span className={`text-xs font-medium ${due.color}`}>
          {due.label}
        </span>
      </div>
    </div>
  )
}

export function TareasBoard({ tasks: initialTasks }: { tasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks)
  const router = useRouter()
  const supabase = createClient()

  async function handleToggle(id: string, done: boolean) {
    const newStatus = done ? 'done' : 'pending'

    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t))

    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', id)

    if (error) {
      setTasks(initialTasks)
      toast.error('Error al actualizar la tarea')
      return
    }

    toast.success(done ? 'Tarea completada ✓' : 'Tarea reabierta')
    router.refresh()
  }

  const pending = tasks.filter(t => t.status !== 'done')
  const done = tasks.filter(t => t.status === 'done')
  const overdue = pending.filter(t => isPast(new Date(t.due_date)) && !isToday(new Date(t.due_date)))
  const today = pending.filter(t => isToday(new Date(t.due_date)))
  const upcoming = pending.filter(t => !isPast(new Date(t.due_date)) || isTomorrow(new Date(t.due_date)))

  return (
    <Tabs defaultValue="pending">
      <TabsList className="bg-gray-100">
        <TabsTrigger value="pending" className="gap-2">
          <Clock className="w-3.5 h-3.5" />
          Pendientes
          {pending.length > 0 && (
            <span className="ml-1 bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
              {pending.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="overdue" className="gap-2">
          <AlertCircle className="w-3.5 h-3.5" />
          Vencidas
          {overdue.length > 0 && (
            <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
              {overdue.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="done" className="gap-2">
          <CheckSquare className="w-3.5 h-3.5" />
          Completadas
        </TabsTrigger>
      </TabsList>

      <TabsContent value="pending" className="mt-4 space-y-2">
        {overdue.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-red-500 uppercase tracking-wide px-1">Vencidas</p>
            {overdue.map(t => <TaskRow key={t.id} task={t} onToggle={handleToggle} />)}
          </div>
        )}
        {today.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-amber-500 uppercase tracking-wide px-1">Hoy</p>
            {today.map(t => <TaskRow key={t.id} task={t} onToggle={handleToggle} />)}
          </div>
        )}
        {upcoming.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1">Próximas</p>
            {upcoming.map(t => <TaskRow key={t.id} task={t} onToggle={handleToggle} />)}
          </div>
        )}
        {pending.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <CheckSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No hay tareas pendientes</p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="overdue" className="mt-4 space-y-2">
        {overdue.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <CheckSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Sin tareas vencidas</p>
          </div>
        ) : (
          overdue.map(t => <TaskRow key={t.id} task={t} onToggle={handleToggle} />)
        )}
      </TabsContent>

      <TabsContent value="done" className="mt-4 space-y-2">
        {done.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <CheckCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No hay tareas completadas aún</p>
          </div>
        ) : (
          done.map(t => <TaskRow key={t.id} task={t} onToggle={handleToggle} />)
        )}
      </TabsContent>
    </Tabs>
  )
}
