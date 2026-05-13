import { createClient } from '@/lib/supabase/server'
import { TareasBoard } from '@/components/tareas/TareasBoard'
import { CreateTaskButton } from '@/components/tareas/CreateTaskButton'

export default async function TareasPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const [tasksRes, leadsRes] = await Promise.all([
    supabase
      .from('tasks')
      .select('*, lead:leads(id, code, full_name)')
      .order('due_date', { ascending: true }),
    supabase
      .from('leads')
      .select('id, code, full_name')
      .not('stage', 'in', '(ganado,perdido)')
      .order('full_name'),
  ])

  const tasks = tasksRes.data ?? []
  const leads = leadsRes.data ?? []

  const pending = tasks.filter(t => t.status === 'pending')
  const done = tasks.filter(t => t.status === 'done')
  const overdue = pending.filter(t => new Date(t.due_date) < new Date())

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tareas</h1>
          <p className="text-sm text-gray-500 mt-1">
            {pending.length} pendientes
            {overdue.length > 0 && (
              <span className="ml-2 text-red-500 font-medium">· {overdue.length} vencidas</span>
            )}
          </p>
        </div>
        <CreateTaskButton leads={leads} userId={user?.id ?? ''} />
      </div>
      <TareasBoard tasks={tasks} />
    </div>
  )
}
